export type OnlineAtcApiResponse = {
  name: string;
  frequency: number;
  fir: string;
  callsign: string;
};

export type Position = {
  dt: Date;
  alt: number;
  hdg: number;
  lat: number;
  lng: number;
  spd: number;
};

export type OnlineFlightsApiResponse = {
  callsign: string;
  name: string;
  origin: string;
  destination: string;
  aircraft: string;
  firs: string[];
  position: Position;
};

export interface FutureBookingsApiResponse {
  callsign: string;
  name: string;
  fir: string;
  date: string;
  timeStart: string;
  timeStop: string;
}
