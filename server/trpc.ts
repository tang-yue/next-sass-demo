import { getServerSession } from "@/server/auth";
import { TRPCError, initTRPC } from "@trpc/server";

const t = initTRPC.context().create();

const { router, procedure } = t;

export const withLoggerProcedure = procedure.use(async ({ ctx, next }) => {
    const start = Date.now();

    const result = await next();

    console.log("---> Api time:", Date.now() - start);

    return result;
});

export const withSessionMiddleware = t.middleware(async ({ ctx, next }) => {
    const session = await getServerSession();

    return next({
        ctx: {
            session,
        },
    });
});


export const protectedProcedure = withLoggerProcedure
    .use(withSessionMiddleware)
    .use(async ({ ctx, next }) => {
        if (!ctx.session?.user) {
            throw new TRPCError({ code: "FORBIDDEN" });
        }

        return next({ ctx });
    });

export { router };