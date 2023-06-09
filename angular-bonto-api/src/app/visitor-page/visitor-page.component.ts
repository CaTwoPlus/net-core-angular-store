import { Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest, filter, map, of, startWith, switchMap, take, takeUntil, tap } from 'rxjs';
import { BontoApiService } from 'src/app/bonto-api.service';
import { CategoryPageService } from '../category-page.service';
import { SearchBarComponent } from 'src/app/search/search.component';

@Component({
  selector: 'app-visitor-page',
  templateUrl: './visitor-page.component.html',
  styleUrls: ['./visitor-page.component.css']
})

export class VisitorPageComponent implements OnInit{
  @ViewChild('searchBar') searchBar!: SearchBarComponent;

  title = 'ford';
  kategoriaList$!:Observable<any[]>;
  autoTipusList$!: Observable<any[]>;
  alkatreszList$!:Observable<any[]>;
  filteredAlkatreszek$!: Observable<any[]>;
  showCategoryPage$!:Observable<any>;

  private unsubscribe$ = new Subject<void>();

  autoTipusokInput: { [key: string]: boolean } = {};
  isFilterActive: boolean = false;
  isOrderActive: boolean = false;
  filterButtonDisabled: boolean = true;
  orderButtonDisabled: boolean = true;
  orderDeleteBtnDisabled: boolean = true;
  filterDeleteBtnDisabled: boolean = true; 
  isDescPriceChecked: boolean = false;
  isAscPriceChecked: boolean = false;
  isDescNameChecked: boolean = false;
  isAscNameChecked: boolean = false;
  showInvalidSearchAlert: boolean = false;
  isSearchResultEmpty: boolean = false;
  dropdownFilterOptionNum: number = 0;
  filterOrder: string = '';
  [key: string]: any;

  categoryFilter: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  orderFilter: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(private service: BontoApiService, public categoryPageService: CategoryPageService) {}

  ngOnInit(): void {
    this.kategoriaList$ = this.service.getKategoriaList();
    this.alkatreszList$ = this.service.getAlkatreszList();
    this.autoTipusList$ = this.service.getAutoTipusList();
    this.filteredAlkatreszek$ = this.alkatreszList$;
    this.showCategoryPage$ = this.categoryPageService.showCategoryPage$;
  }

  ngAfterViewInit(): void {
    combineLatest([
      this.filteredAlkatreszek$,
      this.categoryPageService.currentCategory$,
      this.categoryPageService.orderBy$,
      this.searchBar ? (this.searchBar.searchTerm.pipe(startWith(''))) : of(''),
    ]).pipe(
      switchMap(([_, category, orderBy, searchTermValue ]) => {
        const kategoria = category.trim().replace(/\s+/g, ' ');
        const filter = searchTermValue ? searchTermValue.trim() : '';
        if (filter.length > 0) {
          return this.service.searchAlkatreszByFilter(filter, orderBy).pipe(
            tap(results => {
              this.isSearchResultEmpty = results.length === 0;
              if (this.isSearchResultEmpty) {
                this.searchBar.isSearchFilterApplied = false;
                this.categoryPageService.setShowCategoryPage(false);
                setTimeout(() => {
                  const showSearchAlert = document.getElementById("search-failure-alert");
                  if (showSearchAlert) {
                    showSearchAlert.style.display = "none";
                    this.isSearchResultEmpty = !this.isSearchResultEmpty;
                  }
                }, 4000);
              }
            }),
            takeUntil(this.unsubscribe$)
          );
        } else {
          return this.service.searchAlkatreszByCategories(kategoria, orderBy).pipe(
            takeUntil(this.unsubscribe$)
          )
        }
      })
    ).subscribe(filteredAlkatreszek => {
      this.filteredAlkatreszek$ = of(filteredAlkatreszek);
    });
  }  

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  setCategoryPage(category: string) {
    if (category !== this.categoryPageService.getCategory()) {
      this.categoryPageService.setCategory(category.trim());
      this.categoryPageService.setShowCategoryPage(true);
      this.searchBar.resetSearch();
    }
  }

