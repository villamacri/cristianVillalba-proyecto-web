export interface Category {
  id: number;
  name: string;
}

export type CategoryListResponse = Category[] | { data?: Category[] };
