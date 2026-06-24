import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { Select, SelectOption } from "../../components/forms/Select";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useToast } from "../../components/common/Toast";
import { GuestbookWallPreview } from "../../components/wall/GuestbookWallPreview";
import { WishWallPreview } from "../../components/wall/WishWallPreview";
import { ApiError } from "../../services/api";
import { dashboardService } from "../../services/dashboard.service";
import { eventService } from "../../services/event.service";
import type { WishWallSettings } from "../../types/wish-wall";

const defaultSettings: WishWallSettings = {
  background: {
    color: "#fffaf4",
    gradientEnd: "#f8eee4",
    gradientStart: "#fffaf4",
    imageUrl: null,
    mode: "gradient"
  },
  cardStyle: {
    density: "relaxed",
    radius: "large",
    style: "polaroid"
  },
  export: {
    showHeader: true,
    showMetadata: true,
    showReactions: true,
    showStats: true
  },
  layout: {
    columns: 3,
    mode: "collageScrapbook"
  },
  themePreset: "paper",
  typography: {
    bodyFont: "sans",
    headingFont: "serif"
  }
};

const gradientPresets = [
  { label: "Cream Bloom", from: "#fffaf4", to: "#f8eee4" },
  { label: "Rose Glow", from: "#fff7f8", to: "#f7d9dc" },
  { label: "Garden Mist", from: "#f7fbf8", to: "#e6efe5" },
  { label: "Golden Hour", from: "#fff8ef", to: "#f2dcc7" }
] as const;

const themePresets: Array<{
  label: string;
  value: WishWallSettings["themePreset"];
}> = [
  { label: "Paper", value: "paper" },
  { label: "Sunset", value: "sunset" },
  { label: "Garden", value: "garden" },
  { label: "Midnight", value: "midnight" }
];

const exportToggleKeys = [
  { key: "showHeader", label: "Header" },
  { key: "showStats", label: "Stats" },
  { key: "showMetadata", label: "Metadata" },
  { key: "showReactions", label: "Reactions" }
] as const;

const typographyOptions = [
  { label: "Serif editorial", value: "serif" },
  { label: "Clean sans", value: "sans" },
  { label: "Display serif", value: "display" },
  { label: "Handwritten script", value: "handwritten" },
  { label: "Typewriter mono", value: "mono" }
] as const;

const layoutModeOptions = [
  { label: "Collage Scrapbook", value: "collageScrapbook" as const },
  { label: "Letter Timeline", value: "letterTimeline" as const },
  { label: "Bunting Garland", value: "buntingGarland" as const },
  { label: "Open Journal", value: "openJournal" as const }
] satisfies Array<{
  label: string;
  value: WishWallSettings["layout"]["mode"];
}>;

function cloneSettings(settings: WishWallSettings): WishWallSettings {
  return {
    background: { ...settings.background },
    cardStyle: { ...settings.cardStyle },
    export: { ...settings.export },
    layout: { ...settings.layout },
    themePreset: settings.themePreset,
    typography: { ...settings.typography }
  };
}

function applyPreset(preset: WishWallSettings["themePreset"]): WishWallSettings {
  switch (preset) {
    case "sunset":
      return {
        ...defaultSettings,
        background: {
          color: "#fff7f0",
          gradientEnd: "#f2dcc7",
          gradientStart: "#fff7f0",
          imageUrl: null,
          mode: "gradient"
        },
        cardStyle: {
          density: "relaxed",
          radius: "large",
          style: "glass"
        },
        layout: {
          columns: 3,
          mode: "collageScrapbook"
        },
        themePreset: "sunset"
      };
    case "garden":
      return {
        ...defaultSettings,
        background: {
          color: "#f7fbf8",
          gradientEnd: "#e6efe5",
          gradientStart: "#f7fbf8",
          imageUrl: null,
          mode: "gradient"
        },
        cardStyle: {
          density: "relaxed",
          radius: "rounded",
          style: "linen"
        },
        typography: {
          bodyFont: "sans",
          headingFont: "serif"
        },
        themePreset: "garden"
      };
    case "midnight":
      return {
        ...defaultSettings,
        background: {
          color: "#efe8df",
          gradientEnd: "#dfd2c5",
          gradientStart: "#f8f3ec",
          imageUrl: null,
          mode: "gradient"
        },
        cardStyle: {
          density: "compact",
          radius: "soft",
          style: "glass"
        },
        layout: {
          columns: 2,
          mode: "letterTimeline"
        },
        typography: {
          bodyFont: "sans",
          headingFont: "serif"
        },
        themePreset: "midnight"
      };
    default:
      return cloneSettings(defaultSettings);
  }
}

