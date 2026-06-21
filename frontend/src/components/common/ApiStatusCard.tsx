import { useEffect, useState } from "react";

import { healthApi } from "../../services/health.service";

type ApiState = "idle" | "loading" | "success" | "error";

export function ApiStatusCard() {
  const [status, setStatus] = useState<ApiState>("idle");
  const [message, setMessage] = useState(
    "The frontend foundation is ready to connect to the backend health check."
  );

  useEffect(() => {
    let mounted = true;

    async function checkHealth() {
      setStatus("loading");

      try {
        const response = await healthApi.getHealth();

        if (!mounted) {
          return;
        }

        setStatus("success");
        setMessage(response.message);
      } catch (error) {
        if (!mounted) {
          return;
        }

        const fallback =
          error instanceof Error
            ? error.message
            : "Unable to reach the backend health endpoint.";

        setStatus("error");
        setMessage(fallback);
      }
    }

    void checkHealth();

    return () => {
      mounted = false;
    };
  }, []);

  const accentClass =
    status === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : status === "error"
        ? "border-rose-200 bg-rose-50 text-rose-900"
        : "border-gold-400/20 bg-white text-charcoal-900";

  return (
    <aside className="rounded-[28px] border border-plum-700/10 bg-plum-800 p-7 text-white shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush-100">
        Backend Health
      </p>
      <h2 className="mt-3 font-display text-2xl">Connection check</h2>
      <p className="mt-3 text-sm leading-7 text-white/76">
        This is a lightweight foundation probe so we can validate the backend
        before any feature APIs are built.
      </p>
      <div className={`mt-6 rounded-3xl border px-4 py-4 text-sm ${accentClass}`}>
        {status === "loading" ? "Checking backend health..." : message}
      </div>
    </aside>
  );
}

