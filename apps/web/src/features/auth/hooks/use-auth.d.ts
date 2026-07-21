import React, { ReactNode } from "react";
import { User, Merchant, RegisterInput, LoginInput } from "@ludes/shared";
interface AuthContextType {
    user: User | null;
    merchantProfile: Merchant | null;
    isLoggedIn: boolean;
    isMerchant: boolean;
    login: (data: LoginInput) => Promise<void>;
    register: (data: RegisterInput) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
}
export declare const AuthProvider: ({ children }: {
    children: ReactNode;
}) => React.JSX.Element;
export declare const useAuth: () => AuthContextType;
export {};
//# sourceMappingURL=use-auth.d.ts.map