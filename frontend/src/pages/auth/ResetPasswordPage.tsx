import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";
import { FormField } from "../../components/forms/FormField";
import { Input } from "../../components/forms/Input";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../services/api";

import { AuthShell } from "./AuthShell";

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const message = await resetPassword({ password, token });
      showToast({
        title: "Password updated",
        description: message,
        tone: "success"
      });
      navigate("/login", { replace: true });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to reset password.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Reset Password"
      title="Choose a fresh password"
      subtitle="Set a new password for your Pen A Wish account and step back into your celebration dashboard."
    >
      {!token ? (
        <p className="rounded-[20px] bg-rose-50 px-4 py-3 text-sm text-rose-800">
          This reset link is missing a token. Please request a new password reset email.
        </p>
      ) : (
        <form className="mt-2 space-y-5" onSubmit={handleSubmit}>
          <FormField
            label="New password"
            helperText="Use at least 8 characters so your new sign-in stays secure."
          >
            <div className="relative">
              <Input
                autoComplete="new-password"
                className="pr-20"
                placeholder="Create a new password"
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
            {isSubmitting ? "Updating password..." : "Reset password"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-charcoal-900/65">
        Need a new link?{" "}
        <Link className="font-medium text-plum-800" to="/forgot-password">
          Request another reset email
        </Link>
      </p>
    </AuthShell>
  );
}
