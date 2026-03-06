import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookPhysicalCondition } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-edit-book',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-book.component.html',
  styleUrl: './edit-book.component.css',
})
export class EditBookComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private bookService = inject(BookService);
  private categoryService = inject(CategoryService);

  bookId: number | null = null;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  categories: Category[] = [];

  physicalConditions: { value: BookPhysicalCondition; label: string }[] = [
    { value: 'new', label: 'Nuevo' },
    { value: 'like_new', label: 'Como nuevo' },
    { value: 'good', label: 'Buen estado' },
    { value: 'fair', label: 'Aceptable' },
    { value: 'used', label: 'Usado' },
  ];

  formulario = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    author: ['', [Validators.required, Validators.minLength(2)]],
    publisher: ['', [Validators.required]],
    publication_year: [new Date().getFullYear(), [Validators.required, Validators.min(1450)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    physical_condition: ['good' as BookPhysicalCondition, [Validators.required]],
    operation_type: ['sale' as 'sale' | 'exchange', [Validators.required]],
    price: [0],
    category_id: [1, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('id');

    if (!idFromRoute) {
      this.errorMessage = 'No se recibio el ID del libro.';
      this.isLoading = false;
      return;
    }

    const parsedId = Number(idFromRoute);

    if (Number.isNaN(parsedId) || parsedId <= 0) {
      this.errorMessage = 'El ID del libro no es valido.';
      this.isLoading = false;
      return;
    }

    this.bookId = parsedId;

    // Cargar categorias
    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: (err) => {
        console.error('Error al cargar categorias:', err);
      },
    });

    this.bookService.getBook(parsedId).subscribe({
      next: (libro) => {
        this.formulario.patchValue({
          title: libro.title,
          author: libro.author,
          publisher: libro.publisher ?? '',
          publication_year: libro.publication_year ?? new Date().getFullYear(),
          description: libro.description ?? '',
          physical_condition: (libro.physical_condition as BookPhysicalCondition) ?? 'good',
          operation_type: (libro.operation_type as 'sale' | 'exchange') ?? 'sale',
          price: libro.price ?? 0,
          category_id: libro.category_id,
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar libro:', err);
        this.errorMessage = 'No se pudo cargar la informacion del libro.';
        this.isLoading = false;
      },
    });
  }

  guardarCambios(): void {
    if (this.formulario.invalid || this.bookId === null) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.bookService.updateBook(this.bookId, this.formulario.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/libros']);
      },
      error: (err) => {
        console.error('Error al guardar cambios:', err);
        this.errorMessage = 'No se pudieron guardar los cambios del libro.';
        this.isSubmitting = false;
      },
    });
  }
}
