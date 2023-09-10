import { Component, ElementRef, Input, OnInit, ViewChild, } from '@angular/core';
import { BontoApiService } from 'src/app/bonto-api.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-edit-alkatresz',
  templateUrl: './add-edit-alkatresz.component.html',
  styleUrls: ['./add-edit-alkatresz.component.css']
})
export class AddEditAlkatreszComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  constructor(private service: BontoApiService) {}

  @Input() alkatresz: any;
  @Input() autoTipusList: any;
  @Input() kategoriaList: any;

  nev: string = "";
  megjegyzes: string = "";
  kategoriak: string = "";
  generacio: string = "";
  ar: number = 0;
  kepek: string = "";
  kepekInput: string = "";
  baseUrl: string = environment.baseUrl;
  imgUrl: string = this.baseUrl + "/images/";
  kategoriakInput: string[] = [];
  autoTipusokInput: string[] = [];
  activateImagePreview: boolean = false;

  ngOnInit(): void{
    if (this.alkatresz.id !== 0) {
      this.nev = this.alkatresz.nev;
      this.megjegyzes = this.alkatresz.megjegyzes;
      this.kategoriak = this.alkatresz.kategoriak;
      this.generacio = this.alkatresz.generacio;
      this.ar = this.alkatresz.ar;
      this.kepek = this.alkatresz.kepek;
    } else {
      this.nev = '';
      this.megjegyzes = '';
      this.kategoriak = '';
      this.generacio = '';
      this.ar = 0;
      this.kepek = '';
    }
  }

  addAlkatresz() {
    this.kategoriakInput = this.kategoriakInput.map(kategoria => kategoria.trim());
    this.kategoriak = "";
    this.kategoriak = this.kategoriakInput.concat(this.autoTipusokInput).join(';').replace(/\s*,\s*/g, ';');
        
    var alkatresz = {
      nev:this.nev,
      megjegyzes:this.megjegyzes,
      kategoriak:this.kategoriak,
      generacio:this.generacio,
      ar:this.ar,
      kepek:this.kepek
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

    if (this.kategoriakInput.toString() != "") {
      this.kategoriak = this.kategoriakInput.concat(this.autoTipusokInput).join(';').replace(/\s*,\s*/g, ';');
    }     
    
    var alkatresz = {
      id: this.alkatresz.id,
      nev: this.nev,
      megjegyzes: this.megjegyzes,
      kategoriak: this.kategoriak,
      generacio: this.generacio,
      ar: this.ar,
      kepek: this.kepek
    }
    var id: number = this.alkatresz.id;

    this.service.updateAlkatresz(id, alkatresz).subscribe(() => {
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

  uploadImages() {
    const files: FileList | null = this.fileInput.nativeElement.files;
    if (files) {
      var imageOverride = false;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (this.kepek.length > 0 && !imageOverride) {
          this.kepek = '';
          imageOverride = true;
        }
        this.kepek += file.name;
        if (i !== files.length - 1) {
          this.kepek += ';';
        }
      }
      this.activateImagePreview = true;
    }
    this.fileInput.nativeElement.value = '';
    this.kepekInput = '';
  }
}
