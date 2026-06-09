/* eslint-disable no-console */
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { AxiosError } from "axios";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import { handleServerError } from "@/utils/handle-server-error";
import { FontProvider } from "./context/font-context";
import { ThemeProvider } from "./context/theme-context";
import "./index.css";
// Generated Routes
import { routeTree } from "./routeTree.gen";
import { useAuthStore } from "./stores/use-auth-store";
// import { Toaster } from "./components/ui/sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.log({ failureCount, error });

        if (failureCount >= 0 && import.meta.env.DEV) return false;
        if (failureCount > 3 && import.meta.env.PROD) return false;

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        );
      },
      // refetchOnWindowFocus: import.meta.env.PROD,
      refetchOnWindowFocus: true,
      staleTime: 0 * 1000, // 0s
      gcTime: 0,
    },
    mutations: {
      onError: (error) => {
        handleServerError(error);

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.error("Content not modified!");
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error("Session expired!");
          useAuthStore.getState().logout();
          const redirect = `${router.history.location.href}`;
          router.navigate({ to: "/sign-in", search: { redirect } });
        }
        if (error.response?.status === 500) {
          toast.error("Internal Server Error!");
          router.navigate({ to: "/500" });
        }
        if (error.response?.status === 403) {
          router.navigate({ to: "/503" });
        }
      }
    },
  }),
});

// Create a new router instance
const router = createRouter({
  basepath: "",
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
if (process.env.NODE_ENV === "production") {
  console.log = function () {};
  console.warn = function () {};
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="mode">
          <FontProvider>
            <RouterProvider router={router} />
            {/* <Toaster /> */}
          </FontProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}
