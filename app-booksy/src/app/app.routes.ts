import { Routes } from '@angular/router';
import { Login } from './pages/login-page/login';
import { Register } from './pages/register-page/register';
import { Dashboard } from './pages/dashboard-page/dashboard';
import { Eventos } from './pages/eventos-page/eventos';
import { Libros } from './pages/libros-page/libros';
import { Usuarios } from './pages/usuarios-page/usuarios';
import { Transacciones } from './pages/transacciones-page/transacciones';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path:'login',
        component:Login
    },
    {
        path:'register',
        component:Register,
        canActivate: [authGuard]
    },
    {
        path:'dashboard',
        component:Dashboard,
        canActivate: [authGuard]
    },
    {
        path:'eventos/add',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/add-event/add-event.component').then((m) => m.AddEventComponent)
    },
    {
        path:'eventos/edit/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/edit-event/edit-event.component').then((m) => m.EditEventComponent)
    },
    {
        path:'eventos',
        component:Eventos,
        canActivate: [authGuard]
    },
    {
        path:'libros/add',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/add-book/add-book.component').then((m) => m.AddBookComponent)
    },
    {
        path:'libros/edit/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/edit-book/edit-book.component').then((m) => m.EditBookComponent)
    },
    {
        path:'libros',
        component: Libros,
        canActivate: [authGuard]
    },
    {
        path:'usuarios',
        component: Usuarios,
        canActivate: [authGuard]
    },
    {
        path:'transacciones',
        component: Transacciones,
        canActivate: [authGuard]
    },
    {
        path:'',
        redirectTo:'login',
        pathMatch:'full'
    }
];
