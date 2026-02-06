import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, type ReactElement } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Lazy loading das páginas para melhor performance
const Index = lazy(() => import("./pages/Index"));
const CashFlow = lazy(() => import("./pages/CashFlow"));
const Clients = lazy(() => import("./pages/Clients"));
const Leads = lazy(() => import("./pages/Leads"));
const AsaasFinancial = lazy(() => import("./pages/AsaasFinancial"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));

// Configurar QueryClient com cache otimizado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos - dados considerados "frescos" por 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos - cache mantido por 10 minutos (anteriormente cacheTime)
      refetchOnWindowFocus: false, // Não recarregar ao focar na janela
      refetchOnMount: false, // Não recarregar ao montar se os dados estão no cache
      retry: 1, // Tentar apenas 1 vez em caso de erro
    },
  },
});

const RequireAuth = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Componente de loading para páginas lazy
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center text-muted-foreground">
    Carregando...
  </div>
);

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route
                path="/login"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Login />
                  </Suspense>
                }
              />
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <Suspense fallback={<PageLoader />}>
                      <Index />
                    </Suspense>
                  </RequireAuth>
                }
              />
              <Route
                path="/fluxo-caixa"
                element={
                  <RequireAuth>
                    <Suspense fallback={<PageLoader />}>
                      <CashFlow />
                    </Suspense>
                  </RequireAuth>
                }
              />
              <Route
                path="/clientes"
                element={
                  <RequireAuth>
                    <Suspense fallback={<PageLoader />}>
                      <Clients />
                    </Suspense>
                  </RequireAuth>
                }
              />
              <Route
                path="/leads"
                element={
                  <RequireAuth>
                    <Suspense fallback={<PageLoader />}>
                      <Leads />
                    </Suspense>
                  </RequireAuth>
                }
              />
              <Route
                path="/asaas-financial"
                element={
                  <RequireAuth>
                    <Suspense fallback={<PageLoader />}>
                      <AsaasFinancial />
                    </Suspense>
                  </RequireAuth>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route
                path="*"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <NotFound />
                  </Suspense>
                }
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
