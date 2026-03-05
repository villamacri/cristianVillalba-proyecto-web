import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-libros',
  imports: [RouterLink],
  templateUrl: './libros.html',
  styleUrl: './libros.css',
})
export class Libros implements OnInit {
  private bookService = inject(BookService);
  private reportService = inject(ReportService);
  private readonly categoryFallbackMap: Record<number, string> = {
    1: 'Ficcion Contemporanea',
    2: 'Fantasia y Sci-Fi',
    3: 'Novela Historica',
    4: 'Romance',
    5: 'Misterio y Thriller',
    6: 'Desarrollo Personal',
    7: 'Negocios y Economia',
    8: 'Tecnologia y Programacion',
  };

  allBooks = signal<Book[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  searchTerm = signal<string>('');
  selectedCategory = signal<string>('all');
  selectedOperation = signal<string>('all');

  filteredBooks = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const category = this.selectedCategory();
    const operation = this.selectedOperation();

    return this.allBooks().filter((book) => {
      const operationType = this.normalizeOperation(book.operation_type);
      const matchesSearch =
        term.length === 0 ||
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term);
      const matchesCategory = category === 'all' || String(book.category_id) === category;
      const matchesOperation = operation === 'all' || operationType === operation;

      return matchesSearch && matchesCategory && matchesOperation;
    });
  });

  categoryNamesById = computed(() => {
    const names = new Map<number, string>();

    this.allBooks().forEach((book) => {
      names.set(book.category_id, this.resolveCategoryName(book));
    });

    return names;
  });

  categories = computed(() =>
    Array.from(this.categoryNamesById().entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([id, label]) => ({
        value: String(id),
        label,
      }))
  );

  totalBooks = computed(() => this.allBooks().length);
  salesCount = computed(
    () => this.allBooks().filter((book) => this.normalizeOperation(book.operation_type) === 'sale').length
  );
  exchangeCount = computed(
    () => this.allBooks().filter((book) => this.normalizeOperation(book.operation_type) === 'exchange').length
  );

  ngOnInit(): void {
    this.loadBooks();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.searchTerm.set(input?.value ?? '');
  }

  onCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    this.selectedCategory.set(select?.value ?? 'all');
  }

  onOperationChange(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    this.selectedOperation.set(select?.value ?? 'all');
  }

  operationLabel(operationType: string): string {
    const normalizedOperation = this.normalizeOperation(operationType);

    if (normalizedOperation === 'sale') {
      return 'Venta';
    }

    if (normalizedOperation === 'exchange') {
      return 'Intercambio';
    }

    return 'No definido';
  }

  isSaleOperation(operationType: string): boolean {
    return this.normalizeOperation(operationType) === 'sale';
  }

  getBookCategoryName(book: Book): string {
    return this.resolveCategoryName(book);
  }

  private loadBooks(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.allBooks.set(books);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar los libros.');
        this.isLoading.set(false);
      },
    });
  }

  exportarPDF(): void {
    this.reportService.exportBooksPDF(this.allBooks()).catch(() => {
      this.errorMessage.set('No se pudo generar el reporte PDF de libros.');
    });
  }

  eliminarLibro(id: number): void {
    if (!confirm('¿Seguro que quieres eliminar este libro?')) {
      return;
    }

    this.errorMessage.set('');

    try {
      this.bookService.deleteBook(id).subscribe({
        next: () => {
          this.allBooks.update((books) => books.filter((book) => book.id !== id));
        },
        error: (error) => {
          console.error('Error al eliminar libro:', error);
          const backendMessage = this.extractBackendError(error, 'No se pudo eliminar el libro.');
          this.errorMessage.set(backendMessage);

          if (
            this.isConstraintError(error, backendMessage)
          ) {
            alert(backendMessage);
          }
        },
      });
    } catch (error) {
      const backendMessage = this.extractBackendError(error, 'No se pudo eliminar el libro.');
      this.errorMessage.set(backendMessage);
      alert(backendMessage);
    }
  }

  private normalizeOperation(operationType: string): string {
    return operationType.toLowerCase();
  }

  private resolveCategoryName(book: Book): string {
    const relationName = book.category?.name?.trim();

    if (relationName) {
      return relationName;
    }

    return this.categoryFallbackMap[book.category_id] ?? `Categoria ${book.category_id}`;
  }

  private extractBackendError(error: unknown, fallbackMessage: string): string {
    const backendError = error as {
      status?: number;
      error?: {
        message?: string;
        error?: string;
      };
    };

    return backendError?.error?.message ?? backendError?.error?.error ?? fallbackMessage;
  }

  private isConstraintError(error: unknown, message: string): boolean {
    const statusCode = (error as { status?: number })?.status;
    const normalizedMessage = message.toLowerCase();

    return (
      statusCode === 422 ||
      normalizedMessage.includes('foreign key') ||
      normalizedMessage.includes('historial') ||
      normalizedMessage.includes('no se puede eliminar')
    );
  }
}
