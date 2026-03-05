export interface Book {
  id: number;
  title: string;
  author: string;
  physical_condition: string;
  operation_type: string;
  price?: number;
  category_id: number;
  user_id: number;
  image_url?: string;
  created_at?: string;
}
