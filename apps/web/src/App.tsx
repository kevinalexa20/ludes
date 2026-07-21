import React, { useEffect } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/features/auth/hooks/use-auth";
import { Layout } from "@/components/layout";
import { HomePage } from "@/pages/home-page";
import { LoginPage } from "@/features/auth/pages/login-page";
import { RegisterPage } from "@/features/auth/pages/register-page";
import { MerchantProfilePage } from "@/pages/merchant-profile-page";
import { FoodListPage } from "@/pages/food-list-page";
import { CreateFoodPage } from "@/pages/create-food-page";

// Helper components for guards
const AuthGuard = ({ children, requireMerchant = false }: { children: React.ReactNode, requireMerchant?: boolean }) => {
  const { isLoggedIn, isMerchant, merchantProfile, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    
    if (!isLoggedIn) {
      navigate({ to: "/login" });
    } else if (requireMerchant && !isMerchant) {
      navigate({ to: "/" });
    } else if (requireMerchant && isMerchant && !merchantProfile && window.location.pathname !== "/merchant/profile") {
      navigate({ to: "/merchant/profile" });
    }
  }, [isLoggedIn, isMerchant, merchantProfile, isLoading, navigate, requireMerchant]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-green-500 border-t-transparent" />
      </div>
    );
  }

  if (!isLoggedIn) return null;
  if (requireMerchant && !isMerchant) return null;

  return <>{children}</>;
};

const PublicOnlyGuard = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (isLoggedIn) {
      navigate({ to: "/" });
    }
  }, [isLoggedIn, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-green-500 border-t-transparent" />
      </div>
    );
  }

  if (isLoggedIn) return null;

  return <>{children}</>;
};

// Route Tree Definitions
const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <PublicOnlyGuard>
      <LoginPage />
    </PublicOnlyGuard>
  ),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: () => (
    <PublicOnlyGuard>
      <RegisterPage />
    </PublicOnlyGuard>
  ),
});

const merchantProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/merchant/profile",
  component: () => (
    <AuthGuard requireMerchant={true}>
      <MerchantProfilePage />
    </AuthGuard>
  ),
});

const merchantFoodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/merchant/food",
  component: () => (
    <AuthGuard requireMerchant={true}>
      <FoodListPage />
    </AuthGuard>
  ),
});

const merchantFoodNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/merchant/food/new",
  component: () => (
    <AuthGuard requireMerchant={true}>
      <CreateFoodPage />
    </AuthGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  merchantProfileRoute,
  merchantFoodRoute,
  merchantFoodNewRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
