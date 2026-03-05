import { Injectable } from '@angular/core';
import { Book } from '../models/book.model';
import { User } from '../models/user.model';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  async exportBooksPDF(books: Book[]): Promise<void> {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Reporte de Libros', 14, 18);
    doc.setFontSize(11);
    doc.text(`Total de libros: ${books.length}`, 14, 26);

    autoTable(doc, {
      startY: 32,
      head: [['Título', 'Autor', 'Estado físico', 'Tipo operación']],
      body: books.map((book) => [
        book.title,
        book.author,
        book.physical_condition,
        book.operation_type,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 58, 95] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`reporte-libros-${this.getDateStamp()}.pdf`);
  }

  async exportUsersExcel(users: User[]): Promise<void> {
    const XLSX = await import('xlsx');

    const rows = users.map((user) => ({
      Email: user.email,
      Rol: user.role,
      Registro: user.created_at,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');
    XLSX.writeFile(workbook, `usuarios-${this.getDateStamp()}.xlsx`);
  }

  async exportTransactionsExcel(transactions: Transaction[]): Promise<void> {
    const XLSX = await import('xlsx');

    const rows = transactions.map((transaction) => ({
      ID: transaction.id,
      Comprador: transaction.buyer_id,
      Vendedor: transaction.seller_id,
      Tipo: transaction.transaction_type,
      Estado: transaction.status,
      Monto: transaction.amount,
      Fecha: transaction.transaction_date,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transacciones');
    XLSX.writeFile(workbook, `transacciones-${this.getDateStamp()}.xlsx`);
  }

  private getDateStamp(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
