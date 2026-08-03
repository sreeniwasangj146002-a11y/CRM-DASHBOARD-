"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Leaf, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginFormSchema, LoginFormValues } from "@/lib/validation";
import { useAuthStore, DEMO_USERNAME, DEMO_PASSWORD } from "@/hooks/use-auth-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { username: DEMO_USERNAME, password: DEMO_PASSWORD },
  });

  const onSubmit = (values: LoginFormValues) => {
    setIsSubmitting(true);
    // Simulated auth check — this is a demo login, not a real backend session.
    setTimeout(() => {
      if (values.username === DEMO_USERNAME && values.password === DEMO_PASSWORD) {
        login(values.username);
        toast.success("Welcome back!");
        router.push("/");
      } else {
        toast.error("Invalid username or password.");
        setIsSubmitting(false);
      }
    }, 400);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Leaf className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Greentiq CRM</h1>
          <p className="text-sm text-muted">Sign in to manage your customers.</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-lg"
        >
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
              <Input id="username" className="pl-9" placeholder="1" {...register("username")} />
            </div>
            {errors.username && (
              <p className="text-xs text-danger">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pl-9 pr-9"
                placeholder="123"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-2 hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-danger">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>

          <p className="text-center text-xs text-muted">
            Demo credentials — username <span className="font-mono text-foreground">1</span>,
            password <span className="font-mono text-foreground">123</span> (prefilled).
          </p>
        </form>
      </div>
    </div>
  );
}
