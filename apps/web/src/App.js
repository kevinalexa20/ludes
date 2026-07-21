import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from "react";
import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet, useNavigate, } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/features/auth/hooks/use-auth";
import { Layout } from "@/components/layout";
import { HomePage } from "@/pages/home-page";
import { LoginPage } from "@/features/auth/pages/login-page";
import { RegisterPage } from "@/features/auth/pages/register-page";
import { MerchantProfilePage } from "@/pages/merchant-profile-page";
import { FoodListPage } from "@/pages/food-list-page";
import { CreateFoodPage } from "@/pages/create-food-page";
// Helper components for guards
const AuthGuard = ({ children, requireMerchant = false }) => {
    const { isLoggedIn, isMerchant, merchantProfile, isLoading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (isLoading)
            return;
        if (!isLoggedIn) {
            navigate({ to: "/login" });
        }
        else if (requireMerchant && !isMerchant) {
            navigate({ to: "/" });
        }
        else if (requireMerchant && isMerchant && !merchantProfile && window.location.pathname !== "/merchant/profile") {
            navigate({ to: "/merchant/profile" });
        }
    }, [isLoggedIn, isMerchant, merchantProfile, isLoading, navigate, requireMerchant]);
    if (isLoading) {
        return (_jsx("div", { className: "min-h-[50vh] flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-4 border-brand-green-500 border-t-transparent" }) }));
    }
    if (!isLoggedIn)
        return null;
    if (requireMerchant && !isMerchant)
        return null;
    return _jsx(_Fragment, { children: children });
};
const PublicOnlyGuard = ({ children }) => {
    const { isLoggedIn, isLoading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (isLoading)
            return;
        if (isLoggedIn) {
            navigate({ to: "/" });
        }
    }, [isLoggedIn, isLoading, navigate]);
    if (isLoading) {
        return (_jsx("div", { className: "min-h-[50vh] flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-4 border-brand-green-500 border-t-transparent" }) }));
    }
    if (isLoggedIn)
        return null;
    return _jsx(_Fragment, { children: children });
};
// Route Tree Definitions
const rootRoute = createRootRoute({
    component: () => (_jsx(Layout, { children: _jsx(Outlet, {}) })),
});
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: HomePage,
});
const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/login",
    component: () => (_jsx(PublicOnlyGuard, { children: _jsx(LoginPage, {}) })),
});
const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/register",
    component: () => (_jsx(PublicOnlyGuard, { children: _jsx(RegisterPage, {}) })),
});
const merchantProfileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/merchant/profile",
    component: () => (_jsx(AuthGuard, { requireMerchant: true, children: _jsx(MerchantProfilePage, {}) })),
});
const merchantFoodRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/merchant/food",
    component: () => (_jsx(AuthGuard, { requireMerchant: true, children: _jsx(FoodListPage, {}) })),
});
const merchantFoodNewRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/merchant/food/new",
    component: () => (_jsx(AuthGuard, { requireMerchant: true, children: _jsx(CreateFoodPage, {}) })),
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
export const App = () => {
    return (_jsx(AuthProvider, { children: _jsx(RouterProvider, { router: router }) }));
};
export default App;
//# sourceMappingURL=App.js.map