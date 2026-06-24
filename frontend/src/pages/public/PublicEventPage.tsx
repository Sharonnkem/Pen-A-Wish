import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { PageTransition } from "../../components/animations/PageTransition";
import { Card } from "../../components/cards/Card";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { useToast } from "../../components/common/Toast";
import { FormField } from "../../components/forms/FormField";
import { Input } from "../../components/forms/Input";
import { Textarea } from "../../components/forms/Textarea";
import { PublicEventLayout } from "../../components/layout/PublicEventLayout";
import { Modal } from "../../components/modals/Modal";
import { ApiError } from "../../services/api";
import { eventService } from "../../services/event.service";
import { formatNairaFromKobo } from "../../utils/currency";

const reactionOptions = ["\u2764\uFE0F", "\uD83C\uDF89", "\uD83D\uDC4F", "\uD83E\uDD73"];
const confettiPieces = [
  { color: "bg-rose-300", delay: 0, driftX: -22, left: "10%", rotate: -20, y: -64 },
  { color: "bg-amber-300", delay: 0.04, driftX: 18, left: "18%", rotate: 12, y: -92 },
  { color: "bg-blush-300", delay: 0.08, driftX: -18, left: "28%", rotate: -8, y: -116 },
  { color: "bg-sky-200", delay: 0.12, driftX: 22, left: "38%", rotate: 18, y: -88 },
  { color: "bg-gold-400", delay: 0.16, driftX: -14, left: "50%", rotate: -12, y: -132 },
  { color: "bg-amber-200", delay: 0.2, driftX: 20, left: "61%", rotate: 24, y: -102 },
  { color: "bg-rose-200", delay: 0.24, driftX: -16, left: "73%", rotate: -18, y: -84 },
  { color: "bg-cream-100", delay: 0.28, driftX: 14, left: "84%", rotate: 14, y: -58 }
] as const;

const WISH_MESSAGE_LIMIT = 280;

type PublicEventQueryData = Awaited<ReturnType<typeof eventService.getPublicEventBySlug>>;
type ReactionBurstState =
  | {
      emoji: string;
      key: number;
      targetId: string;
      targetType: "event" | "wish";
    }
  | null;

function getCountdownLabel(eventDate: string) {
  const now = new Date();
  const target = new Date(eventDate);
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "Today is the celebration";
  }

  const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (totalDays === 1) {
    return "1 day to go";
  }

  return `${totalDays} days to go`;
}

function getVisitorFingerprint() {
  if (typeof window === "undefined") {
    return undefined;
  }

  const storageKey = "pen_a_wish_visitor_id";
  const existing = window.localStorage.getItem(storageKey);

  if (existing) {
    return existing;
  }

  const next = `visitor-${Math.random().toString(36).slice(2, 12)}`;
  window.localStorage.setItem(storageKey, next);
  return next;
}

