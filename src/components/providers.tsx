"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// TanStack Query keeps data fetched in the browser (the session today, the
// bag next) in one shared cache. One client per browser tab: created in
// state so a re-render never throws the cache away.
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
