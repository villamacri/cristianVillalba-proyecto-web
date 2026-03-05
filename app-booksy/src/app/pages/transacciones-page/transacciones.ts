import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-transacciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transacciones.html',
  styleUrl: './transacciones.css',
})
export class Transacciones implements OnInit {
  private transactionService = inject(TransactionService);
  private reportService = inject(ReportService);

  listaTransacciones: Transaction[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.isLoading = true;
    this.transactionService.getTransactions().subscribe({
      next: (data) => {
        this.listaTransacciones = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.errorMessage = 'Error al cargar transacciones';
        this.isLoading = false;
      },
    });
  }

  exportarHistorialExcel(): void {
    this.reportService.exportTransactionsExcel(this.listaTransacciones).catch(() => {
      this.errorMessage = 'No se pudo generar el historial en Excel.';
    });
  }
}
