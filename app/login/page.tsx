import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { hasSupabaseConfig } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return <AuthForm isConfigured={hasSupabaseConfig()} />;
}
