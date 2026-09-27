export type Meeting = {
  id: string;
  title: string;
  startsAt: Date;
  location: string;
  videoLink?: string;
  agendaCount: number;
};