export function WallStudioPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const backgroundInputRef = useRef<HTMLInputElement | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const lastSavedSignatureRef = useRef("");
  const [exportState, setExportState] = useState<{
    format: "JPG" | "PDF" | "PNG" | null;
    message?: string;
    status: "idle" | "loading" | "success" | "failure";
  }>({ format: null, status: "idle" });
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [exportTarget, setExportTarget] = useState<"guestbook" | "wishes">("wishes");
  const [settings, setSettings] = useState<WishWallSettings>(cloneSettings(defaultSettings));

  const wishesQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => dashboardService.getEventWishes(id),
    queryKey: ["event-wall", id]
  });
  const eventDetailsQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => eventService.getEventById(id),
    queryKey: ["event-detail", id]
  });
  const settingsQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => eventService.getWishWallSettings(id),
    queryKey: ["wish-wall-settings", id]
  });
  const guestbookQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => dashboardService.getEventGuestbook(id),
    queryKey: ["event-guestbook", id]
  });

  const visibleWishes = useMemo(
    () => (wishesQuery.data?.data.wishes ?? []).filter((wish) => !wish.isHidden),
    [wishesQuery.data]
  );
  const visibleGuestbookEntries = useMemo(
    () => (guestbookQuery.data?.data.entries ?? []).filter((entry) => !entry.isHidden),
    [guestbookQuery.data]
  );
  const visibleWishPreviews = useMemo(
    () =>
      (wishesQuery.data?.data.wishes ?? [])
        .filter((wish) => !wish.isHidden)
        .map((wish) => ({
          createdAt: wish.createdAt,
          id: wish.id,
          message: wish.message,
          reactionCounts: [],
          senderName: wish.senderName
        })),
    [wishesQuery.data]
  );
  const wallEvent = wishesQuery.data?.data.event;
  const eventDetails = eventDetailsQuery.data?.data.event;
  const guestbookEvent = guestbookQuery.data?.data.event;

  const hideWishMutation = useMutation({
    mutationFn: (wishId: string) => dashboardService.hideWish(wishId),
    onError: (error) => {
      showToast({
        title: "Unable to remove wish",
        description:
          error instanceof ApiError
            ? error.message
            : "We could not hide that wish right now.",
        tone: "error"
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["event-wall", id] }),
        queryClient.invalidateQueries({ queryKey: ["event-detail", id] }),
        queryClient.invalidateQueries({ queryKey: ["event-wishes", id] }),
        queryClient.invalidateQueries({ queryKey: ["my-events"] })
      ]);
      showToast({
        title: "Wish removed from wall",
        description: "The message has been hidden from the Wish Wall and exports.",
        tone: "success"
      });
    }
  });

  const hideGuestbookMutation = useMutation({
    mutationFn: (entryId: string) => dashboardService.hideGuestbookEntry(entryId),
    onError: (error) => {
      showToast({
        title: "Unable to hide memory",
        description:
          error instanceof ApiError
            ? error.message
            : "We could not hide that memory right now.",
        tone: "error"
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["event-guestbook", id] });
      showToast({
        title: "Memory hidden",
        description: "The guestbook note has been removed from the export view.",
        tone: "success"
      });
    }
  });

  const uploadBackgroundMutation = useMutation({
    mutationFn: (file: File) => eventService.uploadImage({ file, folder: "covers" }),
    onError: (error) => {
      showToast({
        title: "Background upload failed",
        description:
          error instanceof ApiError
            ? error.message
            : "We could not upload the background image right now.",
        tone: "error"
      });
    },
    onSuccess: (response) => {
      setSettings((current) => ({
        ...current,
        background: {
          ...current.background,
          imageUrl: response.data.url,
          mode: "image"
        }
      }));
      showToast({
        title: "Background image ready",
        description: "The uploaded image is now available in the wall preview.",
        tone: "success"
      });
    }
  });

  const saveSettingsMutation = useMutation({
    mutationFn: (next: WishWallSettings) => eventService.updateWishWallSettings(id, next),
    onError: (error) => {
      setSaveState("error");
      showToast({
        title: "Unable to save wall settings",
        description:
          error instanceof ApiError
            ? error.message
            : "We could not save the studio changes right now.",
        tone: "error"
      });
    },
    onSuccess: (response) => {
      const next = response.data.settings;
      lastSavedSignatureRef.current = JSON.stringify(next);
      setSettings(next);
      setSaveState("saved");
      void queryClient.invalidateQueries({ queryKey: ["wish-wall-settings", id] });
    }
  });

  useEffect(() => {
    if (settingsQuery.data) {
      const loaded = settingsQuery.data.data.settings ?? defaultSettings;
      const next = cloneSettings(loaded);
      setSettings(next);
      lastSavedSignatureRef.current = JSON.stringify(next);
      setSaveState("saved");
      return;
    }

    if (settingsQuery.isError) {
      const next = cloneSettings(defaultSettings);
      setSettings(next);
      lastSavedSignatureRef.current = JSON.stringify(next);
      setSaveState("saved");
    }
  }, [settingsQuery.data, settingsQuery.isError]);

  useEffect(() => {
    if (settingsQuery.isLoading) {
      return;
    }

    const signature = JSON.stringify(settings);

    if (signature === lastSavedSignatureRef.current) {
      return;
    }

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    setSaveState("saving");
    saveTimerRef.current = window.setTimeout(() => {
      saveSettingsMutation.mutate(settings);
    }, 700);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [saveSettingsMutation, settings, settingsQuery.isLoading]);

  async function handleDownload(format: "JPG" | "PNG" | "PDF") {
    if (!wallEvent || !eventDetails || !guestbookEvent) {
      setExportState({
        format,
        message: "The wall preview is not ready to export yet.",
        status: "failure"
      });
      return;
    }

    setExportState({
      format,
      status: "loading"
    });

    try {
      const blob = await eventService.downloadWishWallExport(id, format, exportTarget);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const exportTitle = exportTarget === "guestbook" ? guestbookEvent.title : wallEvent.title;
      const safeTitle = exportTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);

      link.href = downloadUrl;
      link.download = `${safeTitle || "wish-wall"}-${exportTarget}-${format.toLowerCase()}.${format.toLowerCase()}`;
      link.rel = "noopener";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 30_000);
      showToast({
        title: `${format} export ready`,
        description:
          exportTarget === "guestbook"
            ? "The guestbook memory-book file has been downloaded."
            : "The branded Wish Wall file has been downloaded.",
        tone: "success"
      });
      setExportState({ format: null, status: "idle" });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `We could not create the ${format} export right now.`;
      setExportState({
        format,
        message,
        status: "failure"
      });
      showToast({
        title: `${format} export failed`,
        description: message,
        tone: "error"
      });
    }
  }

  function updateSettings(
    updater: (current: WishWallSettings) => WishWallSettings
  ) {
    setSettings((current) => updater(current));
    setSaveState("saving");
  }

  function applyThemePreset(preset: WishWallSettings["themePreset"]) {
    updateSettings(() => applyPreset(preset));
  }

  const actionMode = searchParams.get("mode");

  if (
    wishesQuery.isLoading ||
    eventDetailsQuery.isLoading ||
    settingsQuery.isLoading ||
    guestbookQuery.isLoading
  ) {
    return (
      <DashboardLayout
        title="Wish Wall studio"
        subtitle="Loading your studio controls and current wall preview..."
      >
        <LoadingState label="Setting up the Wish Wall Studio..." />
      </DashboardLayout>
    );
  }

  if (
    wishesQuery.isError ||
    eventDetailsQuery.isError ||
    guestbookQuery.isError ||
    !wallEvent ||
    !eventDetails ||
    !guestbookEvent
  ) {
    return (
      <DashboardLayout
        title="Wish Wall studio"
        subtitle="We could not load this celebration right now."
      >
        <EmptyState
          title="Unable to load the Wish Wall"
          description="We could not fetch this celebration's wishes right now."
          actionLabel="Try again"
          onAction={() => void wishesQuery.refetch()}
        />
      </DashboardLayout>
    );
  }

  const saveStatusLabel =
    saveState === "saving"
      ? "Saving changes..."
      : saveState === "saved"
        ? "All changes saved"
        : saveState === "error"
          ? "Save failed"
          : "Ready";

  return (
    <DashboardLayout
      title={wallEvent.title}
      subtitle="Customize the wall before exporting it as a keepsake. The preview updates live as you make changes."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-plum-700/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-plum-700">
            {saveStatusLabel}
          </span>
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </Button>
        </div>
      }
    >
      {exportState.status === "loading" || exportState.status === "failure" ? (
        <div
          className={`rounded-[24px] px-4 py-4 text-sm ${
            exportState.status === "failure"
              ? "border border-rose-200 bg-rose-50 text-rose-950"
              : "border border-white/70 bg-white/84 text-charcoal-900/72"
          }`}
        >
          <p className="font-semibold">
            {exportState.status === "loading"
              ? `Preparing ${exportState.format} export...`
              : `${exportState.format} export failed`}
          </p>
          {exportState.message ? <p className="mt-1">{exportState.message}</p> : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        <aside className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          <details
            className="hidden group rounded-[30px] border border-white/70 bg-white/84 p-5 shadow-card xl:col-span-2 2xl:col-span-3"
            open
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-plum-700">
                  Studio controls
                </p>
                <h2 className="mt-3 font-display text-3xl text-charcoal-900">Customize the wall</h2>
                <p className="mt-3 text-sm leading-7 text-charcoal-900/68">
                  Backgrounds, typography, card treatment, and export toggles update the wall live.
                </p>
              </div>
              <span className="text-2xl text-plum-700 transition-transform duration-200 group-open:rotate-180">
                ⌄
              </span>
            </summary>
          </details>

          <details className="group rounded-[30px] border border-white/70 bg-white/84 p-5 shadow-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum-700">
                  Theme presets
                </p>
                <p className="mt-2 text-sm text-charcoal-900/62">One-tap moods for the wall.</p>
              </div>
              <span className="text-2xl text-plum-700 transition-transform duration-200 group-open:rotate-180">
                ⌄
              </span>
            </summary>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {themePresets.map((preset) => (
                <Button
                  key={preset.value}
                  variant={settings.themePreset === preset.value ? "primary" : "secondary"}
                  className="justify-start"
                  onClick={() => applyThemePreset(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </details>

          <details className="group rounded-[30px] border border-white/70 bg-white/84 p-5 shadow-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum-700">
                  Background
                </p>
                <p className="mt-2 text-sm text-charcoal-900/62">Solid, gradient, or image layers.</p>
              </div>
              <span className="text-2xl text-plum-700 transition-transform duration-200 group-open:rotate-180">
                ⌄
              </span>
            </summary>
            <div className="mt-4 grid gap-2">
              <div className="grid grid-cols-3 gap-2">
                {(["solid", "gradient", "image"] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={settings.background.mode === mode ? "primary" : "secondary"}
                    size="sm"
                    onClick={() =>
                      updateSettings((current) => ({
                        ...current,
                        background: { ...current.background, mode }
                      }))
                    }
                  >
                    {mode}
                  </Button>
                ))}
              </div>

              {settings.background.mode === "solid" ? (
                <label className="grid gap-2 text-sm text-charcoal-900/68">
                  Background color
                  <input
                    aria-label="Background color"
                    className="h-12 w-full rounded-[20px] border border-plum-700/12 bg-white/90 p-1"
                    type="color"
                    value={settings.background.color}
                    onChange={(event) =>
                      updateSettings((current) => ({
                        ...current,
                        background: { ...current.background, color: event.target.value }
                      }))
                    }
                  />
                </label>
              ) : null}

              {settings.background.mode === "gradient" ? (
                <div className="grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm text-charcoal-900/68">
                      Gradient start
                      <input
                        aria-label="Gradient start"
                        className="h-12 w-full rounded-[20px] border border-plum-700/12 bg-white/90 p-1"
                        type="color"
                        value={settings.background.gradientStart}
                        onChange={(event) =>
                          updateSettings((current) => ({
                            ...current,
                            background: {
                              ...current.background,
                              gradientStart: event.target.value
                            }
                          }))
                        }
                      />
                    </label>
                    <label className="grid gap-2 text-sm text-charcoal-900/68">
                      Gradient end
                      <input
                        aria-label="Gradient end"
                        className="h-12 w-full rounded-[20px] border border-plum-700/12 bg-white/90 p-1"
                        type="color"
                        value={settings.background.gradientEnd}
                        onChange={(event) =>
                          updateSettings((current) => ({
                            ...current,
                            background: { ...current.background, gradientEnd: event.target.value }
                          }))
                        }
                      />
                    </label>
                  </div>
                  <div className="grid gap-2">
                    {gradientPresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="flex items-center gap-3 rounded-[22px] border border-plum-700/10 bg-white/82 p-3 text-left text-sm transition hover:border-plum-700/20"
                        onClick={() =>
                          updateSettings((current) => ({
                            ...current,
                            background: {
                              ...current.background,
                              gradientEnd: preset.to,
                              gradientStart: preset.from
                            }
                          }))
                        }
                      >
                        <span
                          className="h-8 w-8 rounded-full border border-white/70 shadow-sm"
                          style={{
                            backgroundImage: `linear-gradient(135deg, ${preset.from}, ${preset.to})`
                          }}
                        />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {settings.background.mode === "image" ? (
                <div className="space-y-3">
                  <input
                    ref={backgroundInputRef}
                    accept="image/*"
                    className="hidden"
                    type="file"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (!file) {
                        return;
                      }

                      uploadBackgroundMutation.mutate(file);
                      event.target.value = "";
                    }}
                  />
                  <Button
                    variant="secondary"
                    fullWidth
                    disabled={uploadBackgroundMutation.isPending}
                    onClick={() => backgroundInputRef.current?.click()}
                  >
                    {uploadBackgroundMutation.isPending
                      ? "Uploading background..."
                      : "Upload background image"}
                  </Button>
                  {settings.background.imageUrl ? (
                    <div className="overflow-hidden rounded-[20px] border border-plum-700/10 bg-white/84">
                      <img
                        alt="Background preview"
                        className="h-28 w-full object-cover"
                        crossOrigin="anonymous"
                        src={settings.background.imageUrl}
                      />
                      <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs text-charcoal-900/62">
                        <span>Background uploaded</span>
                        <button
                          className="font-semibold text-plum-800"
                          type="button"
                          onClick={() =>
                            updateSettings((current) => ({
                              ...current,
                              background: { ...current.background, imageUrl: null, mode: "gradient" }
                            }))
                          }
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-charcoal-900/60">
                      Upload a gentle paper-like photo or texture for the wall background.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </details>

          <details className="group rounded-[30px] border border-white/70 bg-white/84 p-5 shadow-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum-700">
                  Typography
                </p>
                <p className="mt-2 text-sm text-charcoal-900/62">Fonts for the wall and captions.</p>
              </div>
              <span className="text-2xl text-plum-700 transition-transform duration-200 group-open:rotate-180">
                ⌄
              </span>
            </summary>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-2 text-sm text-charcoal-900/68">
                Heading font
                <Select
                  value={settings.typography.headingFont}
                  onChange={(event) =>
                    updateSettings((current) => ({
                      ...current,
                      typography: { ...current.typography, headingFont: event.target.value as WishWallSettings["typography"]["headingFont"] }
                    }))
                  }
                >
                  {typographyOptions.map((option) => (
                    <SelectOption key={option.value} value={option.value}>
                      {option.label}
                    </SelectOption>
                  ))}
                </Select>
              </label>

              <label className="grid gap-2 text-sm text-charcoal-900/68">
                Body font
                <Select
                  value={settings.typography.bodyFont}
                  onChange={(event) =>
                    updateSettings((current) => ({
                      ...current,
                      typography: { ...current.typography, bodyFont: event.target.value as WishWallSettings["typography"]["bodyFont"] }
                    }))
                  }
                >
                  {typographyOptions.map((option) => (
                    <SelectOption key={option.value} value={option.value}>
                      {option.label}
                    </SelectOption>
                  ))}
                </Select>
              </label>
            </div>
          </details>

                              <details className="group rounded-[30px] border border-white/70 bg-white/84 p-5 shadow-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum-700">
                  Layout
                </p>
                <p className="mt-2 text-sm text-charcoal-900/62">How the cards arrange on the wall.</p>
              </div>
              <span className="text-2xl text-plum-700 transition-transform duration-200 group-open:rotate-180">
                ⌄
              </span>
            </summary>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm text-charcoal-900/68">
                Layout mode
                <Select
                  value={settings.layout.mode}
                  onChange={(event) =>
                    updateSettings((current) => ({
                      ...current,
                      layout: {
                        ...current.layout,
                        mode: event.target.value as WishWallSettings["layout"]["mode"]
                      }
                    }))
                  }
                >
                  {layoutModeOptions.map((option) => (
                    <SelectOption key={option.value} value={option.value}>
                      {option.label}
                    </SelectOption>
                  ))}
                </Select>
              </label>

            </div>
          </details>
<details className="group rounded-[30px] border border-white/70 bg-white/84 p-5 shadow-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum-700">
                  Export settings
                </p>
                <p className="mt-2 text-sm text-charcoal-900/62">
                  What should appear in the downloaded wall.
                </p>
              </div>
              <span className="text-2xl text-plum-700 transition-transform duration-200 group-open:rotate-180">
                ⌄
              </span>
            </summary>
            <div className="mt-4 grid gap-2">
              {exportToggleKeys.map(({ key, label }) => {
                const checked = settings.export[key];

                return (
                  <Button
                    key={key}
                    variant={checked ? "primary" : "secondary"}
                    className="justify-start"
                    size="sm"
                    onClick={() =>
                      updateSettings((current) => ({
                        ...current,
                        export: {
                          ...current.export,
                          [key]: !current.export[key]
                        }
                      }))
                    }
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </details>
        </aside>

        <div className="space-y-4">
          <section className="rounded-[30px] border border-white/70 bg-white/84 p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum-700">
                  Live preview
                </p>
                <h2 className="mt-3 font-display text-3xl text-charcoal-900">
                  {exportTarget === "guestbook" ? "Guestbook memories" : "Editable Wish Wall"}
                </h2>
                <p className="mt-2 text-sm text-charcoal-900/62">
                  {exportTarget === "guestbook"
                    ? "Review, hide, and delete guestbook memories before downloading the selected version."
                    : "The wall updates as you switch themes, backgrounds, typography, and export settings."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="grid grid-cols-2 rounded-full border border-plum-700/10 bg-white/74 p-1">
                  <button
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      exportTarget === "wishes"
                        ? "bg-plum-800 text-white shadow-[0_10px_24px_rgba(67,34,53,0.18)]"
                        : "text-plum-800/72 hover:text-plum-800"
                    }`}
                    onClick={() => setExportTarget("wishes")}
                  >
                    Wishes
                  </button>
                  <button
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      exportTarget === "guestbook"
                        ? "bg-plum-800 text-white shadow-[0_10px_24px_rgba(67,34,53,0.18)]"
                        : "text-plum-800/72 hover:text-plum-800"
                    }`}
                    onClick={() => setExportTarget("guestbook")}
                  >
                    Guestbook
                  </button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => void handleDownload("PNG")}>
                  PNG
                </Button>
                <Button variant="ghost" size="sm" onClick={() => void handleDownload("JPG")}>
                  JPG
                </Button>
                <Button variant="ghost" size="sm" onClick={() => void handleDownload("PDF")}>
                  PDF
                </Button>
              </div>
            </div>
          </section>

          <div className="overflow-hidden rounded-[36px]">
            {exportTarget === "guestbook" ? (
              <GuestbookWallPreview
                celebrantName={eventDetails.celebrantName}
                eventDate={eventDetails.eventDate}
                eventTitle={guestbookEvent.title}
                entries={guestbookQuery.data?.data.entries ?? []}
                settings={settings}
                onRemoveEntry={(entryId) => hideGuestbookMutation.mutate(entryId)}
                removingEntryId={
                  hideGuestbookMutation.isPending ? hideGuestbookMutation.variables ?? null : null
                }
              />
            ) : (
              <WishWallPreview
                celebrantName={eventDetails.celebrantName}
                eventDate={eventDetails.eventDate}
                eventTitle={wallEvent.title}
                eventType={eventDetails.eventType}
                onRemoveWish={(wishId) => hideWishMutation.mutate(wishId)}
                removingWishId={
                  hideWishMutation.isPending ? hideWishMutation.variables ?? null : null
                }
                settings={settings}
                wishes={visibleWishPreviews}
              />
            )}
          </div>

          <section className="rounded-[30px] border border-white/70 bg-white/84 p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum-700">
                  Summary
                </p>
                <p className="mt-2 text-sm text-charcoal-900/62">
                  {exportTarget === "guestbook"
                    ? `${visibleGuestbookEntries.length} visible memories, ${
                        guestbookQuery.data?.data.entries.length ?? 0
                      } total memories, and a fully stylized preview ready for export.`
                    : `${visibleWishes.length} visible wishes, ${wishesQuery.data?.data.wishes.length ?? 0} total wishes, and a fully stylized preview ready for export.`}
                </p>
              </div>
              {actionMode === "download" ? (
                <span className="rounded-full bg-gold-400/18 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-plum-800">
                  Download mode
                </span>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}




