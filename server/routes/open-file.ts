import z from "zod";
import { TRPCError, initTRPC } from "@trpc/server";
import { headers } from "next/headers";
import { router } from "../trpc";
import { db } from "../db/db";
import { files, storageConfiguration, apiKeys, apps } from "../db/schema";
import { eq, desc, count, and, isNull } from "drizzle-orm";
import {
    S3Client,
    PutObjectCommand,
    PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import jwt, { JwtPayload } from "jsonwebtoken";

// 创建独立的TRPC实例用于开放API
const t = initTRPC.context<{
    app: typeof apps.$inferSelect;
    user: { id: string };
}>().create();

const { procedure } = t;

// 基于API Key或Signed Token的中间件 - 用于开放API接口
export const withApiKeyMiddleware = t.middleware(async ({ next }) => {
    const header = await headers();
    const apiKey = header.get("api-key");
    const signedToken = header.get("signed-token");

    if (apiKey) {
        // 传统的API Key认证方式
        const apiKeyAndAppUser = await db.query.apiKeys.findFirst({
            where: (apiKeys, { eq, and, isNull }) =>
                and(eq(apiKeys.key, apiKey), isNull(apiKeys.deletedAt)),
            with: {
                app: {
                    with: {
                        user: true,
                        storage: true,
                    },
                },
            },
        });

        if (!apiKeyAndAppUser) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Invalid API Key",
            });
        }

        return next({
            ctx: {
                app: apiKeyAndAppUser.app,
                user: apiKeyAndAppUser.app.user,
            },
        });
    } else if (signedToken) {
        // 基于JWT Token的认证方式
        try {
            // 解析JWT token获取clientId
            const payload = jwt.decode(signedToken) as JwtPayload;
            
            if (!payload?.clientId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "clientId not found in token",
                });
            }

            // 根据clientId查询API Key
            const apiKeyAndAppUser = await db.query.apiKeys.findFirst({
                where: (apiKeys, { eq, and, isNull }) =>
                    and(
                        eq(apiKeys.clientId, payload.clientId),
                        isNull(apiKeys.deletedAt)
                    ),
                with: {
                    app: {
                        with: {
                            user: true,
                            storage: true,
                        },
                    },
                },
            });

            if (!apiKeyAndAppUser) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Invalid clientId in token",
                });
            }

            // 验证token签名
            try {
                jwt.verify(signedToken, apiKeyAndAppUser.key);
            } catch (err) {
                console.log(apiKeyAndAppUser.key, signedToken)
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Invalid token signature",
                });
            }

            return next({
                ctx: {
                    app: apiKeyAndAppUser.app,
                    user: apiKeyAndAppUser.app.user,
                },
            });
        } catch (error) {
            if (error instanceof TRPCError) {
                throw error;
            }
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Invalid signed token",
            });
        }
    } else {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "API Key or signed-token is required",
        });
    }
});

// 开放API的procedure - 使用API Key认证而非用户登录
export const openApiProcedure = procedure.use(withApiKeyMiddleware);

// 从环境变量获取默认存储配置
const bucket = process.env.COS_BUCKET;
const region = process.env.COS_REGION;
const apiEndpoint = process.env.COS_API_ENDPOINT;
const cosAppId = process.env.COS_APP_ID;
const cosAppSecret = process.env.COS_APP_SECRET;

/**
 * 开放文件API路由
 * 这些接口通过API Key进行认证，允许第三方应用无需用户登录即可访问
 * 所有操作都基于API Key关联的应用(APP)和用户进行权限控制
 */
