import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookPhysicalCondition, BookRequest } from '../../models/book.model';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-book.component.html',
  styleUrl: './add-book.component.css',
})
export class AddBookComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private bookService = inject(BookService);

  isSubmitting = false;
  errorMessage = '';

  physicalConditions: { value: BookPhysicalCondition; label: string }[] = [
    { value: 'new', label: 'Nuevo' },
    { value: 'like_new', label: 'Como nuevo' },
    { value: 'good', label: 'Buen estado' },
    { value: 'fair', label: 'Aceptable' },
    { value: 'used', label: 'Usado' },
  ];

  bookForm = this.fb.nonNullable.group({
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

  onSubmit(): void {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    const formValue = this.bookForm.getRawValue();
    const payload: BookRequest = {
      title: formValue.title,
      author: formValue.author,
      publisher: formValue.publisher,
      publication_year: Number(formValue.publication_year),
      description: formValue.description,
      physical_condition: formValue.physical_condition,
      operation_type: formValue.operation_type,
      price: formValue.operation_type === 'sale' ? Number(formValue.price ?? 0) : null,
      category_id: Number(formValue.category_id),
    };

    this.bookService.createBook(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/libros']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'No se pudo crear el libro.';
        console.error('Error al crear libro:', error);
        alert('No se pudo crear el libro');
      },
    });
  }
}