function WishCelebrationBurst({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[32px]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="absolute inset-x-6 bottom-6 rounded-[26px] border border-white/70 bg-white/92 px-5 py-4 shadow-[0_20px_60px_rgba(67,34,53,0.16)] backdrop-blur"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-plum-700">
              Wish delivered
            </p>
            <p className="mt-2 font-display text-2xl text-plum-800">
              Your note is now part of this celebration.
            </p>
          </motion.div>

          {confettiPieces.map((piece, index) => (
            <motion.div
              key={`${piece.left}-${index}`}
              initial={{ opacity: 0, scale: 0.7, x: 0, y: 0, rotate: 0 }}
              animate={{
                opacity: [0, 1, 0],
                rotate: [0, piece.rotate, piece.rotate * 1.5],
                x: [0, piece.driftX, piece.driftX * 1.2],
                y: [0, piece.y, piece.y - 12]
              }}
              exit={{ opacity: 0 }}
              transition={{ delay: piece.delay, duration: 1.15, ease: "easeOut" }}
              className={`absolute bottom-20 h-4 w-4 rounded-[6px] ${piece.color} shadow-[0_8px_18px_rgba(67,34,53,0.12)]`}
              style={{ left: piece.left }}
            />
          ))}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function EmojiReactionBurst({
  emoji,
  isVisible
}: {
  emoji: string;
  isVisible: boolean;
}) {
  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.8 }}
          animate={{ opacity: [0, 1, 0], y: [8, -18, -42], scale: [0.8, 1.12, 1] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="pointer-events-none absolute left-1/2 top-6 z-10 -translate-x-1/2 text-4xl"
        >
          {emoji}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function PublicEventPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const recentWishesSectionRef = useRef<HTMLDivElement | null>(null);
  const [giftForm, setGiftForm] = useState({
    amountNaira: "",
    message: "",
    senderName: ""
  });
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isGuestbookModalOpen, setIsGuestbookModalOpen] = useState(false);
  const [isGuestbookSuccessModalOpen, setIsGuestbookSuccessModalOpen] = useState(false);
  const [guestbookCelebrationTick, setGuestbookCelebrationTick] = useState(0);
  const [reactionBurst, setReactionBurst] = useState<ReactionBurstState>(null);
  const [wishCelebrationTick, setWishCelebrationTick] = useState(0);
  const [isWishSuccessModalOpen, setIsWishSuccessModalOpen] = useState(false);
    const [showRecentWishesPreview, setShowRecentWishesPreview] = useState(false);
    const [showRecentGuestbookPreview, setShowRecentGuestbookPreview] = useState(false);
  const [recentWishesPage, setRecentWishesPage] = useState(1);
  const [recentGuestbookPage, setRecentGuestbookPage] = useState(1);
  const [guestbookForm, setGuestbookForm] = useState({
    message: "",
    senderName: ""
  });
  const [wishForm, setWishForm] = useState({
    message: "",
    senderName: ""
  });

  useEffect(() => {
    if (!wishCelebrationTick) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setWishCelebrationTick(0);
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [wishCelebrationTick]);

  useEffect(() => {
    if (!guestbookCelebrationTick) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setGuestbookCelebrationTick(0);
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [guestbookCelebrationTick]);

  useEffect(() => {
    if (!reactionBurst) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setReactionBurst(null);
    }, 760);

    return () => window.clearTimeout(timer);
  }, [reactionBurst]);

  const eventQuery = useQuery({
    enabled: Boolean(slug),
    queryFn: () => eventService.getPublicEventBySlug(slug),
    queryKey: ["public-event", slug]
  });

  const reactionsQuery = useQuery({
    enabled: Boolean(slug),
    queryFn: () => eventService.getEventReactions(slug),
    queryKey: ["public-event-reactions", slug]
  });

  useEffect(() => {
    const event = eventQuery.data?.data.event;

    if (!event || typeof document === "undefined") {
      return;
    }

    const pageTitle = `${event.title} | Pen A Wish`;
    const description =
      event.description ??
      `Leave wishes and memories for ${event.celebrantName}'s ${event.eventType.toLowerCase()} celebration.`;
    const imageUrl = event.profileImageUrl ?? event.coverImageUrl ?? "";
    const pageUrl =
      typeof window === "undefined" ? `/events/${event.slug}` : window.location.href;

    const previousTitle = document.title;
    document.title = pageTitle;

    const updateMeta = (selector: string, attr: "content" | "href", value: string) => {
      let tag = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);

      if (!tag) {
        tag = selector.startsWith("link")
          ? document.createElement("link")
          : document.createElement("meta");
        if (selector.startsWith('meta[property="')) {
          const property = selector.match(/meta\[property="([^"]+)"\]/)?.[1];
          if (property) {
            (tag as HTMLMetaElement).setAttribute("property", property);
          }
        } else if (selector.startsWith('meta[name="')) {
          const name = selector.match(/meta\[name="([^"]+)"\]/)?.[1];
          if (name) {
            (tag as HTMLMetaElement).setAttribute("name", name);
          }
        } else if (selector.startsWith('link[rel="')) {
          const rel = selector.match(/link\[rel="([^"]+)"\]/)?.[1];
          if (rel) {
            (tag as HTMLLinkElement).setAttribute("rel", rel);
          }
        }
        document.head.appendChild(tag);
      }

      tag.setAttribute(attr, value);
    };

    updateMeta('meta[name="description"]', "content", description);
    updateMeta('meta[property="og:title"]', "content", pageTitle);
    updateMeta('meta[property="og:description"]', "content", description);
    updateMeta('meta[property="og:type"]', "content", "article");
    updateMeta('meta[property="og:url"]', "content", pageUrl);
    updateMeta('meta[property="og:image"]', "content", imageUrl);
    updateMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    updateMeta('meta[name="twitter:title"]', "content", pageTitle);
    updateMeta('meta[name="twitter:description"]', "content", description);
    updateMeta('meta[name="twitter:image"]', "content", imageUrl);
    updateMeta('link[rel="canonical"]', "href", pageUrl);

    return () => {
      document.title = previousTitle;
    };
  }, [eventQuery.data]);

  useEffect(() => {
    if (!showRecentWishesPreview || !recentWishesSectionRef.current) {
      return;
    }

    recentWishesSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showRecentWishesPreview]);

  const initializeGiftMutation = useMutation({
    mutationFn: () =>
      eventService.initializeGift(slug, {
        amountNaira: safeGiftAmountNaira,
        message: giftForm.message || undefined,
        senderName: giftForm.senderName
      }),
    onError: (error) => {
      showToast({
        title: "Gift checkout could not start",
        description:
          error instanceof ApiError
            ? error.message
            : "We could not open Paystack checkout right now. Please try again shortly.",
        tone: "error"
      });
    },
    onSuccess: (response) => {
      window.location.href = response.data.authorizationUrl;
    }
  });

  const verifyGiftMutation = useMutation({
    mutationFn: (reference: string) => eventService.verifyPaystackPayment(reference),
    onError: (error) => {
      showToast({
        title: "Gift verification failed",
        description:
          error instanceof ApiError
            ? error.message
            : "We could not verify this Paystack payment yet. Please refresh and try again.",
        tone: "error"
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["public-event", slug] });
      setGiftForm({
        amountNaira: "",
        message: "",
        senderName: ""
      });
      showToast({
        title: "Gift received",
        description: "Payment was verified successfully and the celebrant has been notified.",
        tone: "success"
      });
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("reference");
      nextParams.delete("trxref");
      setSearchParams(nextParams, { replace: true });
    }
  });

  useEffect(() => {
    const paymentReference =
      searchParams.get("reference") ?? searchParams.get("trxref") ?? undefined;

    if (!paymentReference || verifyGiftMutation.isPending) {
      return;
    }

    const storageKey = `pen_a_wish_verified_gift_${paymentReference}`;

    if (typeof window !== "undefined" && window.sessionStorage.getItem(storageKey)) {
      return;
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(storageKey, "pending");
    }

    verifyGiftMutation.mutate(paymentReference, {
      onSettled: () => {
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(storageKey);
        }
      }
    });
  }, [searchParams, verifyGiftMutation]);

  const submitWishMutation = useMutation({
    mutationFn: () =>
      eventService.submitWish(slug, {
        message: wishForm.message,
        senderName: wishForm.senderName
      }),
    onError: (error) => {
      showToast({
        title: "Wish could not be sent",
        description:
          error instanceof ApiError
            ? error.message
            : "We could not send your wish right now. Please try again shortly.",
        tone: "error"
      });
    },
    onSuccess: async (response) => {
      setWishForm({
        message: "",
        senderName: ""
      });
      setWishCelebrationTick(Date.now());
      queryClient.setQueryData<PublicEventQueryData>(
        ["public-event", slug],
        (current) =>
          current
            ? {
                ...current,
                data: {
                  ...current.data,
                  recentWishes: [
                    {
                      ...response.data.wish,
                      reactionCounts: []
                    },
                    ...current.data.recentWishes
                  ].slice(0, 4),
                  stats: {
                    ...current.data.stats,
                    wishesCount: current.data.stats.wishesCount + 1
                  }
                }
              }
            : current
      );
      await queryClient.invalidateQueries({ queryKey: ["public-event", slug] });
        setIsWishSuccessModalOpen(true);
      showToast({
        title: "Wish sent",
        description: "Your heartfelt note has been added to the celebration.",
        tone: "success"
      });
    }
  });

  const submitGuestbookMutation = useMutation({
    mutationFn: () =>
      eventService.submitGuestbookEntry(slug, {
        message: guestbookForm.message,
        senderName: guestbookForm.senderName
      }),
    onError: (error) => {
      showToast({
        title: "Memory could not be saved",
        description:
          error instanceof ApiError
            ? error.message
            : "We could not save your guestbook memory right now. Please try again shortly.",
        tone: "error"
      });
    },
    onSuccess: async (response) => {
      setGuestbookForm({
        message: "",
        senderName: ""
      });
      setGuestbookCelebrationTick(Date.now());
      setShowRecentGuestbookPreview(false);
      queryClient.setQueryData<PublicEventQueryData>(
        ["public-event", slug],
        (current) =>
          current
            ? {
                ...current,
                data: {
                  ...current.data,
                  recentGuestbookEntries: [
                    response.data.entry,
                    ...current.data.recentGuestbookEntries
                  ].slice(0, 4),
                  stats: {
                    ...current.data.stats,
                    guestbookCount: current.data.stats.guestbookCount + 1
                  }
                }
              }
            : current
      );
      await queryClient.invalidateQueries({ queryKey: ["public-event", slug] });
      setIsGuestbookSuccessModalOpen(true);
      showToast({
        title: "Memory saved",
        description: "Your guestbook note has been added to this celebration's memory book.",
        tone: "success"
      });
    }
  });

  const reactionMutation = useMutation({
    mutationFn: (reactionType: string) =>
      eventService.submitEventReaction(slug, {
        reactionType,
        visitorFingerprint: getVisitorFingerprint()
      }),
    onError: (error) => {
      showToast({
        title: "Reaction could not be saved",
        description:
          error instanceof ApiError
            ? error.message
            : "We could not save your reaction right now. Please try again shortly.",
        tone: "error"
      });
    },
    onSuccess: async (response, reactionType) => {
      setReactionBurst({
        emoji: reactionType,
        key: Date.now(),
        targetId: slug,
        targetType: "event"
      });
      queryClient.setQueryData(["public-event-reactions", slug], response);
    }
  });

  const wishReactionMutation = useMutation({
    mutationFn: (input: { reactionType: string; wishId: string }) =>
      eventService.submitWishReaction(input.wishId, {
        reactionType: input.reactionType,
        visitorFingerprint: getVisitorFingerprint()
      }),
    onError: (error) => {
      showToast({
        title: "Reaction could not be saved",
        description:
          error instanceof ApiError
            ? error.message
            : "We could not save your reaction right now. Please try again shortly.",
        tone: "error"
      });
    },
    onSuccess: async (response, variables) => {
      setReactionBurst({
        emoji: variables.reactionType,
        key: Date.now(),
        targetId: variables.wishId,
        targetType: "wish"
      });
      queryClient.setQueryData<PublicEventQueryData>(
        ["public-event", slug],
        (current) =>
          current
            ? {
                ...current,
                data: {
                  ...current.data,
                  recentWishes: current.data.recentWishes.map((wish) =>
                    wish.id === variables.wishId
                      ? {
                          ...wish,
                          reactionCounts: response.data.counts
                        }
                      : wish
                  )
                }
              }
            : current
      );
      await queryClient.invalidateQueries({ queryKey: ["public-event", slug] });
    }
  });

  const eventData = eventQuery.data?.data;
  const event = eventData?.event;
  const recentGuestbookEntries = eventData?.recentGuestbookEntries ?? [];
  const recentWishes = eventData?.recentWishes ?? [];
  const stats = eventData?.stats;
  const wishMessageLength = wishForm.message.length;
  const wishCharactersRemaining = WISH_MESSAGE_LIMIT - wishMessageLength;
  const isWishMessageOverLimit = wishMessageLength > WISH_MESSAGE_LIMIT;
  const canSubmitWish =
    !submitWishMutation.isPending &&
    wishForm.senderName.trim().length >= 2 &&
    wishForm.message.trim().length > 0 &&
    !isWishMessageOverLimit;
    const canShowRecentWishes = Boolean(event?.showPublicRecentWishes);
    const canShowRecentGuestbook = Boolean(event?.showPublicRecentGuestbook);
    const shouldShowRecentWishes = showRecentWishesPreview;
  const hasVisibleRecentWishes = recentWishes.length > 0;
  const recentWishesPageSize = 4;
  const recentWishesTotalPages = Math.max(1, Math.ceil(recentWishes.length / recentWishesPageSize));
  const recentWishesCurrentPage = Math.min(recentWishesPage, recentWishesTotalPages);
  const recentWishesVisible = useMemo(() => {
    const start = (recentWishesCurrentPage - 1) * recentWishesPageSize;
    return recentWishes.slice(start, start + recentWishesPageSize);
  }, [recentWishes, recentWishesCurrentPage]);
  const hasVisibleRecentGuestbookEntries = recentGuestbookEntries.length > 0;
  const recentGuestbookPageSize = 4;
  const recentGuestbookTotalPages = Math.max(
    1,
    Math.ceil(recentGuestbookEntries.length / recentGuestbookPageSize)
  );
  const recentGuestbookCurrentPage = Math.min(recentGuestbookPage, recentGuestbookTotalPages);
  const recentGuestbookVisible = useMemo(() => {
    const start = (recentGuestbookCurrentPage - 1) * recentGuestbookPageSize;
    return recentGuestbookEntries.slice(start, start + recentGuestbookPageSize);
  }, [recentGuestbookEntries, recentGuestbookCurrentPage]);

  useEffect(() => {
    setRecentGuestbookPage(1);
    }, [recentGuestbookEntries.length, showRecentGuestbookPreview]);
  useEffect(() => {
    setRecentWishesPage(1);
  }, [recentWishes.length, shouldShowRecentWishes]);

  const celebrationStats = stats ?? {
    giftsCount: 0,
    guestbookCount: 0,
    wishesCount: 0
  };

  const reactionCounts = useMemo(() => {
    const counts = reactionsQuery.data?.data.counts ?? [];
    return reactionOptions.map((reactionType) => ({
      count: counts.find((count) => count.reactionType === reactionType)?.count ?? 0,
      reactionType
    }));
  }, [reactionsQuery.data]);
  const parsedGiftAmountNaira = Number(giftForm.amountNaira);
  const safeGiftAmountNaira = Number.isFinite(parsedGiftAmountNaira)
    ? parsedGiftAmountNaira
    : 0;
  const giftAmountKoboPreview = Math.max(0, Math.round(safeGiftAmountNaira * 100));
  const giftPlatformFeeKobo = 5_000;
  const giftTotalChargedKoboPreview = giftAmountKoboPreview + giftPlatformFeeKobo;
  const isGiftFormValid =
    giftForm.senderName.trim().length >= 2 && safeGiftAmountNaira > 0;

  if (eventQuery.isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4">
        <LoadingState className="w-full" label="Opening this celebration page..." />
      </main>
    );
  }

  if (eventQuery.isError || !eventData || !event) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4">
        <EmptyState
          title="Celebration not found"
          description="This public event link may have expired or the page is no longer available."
        />
      </main>
    );
  }

  const countdownLabel = getCountdownLabel(event.eventDate);

  return (
    <PageTransition>
      <PublicEventLayout
        title={event.title}
        description={event.description ?? "Welcome to this celebration page."}
        coverSlot={
          <div className="absolute inset-x-6 bottom-6 top-6 overflow-hidden rounded-[30px] border border-white/20">
            <img
              alt={`${event.title} cover`}
              className="h-full w-full object-cover"
              src={
                event.profileImageUrl ??
                event.coverImageUrl ??
                "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'%3E%3Crect width='1200' height='600' fill='%23f8eee4'/%3E%3Ctext x='600' y='300' text-anchor='middle' font-size='40' font-family='Georgia' fill='%23432235'%3EPen A Wish%3C/text%3E%3C/svg%3E"
              }
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(31,29,31,0.05)_0%,rgba(31,29,31,0.35)_100%)]" />
            <div className="absolute bottom-5 left-5 flex items-end gap-4">
              <img
                alt={`${event.celebrantName} profile`}
                className="h-24 w-24 rounded-[28px] border-4 border-white/80 object-cover shadow-[0_20px_40px_rgba(31,29,31,0.18)]"
                src={
                  event.profileImageUrl ??
                  event.coverImageUrl ??
                  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Crect width='240' height='240' rx='40' fill='%23fffaf4'/%3E%3Ctext x='120' y='128' text-anchor='middle' font-size='28' font-family='Georgia' fill='%23432235'%3EPen A Wish%3C/text%3E%3C/svg%3E"
                }
              />
              <div className="rounded-[24px] bg-white/88 px-4 py-3 text-charcoal-900 shadow-[0_16px_36px_rgba(31,29,31,0.16)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-plum-700">
                  Celebrant
                </p>
                <p className="mt-1 font-display text-2xl text-plum-800">
                  {event.celebrantName}
                </p>
              </div>
            </div>
          </div>
        }
        ctaSlot={
          <div className="grid w-full max-w-[19rem] grid-cols-2 gap-3 sm:flex sm:w-auto sm:max-w-none sm:flex-wrap sm:justify-end">
            <Button
              className="justify-self-start sm:col-span-1"
              onClick={() =>
                document
                  .getElementById("leave-wish")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              Leave a wish
            </Button>
            <Button
              variant="secondary"
              className="justify-self-end bg-white/88 sm:translate-y-1"
              onClick={() => setIsGiftModalOpen(true)}
            >
              Send a gift
            </Button>
            <Button
              variant="secondary"
              className="col-span-2 justify-self-start bg-white/82 sm:col-span-1 sm:-translate-y-1"
              onClick={() => setIsGuestbookModalOpen(true)}
            >
              Guestbook
            </Button>
          </div>
        }
        metaSlot={
          <div className="grid gap-3 text-sm text-charcoal-900/72">
            <div className="rounded-[20px] bg-cream-50 p-3">
              <p className="font-semibold text-charcoal-900">Countdown</p>
              <p className="mt-2">{countdownLabel}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[20px] bg-cream-50 p-3">
                <p className="font-semibold text-charcoal-900">Wishes</p>
                <p className="mt-2">{celebrationStats.wishesCount}</p>
              </div>
              <div className="rounded-[20px] bg-cream-50 p-3">
                <p className="font-semibold text-charcoal-900">Memories</p>
                <p className="mt-2">{celebrationStats.guestbookCount}</p>
              </div>
              <div className="rounded-[20px] bg-cream-50 p-3">
                <p className="font-semibold text-charcoal-900">Gifts</p>
                <p className="mt-2">{celebrationStats.giftsCount}</p>
              </div>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card
              title="Celebrate this moment"
              description={`A warm invitation page for ${event.eventType.toLowerCase()} wishes, memories, and support.`}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-cream-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum-700">
                    Event type
                  </p>
                  <p className="mt-2 font-display text-2xl text-plum-800">
                    {event.eventType}
                  </p>
                </div>
                <div className="rounded-[24px] bg-cream-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum-700">
                    Event date
                  </p>
                  <p className="mt-2 font-display text-2xl text-plum-800">
                    {new Date(event.eventDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card
              tone="polaroid"
              className="relative"
              title="Send a little love"
              description="React to the page in one tap and let the celebrant feel the room around them."
            >
              <EmojiReactionBurst
                key={reactionBurst?.key ?? 0}
                emoji={reactionBurst?.emoji ?? ""}
                isVisible={
                  reactionBurst?.targetType === "event" && reactionBurst?.targetId === slug
                }
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {reactionCounts.map((reaction) => (
                  <motion.button
                    key={reaction.reactionType}
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ y: -2 }}
                    className="rounded-[22px] border border-plum-700/10 bg-white/78 px-4 py-4 text-center shadow-[0_10px_30px_rgba(67,34,53,0.06)]"
                    disabled={reactionMutation.isPending}
                    onClick={() => reactionMutation.mutate(reaction.reactionType)}
                  >
                    <div className="text-2xl">{reaction.reactionType}</div>
                    <p className="mt-2 text-sm font-semibold text-charcoal-900">
                      {reaction.count}
                    </p>
                  </motion.button>
                ))}
              </div>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
            <Card
              title="Have more to say?"
              description="Longer stories belong in the Guestbook, where visitors can leave fuller memories."
            >
              <div className="space-y-4">
                <div className="rounded-[24px] border border-plum-700/10 bg-cream-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum-700">
                    Guestbook
                  </p>
                  <p className="mt-2 text-sm leading-7 text-charcoal-900/72">
                    Have more to say? Leave a longer memory in the Guestbook.
                  </p>
                </div>
                <Button variant="secondary" onClick={() => setIsGuestbookModalOpen(true)}>
                  Open Guestbook
                </Button>
              </div>
            </Card>

            <Card
              className="relative overflow-visible"
              title="Leave a wish"
              description="Guests do not need an account. Just add your name and heartfelt message."
            >
              <WishCelebrationBurst isVisible={Boolean(wishCelebrationTick)} />
              <form
                id="leave-wish"
                className="space-y-4"
                onSubmit={(eventSubmit) => {
                  eventSubmit.preventDefault();
                  if (submitWishMutation.isPending) {
                    return;
                  }
                  submitWishMutation.mutate();
                }}
              >
                <FormField label="Your name">
                  <Input
                    placeholder="Ada"
                    value={wishForm.senderName}
                    onChange={(eventChange) =>
                      setWishForm((current) => ({
                        ...current,
                        senderName: eventChange.target.value
                      }))
                    }
                  />
                </FormField>
                <FormField
                  label="Your wish"
                  helperText="Keep your wish short and sweet. If you have a longer memory or story to share, use the Guestbook instead."
                >
                  <Textarea
                    placeholder="Wishing you joy, peace, and unforgettable beautiful moments ahead."
                    rows={5}
                    maxLength={WISH_MESSAGE_LIMIT}
                    value={wishForm.message}
                    onChange={(eventChange) =>
                      setWishForm((current) => ({
                        ...current,
                        message: eventChange.target.value
                      }))
                    }
                  />
                </FormField>
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <p
                    className={
                      isWishMessageOverLimit
                        ? "text-rose-700"
                        : wishCharactersRemaining < 30
                          ? "text-amber-700"
                          : "text-charcoal-900/56"
                    }
                  >
                    {isWishMessageOverLimit
                      ? "Wishes are limited to 280 characters. Please use the Guestbook for longer messages."
                      : `${Math.max(wishCharactersRemaining, 0)} characters left`}
                  </p>
                  <p className="text-charcoal-900/56">
                    {wishMessageLength}/{WISH_MESSAGE_LIMIT}
                  </p>
                </div>
                <AnimatePresence>
                  {wishCelebrationTick ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="rounded-[20px] border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-charcoal-900/72"
                    >
                      Your wish has landed beautifully and the latest preview is updating.
                    </motion.div>
                    ) : null}
                </AnimatePresence>
                <Button disabled={!canSubmitWish} type="submit">
                  {submitWishMutation.isPending ? "Sending your wish..." : "Send wish"}
                </Button>
                <div className="pt-1 text-sm text-charcoal-900/60">
                  <button
                    className="font-medium text-plum-800 underline underline-offset-4 transition hover:text-plum-700"
                    type="button"
                    onClick={() => setIsGuestbookModalOpen(true)}
                  >
                    Have more to say? Leave a longer memory in the Guestbook.
                  </button>
                </div>
              </form>
            </Card>
          </section>

          {shouldShowRecentWishes ? (
            <section ref={recentWishesSectionRef} className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum-700">
                    Recent wishes
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-3xl text-charcoal-900">
                      Wishes already on the wall
                    </h2>
                    <Button variant="secondary" onClick={() => navigate("/")}>
                      Create Your Own Celebration
                    </Button>
                  </div>
                </div>
              </div>
              {hasVisibleRecentWishes ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {recentWishesVisible.map((wish, index) => (
                    <motion.div
                      key={wish.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ delay: index * 0.06, duration: 0.25 }}
                      className="relative rounded-[22px] border border-plum-700/10 bg-white/78 p-4 shadow-[0_12px_32px_rgba(67,34,53,0.06)]"
                    >
                      <EmojiReactionBurst
                        key={reactionBurst?.key ?? 0}
                        emoji={reactionBurst?.emoji ?? ""}
                        isVisible={
                          reactionBurst?.targetType === "wish" &&
                          reactionBurst?.targetId === wish.id
                        }
                      />
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-semibold text-charcoal-900">{wish.senderName}</p>
                        <p className="text-xs uppercase tracking-[0.22em] text-charcoal-900/48">
                          {new Date(wish.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-charcoal-900/72">
                        {wish.message}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {reactionOptions.map((reactionType) => {
                          const count =
                            wish.reactionCounts.find(
                              (reaction) => reaction.reactionType === reactionType
                            )?.count ?? 0;

                          return (
                            <motion.button
                              key={`${wish.id}-${reactionType}`}
                              whileTap={{ scale: 0.94 }}
                              whileHover={{ y: -1 }}
                              className="inline-flex items-center gap-2 rounded-full border border-plum-700/10 bg-cream-50/90 px-3 py-2 text-sm text-charcoal-900 shadow-[0_8px_18px_rgba(67,34,53,0.06)]"
                              disabled={wishReactionMutation.isPending}
                              onClick={() =>
                                wishReactionMutation.mutate({
                                  reactionType,
                                  wishId: wish.id
                                })
                              }
                              type="button"
                            >
                              <span>{reactionType}</span>
                              <span className="font-semibold">{count}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No wishes yet"
                  description="Be the first guest to leave a warm note for this celebration."
                />
              )}
              {hasVisibleRecentWishes && recentWishesTotalPages > 1 ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/50 bg-white/40 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.22em] text-charcoal-900/45">
                    {recentWishesCurrentPage} / {recentWishesTotalPages}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className="rounded-full border border-transparent bg-transparent px-2 py-1 text-sm text-charcoal-900/58 transition hover:text-charcoal-900 disabled:cursor-not-allowed disabled:opacity-35"
                      disabled={recentWishesCurrentPage === 1}
                      onClick={() =>
                        setRecentWishesPage((current) => Math.max(1, current - 1))
                      }
                      type="button"
                    >
                      Newer
                    </button>
                    {Array.from({ length: recentWishesTotalPages }, (_, index) => index + 1).map(
                      (page) => (
                        <button
                          key={page}
                          className={
                            page === recentWishesCurrentPage
                              ? "min-w-8 rounded-full bg-plum-800 px-3 py-1.5 text-sm font-medium text-white shadow-[0_8px_18px_rgba(67,34,53,0.12)]"
                              : "min-w-8 rounded-full bg-white/50 px-3 py-1.5 text-sm font-medium text-charcoal-900/62 transition hover:bg-white/75 hover:text-charcoal-900"
                          }
                          onClick={() => setRecentWishesPage(page)}
                          type="button"
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      className="rounded-full border border-transparent bg-transparent px-2 py-1 text-sm text-charcoal-900/58 transition hover:text-charcoal-900 disabled:cursor-not-allowed disabled:opacity-35"
                      disabled={recentWishesCurrentPage >= recentWishesTotalPages}
                      onClick={() =>
                        setRecentWishesPage((current) =>
                          Math.min(recentWishesTotalPages, current + 1)
                        )
                      }
                      type="button"
                    >
                      Older
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      </PublicEventLayout>

      <Modal
        isOpen={isWishSuccessModalOpen}
        onClose={() => setIsWishSuccessModalOpen(false)}
        title="Wish received"
        description="Thank you for adding your words of love to this celebration."
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
              {canShowRecentWishes && hasVisibleRecentWishes ? (
                <div className="rounded-[24px] border border-plum-700/10 bg-cream-50 p-5">
                  <Button
                    className="w-full"
                    onClick={() => {
                      setShowRecentWishesPreview(true);
                      setIsWishSuccessModalOpen(false);
                    }}
                    variant="secondary"
                  >
                    View Recent Wishes
                  </Button>
                  <p className="mt-3 text-sm leading-6 text-charcoal-900/62">
                    See some of the love and messages others have shared.
                  </p>
                </div>
              ) : null}

            <div className="rounded-[24px] border border-plum-700/10 bg-white/78 p-5">
              <Button
                className="w-full"
                onClick={() => navigate("/")}
              >
                Create Your Own Celebration
              </Button>
              <p className="mt-3 text-sm leading-6 text-charcoal-900/62">
                Start your own page and collect wishes, memories, and gifts.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isGuestbookSuccessModalOpen}
        onClose={() => {
          setIsGuestbookSuccessModalOpen(false);
          setShowRecentGuestbookPreview(false);
        }}
        title="Memory received"
        description="Thank you for adding a keepsake note to this celebration."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-plum-700/10 bg-white/78 p-5">
            <p className="text-sm leading-6 text-charcoal-900/72">
              Thank you for adding a keepsake note to this celebration.
            </p>
            <Button onClick={() => navigate("/")}>Create Your Own Celebration</Button>
          </div>

            {canShowRecentGuestbook && !showRecentGuestbookPreview && hasVisibleRecentGuestbookEntries ? (
              <div className="rounded-[24px] border border-plum-700/10 bg-cream-50 p-5">
                <Button
                  className="w-full"
                  onClick={() => setShowRecentGuestbookPreview(true)}
                  variant="secondary"
                >
                  View Recent Memories
                </Button>
                <p className="mt-3 text-sm leading-6 text-charcoal-900/62">
                  See some of the love and stories others have shared.
                </p>
              </div>
            ) : null}

            {canShowRecentGuestbook && showRecentGuestbookPreview && hasVisibleRecentGuestbookEntries ? (
              <div className="space-y-3 rounded-[26px] border border-white/70 bg-white/84 p-4">
              {recentGuestbookVisible.map((entry, index) => (
                <motion.article
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className="rounded-[22px] border border-plum-700/10 bg-cream-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-semibold text-charcoal-900">{entry.senderName}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-charcoal-900/42">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-charcoal-900/72">{entry.message}</p>
                </motion.article>
              ))}
              {recentGuestbookTotalPages > 1 ? (
                <div className="flex items-center justify-between gap-3 pt-1 text-xs uppercase tracking-[0.2em] text-charcoal-900/42">
                  <button
                    className="transition hover:text-charcoal-900 disabled:cursor-not-allowed disabled:opacity-30"
                    disabled={recentGuestbookCurrentPage === 1}
                    onClick={() =>
                      setRecentGuestbookPage((current) => Math.max(1, current - 1))
                    }
                    type="button"
                  >
                    Newer
                  </button>
                  <span>
                    {recentGuestbookCurrentPage} / {recentGuestbookTotalPages}
                  </span>
                  <button
                    className="transition hover:text-charcoal-900 disabled:cursor-not-allowed disabled:opacity-30"
                    disabled={recentGuestbookCurrentPage >= recentGuestbookTotalPages}
                    onClick={() =>
                      setRecentGuestbookPage((current) =>
                        Math.min(recentGuestbookTotalPages, current + 1)
                      )
                    }
                    type="button"
                  >
                    Older
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </Modal>

      <Modal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        title="Send a gift"
        description="Send a warm monetary gift with your message. We’ll confirm the final amount securely before anything is charged."
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsGiftModalOpen(false)}>
              Close
            </Button>
            <Button
              disabled={
                !isGiftFormValid ||
                initializeGiftMutation.isPending ||
                verifyGiftMutation.isPending
              }
              onClick={() => initializeGiftMutation.mutate()}
            >
              {initializeGiftMutation.isPending ? "Opening checkout..." : "Continue to Paystack"}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <FormField label="Your name">
            <Input
              placeholder="Ada"
              value={giftForm.senderName}
              onChange={(eventChange) =>
                setGiftForm((current) => ({
                  ...current,
                  senderName: eventChange.target.value
                }))
              }
            />
          </FormField>
          <FormField
            label="Gift amount"
            helperText="Enter the gift amount in naira. The fixed platform fee is added by the backend."
          >
            <Input
              inputMode="decimal"
              placeholder="5000"
              value={giftForm.amountNaira}
              onChange={(eventChange) =>
                setGiftForm((current) => ({
                  ...current,
                  amountNaira: eventChange.target.value
                }))
              }
            />
          </FormField>
          <FormField
            label="Message"
            helperText="Optional short note to go with your gift."
          >
            <Textarea
              placeholder="Happy celebration! Sending love and support for this beautiful moment."
              rows={4}
              value={giftForm.message}
              onChange={(eventChange) =>
                setGiftForm((current) => ({
                  ...current,
                  message: eventChange.target.value
                }))
              }
            />
          </FormField>

          <div className="rounded-[24px] border border-plum-700/10 bg-white/78 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum-700">
              Charge summary
            </p>
            <div className="mt-4 space-y-3 text-sm text-charcoal-900/72">
              <div className="flex items-center justify-between gap-4">
                <span>Gift amount</span>
                <span className="font-semibold text-charcoal-900">
                  {formatNairaFromKobo(giftAmountKoboPreview)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Platform fee</span>
                <span className="font-semibold text-charcoal-900">
                  {formatNairaFromKobo(giftPlatformFeeKobo)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-plum-700/10 pt-3">
                <span className="font-semibold text-charcoal-900">Total to charge</span>
                <span className="font-semibold text-plum-800">
                  {formatNairaFromKobo(giftTotalChargedKoboPreview)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-charcoal-900/72">
            Your payment is checked securely after checkout, and the celebrant’s wallet is updated only after everything matches.
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isGuestbookModalOpen}
        onClose={() => setIsGuestbookModalOpen(false)}
        title="Guestbook memories"
        description="Longer notes feel more like keepsakes here, arranged as collected pages instead of a plain comment thread."
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setIsGuestbookModalOpen(false)}>Close</Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative min-w-0 overflow-hidden rounded-[28px] border border-plum-700/10 bg-[linear-gradient(180deg,rgba(255,250,244,0.94)_0%,rgba(248,238,228,0.92)_100%)] p-5 shadow-[0_20px_50px_rgba(67,34,53,0.08)]">
              <div className="absolute -right-8 top-5 h-20 w-20 rounded-full bg-blush-100/70 blur-2xl" />
              <div className="absolute left-6 top-0 h-6 w-24 -rotate-3 rounded-b-[18px] bg-white/70" />
              <div className="relative space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum-700">
                    Leave a memory
                  </p>
                  <p className="mt-2 font-display text-3xl text-plum-800">
                    Write something they will want to revisit.
                  </p>
                </div>

                <form
                  className="space-y-4"
                  onSubmit={(eventSubmit) => {
                    eventSubmit.preventDefault();
                    if (submitGuestbookMutation.isPending) {
                      return;
                    }
                    submitGuestbookMutation.mutate();
                  }}
                >
                  <FormField label="Your name">
                    <Input
                      placeholder="Ada"
                      value={guestbookForm.senderName}
                      onChange={(eventChange) =>
                        setGuestbookForm((current) => ({
                          ...current,
                          senderName: eventChange.target.value
                        }))
                      }
                    />
                  </FormField>
                  <FormField
                    label="Your memory"
                    helperText="Share a longer reflection, story, or message for the memory book."
                  >
                    <Textarea
                      placeholder="One of my favorite memories with you is the way you always made ordinary moments feel unforgettable..."
                      rows={7}
                      value={guestbookForm.message}
                      onChange={(eventChange) =>
                        setGuestbookForm((current) => ({
                          ...current,
                          message: eventChange.target.value
                        }))
                      }
                    />
                  </FormField>
                  <AnimatePresence>
                    {guestbookCelebrationTick ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="rounded-[20px] border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-charcoal-900/72"
                      >
                        Your memory has been tucked into the guestbook and the page is refreshing.
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                  <Button disabled={submitGuestbookMutation.isPending} type="submit">
                    {submitGuestbookMutation.isPending
                      ? "Saving your memory..."
                      : "Add to guestbook"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}
