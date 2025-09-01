import z from "zod";
import { protectedProcedure } from "../trpc";
import { router } from "../trpc";
import { TRPCError } from "@trpc/server";
import {
    S3Client,
    PutObjectCommand,
    PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "../db/db";
import { files } from "../db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq, desc, count } from "drizzle-orm";

// 从环境变量获取配置
const bucket = process.env.COS_BUCKET;
const region = process.env.COS_REGION;
const apiEndpoint = process.env.COS_API_ENDPOINT;
const cosAppId = process.env.COS_APP_ID;
const cosAppSecret = process.env.COS_APP_SECRET;

// 验证必要的环境变量
if (!bucket || !region || !apiEndpoint || !cosAppId || !cosAppSecret) {
  throw new Error("Missing required environment variables for S3/COS configuration");
}


export const fileRoutes = router({
  // 获取文件列表
  getFiles: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const offset = (input.page - 1) * input.limit;

      const filesList = await db
        .select()
        .from(files)
        .where(eq(files.userId, (session?.user as { id: string })?.id || ""))
        .orderBy(desc(files.createdAt))
        .limit(input.limit)
        .offset(offset);

      const totalCount = await db
        .select({ count: count() })
        .from(files)
        .where(eq(files.userId, (session?.user as { id: string })?.id || ""));

      return {
        files: filesList,
        total: totalCount[0]?.count || 0,
        page: input.page,
        limit: input.limit,
      };
    }),

  createPresignedUrl: protectedProcedure
    .input(
        z.object({
            filename: z.string(),
            contentType: z.string(),
            size: z.number(),
        })
    )
    .mutation(async ({ ctx, input }) => {
      const date = new Date();

      const isoString = date.toISOString();

      const dateString = isoString.split("T")[0];

      const params: PutObjectCommandInput = {
        Bucket: bucket,
        Key: `${dateString}/${input.filename.replaceAll(" ", "_")}`,
        ContentType: input.contentType,
        ContentLength: input.size,
      };

      const s3Client = new S3Client({
        endpoint: apiEndpoint,
        region: region,
        credentials: {
          accessKeyId: cosAppId,
          secretAccessKey: cosAppSecret,
        },
      });

      const command = new PutObjectCommand(params);
      const url = await getSignedUrl(s3Client, command, {
        expiresIn: 60,
      });

      return {
        url,
        method: "PUT" as const,
      };
    }),
  saveFile: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        path: z.string(),
        type: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      const url = new URL(input.path);

      const photo = await db
      .insert(files)
      .values({
        ...input,
        id: uuidv4(),
        path: url.pathname,
        url: url.toString(),
        userId: (session?.user as { id: string })?.id || "",
        contentType: input.type,
      }).returning();

      return photo[0];
    })
})