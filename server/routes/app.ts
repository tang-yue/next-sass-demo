import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db } from "../db/db";
import { apps } from "../db/schema";
import { eq } from "drizzle-orm";

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
        .where(eq(apps.userId, userId));

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
});
