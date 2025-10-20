import { fileRoutes } from "./routes/file";
import { appRouter as appRoutes } from "./routes/app";
import { storageRouter as storageRoutes } from "./routes/storage";
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
});

export type AppRouter = typeof appRouter;
