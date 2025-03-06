// // 'use client';

// // import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// // const queryClient = new QueryClient();

// // export function Providers({ children }: { children: React.ReactNode }) {
// //   return (
// //     <QueryClientProvider client={queryClient}>
// //       {children}
// //     </QueryClientProvider>
// //   );
// // }

// // app/providers.tsx
// 'use client';

// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { persistQueryClient } from '@tanstack/query-persist-client-core';
// import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       gcTime: 1000 * 60 * 60, // 1 hours
//     },
//   },
// });

// const persister = createSyncStoragePersister({
//   storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
// });

// // Persist the cache
// if (typeof window !== 'undefined') {
//   persistQueryClient({
//     queryClient,
//     persister,
//     maxAge: 1000 * 60 * 60, // 1 hours
//   });
// }

// export function Providers({ children }: { children: React.ReactNode }) {
//   return (
//     <QueryClientProvider client={queryClient}>
//       {children}
//     </QueryClientProvider>
//   );
// }

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useEffect, useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 , // 1 hours
        staleTime: Infinity,
      },
    },
  }));

  useEffect(() => {
    const sessionStoragePersister = createSyncStoragePersister({
      storage: window.sessionStorage,
    });

    persistQueryClient({
      queryClient,
      persister: sessionStoragePersister,
      maxAge: 1000 * 60 * 60,
      hydrateOptions: {
        defaultOptions: {
          queries: {
            gcTime: 1000 * 60 * 60,
          },
        },
      },
    });
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}