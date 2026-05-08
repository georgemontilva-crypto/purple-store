import { createContext, useContext, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

type AuthUser = {
  id: number;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  isVerified: boolean;
} | null;

type AuthContextType = {
  user: AuthUser;
  loading: boolean;
  refetch: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refetch: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, refetch } = trpc.customAuth.me.useQuery(undefined, {
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return (
    <AuthContext.Provider
      value={{
        user: data ?? null,
        loading: isLoading,
        refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useCustomAuth() {
  return useContext(AuthContext);
}
