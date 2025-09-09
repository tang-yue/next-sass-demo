import { fileRoutes } from "./routes/file";
import { router, protectedProcedure, publicProcedure } from "./trpc";

export const appRouter = router({
    hello: publicProcedure.query(async ({ ctx }) => {
        console.log(ctx.session, "ctx.session")
        return {
            message: "Hello, world!",
        }
    }),
    file: fileRoutes,
});

export type AppRouter = typeof appRouter;
