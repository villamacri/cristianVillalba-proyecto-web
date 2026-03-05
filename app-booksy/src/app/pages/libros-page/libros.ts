import { Component, OnInit, inject } from '@angular/core';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-libros',
  imports: [],
  templateUrl: './libros.html',
  styleUrl: './libros.css',
})
export class Libros implements OnInit {
  private bookService = inject(BookService);
  private reportService = inject(ReportService);

  listaLibros: Book[] = [];
  errorMessage: string = '';

  get salesCount(): number {
    return this.listaLibros.filter((libro) => libro.operation_type === 'sale').length;
  }

  get exchangeCount(): number {
    return this.listaLibros.filter((libro) => libro.operation_type === 'exchange').length;
  }

  ngOnInit(): void {
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.listaLibros = books;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los libros.';
      }
    });
  }

  exportarPDF(): void {
    this.reportService.exportBooksPDF(this.listaLibros).catch(() => {
      this.errorMessage = 'No se pudo generar el reporte PDF de libros.';
    });
  }
}
