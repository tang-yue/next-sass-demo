import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from "@/server/router";
import { getServerSession } from '@/server/auth';

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: async () => ({
      session: await getServerSession(),
    }),
  });
};

export { handler as GET, handler as POST };