import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/common/Button";
import { useToast } from "@/components/common/Toast";
import { FormField } from "@/components/forms/FormField";
import { Input } from "@/components/forms/Input";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/services/api";

import { AuthShell } from "./AuthShell";

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const user = await login({ email, password });
      showToast({
        title: "Welcome back",
        description: "Your account is ready for wishes, gifts, and celebration planning.",
        tone: "success"
      });

      const nextPath =
        (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
        (user.role === "admin" ? "/admin" : "/dashboard");

      navigate(nextPath, { replace: true });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to log in right now.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Login"
      title="Step back into your celebration space"
      subtitle="Sign in to manage your events, follow new wishes, and keep every memory in motion."
    >
      <form className="mt-2 space-y-5" onSubmit={handleSubmit}>
        <FormField label="Email address">
          <Input
            autoComplete="email"
            placeholder="sharon@example.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>

        <FormField
          label="Password"
          labelAdornment={
            <Link className="text-plum-700 transition hover:text-plum-800" to="/forgot-password">
              Forgot password?
            </Link>
          }
        >
          <div className="relative">
            <Input
              autoComplete="current-password"
              className="pr-20"
              placeholder="Enter your password"
              type={isPasswordVisible ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-plum-700 transition hover:text-plum-800"
              onClick={() => setIsPasswordVisible((current) => !current)}
            >
              {isPasswordVisible ? "Hide" : "Show"}
            </button>
          </div>
        </FormField>

        {errorMessage ? (
          <p className="rounded-[20px] bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {errorMessage}
          </p>
        ) : null}

        <Button fullWidth type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing you in..." : "Login"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-charcoal-900/65">
        New here?{" "}
        <Link className="font-medium text-plum-800" to="/register">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
