import { initTRPC, TRPCError } from "@trpc/server";
import { getServerSession, Session } from "next-auth";
import { createTRPCContext } from '@trpc/tanstack-react-query';

const t = initTRPC.context<{
  session: Session | null;
}>().create(
  {
    isServer: true,
    allowOutsideOfServer: true,
  }
);

export const router = t.router;
export const publicProcedure = t.procedure;
const loginRequiredMiddleware = t.middleware(async ({ ctx, next }) => {
  console.log(ctx.session, "ctx.session")
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx });
});
// 导出类型，实际的路由定义在 server/router.ts
export type AppRouter = import("../server/router").AppRouter;

// 创建一个服务端组件的调用者，用于在服务端组件中调用 tRPC 路由
import { appRouter } from "../server/router";

export const caller = appRouter.createCaller(
  async () => ({
    session: await getServerSession(),
  }),
);