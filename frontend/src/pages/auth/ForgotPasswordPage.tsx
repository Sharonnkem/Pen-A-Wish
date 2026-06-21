import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";
import { FormField } from "../../components/forms/FormField";
import { Input } from "../../components/forms/Input";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../services/api";

import { AuthShell } from "./AuthShell";

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const message = await forgotPassword({ email });
      showToast({
        title: "Check your inbox",
        description: message,
        tone: "success"
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to start the password reset flow.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Forgot Password"
      title="Let’s help you back in"
      subtitle="Enter the email tied to your account and we’ll send a secure reset link if it exists."
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

        {errorMessage ? (
          <p className="rounded-[20px] bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {errorMessage}
          </p>
        ) : null}

        <Button fullWidth type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending reset link..." : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-charcoal-900/65">
        Remembered it?{" "}
        <Link className="font-medium text-plum-800" to="/login">
          Return to login
        </Link>
      </p>
    </AuthShell>
  );
}

