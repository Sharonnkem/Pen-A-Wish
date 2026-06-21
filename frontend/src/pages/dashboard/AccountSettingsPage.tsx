import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { Card } from "@/components/cards/Card";
import { Button } from "@/components/common/Button";
import { useToast } from "@/components/common/Toast";
import { FormField } from "@/components/forms/FormField";
import { Input } from "@/components/forms/Input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";

type LocalPreferences = {
  emailNotifications: boolean;
  giftAlerts: boolean;
  guestbookAlerts: boolean;
  wishAlerts: boolean;
};

const SETTINGS_STORAGE_KEY = "pen-a-wish-local-settings";

const defaultPreferences: LocalPreferences = {
  emailNotifications: true,
  giftAlerts: true,
  guestbookAlerts: true,
  wishAlerts: true
};

export function AccountSettingsPage() {
  const { logout, user } = useAuth();
  const { showToast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(user?.name ?? "");
  const [preferences, setPreferences] = useState<LocalPreferences>(defaultPreferences);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedPreferences = window.localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!storedPreferences) {
      return;
    }

    try {
      const parsed = JSON.parse(storedPreferences) as Partial<LocalPreferences>;
      setPreferences({
        ...defaultPreferences,
        ...parsed
      });
    } catch {
      window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
    }
  }, []);

  const initials = useMemo(() => {
    const value = (displayName || user?.name || "PW").trim();
    return value
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [displayName, user?.name]);

  const passwordResetMutation = useMutation({
    mutationFn: () => authService.forgotPassword({ email: user?.email ?? "" }),
    onError: () => {
      showToast({
        title: "Reset email failed",
        description: "We could not send the password reset email right now.",
        tone: "error"
      });
    },
    onSuccess: () => {
      showToast({
        title: "Reset email sent",
        description: "Check your inbox for the secure password reset link.",
        tone: "success"
      });
    }
  });

  function persistPreferences(nextPreferences: LocalPreferences) {
    setPreferences(nextPreferences);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextPreferences));
    }

    showToast({
      title: "Preferences saved",
      description: "Your account preferences were saved on this browser.",
      tone: "success"
    });
  }

  return (
    <DashboardLayout
      title="Account settings"
      subtitle="Keep your profile details, security actions, and notification preferences in one calm, polished space."
      actions={
        <Button variant="secondary" onClick={() => void logout()}>
          Log out
        </Button>
      }
    >
      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card
          tone="polaroid"
          title="Profile snapshot"
          description="Your current account identity and avatar preview live here."
        >
          <div className="grid gap-5 lg:grid-cols-[10rem_minmax(0,1fr)] lg:items-center">
            <div className="flex flex-col items-center gap-3">
              {avatarPreview ? (
                <img
                  alt="Avatar preview"
                  className="h-32 w-32 rounded-[30px] object-cover shadow-card"
                  src={avatarPreview}
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-[30px] bg-plum-800 text-3xl font-display text-white shadow-card">
                  {initials}
                </div>
              )}
              <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-plum-700/12 bg-white px-4 py-2 text-sm font-semibold text-plum-800 transition hover:border-plum-700/24">
                Avatar preview
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    setAvatarPreview(URL.createObjectURL(file));
                    showToast({
                      title: "Avatar preview updated",
                      description: "The selected image is ready for your profile preview.",
                      tone: "success"
                    });
                  }}
                />
              </label>
            </div>

            <div className="space-y-4">
              <FormField label="Display name">
                <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
              </FormField>
              <FormField label="Email address">
                <Input readOnly value={user?.email ?? ""} />
              </FormField>
              <div className="rounded-[22px] bg-white/72 px-4 py-4 text-sm leading-7 text-charcoal-900/70">
                Profile editing APIs are not exposed yet, so this page keeps your structure, security actions, and preference controls ready without inventing backend behavior.
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Security"
          description="Use trusted account actions without leaving the dashboard."
        >
          <div className="space-y-4">
            <div className="rounded-[22px] border border-plum-700/10 bg-cream-50/88 p-4 text-sm leading-7 text-charcoal-900/70">
              Password changes are handled through the secure reset flow so we do not expose sensitive updates in a half-connected form.
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                disabled={passwordResetMutation.isPending || !user?.email}
                onClick={() => passwordResetMutation.mutate()}
              >
                {passwordResetMutation.isPending ? "Sending reset email..." : "Send password reset email"}
              </Button>
              <Button variant="ghost" onClick={() => void logout()}>
                Log out on this device
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card
          title="Notification preferences"
          description="Choose which celebration moments should stay front and center in this browser."
        >
          <div className="grid gap-3">
            {[
              {
                key: "emailNotifications",
                label: "Email notifications",
                text: "General account and support-related notices."
              },
              {
                key: "wishAlerts",
                label: "Wish alerts",
                text: "New public wishes on your celebrations."
              },
              {
                key: "guestbookAlerts",
                label: "Guestbook alerts",
                text: "Long-form memories added to your guestbook."
              },
              {
                key: "giftAlerts",
                label: "Gift alerts",
                text: "Gift and wallet-related activity."
              }
            ].map((item) => {
              const key = item.key as keyof LocalPreferences;

              return (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-start justify-between gap-4 rounded-[22px] border border-plum-700/10 bg-white/78 px-4 py-4"
                >
                  <div>
                    <p className="font-semibold text-charcoal-900">{item.label}</p>
                    <p className="mt-1 text-sm text-charcoal-900/62">{item.text}</p>
                  </div>
                  <input
                    checked={preferences[key]}
                    className="mt-1 h-5 w-5 rounded border-plum-700/20 accent-plum-800"
                    type="checkbox"
                    onChange={(event) =>
                      persistPreferences({
                        ...preferences,
                        [key]: event.target.checked
                      })
                    }
                  />
                </label>
              );
            })}
          </div>
        </Card>

        <Card
          title="Account guidance"
          description="A simple reminder of how this Version 1 settings space behaves."
        >
          <div className="space-y-3 text-sm leading-7 text-charcoal-900/70">
            <div className="rounded-[20px] bg-white/72 px-4 py-4">
              Account identity comes from your authenticated Pen A Wish session.
            </div>
            <div className="rounded-[20px] bg-white/72 px-4 py-4">
              Notification choices on this page are saved locally in your browser for now.
            </div>
            <div className="rounded-[20px] bg-white/72 px-4 py-4">
              Password changes are routed through the secure reset email flow.
            </div>
          </div>
        </Card>
      </section>
    </DashboardLayout>
  );
}
