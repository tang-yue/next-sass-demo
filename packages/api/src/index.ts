import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { OpenRouter } from './open-router-dts';

// Create tRPC client
export const apiClient = createTRPCClient<OpenRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/open',
    }),
  ],
});

export const createApiClient = (headers: Record<string, string> = {}) => {
  const header: Record<string, string> = {
    ...headers,
  };
  return createTRPCClient<OpenRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost:3000/api/open',
        headers: header,
      }),
    ],
  });
};