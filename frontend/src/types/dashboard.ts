export type DashboardOverview = {
  recentGifts: Array<{
    amountKobo: number;
    createdAt: string;
    eventId: string;
    eventSlug: string;
    eventTitle: string;
    id: string;
    message: string | null;
    senderName: string;
  }>;
  recentWishes: Array<{
    createdAt: string;
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

export type EventWish = {
  createdAt: string;
  id: string;
  isHidden: boolean;
  message: string;
  senderEmail: string | null;
  senderName: string;
};

export type EventGuestbookEntry = {
  createdAt: string;
  id: string;
  isHidden: boolean;
  message: string;
  senderEmail: string | null;
  senderName: string;
};
