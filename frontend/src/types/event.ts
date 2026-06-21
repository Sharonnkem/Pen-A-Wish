export type CelebrationEvent = {
  celebrantName: string;
  coverImageUrl: string | null;
  createdAt: string;
  description: string | null;
  eventDate: string;
  eventType: string;
  giftsCount?: number;
  id: string;
  isPublic: boolean;
  profileImageUrl: string | null;
  shareLink: string;
  slug: string;
  title: string;
  updatedAt: string;
  userId: string;
  wishesCount?: number;
};

export type PublicCelebrationEvent = Pick<
  CelebrationEvent,
  | "celebrantName"
  | "coverImageUrl"
  | "description"
  | "eventDate"
  | "eventType"
  | "id"
  | "profileImageUrl"
  | "slug"
  | "title"
>;

export type PublicWishPreview = {
  createdAt: string;
  id: string;
  message: string;
  reactionCounts: EventReactionCount[];
  senderName: string;
};

export type PublicWishWall = {
  event: PublicCelebrationEvent;
  stats: {
    giftsCount: number;
    guestbookCount: number;
    wishesCount: number;
  };
  wishes: PublicWishPreview[];
};

export type PublicGuestbookEntry = {
  createdAt: string;
  id: string;
  message: string;
  senderName: string;
};

export type EventReactionCount = {
  count: number;
  reactionType: string;
};

export type CreateEventInput = {
  celebrantName: string;
  coverImageUrl?: string | null;
  description: string;
  eventDate: string;
  eventType: string;
  profileImageUrl?: string | null;
  title: string;
};
