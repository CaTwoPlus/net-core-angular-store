import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, Subject, combineLatest, of } from 'rxjs';
import { map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BontoApiService } from "src/app/bonto-api.service";
import { ViewAlkatreszService } from "src/app/view-alkatresz.service";
import { SearchBarComponent } from 'src/app/search/search.component';
import { AuthenticationService } from 'src/app/login/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-show-alkatresz',
  templateUrl: './show-alkatresz.component.html',
  styleUrls: ['./show-alkatresz.component.css']
})
export class ShowAlkatreszComponent implements OnInit{
  @ViewChild('searchBar', { static: false }) searchBar!: SearchBarComponent;
  @ViewChild('viewAlkatreszModal') viewAlkatreszModal!: ElementRef;
  @ViewChild('addEditAlkatreszModal') addEditAlkatreszModal!: ElementRef;

  constructor(private service:BontoApiService, private viewAlkatreszService: ViewAlkatreszService, 
    private authService: AuthenticationService, private cookie: CookieService) {}

  alkatreszList$!:Observable<any[]>;
  kategoriaList$!:Observable<any[]>;
  autoTipusList$!:Observable<any[]>;
  filteredAlkatreszek$!:Observable<any[]>;

  categoryFilter: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  kategoriak: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private unsubscribe$ = new Subject<void>();
  
  modalTitle: string = '';
  filterOrder: string = '';
  kategoriakInput: string[] = [];
  kategoriakLabel: string = '';
  autoTipusokInput: string[] = [];

  alkatresz:any;

  activateAddEditAlkatreszComponent:boolean = false;
  activateViewAlkatreszComponent:boolean = false;
  isFilterActive:boolean = false;

  async ngOnInit() {
    //this.viewAlkatreszService.alkatreszList$ = this.service.getAlkatreszList();
    //this.alkatreszList$ = this.viewAlkatreszService.alkatreszList$;
    //this.alkatreszList$ = this.service.getAlkatreszList();
    this.kategoriaList$ = this.service.getKategoriaList();
    this.autoTipusList$ = this.service.getAutoTipusList();
    this.filteredAlkatreszek$ = this.service.getAlkatreszList();
  }

  ngAfterViewInit(): void {
    combineLatest([
      this.filteredAlkatreszek$,
      this.searchBar ? this.searchBar.searchTerm.pipe(startWith('')) : of(''),
      this.kategoriak
    ]).pipe(
      switchMap(([_, searchTermValue, kategoriakValue]) => {
        return this.authService.checkTokenExpiration().pipe(
          switchMap((sessionExpired) => {
            if (sessionExpired) {
              alert('Lejárt a munkamenet, jelentkezz be újra!');
              this.authService.logout().subscribe(() => {
              });
              return EMPTY;
            } else {
              const keyword = searchTermValue ? searchTermValue.trim() : '';
              const kategoriakString = kategoriakValue.join(';');
              return this.service.searchAlkatreszByKeywordAndCategories(keyword, kategoriakString, this.filterOrder);
            }
          })
        );
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe(filteredAlkatreszek => {
      this.filteredAlkatreszek$ = of(filteredAlkatreszek);
    });
  }
  
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
            showDeleteSuccess.style.display = "none";
          }
        }, 4000);
      })  
    }
  }


  modalClose() {
    this.activateAddEditAlkatreszComponent = false;
    this.activateViewAlkatreszComponent = false;
    this.alkatreszList$ = this.service.getAlkatreszList();
  }

  filterByCategory() {
    const isKategoriak = this.kategoriakInput.length > 0;
    const isAutoTipusok = this.autoTipusokInput.length > 0;
    const currentFilter = this.categoryFilter.getValue();
    const updatedKategoriak: string[] = [];
  
    if (isKategoriak) {
      const kategoriakFormatted = this.kategoriakInput.map((value: string) => value.trim().replace(/\s+/g, ' '));
      const newValues = kategoriakFormatted.filter((value: string) => !currentFilter.includes(value));
      updatedKategoriak.push(...newValues);
      this.kategoriakInput = [];
      this.isFilterActive = true;
    }
  
    if (isAutoTipusok) {
      const autoTipusokFormatted = this.autoTipusokInput.map((value: string) => value.trim().replace(/\s+/g, ' '));
      const newValues = autoTipusokFormatted.filter((value: string) => !currentFilter.includes(value));
      updatedKategoriak.push(...newValues);
      this.autoTipusokInput = [];
      this.isFilterActive = true;
    }
  
    const kategoriakValue = this.kategoriak.getValue();
    const concatenatedKategoriak = [...kategoriakValue, ...updatedKategoriak];
    const uniqueKategoriak = Array.from(new Set(concatenatedKategoriak));
  
    this.kategoriakLabel = this.kategoriakLabel.concat(currentFilter.join(";"), updatedKategoriak.join(";"));
    this.kategoriak.next(uniqueKategoriak);
  
    const closeModalBtn = document.getElementById('filter-alkatresz-modal-close');
    if (closeModalBtn) {
      closeModalBtn.click();
    }
  }  

  deleteFilter() {
    this.kategoriak.next([]);
    this.kategoriakLabel = '';
    this.isFilterActive = false;
  }

  logOut() {
    this.authService.logout();
  }
}

