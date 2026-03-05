import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category, CategoryListResponse } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getCategories(): Observable<Category[]> {
    return this.http
      .get<CategoryListResponse>(`${this.apiUrl}/categories`)
      .pipe(map((response) => (Array.isArray(response) ? response : response.data ?? [])));
  }
}
