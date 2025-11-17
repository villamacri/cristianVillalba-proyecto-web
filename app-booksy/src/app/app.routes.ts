import { Routes } from '@angular/router';
import { Login } from './pages/login-page/login';
import { Register } from './pages/register-page/register';
import { Dashboard } from './pages/dashboard-page/dashboard';
import { Eventos } from './pages/eventos-page/eventos';
import { Libros } from './pages/libros-page/libros';

export const routes: Routes = [
    {
        path:'login',
        component:Login
    },
    {
        path:'register',
        component:Register
    },
    {
        path:'dashboard',
        component:Dashboard
    },
    {
        path:'eventos',
        component:Eventos
    },
    {
        path:'libros',
        component: Libros
    },
    {
        path:'',
        redirectTo:'login',
        pathMatch:'full'
    }
];
