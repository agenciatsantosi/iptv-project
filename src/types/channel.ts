export interface Channel {
  id?: string;
  name: string;
  url: string;
  logo?: string;
  type?: string;
  group?: string;
  description?: string;
  year?: number;
  rating?: number;
  duration?: number;
  genres?: string[];
  cast?: string[];
  director?: string;
  country?: string;
  language?: string;
}
