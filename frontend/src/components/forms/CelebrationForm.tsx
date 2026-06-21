import { useMemo, useState } from "react";

import { Button } from "../common/Button";
import { LoadingState } from "../common/LoadingState";
import { useToast } from "../common/Toast";
import { FormField } from "./FormField";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { eventService } from "../../services/event.service";
import type { CelebrationEvent, CreateEventInput } from "../../types/event";

type CelebrationFormProps = {
  initialEvent?: CelebrationEvent | null;
  isSubmitting: boolean;
  onSubmit: (input: CreateEventInput) => Promise<void>;
  submitLabel: string;
};

function toDateValue(value: string | undefined) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export function CelebrationForm({
  initialEvent,
  isSubmitting,
  onSubmit,
  submitLabel
}: CelebrationFormProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState(initialEvent?.title ?? "");
  const [celebrantName, setCelebrantName] = useState(initialEvent?.celebrantName ?? "");
  const [eventType, setEventType] = useState(initialEvent?.eventType ?? "");
  const [eventDate, setEventDate] = useState(toDateValue(initialEvent?.eventDate));
  const [description, setDescription] = useState(initialEvent?.description ?? "");
  const [profileImageUrl, setProfileImageUrl] = useState(
    initialEvent?.profileImageUrl ?? ""
  );
  const [coverImageUrl, setCoverImageUrl] = useState(initialEvent?.coverImageUrl ?? "");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const profilePreview = useMemo(
    () => (profileFile ? URL.createObjectURL(profileFile) : profileImageUrl || ""),
    [profileFile, profileImageUrl]
  );
  const coverPreview = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : coverImageUrl || ""),
    [coverFile, coverImageUrl]
  );

  async function uploadPendingImages() {
    setIsUploading(true);

    try {
      let nextProfileUrl = profileImageUrl || null;
      let nextCoverUrl = coverImageUrl || null;

      if (profileFile) {
        try {
          const upload = await eventService.uploadImage({
            file: profileFile,
            folder: "events"
          });
          nextProfileUrl = upload.data.url;
          setProfileImageUrl(upload.data.url);
          setProfileFile(null);
        } catch {
          showToast({
            title: "Profile image skipped",
            description: "We could not upload the profile image right now, so the celebration will be created without it.",
            tone: "error"
          });
        }
      }

      if (coverFile) {
        try {
          const upload = await eventService.uploadImage({
            file: coverFile,
            folder: "covers"
          });
          nextCoverUrl = upload.data.url;
          setCoverImageUrl(upload.data.url);
          setCoverFile(null);
        } catch {
          showToast({
            title: "Cover image skipped",
            description: "We could not upload the cover image right now, so the celebration will be created without it.",
            tone: "error"
          });
        }
      }

      return {
        coverImageUrl: nextCoverUrl,
        profileImageUrl: nextProfileUrl
      };
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    try {
      const uploads = await uploadPendingImages();

      await onSubmit({
        celebrantName,
        coverImageUrl: uploads.coverImageUrl,
        description,
        eventDate,
        eventType,
        profileImageUrl: uploads.profileImageUrl,
        title
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save celebration.";
      setErrorMessage(message);
      showToast({
        title: "Unable to save celebration",
        description: message,
        tone: "error"
      });
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {(isUploading || isSubmitting) && !initialEvent ? (
        <LoadingState label="Preparing your celebration page..." />
      ) : null}

      <section className="rounded-[26px] border border-plum-700/10 bg-white/65 p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="font-display text-2xl text-charcoal-900">Event details</h3>
          <p className="mt-2 text-sm leading-7 text-charcoal-900/64">
            Keep the invitation details clear, warm, and easy for guests to understand at a glance.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <FormField
            label="Celebrant name"
            helperText="This name appears across the invitation and Wish Wall."
          >
            <Input
              placeholder="Sharon"
              value={celebrantName}
              onChange={(current) => setCelebrantName(current.target.value)}
            />
          </FormField>

          <FormField
            label="Event title"
            helperText="Give the celebration a warm, shareable title."
          >
            <Input
              placeholder="Sharon's Birthday Celebration"
              value={title}
              onChange={(current) => setTitle(current.target.value)}
            />
          </FormField>

          <FormField
            label="Event type"
            helperText="Use the event type exactly as you want guests to see it."
          >
            <Input
              placeholder="Birthday"
              value={eventType}
              onChange={(current) => setEventType(current.target.value)}
            />
          </FormField>

          <FormField
            label="Event date"
            helperText="This powers the public countdown later on."
          >
            <Input
              type="date"
              value={eventDate}
              onChange={(current) => setEventDate(current.target.value)}
            />
          </FormField>
        </div>

        <div className="mt-6">
          <FormField
            label="Description"
            helperText="Add a short invitation-style message for guests."
          >
            <Textarea
              placeholder="Join me in celebrating this special day."
              rows={5}
              value={description}
              onChange={(current) => setDescription(current.target.value)}
            />
          </FormField>
        </div>
      </section>

      <section className="rounded-[26px] border border-plum-700/10 bg-white/65 p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="font-display text-2xl text-charcoal-900">Images</h3>
          <p className="mt-2 text-sm leading-7 text-charcoal-900/64">
            Upload the visuals guests will see on the public invitation and celebration page.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <FormField
            label="Profile picture"
            helperText="Upload the celebrant profile image for the public page."
          >
            <div className="space-y-3">
              <Input
                type="file"
                accept="image/*"
                onChange={(current) => setProfileFile(current.target.files?.[0] ?? null)}
              />
              {profilePreview ? (
                <img
                  alt="Profile preview"
                  className="h-48 w-full rounded-[24px] object-cover shadow-card"
                  src={profilePreview}
                />
              ) : (
                <div className="rounded-[24px] border border-dashed border-plum-700/20 bg-white/70 px-4 py-10 text-center text-sm text-charcoal-900/58">
                  Profile image preview appears here.
                </div>
              )}
            </div>
          </FormField>

          <FormField
            label="Cover image"
            helperText="Upload the large cover visual for the event invitation."
          >
            <div className="space-y-3">
              <Input
                type="file"
                accept="image/*"
                onChange={(current) => setCoverFile(current.target.files?.[0] ?? null)}
              />
              {coverPreview ? (
                <img
                  alt="Cover preview"
                  className="h-48 w-full rounded-[24px] object-cover shadow-card"
                  src={coverPreview}
                />
              ) : (
                <div className="rounded-[24px] border border-dashed border-plum-700/20 bg-white/70 px-4 py-10 text-center text-sm text-charcoal-900/58">
                  Cover image preview appears here.
                </div>
              )}
            </div>
          </FormField>
        </div>
      </section>

      {errorMessage ? (
        <p className="rounded-[22px] bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 rounded-[24px] bg-cream-50/72 p-4 sm:flex-row sm:items-center sm:justify-between">
        <Button disabled={isSubmitting || isUploading} type="submit">
          {isSubmitting || isUploading ? "Saving celebration..." : submitLabel}
        </Button>
        <p className="text-sm text-charcoal-900/58 sm:text-right">
          Your public share link and unique slug are generated automatically.
        </p>
      </div>
    </form>
  );
}
