import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone:true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router){}

  onLogin(){
    this.errorMessage = '';

    const credentials = {
      email: this.email,
      password: this.password
    };

    console.log('Enviando datos a Laravel...', credentials);

    this.authService.login(credentials).subscribe({
      next:(response: any) => {
        console.log('Respuesta recibida:', response);

        if(response.token){
          localStorage.setItem('token', response.token);
          this.router.navigate(['/dashboard']);
        }else{
          this.errorMessage = 'Error: no se recibió el token de seguridad.';
        }
      },
      error: (error)=>{
        console.error('Error en el login:', error);

        if(error.status === 401){
          this.errorMessage = 'Correo o contraseña incorrectos.';
        }else if (error.status === 0){
          this.errorMessage = 'No se puede conectar con el servidor.'
        }else{
          this.errorMessage = 'Ocurrió un error inesperado. Inténtalo más tarde.'
        }
      }
    })
  }
}
