export interface User {
  id: number;
  name: string;
  last_name?: string;
  email: string;
  role: string;
  registration_date?: string;
  created_at: string;
  books_count?: number;
  meetups_count?: number;
  transactions_count?: number;
}
