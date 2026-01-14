import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api-service';

@Component({
  selector: 'app-libros',
  imports: [],
  templateUrl: './libros.html',
  styleUrl: './libros.css',
})
export class Libros implements OnInit {

  listaLibros : any = []

  constructor(private service: ApiService) {}

  ngOnInit(): void {
    this.service.getLibros().subscribe(r => {
      this.listaLibros = r
    })
  }

}
