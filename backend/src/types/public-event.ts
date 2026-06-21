export type PublicWishPreviewRecord = {
  created_at: Date;
  event_id: string;
  id: string;
  message: string;
  sender_name: string;
};

export type PublicWishWallRecord = PublicWishPreviewRecord & {
  sender_email: string | null;
};

export type PublicWishRecord = {
  event_id: string;
  id: string;
};

export type GuestbookEntryRecord = {
  created_at: Date;
  event_id: string;
  id: string;
  is_hidden: boolean;
  message: string;
  sender_email: string | null;
  sender_name: string;
};

export type ReactionCountRecord = {
  reaction_count: string;
  reaction_type: string;
};

export type WishReactionCountRecord = ReactionCountRecord & {
  wish_id: string;
};
