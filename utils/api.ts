import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './trpc';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Create tRPC client
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
    }),
  ],
});