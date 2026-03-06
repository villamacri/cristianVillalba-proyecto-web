import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { DashboardSummary, BookByCategory, RecentUser, StatsService } from '../../services/stats.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private statsService = inject(StatsService);

  summary = signal<DashboardSummary>({
    total_users: 0,
    total_books: 0,
    active_meetups: 0,
    successful_exchanges: 0,
    recent_users: [],
    books_by_category: [],
  });
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  recentUsers = computed(() => this.summary().recent_users ?? []);
  booksByCategory = computed(() => this.summary().books_by_category ?? []);
  topCategories = computed(() => this.calculateTopCategories());

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.statsService.getSummary().pipe(
      catchError((error) => {
        console.error('Error al cargar estadísticas:', error);
        this.errorMessage.set('No se pudieron cargar las estadísticas del dashboard.');
        this.isLoading.set(false);
        return of({
          total_users: 0,
          total_books: 0,
          active_meetups: 0,
          successful_exchanges: 0,
          recent_users: [],
          books_by_category: [],
        });
      })
    ).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  private calculateTopCategories(): Array<BookByCategory & { width: number }> {
    const categories = this.summary().books_by_category ?? [];
    if (categories.length === 0) return [];

    const maxCount = Math.max(...categories.map(c => c.books_count), 1);

    return categories
      .map((category) => ({
        ...category,
        width: Math.round((category.books_count / maxCount) * 100),
      }))
      .slice(0, 5);
  }

  private toTimestamp(date: string): number {
    const parsedDate = new Date(date).getTime();
    return Number.isNaN(parsedDate) ? 0 : parsedDate;
  }
}
