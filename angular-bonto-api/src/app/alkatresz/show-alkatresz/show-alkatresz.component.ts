import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { BontoApiService } from "src/app/bonto-api.service";
import { ViewAlkatreszService } from "src/app/view-alkatresz.service";
import { SearchBarComponent } from 'src/app/alkatresz/search/search.component';

@Component({
  selector: 'app-show-alkatresz',
  template: `
    <app-search-bar [alkatreszList$]="alkatreszList$" #searchBar></app-search-bar>
  `,
  templateUrl: './show-alkatresz.component.html',
  styleUrls: ['./show-alkatresz.component.css']
})
export class ShowAlkatreszComponent implements OnInit{
  @ViewChild('searchBar') searchBar!: SearchBarComponent;
  @ViewChild('viewAlkatreszModal') viewAlkatreszModal!: ElementRef;
  @ViewChild('addEditAlkatreszModal') addEditAlkatreszModal!: ElementRef;

  alkatreszList$!:Observable<any[]>;
  kategoriaList$!:Observable<any[]>;
  autoTipusList$!:Observable<any[]>;
  imageURLList$: any[] = [];
  filteredAlkatreszek$!:Observable<any[]>;
  filteredAlkatreszList: any[] = [];
  searchText: string = '';
  alkatreszService: any;

  constructor(private service:BontoApiService, private viewAlkatreszService: ViewAlkatreszService) {}

  // Variables (properties)
  modalTitle:string = '';
  activateAddEditAlkatreszComponent:boolean = false;
  activateViewAlkatreszComponent:boolean = false;
  alkatresz:any;
  kategoria:any;
  autoTipus:any;
  imageFiles:any;
  appPath:any;

  async ngOnInit() {
    this.alkatreszList$ = this.service.getAlkatreszList();
    this.kategoriaList$ = this.service.getKategoriaList();
  }

  ngAfterViewInit(): void {
    this.filteredAlkatreszek$ = this.searchBar.searchTerm.pipe(
      startWith(''),
      switchMap(term => {
        if (!term) {
          return this.alkatreszList$;
        } else {
          return this.alkatreszList$.pipe(
            map(alkatreszek =>
              alkatreszek.filter(alkatresz =>
                alkatresz.nev.toLowerCase().includes(term.toLowerCase())
              )
            )
          );
        }
      })
    );
  }

  modalAdd(){ 
    this.alkatresz = {
      id:0,
      nev:null,
      megjegyzes:null,
      kategoriak:null,
      generacio:null,
      ar:0
    }
    this.modalTitle = "Alkatrész hozzáadása";
    this.activateAddEditAlkatreszComponent = true;
  }

  modalEdit(item:any) {
    this.alkatresz = item;
    this.modalTitle = "Alkatrész szerkesztése";
    this.activateAddEditAlkatreszComponent = true;
  }

  modalView(item:any) {
    this.viewAlkatreszService.setSelectedId(item.id);
    this.modalTitle = "Alkatrész megtekintése";
    this.activateViewAlkatreszComponent = true;
  }

  delete(item:any) {
    if (confirm(`Biztos, hogy törlöd a ${item.nev} alkatrészt?`)) {
      this.service.deleteAlkatresz(item.id).subscribe(res => {
        // remove deleted item from the observable
        this.alkatreszList$ = this.alkatreszList$.pipe(
          map(list => list.filter(alkatresz => alkatresz.id !== item.id))
        );
        // update the filtered observable as well
        this.filteredAlkatreszek$ = this.filteredAlkatreszek$.pipe(
          map(list => list.filter(alkatresz => alkatresz.id !== item.id))
        );
        // this.options = this.options.filter(option => option !== item.nev);
        var closeModalBtn = document.getElementById('add-edit-modal-close');
        if(closeModalBtn) {
          closeModalBtn.click();
        }
        var showDeleteSuccess = document.getElementById('delete-success-alert');
        if(showDeleteSuccess) {
          showDeleteSuccess.style.display = "block";
        }
        setTimeout(function() {
          if(showDeleteSuccess) {
            showDeleteSuccess.style.display = "none"
          }
        }, 4000);
      })  
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.viewAlkatreszModal.nativeElement.contains(event.target) && this.activateViewAlkatreszComponent) {
      this.modalClose();
    }
  }

  modalClose() {
    this.activateAddEditAlkatreszComponent = false;
    this.activateViewAlkatreszComponent = false;
    this.alkatreszList$ = this.service.getAlkatreszList();
  }

  onSearchTextEntered(searchValue: string){
    this.searchText = searchValue;
    console.log(this.searchText);
  }
}

