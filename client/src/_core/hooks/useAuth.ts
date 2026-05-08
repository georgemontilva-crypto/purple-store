import { useCustomAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";

export function useAuth() {
  const { user, loading, refetch } = useCustomAuth();
  const logoutMutation = trpc.customAuth.logout.useMutation({
    onSuccess: () => {
      refetch();
      window.location.href = "/";
    },
  });

  return {
    user,
    loading,
    refetch,
    isAuthenticated: !!user,
    logout: () => logoutMutation.mutate(),
  };
}
