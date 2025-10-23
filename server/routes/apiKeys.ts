import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db } from "../db/db";
import { apiKeys, apps } from "../db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import { randomBytes } from "node:crypto";

export const apiKeysRouter = router({
  // 按应用获取 API Keys 列表
  getByAppId: protectedProcedure
    .input(z.object({ appId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as any)?.id;

      // 校验应用归属
      const app = await db
        .select()
        .from(apps)
        .where(and(eq(apps.id, input.appId), eq(apps.userId, userId), isNull(apps.deletedAt)))
        .limit(1);

      if (!app[0]) {
        throw new Error("应用不存在或无权限访问");
      }

      const rows = await db
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.appId, input.appId), isNull(apiKeys.deletedAt)))
        .orderBy(desc(apiKeys.createdAt));

      return { success: true, apiKeys: rows };
    }),

  // 创建 API Key（仅需名称）
  create: protectedProcedure
    .input(z.object({ appId: z.string(), name: z.string().min(1, "名称不能为空").max(255) }))
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as any)?.id;

      const app = await db
        .select()
        .from(apps)
        .where(and(eq(apps.id, input.appId), eq(apps.userId, userId), isNull(apps.deletedAt)))
        .limit(1);

      if (!app[0]) {
        throw new Error("应用不存在或无权限访问");
      }

      const key = randomBytes(32).toString("hex");
      const clientId = randomBytes(16).toString("hex");

      const created = await db
        .insert(apiKeys)
        .values({ name: input.name, key, appId: input.appId, clientId })
        .returning();

      return { success: true, apiKey: created[0] };
    }),

  // 删除 API Key
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as any)?.id;

      // 校验归属（通过联表 apps）
      const owned = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.id, input.id))
        .limit(1);

      if (!owned[0]) {
        throw new Error("API Key 不存在");
      }

      const app = await db
        .select()
        .from(apps)
        .where(and(eq(apps.id, owned[0].appId), eq(apps.userId, userId)))
        .limit(1);

      if (!app[0]) {
        throw new Error("无权限删除此 API Key");
      }

      await db
        .update(apiKeys)
        .set({ deletedAt: new Date() })
        .where(eq(apiKeys.id, input.id));

      return { success: true };
    }),
});


