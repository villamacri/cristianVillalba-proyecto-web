import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { Book } from '../../models/book.model';
import { User } from '../../models/user.model';
import { BookService } from '../../services/book.service';
import { UserService } from '../../services/user.service';
import { DashboardSummary, StatsService } from '../../services/stats.service';

interface RecentActivityItem {
  type: 'book' | 'user';
  id: number;
  title: string;
  subtitle: string;
  created_at: string;
}

interface CategoryBar {
  label: string;
  count: number;
  width: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private statsService = inject(StatsService);
  private bookService = inject(BookService);
  private userService = inject(UserService);

  summary = signal<DashboardSummary>({
    total_users: 0,
    total_books: 0,
    active_meetups: 0,
    successful_exchanges: 0,
  });
  recentActivity = signal<RecentActivityItem[]>([]);
  booksByCategory = signal<CategoryBar[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  topCategories = computed(() => this.booksByCategory().slice(0, 5));

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      summary: this.statsService.getSummary().pipe(
        catchError(() =>
          of({
            total_users: 0,
            total_books: 0,
            active_meetups: 0,
            successful_exchanges: 0,
          })
        )
      ),
      books: this.bookService.getBooks().pipe(catchError(() => of([] as Book[]))),
      users: this.userService.getUsers().pipe(catchError(() => of([] as User[]))),
    }).subscribe({
      next: ({ summary, books, users }) => {
        this.summary.set(summary);
        this.recentActivity.set(this.buildRecentActivity(books, users));
        this.booksByCategory.set(this.buildCategoryBars(books));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar las estadísticas del dashboard.');
        this.isLoading.set(false);
      },
    });
  }

  private buildRecentActivity(books: Book[], users: User[]): RecentActivityItem[] {
    const recentBooks: RecentActivityItem[] = books.map((book) => ({
      type: 'book',
      id: book.id,
      title: 'Libro publicado',
      subtitle: book.title,
      created_at: book.created_at ?? '',
    }));

    const recentUsers: RecentActivityItem[] = users.map((user) => ({
      type: 'user',
      id: user.id,
      title: 'Usuario registrado',
      subtitle: user.name,
      created_at: user.created_at,
    }));

    return [...recentBooks, ...recentUsers]
      .sort((a, b) => this.toTimestamp(b.created_at) - this.toTimestamp(a.created_at))
      .slice(0, 5);
  }

  private buildCategoryBars(books: Book[]): CategoryBar[] {
    const grouped = new Map<number, number>();

    books.forEach((book) => {
      grouped.set(book.category_id, (grouped.get(book.category_id) ?? 0) + 1);
    });

    const maxCount = Math.max(...grouped.values(), 1);

    return Array.from(grouped.entries())
      .map(([categoryId, count]) => ({
        label: `Categoría ${categoryId}`,
        count,
        width: Math.round((count / maxCount) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }

  private toTimestamp(date: string): number {
    const parsedDate = new Date(date).getTime();
    return Number.isNaN(parsedDate) ? 0 : parsedDate;
  }

}
