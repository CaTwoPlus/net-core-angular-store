import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, combineLatest, forkJoin, interval } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { BontoApiService } from "src/app/bonto-api.service";
import { AuthenticationService } from 'src/app/login/auth.service';
import { SearchService } from 'src/app/search/search.service';

@Component({
  selector: 'app-show-alkatresz',
  templateUrl: './show-alkatresz.component.html',
  styleUrls: ['./show-alkatresz.component.css']
})
export class ShowAlkatreszComponent implements OnInit{
  @ViewChild('viewAlkatreszModal') viewAlkatreszModal!: ElementRef;
  @ViewChild('addEditAlkatreszModal') addEditAlkatreszModal!: ElementRef;

  constructor(private service:BontoApiService, 
    private authService: AuthenticationService, private searchService: SearchService) {}

  kategoriaList$!:Observable<any[]>;
  autoTipusList$!:Observable<any[]>;
  private filteredAlkatreszekSubject$ = new BehaviorSubject<any[]>([]);
  private unsubscribe$ = new Subject<void>();
  private countdownSubscription: Subscription | undefined;
  filteredAlkatreszek$ = this.filteredAlkatreszekSubject$.asObservable();
  categoryFilter: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  kategoriakSubject$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  kategoriak$ = this.kategoriakSubject$.asObservable();
  modalTitle: string = '';
  filterOrder: string = '';
  kategoriakInput: string[] = [];
  kategoriakLabel: string = '';
  autoTipusokInput: string[] = [];
  alkatresz:any;
  kategoriakOutput:any[] = [];
  autoTipusokOutput:any[] = [];
  activateAddEditAlkatreszComponent:boolean = false;
  activateViewAlkatreszComponent:boolean = false;
  isFilterActive:boolean = false;
  showSessionExpiry:boolean = false;
  countdown: number = 0;

  async ngOnInit() {
    this.countdown = this.getSessionTimeout();
    // Start the countdown timer
    this.countdownSubscription = interval(1000).subscribe(() => {
      if (this.countdown <= 0) {
        // Session expired, log the user out
        this.authService.logout();
      } else {
        this.countdown--;
      }
    });
    this.kategoriaList$ = this.service.getKategoriaList(true);
    this.kategoriaList$.subscribe(array => {
      array.forEach(item => {
        this.kategoriakOutput.push(item);
      });
    });
    this.autoTipusList$ = this.service.getAutoTipusList(true);
    this.autoTipusList$.subscribe(array => {
      array.forEach(item => {
        this.autoTipusokOutput.push(item);
      });
    });
    this.performSearch();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  getSessionTimeout(): number {
    const refreshTokenExpiration = this.authService.getTokenExpiration(true);
    const refreshTokenExpirationInSeconds = Math.floor(refreshTokenExpiration / 1000);
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = refreshTokenExpirationInSeconds - currentTime;
    return remainingTime > 0 ? remainingTime : 0;
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    const hoursString = String(hours).padStart(2, '0');
    const minutesString = String(remainingMinutes).padStart(2, '0');
    const secondsString = String(remainingSeconds).padStart(2, '0');
    return `${hoursString}:${minutesString}:${secondsString}`;
  }

  performSearch() {
    combineLatest([
      this.searchService.searchTermAdmin$,
      this.kategoriak$,
    ]).pipe(
      switchMap(([searchTermValue, kategoriakValue]) => {
        if (searchTermValue.length >= 3 || kategoriakValue.length > 0) {
          const kategoriakString = kategoriakValue.join(';');
          const filteredResults$ = this.service.searchAlkatreszByKeywordAndCategories(
            searchTermValue, kategoriakString, this.filterOrder, true, true);
          const alkatreszList$ = this.service.getAlkatreszList(true);
          return forkJoin([filteredResults$, alkatreszList$]).pipe(
            map(([filteredResults, allResults]) => {
              return this.combineResults(filteredResults, allResults);
            })
          );
        } else {
          return this.service.getAlkatreszList(true);
        }
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe(filteredAlkatreszek => {
      this.filteredAlkatreszekSubject$.next(filteredAlkatreszek);
    });
  }
  
  private combineResults(filtered: any[], alkatreszList: any[]): any[] {
    return alkatreszList.filter((item) => filtered.some((filteredItem) => filteredItem.id === item.id));
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
    this.alkatresz = item;
    this.modalTitle = "Alkatrész megtekintése";
    this.activateViewAlkatreszComponent = true;
  }

  delete(item:any) {
    if (confirm(`Biztos, hogy törlöd a ${item.nev} alkatrészt?`)) {
      this.service.deleteAlkatresz(item.id).subscribe(res => {
        // update the filtered observable as well
        this.filteredAlkatreszek$ = this.filteredAlkatreszek$.pipe(
          map(list => list.filter(alkatresz => alkatresz.id !== item.id))
        );
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
    this.performSearch();
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
  
    const kategoriakValue = this.kategoriakSubject$.getValue();
    const concatenatedKategoriak = [...kategoriakValue, ...updatedKategoriak];
    const uniqueKategoriak = Array.from(new Set(concatenatedKategoriak));
  
    this.kategoriakLabel = this.kategoriakLabel.concat(currentFilter.join(";"), updatedKategoriak.join(";"));
    this.kategoriakSubject$.next(uniqueKategoriak);
  
    const closeModalBtn = document.getElementById('filter-alkatresz-modal-close');
    if (closeModalBtn) {
      closeModalBtn.click();
    }
  }  

  deleteFilter() {
    this.kategoriakSubject$.next([]);
    this.kategoriakLabel = '';
    this.isFilterActive = false;
  }

  logOut() {
    this.authService.logout(true);
  }
}

