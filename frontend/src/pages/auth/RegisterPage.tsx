import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";
import { FormField } from "../../components/forms/FormField";
import { Input } from "../../components/forms/Input";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../services/api";

import { AuthShell } from "./AuthShell";

export function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: ""
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const user = await register(form);
      showToast({
        title: "Account created",
        description: "Your wallet was prepared automatically, and you are ready to start celebrating.",
        tone: "success"
      });
      navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to create your account.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Register"
      title="Create your Pen A Wish account"
      subtitle="Start building celebration pages that gather wishes, memories, and gifts in one warm place."
    >
      <form className="mt-2 space-y-5" onSubmit={handleSubmit}>
        <FormField label="Full name">
          <Input
            autoComplete="name"
            placeholder="Sharon Isichei"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />
        </FormField>

        <FormField label="Email address">
          <Input
            autoComplete="email"
            placeholder="sharon@example.com"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
          />
        </FormField>

        <FormField
          label="Password"
          helperText="Use at least 8 characters to keep your account protected."
        >
          <div className="relative">
            <Input
              autoComplete="new-password"
              className="pr-20"
              placeholder="Create a strong password"
              type={isPasswordVisible ? "text" : "password"}
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
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
          {isSubmitting ? "Creating your account..." : "Register"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-charcoal-900/65">
        Already have an account?{" "}
        <Link className="font-medium text-plum-800" to="/login">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