export const openFileRoutes = router({
    /**
     * 获取文件列表 - 开放API版本
     * 通过API Key获取关联应用的文件列表
     * 请求头需要包含: api-key
     */
    getFiles: openApiProcedure
        .input(
            z.object({
                page: z.number().default(1),
                limit: z.number().default(20),
            })
        )
        .query(async ({ ctx, input }) => {
            const { app, user } = ctx;
            const offset = (input.page - 1) * input.limit;

            // 查询该应用下的所有文件
            const filesList = await db
                .select()
                .from(files)
                .where(
                    and(
                        eq(files.appId, app.id),
                        isNull(files.deletedAt)
                    )
                )
                .orderBy(desc(files.createdAt))
                .limit(input.limit)
                .offset(offset);

            // 获取总数
            const totalCount = await db
                .select({ count: count() })
                .from(files)
                .where(
                    and(
                        eq(files.appId, app.id),
                        isNull(files.deletedAt)
                    )
                );

            return {
                files: filesList,
                total: totalCount[0]?.count || 0,
                page: input.page,
                limit: input.limit,
                app: {
                    id: app.id,
                    name: app.name,
                },
            };
        }),

    /**
     * 创建预签名上传URL - 开放API版本
     * 为第三方应用生成文件上传的预签名URL
     * 请求头需要包含: api-key
     */
    createPresignedUrl: openApiProcedure
        .input(
            z.object({
                filename: z.string(),
                contentType: z.string(),
                size: z.number(),
                storageId: z.number().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { app, user } = ctx;

            let storageConfig;

            if (input.storageId) {
                // 使用应用指定的存储配置
                const storage = await db
                    .select()
                    .from(storageConfiguration)
                    .where(
                        and(
                            eq(storageConfiguration.id, input.storageId),
                            eq(storageConfiguration.userId, user.id),
                            isNull(storageConfiguration.deletedAt)
                        )
                    )
                    .limit(1);

                if (!storage[0]) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "存储配置不存在或无权限访问",
                    });
                }

                storageConfig = storage[0].configuration;
            } else if (app.storageId) {
                // 使用应用默认的存储配置
                const storage = await db
                    .select()
                    .from(storageConfiguration)
                    .where(
                        and(
                            eq(storageConfiguration.id, app.storageId),
                            eq(storageConfiguration.userId, user.id),
                            isNull(storageConfiguration.deletedAt)
                        )
                    )
                    .limit(1);

                if (!storage[0]) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "应用存储配置不存在",
                    });
                }

                storageConfig = storage[0].configuration;
            } else {
                // 使用环境变量作为默认配置
                if (!bucket || !region || !apiEndpoint || !cosAppId || !cosAppSecret) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "未配置存储服务，请先在应用设置中配置存储",
                    });
                }

                storageConfig = {
                    bucket,
                    region,
                    accessKeyId: cosAppId,
                    secretAccessKey: cosAppSecret,
                    apiEndpoint,
                };
            }

            // 生成文件路径和预签名URL
            const date = new Date();
            const isoString = date.toISOString();
            const dateString = isoString.split("T")[0];

            const params: PutObjectCommandInput = {
                Bucket: storageConfig.bucket,
                Key: `${dateString}/${input.filename.replaceAll(" ", "_")}`,
                ContentType: input.contentType,
                ContentLength: input.size,
            };

            const s3Client = new S3Client({
                endpoint: storageConfig.apiEndpoint,
                region: storageConfig.region,
                credentials: {
                    accessKeyId: storageConfig.accessKeyId,
                    secretAccessKey: storageConfig.secretAccessKey,
                },
            });

            const command = new PutObjectCommand(params);
            const url = await getSignedUrl(s3Client, command, {
                expiresIn: 60,
            });

            return {
                url,
                method: "PUT" as const,
                app: {
                    id: app.id,
                    name: app.name,
                },
            };
        }),

    /**
     * 保存文件记录 - 开放API版本
     * 第三方应用上传文件后，调用此接口保存文件记录到数据库
     * 请求头需要包含: api-key
     */
    saveFile: openApiProcedure
        .input(
            z.object({
                name: z.string(),
                path: z.string(),
                type: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { app, user } = ctx;

            const url = new URL(input.path);

            // 保存文件记录到数据库
            const photo = await db
                .insert(files)
                .values({
                    ...input,
                    id: uuidv4(),
                    path: url.pathname,
                    url: url.toString(),
                    userId: user.id,
                    contentType: input.type,
                    appId: app.id,
                })
                .returning();

            return {
                ...photo[0],
                app: {
                    id: app.id,
                    name: app.name,
                },
            };
        }),

    /**
     * 删除文件 - 开放API版本
     * 第三方应用可以删除其关联应用下的文件（软删除）
     * 请求头需要包含: api-key
     */
    deleteFile: openApiProcedure
        .input(
            z.object({
                fileId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { app } = ctx;

            // 检查文件是否属于当前应用
            const existingFile = await db
                .select()
                .from(files)
                .where(
                    and(
                        eq(files.id, input.fileId),
                        eq(files.appId, app.id),
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

            return {
                ...deletedFile[0],
                app: {
                    id: app.id,
                    name: app.name,
                },
            };
        }),

    /**
     * 获取应用信息 - 开放API版本
     * 通过API Key获取关联应用的基本信息
     * 请求头需要包含: api-key
     */
    getAppInfo: openApiProcedure
        .query(async ({ ctx }) => {
            const { app, user } = ctx;

            return {
                app: {
                    id: app.id,
                    name: app.name,
                    description: app.description,
                    createdAt: app.createdAt,
                },
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            };
        }),
});
