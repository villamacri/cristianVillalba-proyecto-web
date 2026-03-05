export interface MeetupRequest {
  name: string;
  description: string;
  meetup_date: string;
  city: string;
  max_capacity: number;
}

export interface MeetupResponse {
  id: number;
  title?: string;
  name?: string;
  description?: string;
  date?: string;
  meetup_date?: string;
  city?: string;
  max_capacity?: number;
  is_joined?: boolean;
}

export interface Meetup {
  id: number;
  title: string;
  name?: string;
  description: string;
  date: string;
  meetup_date?: string;
  city: string;
  max_capacity?: number;
  is_joined?: boolean;
}
