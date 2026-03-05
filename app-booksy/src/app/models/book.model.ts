export interface BookCategory {
  id: number;
  name: string;
}

export type BookOperationType = 'sale' | 'exchange';

export type BookPhysicalCondition =
  | 'new'
  | 'like_new'
  | 'good'
  | 'fair'
  | 'used';

export interface BookRequest {
  title: string;
  author: string;
  publisher: string;
  publication_year: number;
  description: string;
  physical_condition: BookPhysicalCondition;
  operation_type: BookOperationType;
  price?: number | null;
  category_id: number;
}

export interface BookResponse extends Book {}

export interface Book {
  id: number;
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  description?: string;
  physical_condition: string;
  operation_type: string;
  price?: number;
  category_id: number;
  user_id: number;
  image_url?: string;
  is_available?: boolean;
  category?: BookCategory | null;
  created_at?: string;
}
