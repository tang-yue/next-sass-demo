import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db } from "../db/db";
import { storageConfiguration, apps } from "../db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

export const storageRouter = router({
  // 创建存储配置
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "名称不能为空").max(100, "名称不能超过100个字符"),
        configuration: z.object({
          bucket: z.string().min(1, "存储桶名称不能为空"),
          region: z.string().min(1, "区域不能为空"),
          accessKeyId: z.string().min(1, "Access Key ID不能为空"),
          secretAccessKey: z.string().min(1, "Secret Access Key不能为空"),
          apiEndpoint: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as any)?.id;
      
      const newStorage = await db.insert(storageConfiguration).values({
        name: input.name,
        userId,
        configuration: input.configuration,
      }).returning();

      return {
        success: true,
        storage: newStorage[0],
      };
    }),

  // 获取用户的所有存储配置
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = (ctx.session?.user as any)?.id;
      
      const userStorages = await db
        .select()
        .from(storageConfiguration)
        .where(and(eq(storageConfiguration.userId, userId), isNull(storageConfiguration.deletedAt)))
        .orderBy(desc(storageConfiguration.createdAt));

      return {
        success: true,
        storages: userStorages,
      };
    }),

  // 根据ID获取存储配置
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as any)?.id;
      
      const storage = await db
        .select()
        .from(storageConfiguration)
        .where(
          and(
            eq(storageConfiguration.id, input.id),
            eq(storageConfiguration.userId, userId),
            isNull(storageConfiguration.deletedAt)
          )
        )
        .limit(1);

      if (!storage[0]) {
        throw new Error("存储配置不存在或无权限访问");
      }

      return {
        success: true,
        storage: storage[0],
      };
    }),

  // 更新存储配置
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1, "名称不能为空").max(100, "名称不能超过100个字符"),
        configuration: z.object({
          bucket: z.string().min(1, "存储桶名称不能为空"),
          region: z.string().min(1, "区域不能为空"),
          accessKeyId: z.string().min(1, "Access Key ID不能为空"),
          secretAccessKey: z.string().min(1, "Secret Access Key不能为空"),
          apiEndpoint: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as any)?.id;
      
      // 检查存储配置是否存在且属于当前用户
      const existingStorage = await db
        .select()
        .from(storageConfiguration)
        .where(
          and(
            eq(storageConfiguration.id, input.id),
            eq(storageConfiguration.userId, userId),
            isNull(storageConfiguration.deletedAt)
          )
        )
        .limit(1);

      if (!existingStorage[0]) {
        throw new Error("存储配置不存在或无权限访问");
      }

      // 更新存储配置
      const updatedStorage = await db
        .update(storageConfiguration)
        .set({
          name: input.name,
          configuration: input.configuration,
        })
        .where(eq(storageConfiguration.id, input.id))
        .returning();

      return {
        success: true,
        storage: updatedStorage[0],
      };
    }),

  // 删除存储配置
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as any)?.id;
      
      // 检查存储配置是否存在且属于当前用户
      const existingStorage = await db
        .select()
        .from(storageConfiguration)
        .where(
          and(
            eq(storageConfiguration.id, input.id),
            eq(storageConfiguration.userId, userId),
            isNull(storageConfiguration.deletedAt)
          )
        )
        .limit(1);

      if (!existingStorage[0]) {
        throw new Error("存储配置不存在或无权限访问");
      }

      // 检查是否有应用正在使用此存储配置
      const appsUsingStorage = await db
        .select()
        .from(apps)
        .where(
          and(
            eq(apps.storageId, input.id),
            isNull(apps.deletedAt)
          )
        )
        .limit(1);

      if (appsUsingStorage.length > 0) {
        throw new Error("有应用正在使用此存储配置，无法删除");
      }

      // 软删除存储配置
      await db
        .update(storageConfiguration)
        .set({ deletedAt: new Date() })
        .where(eq(storageConfiguration.id, input.id));

      return {
        success: true,
        message: "存储配置删除成功",
      };
    }),

  // 更新应用的存储配置
  updateAppStorage: protectedProcedure
    .input(z.object({ 
      appId: z.string(),
      storageId: z.number().nullable()
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as any)?.id;
      
      // 检查应用是否存在且属于当前用户
      const app = await db
        .select()
        .from(apps)
        .where(
          and(
            eq(apps.id, input.appId),
            eq(apps.userId, userId),
            isNull(apps.deletedAt)
          )
        )
        .limit(1);

      if (!app[0]) {
        throw new Error("应用不存在或无权限访问");
      }

      // 如果指定了存储配置ID，检查存储配置是否存在且属于当前用户
      if (input.storageId) {
        const storage = await db
          .select()
          .from(storageConfiguration)
          .where(
            and(
              eq(storageConfiguration.id, input.storageId),
              eq(storageConfiguration.userId, userId),
              isNull(storageConfiguration.deletedAt)
            )
          )
          .limit(1);

        if (!storage[0]) {
          throw new Error("存储配置不存在或无权限访问");
        }
      }

      // 更新应用的存储配置
      const updatedApp = await db
        .update(apps)
        .set({ storageId: input.storageId })
        .where(eq(apps.id, input.appId))
        .returning();

      return {
        success: true,
        app: updatedApp[0],
      };
    }),
});
