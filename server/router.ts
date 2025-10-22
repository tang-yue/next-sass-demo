import { fileRoutes } from "./routes/file";
import { appRouter as appRoutes } from "./routes/app";
import { storageRouter as storageRoutes } from "./routes/storage";
import { apiKeysRouter } from "./routes/apiKeys";
import { openFileRoutes } from "./routes/open-file";
import { router, protectedProcedure, publicProcedure } from "./trpc";

export const appRouter = router({
    hello: publicProcedure.query(async ({ ctx }) => {
        console.log(ctx.session, "ctx.session")
        return {
            message: "Hello, world!",
        }
    }),
    file: fileRoutes,
    app: appRoutes,
    storage: storageRoutes,
    apiKeys: apiKeysRouter,
    // 开放API路由 - 通过API Key认证，无需用户登录
    open: openFileRoutes,
});

export type AppRouter = typeof appRouter;
