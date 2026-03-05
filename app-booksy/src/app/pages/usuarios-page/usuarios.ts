import { Component, OnInit, inject } from '@angular/core';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-usuarios',
  imports: [],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  private userService = inject(UserService);
  private reportService = inject(ReportService);

  users: User[] = [];
  errorMessage: string = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  get adminsCount(): number {
    return this.users.filter((user) => user.role === 'admin').length;
  }

  updateRole(userId: number, role: string): void {
    this.userService.updateUserRole(userId, role).subscribe({
      next: (updatedUser) => {
        this.users = this.users.map((user) => (user.id === userId ? updatedUser : user));
      },
      error: () => {
        this.errorMessage = 'No se pudo actualizar el rol del usuario.';
      }
    });
  }

  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter((user) => user.id !== userId);
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar el usuario.';
      }
    });
  }

  private loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los usuarios.';
      }
    });
  }

  exportarExcel(): void {
    this.reportService.exportUsersExcel(this.users).catch(() => {
      this.errorMessage = 'No se pudo generar el Excel de usuarios.';
    });
  }
}
