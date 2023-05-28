import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { BontoApiService } from "src/app/bonto-api.service";
import { ViewAlkatreszService } from "src/app/view-alkatresz.service";
import { SearchBarComponent } from 'src/app/search/search.component';

@Component({
  selector: 'app-show-alkatresz',
  templateUrl: './show-alkatresz.component.html',
  styleUrls: ['./show-alkatresz.component.css']
})
export class ShowAlkatreszComponent implements OnInit{
  @ViewChild('searchBar') searchBar!: SearchBarComponent;
  @ViewChild('viewAlkatreszModal') viewAlkatreszModal!: ElementRef;
  @ViewChild('addEditAlkatreszModal') addEditAlkatreszModal!: ElementRef;

  constructor(private service:BontoApiService, private viewAlkatreszService: ViewAlkatreszService) {}

  alkatreszList$!:Observable<any[]>;
  kategoriaList$!:Observable<any[]>;
  autoTipusList$!:Observable<any[]>;
  filteredAlkatreszek$!:Observable<any[]>;
  combinedFilters$: any;

  categoryFilter: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  categoryFilterObsv$ = this.categoryFilter.asObservable();
  modalTitle: string = '';
  kategoriak: string[] = [];
  autoTipusok: string[] = [];

  alkatreszService: any;
  alkatresz:any;
  kategoria:any;
  autoTipus:any;
  imageFiles:any;
  appPath:any;

  activateAddEditAlkatreszComponent:boolean = false;
  activateViewAlkatreszComponent:boolean = false;
  isFilterActive:boolean = false;

  async ngOnInit() {
    this.alkatreszList$ = this.service.getAlkatreszList();
    this.kategoriaList$ = this.service.getKategoriaList();
    this.autoTipusList$ = this.service.getAutoTipusList();
  }

  // From ngAfterViewInit, old filtering method
  /*this.filteredAlkatreszek$ = this.searchBar.searchTerm.pipe(
      startWith(''),
      switchMap(term => {
        if (!term && (!this.categoryFilter || this.categoryFilter.length === 0)) {
          return this.alkatreszList$;
        } else {
          return this.alkatreszList$.pipe(
            map(alkatreszek =>
              alkatreszek.filter(alkatresz =>
                alkatresz.nev.toLowerCase().includes(term.toLowerCase()) ||
                (this.categoryFilter && this.categoryFilter.length > 0 &&
                  this.categoryFilter.some(category =>
                    alkatresz.kategoriak.toLowerCase().includes(category.toLowerCase())
                  )
                )
              )
            )
          );
        }
      })
    );*/

  ngAfterViewInit(): void {
    this.combineFilters();
  }

  combineFilters() {
    this.filteredAlkatreszek$ = combineLatest([
      this.searchBar.searchTerm.pipe(startWith('')),
      this.categoryFilter.pipe(startWith([]))
    ]).pipe(
      switchMap(([searchTerm, categoryFilter]) => {
        if (!searchTerm && categoryFilter.length === 0) {
          return this.alkatreszList$;
        } else {
          return this.alkatreszList$.pipe(
            map(alkatreszek =>
              alkatreszek.filter(alkatresz =>
                alkatresz.nev && alkatresz.nev.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (categoryFilter.length === 0 || categoryFilter.every((category: string) =>
                 alkatresz.kategoriak && alkatresz.kategoriak.toLowerCase().includes(category.toLowerCase())
                ))
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

  filterByCategory() {
    if (this.kategoriak.length > 0) {
      const kategoriakFormatted = this.kategoriak.map((value: string) => value.trim().replace(/\s+/g, ' '));
      const currentFilter = this.categoryFilter.getValue();
      const newValues = kategoriakFormatted.filter((value: string) => !currentFilter.includes(value));
      this.categoryFilter.next([...currentFilter, ...newValues]);
      this.kategoriak = [];
      this.isFilterActive = true;
    }
    if (this.autoTipusok.length > 0) {
      const autoTipusokFormatted = this.autoTipusok.map((value: string) => value.trim().replace(/\s+/g, ' '));
      const currentFilter = this.categoryFilter.getValue();
      const newValues = autoTipusokFormatted.filter((value: string) => !currentFilter.includes(value));
      this.categoryFilter.next([...currentFilter, ...newValues]);
      this.autoTipusok = [];
      this.isFilterActive = true;
    }
  
    var closeModalBtn = document.getElementById('filter-alkatresz-modal-close');
    if (closeModalBtn) {
      closeModalBtn.click();
    }

    //this.combineFilters();
  }

  deleteFilter() {
    this.categoryFilter.next([]);
    this.isFilterActive = false;
  }
}

