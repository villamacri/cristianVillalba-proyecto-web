import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Book, BookRequest, BookResponse } from '../models/book.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/books`);
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/books/${id}`);
  }

  getBook(id: number): Observable<Book> {
    return this.getBookById(id);
  }

  createBook(bookData: BookRequest): Observable<BookResponse> {
    return this.http.post<BookResponse>(`${this.apiUrl}/books`, bookData);
  }

  updateBook(id: number, book: Partial<Book>): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/books/${id}`, book);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/books/${id}`);
  }

  toggleAvailability(id: number, isAvailable: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/books/${id}`, {
      is_available: isAvailable,
    });
  }
}
