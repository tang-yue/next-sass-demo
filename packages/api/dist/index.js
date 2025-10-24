import { createTRPCClient, httpBatchLink } from '@trpc/client';
// Create tRPC client
export const apiClient = createTRPCClient({
    links: [
        httpBatchLink({
            url: 'http://localhost:3000/api/open',
        }),
    ],
});
