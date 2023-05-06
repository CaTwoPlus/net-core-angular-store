import { Component, Input, OnInit, } from '@angular/core';
import { Observable } from "rxjs";
import { BontoApiService } from 'src/app/bonto-api.service';

@Component({
  selector: 'app-add-edit-alkatresz',
  templateUrl: './add-edit-alkatresz.component.html',
  styleUrls: ['./add-edit-alkatresz.component.css']
})
export class AddEditAlkatreszComponent implements OnInit {

  alkatreszList$!:Observable<any[]>;
  kategoriaList$!:Observable<any[]>;
  autoTipusList$!:Observable<any[]>;

  constructor(private service:BontoApiService) {}

  @Input() alkatresz: any;
  id: number = 0;
  nev: string = "";
  megjegyzes: string = "";
  kategoriak: string = "";
  generacio: string = "";
  ar: number = 0;
  kategoriakInput: string[] = [];
  autoTipusokInput: string[] = [];
  allKategoriak: any;

  ngOnInit(): void{
    this.id = this.alkatresz.id;
    this.nev = this.alkatresz.nev;
    this.megjegyzes = this.alkatresz.megjegyzes;
    this.kategoriak = this.kategoriak;
    this.generacio = this.alkatresz.generacio;
    this.ar = this.alkatresz.ar;
    this.kategoriakInput = this.kategoriakInput;
    this.autoTipusokInput = this.autoTipusokInput;
    this.allKategoriak = this.allKategoriak;

    this.kategoriaList$ = this.service.getKategoriaList();
    this.autoTipusList$ = this.service.getAutoTipusList();
  }

  addAlkatresz() {
    this.kategoriakInput = this.kategoriakInput.map(kategoria => kategoria.trim());
    this.kategoriak = this.kategoriakInput.concat(this.autoTipusokInput).join(';').replace(/\s*,\s*/g, ';');
        
    var alkatresz = {
      nev:this.nev,
      megjegyzes:this.megjegyzes,
      kategoriak:this.kategoriak,
      generacio:this.generacio,
      ar:this.ar
    }
    this.service.addAlkatresz(alkatresz).subscribe(res => {
      var closeModalBtn = document.getElementById('add-edit-modal-close');
      if(closeModalBtn) {
        closeModalBtn.click();
      }

      var showAddSuccess = document.getElementById('add-success-alert');
      if(showAddSuccess) {
        showAddSuccess.style.display = "block";
      }
      setTimeout(function() {
        if(showAddSuccess) {
          showAddSuccess.style.display = "none"
        }
      }, 4000)
    })
  }

  updateAlkatresz() {     
    this.kategoriakInput = this.kategoriakInput.map(kategoria => kategoria.trim());
    this.kategoriak = this.kategoriakInput.concat(this.autoTipusokInput).join(';').replace(/\s*,\s*/g, ';');
    
    var alkatresz = {
      id: this.id,
      nev:this.nev,
      megjegyzes:this.megjegyzes,
      kategoriak:this.kategoriak,
      generacio:this.generacio,
      ar:this.ar
    }
    var id:number = this.id;
    this.service.updateAlkatresz(id, alkatresz).subscribe(res => {
      var closeModalBtn = document.getElementById('add-edit-modal-close');
      if(closeModalBtn) {
        closeModalBtn.click();
      }

      var showUpdateSuccess = document.getElementById('update-success-alert');
      if(showUpdateSuccess) {
        showUpdateSuccess.style.display = "block";
      }
      setTimeout(function() {
        if(showUpdateSuccess) {
          showUpdateSuccess.style.display = "none"
        }
      }, 4000)
    })
  }

}
