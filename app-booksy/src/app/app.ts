import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from './layouts/sidebar/sidebar';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('app-booksy');
  showSidebar = signal(false);

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      // Usamos urlAfterRedirects para detectar la ruta final exacta tras redirecciones
      const currentUrl = (event.urlAfterRedirects || event.url).split('?')[0]; 
      const publicRoutes = ['/login', '/register'];
      // El sidebar se muestra si NO estamos en una de las rutas públicas
      this.showSidebar.set(!publicRoutes.includes(currentUrl));
    });
  }
}
