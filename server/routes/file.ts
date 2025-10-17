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
import { eq, desc, count, and, isNull } from "drizzle-orm";

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
        .where(
          and(
            eq(files.userId, (session?.user as { id: string })?.id || ""),
            isNull(files.deletedAt)
          )
        )
        .orderBy(desc(files.createdAt))
        .limit(input.limit)
        .offset(offset);

      const totalCount = await db
        .select({ count: count() })
        .from(files)
        .where(
          and(
            eq(files.userId, (session?.user as { id: string })?.id || ""),
            isNull(files.deletedAt)
          )
        );

      return {
        files: filesList,
        total: totalCount[0]?.count || 0,
        page: input.page,
        limit: input.limit,
      };
    }),

  // 根据应用ID获取文件列表
  getFilesByAppId: protectedProcedure
    .input(
      z.object({
        appId: z.string(),
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
        .where(
          and(
            eq(files.userId, (session?.user as { id: string })?.id || ""),
            eq(files.appId, input.appId),
            isNull(files.deletedAt)
          )
        )
        .orderBy(desc(files.createdAt))
        .limit(input.limit)
        .offset(offset);

      const totalCount = await db
        .select({ count: count() })
        .from(files)
        .where(
          and(
            eq(files.userId, (session?.user as { id: string })?.id || ""),
            eq(files.appId, input.appId),
            isNull(files.deletedAt)
          )
        );

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
        appId: z.string(),
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
        appId: input.appId,
      }).returning();

      return photo[0];
    }),

  // 删除文件（软删除）
  deleteFile: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = (session?.user as { id: string })?.id || "";

      // 检查文件是否属于当前用户
      const existingFile = await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.id, input.fileId),
            eq(files.userId, userId),
            isNull(files.deletedAt)
          )
        )
        .limit(1);

      if (existingFile.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "文件不存在或无权限删除",
        });
      }

      // 软删除：设置 deletedAt 为当前时间
      const deletedFile = await db
        .update(files)
        .set({ deletedAt: new Date() })
        .where(eq(files.id, input.fileId))
        .returning();

      return deletedFile[0];
    }),
})