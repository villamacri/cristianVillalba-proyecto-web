export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  books_count?: number;
  meetups_count?: number;
  transactions_count?: number;
}
