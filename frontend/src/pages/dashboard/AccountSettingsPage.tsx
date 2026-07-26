import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { Card } from "../../components/cards/Card";
import { Button } from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";
import { FormField } from "../../components/forms/FormField";
import { Input } from "../../components/forms/Input";
import { ImageCropModal } from "../../components/forms/ImageCropModal";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { eventService } from "../../services/event.service";
import { authService } from "../../services/auth.service";

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
  const navigate = useNavigate();
  const { deleteAccount, logout, refreshSession, updateProfile, user } = useAuth();
  const { showToast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null);
  const [avatarCropSource, setAvatarCropSource] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState(user?.name ?? "");
  const [emailAddress, setEmailAddress] = useState(user?.email ?? "");
  const [preferences, setPreferences] = useState<LocalPreferences>(defaultPreferences);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  useEffect(() => {
    setDisplayName(user?.name ?? "");
    setEmailAddress(user?.email ?? "");
    setAvatarUrl(user?.avatarUrl ?? null);
  }, [user?.avatarUrl, user?.email, user?.name]);

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
    mutationFn: () => authService.forgotPassword({ email: emailAddress }),
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

  const saveProfileMutation = useMutation({
    mutationFn: updateProfile,
    onError: () => {
      showToast({
        title: "Profile not saved",
        description: "We could not update your profile right now.",
        tone: "error"
      });
    },
    onSuccess: () => {
      showToast({
        title: "Profile saved",
        description: "Your profile details were updated successfully.",
        tone: "success"
      });
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onError: () => {
      showToast({
        title: "Account deletion failed",
        description: "We could not delete your account right now.",
        tone: "error"
      });
    },
    onSuccess: () => {
      showToast({
        title: "Account deleted",
        description: "Your session has been cleared and you have been signed out.",
        tone: "success"
      });
      navigate("/login");
    }
  });

  async function saveProfile(nextAvatarUrl: string | null = avatarUrl) {
    await saveProfileMutation.mutateAsync({
      avatarUrl: nextAvatarUrl,
      email: emailAddress,
      name: displayName
    });
  }

  async function handleAvatarCropConfirm(file: File) {
    setIsAvatarUploading(true);

    try {
      const response = await eventService.uploadImage({
        file,
        folder: "avatars"
      });

      setAvatarUrl(response.data.url);
      await saveProfile(response.data.url);
    } catch {
      showToast({
        title: "Avatar upload failed",
        description: "We could not upload your cropped photo right now.",
        tone: "error"
      });
    } finally {
      setIsAvatarUploading(false);
      setAvatarCropSource(null);
    }
  }

  async function handleDeleteAvatar() {
    if (!avatarUrl) {
      return;
    }

    setAvatarUrl(null);
    await saveProfile(null);
  }

  function persistPreferences(nextPreferences: LocalPreferences) {
    setPreferences(nextPreferences);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextPreferences));
    }

    showToast({
      title: "Preferences saved",
      description: "Your notification choices were saved in this browser.",
      tone: "success"
    });
  }

  return (
    <DashboardLayout
      title="Account settings"
      subtitle="Update your profile details, manage your photo, and keep the notifications that matter most."
      actions={
        <Button variant="secondary" onClick={() => void logout()}>
          Log out
        </Button>
      }
    >
      <ImageCropModal
        aspectRatio={1}
        backgroundColor="#f8f1ea"
        description="Crop your avatar before it is uploaded to your profile."
        file={avatarCropSource}
        isOpen={Boolean(avatarCropSource)}
        onClose={() => setAvatarCropSource(null)}
        onConfirm={(file) => void handleAvatarCropConfirm(file)}
        title="Crop profile photo"
      />

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card
          tone="polaroid"
          title="Profile"
          description="Edit the name and email tied to your Pen A Wish account."
        >
          <div className="grid gap-5 lg:grid-cols-[10rem_minmax(0,1fr)] lg:items-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[30px] border border-plum-700/10 bg-plum-800 shadow-card">
                {avatarUrl ? (
                  <img alt="Profile photo preview" className="h-full w-full object-cover" src={avatarUrl} />
                ) : (
                  <span className="font-display text-3xl text-white">{initials}</span>
                )}
              </div>

              <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-plum-700/12 bg-white px-4 py-2 text-sm font-semibold text-plum-800 transition hover:border-plum-700/24">
                Upload photo
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";

                    if (!file) {
                      return;
                    }

                    setAvatarCropSource(file);
                  }}
                />
              </label>

              {avatarUrl ? (
                <Button
                  variant="ghost"
                  className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                  onClick={() => void handleDeleteAvatar()}
                >
                  Delete photo
                </Button>
              ) : null}
            </div>

            <div className="space-y-4">
              <FormField label="Display name">
                <Input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </FormField>
              <FormField label="Email address">
                <Input
                  value={emailAddress}
                  onChange={(event) => setEmailAddress(event.target.value)}
                />
              </FormField>
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={
                    saveProfileMutation.isPending ||
                    isAvatarUploading ||
                    !displayName.trim() ||
                    !emailAddress.trim()
                  }
                  onClick={() => void saveProfile()}
                >
                  Save changes
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Security" description="Use trusted account actions from one calm place.">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                disabled={passwordResetMutation.isPending || !user?.email}
                onClick={() => passwordResetMutation.mutate()}
              >
                {passwordResetMutation.isPending ? "Sending reset email..." : "Send password reset email"}
              </Button>
              <Button
                variant="ghost"
                className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                disabled={deleteAccountMutation.isPending}
                onClick={() => {
                  const confirmed = window.confirm(
                    "Delete your Pen A Wish account? This will remove your celebrations, wallet, and public activity."
                  );

                  if (!confirmed) {
                    return;
                  }

                  void deleteAccountMutation.mutate();
                }}
              >
                {deleteAccountMutation.isPending ? "Deleting account..." : "Delete account"}
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
          title="Account tips"
          description="A few useful reminders to keep your profile and notifications tidy."
        >
          <div className="space-y-3 text-sm leading-7 text-charcoal-900/70">
            <div className="rounded-[20px] bg-white/72 px-4 py-4">
              Notification choices on this page are saved immediately in this browser.
            </div>
            <div className="rounded-[20px] bg-white/72 px-4 py-4">
              You can delete your account from the Security section when you are ready.
            </div>
          </div>
        </Card>
      </section>
    </DashboardLayout>
  );
}
