import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const clearUserScopedQueryCache = () => {
  queryClient.removeQueries({ queryKey: ["orders"] });
  queryClient.removeQueries({ queryKey: ["order"] });
  queryClient.removeQueries({ queryKey: ["admin"] });
  queryClient.removeQueries({ queryKey: ["admin-products"] });
  queryClient.removeQueries({ queryKey: ["admin-inventory"] });
  queryClient.removeQueries({ queryKey: ["stock-history"] });
  queryClient.removeQueries({ queryKey: ["reports-summary"] });
  queryClient.removeQueries({ queryKey: ["reports-revenue"] });
  queryClient.removeQueries({ queryKey: ["reports-top-products"] });
};
