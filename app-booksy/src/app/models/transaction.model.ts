export interface Transaction {
  id: number;
  book_id: number;
  buyer_id: number;
  seller_id: number;
  transaction_type: string;
  status: string;
  amount: number;
  transaction_date: string;
}
