import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Navbar } from "./navbar";

export function MainLayout({ children, requireAuth = true, requireAdmin = false }: { children: ReactNode, requireAuth?: boolean, requireAdmin?: boolean }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !user) {
        setLocation("/auth");
      } else if (requireAdmin && user?.role !== 'admin') {
        setLocation("/");
      }
    }
  }, [user, isLoading, requireAuth, requireAdmin, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (requireAuth && !user) {
    return null;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col relative text-foreground">
      {user && <Navbar />}
      <main className="flex-1 flex flex-col container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
