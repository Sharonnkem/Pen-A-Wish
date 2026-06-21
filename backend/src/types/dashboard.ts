export type DashboardOverview = {
  recentGifts: Array<{
    amountKobo: number;
    createdAt: Date;
    eventId: string;
    eventSlug: string;
    eventTitle: string;
    id: string;
    message: string | null;
    senderName: string;
  }>;
  recentWishes: Array<{
    createdAt: Date;
    eventId: string;
    eventSlug: string;
    eventTitle: string;
    id: string;
    isHidden: boolean;
    message: string;
    senderName: string;
  }>;
  stats: {
    celebrationsCount: number;
    giftsReceivedCount: number;
    publicLinksCount: number;
    wishesReceivedCount: number;
  };
  wallet: {
    balanceKobo: number;
    totalGiftsReceivedKobo: number;
  };
};

export type WishRecord = {
  created_at: Date;
  event_id: string;
  id: string;
  is_hidden: boolean;
  message: string;
  sender_email: string | null;
  sender_name: string;
};

