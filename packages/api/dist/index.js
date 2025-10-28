import { createTRPCClient, httpBatchLink } from '@trpc/client';
// Create tRPC client
export const apiClient = createTRPCClient({
    links: [
        httpBatchLink({
            url: '/api/open',
        }),
    ],
});
export const createApiClient = (headers = {}) => {
    const header = Object.assign({}, headers);
    return createTRPCClient({
        links: [
            httpBatchLink({
                url: '/api/open',
                headers: header,
            }),
        ],
    });
};
//# sourceMappingURL=index.js.map