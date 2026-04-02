import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import LandingPage from "./landing";

export default function AuthPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/discover");
    }
  }, [user, setLocation]);

  return <LandingPage />;
}
