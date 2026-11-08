export interface WeddingCard {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  src: string;
  alt: string;
}

export interface WeddingEvent {
  id: string;
  title: string;
  dateStr: string;
  timeStr: string;
  venue: string;
  address: string;
  description: string;
  startDateISO: string; // for calendar
  endDateISO: string;
  mapQuery: string;
}

export interface GuestWish {
  id: string;
  name: string;
  city?: string;
  message: string;
  timestamp: string;
  reactions?: number;
}
