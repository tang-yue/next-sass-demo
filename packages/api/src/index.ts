import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/server/router';

// Create tRPC client
export const apiClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/open',
    }),
  ],
});