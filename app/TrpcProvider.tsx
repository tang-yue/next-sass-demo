"use client"
import { QueryClient, QueryClientProvider, defaultShouldDehydrateQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { trpcClient, trpcClientReact } from '../utils/api';
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // staleTime: 50 * 1000,
        // refetchOnWindowFocus: true,
        // refetchOnMount: true,
        // refetchOnReconnect: false,
        // refetchInterval: false,
        // refetchIntervalInBackground: false,
      },
      dehydrate: {
        // serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
      hydrate: {
        // deserializeData: superjson.deserialize,
      },
    },
  });
}
// Export useTRPC hook from the TRPC React integration
export const useTRPC = () => {
  return trpcClientReact.useUtils();
};
let browserQueryClient: QueryClient;
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

// export const getQueryClient = cache(makeQueryClient);
// export const trpc = createTRPCOptionsProxy({
//   ctx: async () => ({
//     session: await getServerSession(),
//   }),
//   router: appRouter,
//   queryClient: getQueryClient,
// });

export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  const [_trpcClient] = useState(() => trpcClient);
  return (
    <trpcClientReact.Provider client={_trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpcClientReact.Provider>
  );
}