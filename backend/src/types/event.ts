export type EventRecord = {
  celebrant_name: string;
  cover_image_url: string | null;
  created_at: Date;
  description: string | null;
  event_date: string;
  event_type: string;
  id: string;
  is_public: boolean;
  profile_image_url: string | null;
  slug: string;
  title: string;
  updated_at: Date;
  user_id: string;
};

export type EventSummaryRecord = EventRecord & {
  gifts_count: string;
  wishes_count: string;
};