  filterByYear() {
    const autoTipusokInputKeys = Object.keys(this.autoTipusokInput);
    const autoTipusokFormatted = autoTipusokInputKeys.map((key: string) => {
      return key.trim().replace(/\s+/g, ' ');
    });

    let isAutoTipusok = autoTipusokFormatted.length > 0;
    const currentFilter = this.categoryFilter.getValue();
    const updateFilter: string[] = [];
    if (isAutoTipusok) {
      const newValues = autoTipusokFormatted.filter((value: string) => !currentFilter.includes(value));
      updateFilter.push(...newValues);
      this.isFilterActive = true;
      this.categoryFilter.next(updateFilter);
      this.categoryPageService.setCategories(this.categoryFilter);
    } else {
      updateFilter[0] = this.categoryPageService.getCategory();
      this.categoryFilter.next(updateFilter);
    }
    this.filterDeleteBtnDisabled = false;
  }

  orderBy() {
    let isOrderActive = this.filterOrder.length > 0;
    const currentOrder = this.orderFilter.getValue();
    if (isOrderActive) {
      this.isOrderActive = true;
      if (!currentOrder.includes(this.filterOrder)) {
        this.orderFilter.next(this.filterOrder);
        this.categoryPageService.setOrderByParam(this.filterOrder);
      }
    }
    this.orderDeleteBtnDisabled = false;
  }

  deleteFilter() {
    if (this.isFilterActive) {
      this.autoTipusokInput = {};
      this.isFilterActive = false;
      this.filterButtonDisabled = true;
      this.filterDeleteBtnDisabled = true;
      this.categoryFilter.next([]);
      this.categoryPageService.resetCategories();
    }
  }

  deleteOrder() {
    if (this.isOrderActive) {
      this.filterOrder = '';
      this.isOrderActive = false;
      this.orderButtonDisabled = true;
      this.orderDeleteBtnDisabled = true;
      this.orderFilter.next('');
      this.categoryPageService.resetOrderFilter();

      if (this.isDescPriceChecked) {
        this.isDescPriceChecked = false;
      }
      if (this.isAscPriceChecked) {
        this.isAscPriceChecked = false;
      }
      if (this.isDescNameChecked) {
        this.isDescNameChecked = false;
      }
      if (this.isAscNameChecked) {
        this.isAscNameChecked = false;
      }
    }
  }

  onCheckboxChange(filterOption: string, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.id.includes("dropdownFilterOption")) {
      this.filterButtonDisabled = !checkbox.checked;
    } else if (checkbox.id.includes("dropdownFilterOrderOption")) {
      this.orderButtonDisabled = !checkbox.checked;
      switch (filterOption) {
        case 'descPrice':
          this.isDescPriceChecked = true;
          this.filterOrder = "descPrice";
          this.disableOtherCheckboxes(['isAscPriceChecked', 'isDescNameChecked', 'isAscNameChecked']);
          break;
        case 'ascPrice':
          this.isAscPriceChecked = true;
          this.filterOrder = "ascPrice";
          this.disableOtherCheckboxes(['isDescPriceChecked', 'isDescNameChecked', 'isAscNameChecked']);
          break;
        case 'descName':
          this.isDescNameChecked = true;
          this.filterOrder = "descName";
          this.disableOtherCheckboxes(['isDescPriceChecked', 'isAscPriceChecked', 'isAscNameChecked']);
          break;
        case 'ascName':
          this.isAscNameChecked = true;
          this.filterOrder = "ascName";
          this.disableOtherCheckboxes(['isDescPriceChecked', 'isAscPriceChecked', 'isDescNameChecked']);
          break;
      }
    }
  }
  
  disableOtherCheckboxes(checkboxesToDisable: string[]) {
    Object.keys(this).forEach(key => {
      if (checkboxesToDisable.includes(key)) {
        this[key] = false;
      }
    });
  }

  onSearchTermValid(value: boolean): void {
    this.showInvalidSearchAlert = value;
  
    if (value) {
      setTimeout(() => {
        const showSearchAlert = document.getElementById("search-failure-alert-type-err");
        if (showSearchAlert) {
          showSearchAlert.style.display = "none";
        }
      }, 4000);
    }
  }
}
