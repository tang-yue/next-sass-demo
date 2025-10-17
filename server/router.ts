import { fileRoutes } from "./routes/file";
import { appRouter as appRoutes } from "./routes/app";
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
});

export type AppRouter = typeof appRouter;
