import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db } from "../db/db";
import { apps, files } from "../db/schema";
import { eq, and, isNull, count, desc } from "drizzle-orm";

export const appRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "名称不能为空").max(100, "名称不能超过100个字符"),
        description: z.string().max(500, "描述不能超过500个字符").optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, description } = input;
      const userId = (ctx.session?.user as any)?.id;

      const newApp = await db.insert(apps).values({
        id: crypto.randomUUID(),
        name,
        description: description || "",
        userId,
      }).returning();

      return {
        success: true,
        app: newApp[0],
      };
    }),

  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = (ctx.session?.user as any)?.id;
      
      const userApps = await db
        .select()
        .from(apps)
        .where(and(eq(apps.userId, userId), isNull(apps.deletedAt)))
        .orderBy(desc(apps.createdAt));

      return {
        success: true,
        apps: userApps,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as any)?.id;
      
      const app = await db
        .select()
        .from(apps)
        .where(eq(apps.id, input.id))
        .limit(1);

      if (!app[0] || app[0].userId !== userId) {
        throw new Error("应用不存在或无权限访问");
      }

      return {
        success: true,
        app: app[0],
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as any)?.id;
      
      // 检查应用是否存在且属于当前用户
      const app = await db
        .select()
        .from(apps)
        .where(eq(apps.id, input.id))
        .limit(1);

      if (!app[0] || app[0].userId !== userId) {
        throw new Error("应用不存在或无权限访问");
      }

      // 检查应用下是否有文件
      const existingFiles = await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.appId, input.id),
            isNull(files.deletedAt)
          )
        )
        .limit(1);

      if (existingFiles.length > 0) {
        throw new Error("请先删除应用下的所有文件，再删除应用");
      }

      // 软删除应用
      await db
        .update(apps)
        .set({ deletedAt: new Date() })
        .where(eq(apps.id, input.id));

      return {
        success: true,
        message: "应用删除成功",
      };
    }),

  getFilesCount: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as any)?.id;
      
      // 检查应用是否存在且属于当前用户
      const app = await db
        .select()
        .from(apps)
        .where(eq(apps.id, input.id))
        .limit(1);

      if (!app[0] || app[0].userId !== userId) {
        throw new Error("应用不存在或无权限访问");
      }

      // 获取应用下的文件数量
      const filesCount = await db
        .select({ count: count() })
        .from(files)
        .where(
          and(
            eq(files.appId, input.id),
            isNull(files.deletedAt)
          )
        );

      return {
        success: true,
        count: filesCount[0]?.count || 0,
      };
    }),
});
