import { Component, ElementRef, Input, OnInit, Output, ViewChild, } from '@angular/core';
import { Observable } from "rxjs";
import { BontoApiService } from 'src/app/bonto-api.service';
import { ViewAlkatreszService } from 'src/app/view-alkatresz.service';

@Component({
  selector: 'app-add-edit-alkatresz',
  templateUrl: './add-edit-alkatresz.component.html',
  styleUrls: ['./add-edit-alkatresz.component.css']
})
export class AddEditAlkatreszComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  alkatreszList$!:Observable<any[]>;
  alkatresz$!:Observable<any>;
  kategoriaList$!:Observable<any[]>;
  autoTipusList$!:Observable<any[]>;

  constructor(private service:BontoApiService, private viewAlkatreszService: ViewAlkatreszService) {}

  @Input() id: number = 0;
  nev: string = "";
  megjegyzes: string = "";
  kategoriak: string = "";
  generacio: string = "";
  ar: number = 0;
  kepek: string = "";
  kategoriakInput: string[] = [];
  autoTipusokInput: string[] = [];
  activateImagePreview: boolean = false;

  ngOnInit(): void{
    this.alkatresz$ = this.service.getAlkatresz(this.id);
    if (this.alkatresz$) {
      this.alkatresz$.subscribe((item) => {
        this.nev = item.nev;
        this.megjegyzes = item.megjegyzes;
        this.kategoriak = item.kategoriak;
        this.generacio = item.generacio;
        this.ar = item.ar;
        this.kepek = item.kepek;
      })
    }
    this.kategoriakInput = this.kategoriakInput;
    this.autoTipusokInput = this.autoTipusokInput;

    this.kategoriaList$ = this.service.getKategoriaList();
    this.autoTipusList$ = this.service.getAutoTipusList();
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
      id: this.id,
      nev: this.nev,
      megjegyzes: this.megjegyzes,
      kategoriak: this.kategoriak,
      generacio: this.generacio,
      ar: this.ar,
      kepek: this.kepek
    }
    var id: number = this.id;
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

  uploadImages() {
    const files: FileList | null = this.fileInput.nativeElement.files;

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Append file name to kepek property
        this.kepek += file.name;
        
        // Add delimiter if not the last file
        if (i !== files.length - 1) {
          this.kepek += ';';
        }
      }
      this.activateImagePreview = true;
    }
    this.fileInput.nativeElement.value = '';
  }
}
