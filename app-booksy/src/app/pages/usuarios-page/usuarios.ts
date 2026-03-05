import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-usuarios',
  imports: [RouterLink],
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

  cambiarRol(id: number, nuevoRol: string): void {
    this.userService.updateRole(id, nuevoRol).subscribe({
      next: (updatedUser) => {
        this.users = this.users.map((user) => {
          if (user.id !== id) {
            return user;
          }

          return {
            ...user,
            ...updatedUser,
            role: updatedUser.role ?? nuevoRol,
          };
        });
      },
      error: () => {
        this.errorMessage = 'No se pudo actualizar el rol del usuario.';
      },
    });
  }

  eliminarUsuario(id: number): void {
    if (!confirm('¿Estas seguro de que deseas eliminar este usuario?')) {
      return;
    }

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter((user) => user.id !== id);
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar el usuario.';
      },
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
