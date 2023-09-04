import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, HostListener, OnDestroy  } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, combineLatest, exhaustMap, of, takeUntil, tap } from 'rxjs';
import { BontoApiService } from 'src/app/bonto-api.service';
import { SearchService } from '../search/search.service';
import { CategoryPageService } from '../category-page.service';
import { ViewportScroller } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({ 
  selector: 'app-visitor-page',
  templateUrl: './visitor-page.component.html',
  styleUrls: ['./visitor-page.component.css']
})

export class VisitorPageComponent implements OnInit, OnDestroy {
  constructor(private service: BontoApiService, private categoryPageService: CategoryPageService, 
    private searchService: SearchService, private changeDetectorRef: ChangeDetectorRef, private elementRef: ElementRef,
    private viewportScroller: ViewportScroller, private route: ActivatedRoute, private router: Router,
    private location: Location) {}
  
  @ViewChild('scrollTarget', { static: false }) scrollTarget!: ElementRef;
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    const mainBg = this.elementRef.nativeElement.querySelector('.main-container') as HTMLElement;
    if (mainBg) {
      const scrollOffset = window.scrollY;
      const initialY = 55;
      const scrollDirection = scrollOffset > this.lastScrollPosition ? 'down' : 'up';
      const updatedY = scrollDirection === 'down' ? initialY - scrollOffset * 0.2 : this.lastScrollPosition - scrollOffset * 0.01 ;
      mainBg.style.backgroundPositionY = `${updatedY}%`;
      mainBg.style.backgroundPositionX = 'right 70%';
      this.lastScrollPosition = updatedY;
    }
  }

  title = 'ford';
  kategoriaList$:Observable<any[]> = this.service.getKategoriaList();
  autoTipusList$:Observable<any[]> = this.service.getAutoTipusList();
  filteredAlkatreszek$: Observable<any[]> = this.service.getAlkatreszList();
  showCategoryPage$!:Observable<any>;
  private unsubscribe$ = new Subject<void>();
  private searchSubscription: Subscription | undefined;
  autoTipusokInput: { [key: string]: boolean } = {};
  autoTipusok: any[] = [];
  alkatreszekOutput: any[] = []
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
  isSearchResultEmptyAlert: boolean = false;
  isFilterResultEmptyAlert: boolean = false;
  isVisitorQuery: boolean = true;
  lastScrollPosition: number = 0;
  filterOrder: string = '';
  keyword: string | null = '';
  category: string | null = '';
  [key: string]: any;
  yearFilter: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  orderFilter: BehaviorSubject<string> = new BehaviorSubject<string>('');

  ngOnInit() {
    // Service observables are being assigned here based on URL parameters
    // Cannot combine keyword and category based searches
    this.showCategoryPage$ = this.categoryPageService.showCategoryPage$;
    this.autoTipusList$.subscribe(array => {
      array.forEach(item => {
        this.autoTipusok.push(item);
      });
    });
    this.route.paramMap.subscribe(params => {
      this.category = params.get('category') ?? '';
      this.keyword = params.get('talalatok') ?? '';
      const currentUrlSegments = this.location.path().split('/');
      const anchorId = currentUrlSegments.find(segment => {
        return segment === 'szolgaltatasok' || segment === 'vasarlasi_infok' || segment === 'kapcsolat';
      });

      if (this.keyword.length >= 3) {
        // Perform keyword search
        this.searchService.setSearchState(true);
        // Disabled for now, as it causes API call duplication
        this.resetFilters(); 
        if (this.categoryPageService.getCategory() !== '') {
          this.categoryPageService.setCategory('');
        }
        // Check if navigation was through browser history, as in such a case the search service is not used
        // directly for setting the keyword value in the relevant observable
        if (this.searchService.searchTermValue !== this.keyword) {
          this.searchService.setSearchTerm(this.keyword);
        }
        this.categoryPageService.setShowCategoryPage(true);
        this.performSearch(true);
      } else if (this.category) {
        // Perform category search
        this.searchService.setSearchState(false);
        this.resetFilters();
        this.categoryPageService.setCategory(this.category);
        this.categoryPageService.setShowCategoryPage(true);
        this.performSearch();
      } else if (anchorId) {
        // Navigation to anchors
        this.categoryPageService.setShowCategoryPage(false);
        this.categoryPageService.setCategory('');
        this.resetFilters();
        this.searchService.setSearchState(false);
        this.scrollToAnchor(anchorId);
      } else {
        // Navigation to home
        this.categoryPageService.setShowCategoryPage(false);
        this.categoryPageService.setCategory('');
        this.resetFilters();
        this.searchService.setSearchState(false);
        this.router.navigateByUrl('');
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  // As per database design, year filter values are part of the categories, 
  // so the same API call is made for changes in both
  performSearch(onInit = false) {
    if (this.searchSubscription) {
      // If there's an active search subscription, unsubscribe to it to cancel the previous request
      this.searchSubscription.unsubscribe();
    }
    this.searchSubscription =
    combineLatest([
      this.filteredAlkatreszek$,
      this.categoryPageService.currentCategory$,
      this.categoryPageService.orderBy$,
      this.categoryPageService.currentYear$,
      this.searchService.searchTerm$
    ]).pipe(
      exhaustMap(([_, category, orderBy, year, keyword]) => {
        let kategoria = category.replace(/^\s*;/, '').replace(/;\s*$/, '').trim();
        if (keyword.length > 0) {
          if (!this.isFilterActive) {
            this.isFilterResultEmptyAlert = false;
            return this.service.searchAlkatreszByKeyword(keyword, orderBy).pipe(
              takeUntil(this.unsubscribe$), tap(results => {
                if (results.length === 0 && onInit) {
                  this.onAppliedFilterInvalid(true, true);
                }
              })
            ); 
          } else {
              return this.service.searchAlkatreszByKeywordAndCategories(keyword, year, orderBy).pipe(
                takeUntil(this.unsubscribe$), 
                tap(results => {
                  if (results.length === 0 && this.isFilterActive) {
                    this.onAppliedFilterInvalid(true);
                  } else if (results.length > 0 && this.isFilterActive) {
                    this.isFilterResultEmptyAlert = false;
                  }
                })
              );
            }
        } else {
          if (year !== '' && kategoria !== '') {
            // Filtering for category search method
            let yearFilter = kategoria;
            yearFilter = yearFilter.concat(';' + year);
            return this.service.searchAlkatreszByCategories(yearFilter, orderBy).pipe(
              takeUntil(this.unsubscribe$), 
              tap(results => {
                if (results) {
                  if (results.length === 0 && this.isFilterActive) {
                    this.onAppliedFilterInvalid(true);
                  } else {
                    this.isFilterResultEmptyAlert = false;
                  }
                }
              })
            )
          } else if (year === '' && kategoria !== '') {
            // Category search method
            return this.service.searchAlkatreszByCategories(kategoria, orderBy).pipe(
              takeUntil(this.unsubscribe$), 
              tap(results => {
                if (results) {
                  if (results.length === 0 && this.isFilterActive) {
                    this.onAppliedFilterInvalid(true);
                  } else {
                    this.isFilterResultEmptyAlert = false;
                  }
                }
              })
            )
          } else {
            // Browser history navigation was used, don't return anything
            return of([]);
          }
        }
      })
    ).subscribe(filteredAlkatreszek => {
      this.filteredAlkatreszek$ = of(filteredAlkatreszek);
      if (this.alkatreszekOutput.length !== 0) {
        this.alkatreszekOutput = [];
      } 
      filteredAlkatreszek.forEach(item => {
       this.alkatreszekOutput.push(item);
      })
    });
  }

  scrollToAnchor(anchorId: string) {
    setTimeout(() => {this.viewportScroller.scrollToAnchor(anchorId); }, 100);
  }

  filterByYear() {
    // Find the selected key
    const selectedKey = Object.keys(this.autoTipusokInput).find(key => this.autoTipusokInput[key]);
    // Clear all keys in autoTipusokInput
    Object.keys(this.autoTipusokInput).forEach(key => this.autoTipusokInput[key] = false);
    if (selectedKey) {
      // Set the selected checkbox to true
      this.autoTipusokInput[selectedKey] = true;
      const autoTipusokFormatted = selectedKey.trim().replace(/\s+/g, ' ');
      const currentFilter = this.yearFilter.getValue();
      const updateFilter: string[] = [];
      if (autoTipusokFormatted.length > 0 && autoTipusokFormatted !== currentFilter[0]) {
        const newValues = [autoTipusokFormatted].filter(value => !currentFilter.includes(value));
        updateFilter.push(...newValues);
        this.isFilterActive = true;
        this.yearFilter.next(updateFilter);
        this.categoryPageService.setYearFilter(newValues[0]);
      }
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

  resetFilters() { 
    this.deleteFilter();
    this.deleteOrder();
  }

  deleteFilter() {
    this.autoTipusokInput = {};
    this.isFilterActive = false;
    this.filterButtonDisabled = true;
    this.filterDeleteBtnDisabled = true;
    this.yearFilter.next([]);
    this.categoryPageService.resetYearFilter();
  }

  deleteOrder() {
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

  onCheckboxChange(filterOption = '', event: Event, nev = '') {
    const checkbox = event.target as HTMLInputElement;
    // Get the selected autoTipusokInput key
    const selectedKey = nev;
    if (checkbox.id.includes("dropdownFilterOption")) {
      this.filterButtonDisabled = !checkbox.checked;
      if (checkbox.checked) {
        // Uncheck all checkboxes except the selected one
        Object.keys(this.autoTipusokInput).forEach((key) => {
          if (key !== selectedKey) {
            this.autoTipusokInput[key] = false;
          }
        });
      } else {
        // Clear the value of the unchecked checkbox
        this.autoTipusokInput[selectedKey] = false;
      }
    } if (checkbox.id.includes("dropdownFilterOrderOption")) {
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

  onSearchTermInvalid(value: boolean) {
    this.changeDetectorRef.detectChanges();
    this.isSearchResultEmptyAlert = value;
    if (value) {
      setTimeout(() => {
        const showSearchAlert = document.getElementById("search-failure-alert");
        if (showSearchAlert) {
          showSearchAlert.style.display = "none";
          this.isSearchResultEmptyAlert = !value;
        }
      }, 2000);
    }
  }

  onAppliedFilterInvalid(value: boolean, throughNav = false) {
    this.changeDetectorRef.detectChanges();
    this.isFilterResultEmptyAlert = value;
    if (value && !throughNav) {
      setTimeout(() => {
        const showSearchAlert = document.getElementById("filter-failure-alert");
        if (showSearchAlert) {
          showSearchAlert.style.display = "none";
          this.isSearchResultEmptyAlert = !value;
          this.deleteFilter();
        }
      }, 2000);
    } else if (value && throughNav) {
      setTimeout(() => {
        const showSearchAlert = document.getElementById("filter-failure-alert");
        if (showSearchAlert) {
          showSearchAlert.style.display = "none";
          this.isSearchResultEmptyAlert = !value;
          this.router.navigateByUrl('');
        }
      }, 1000);
    }
  }

  onSearchTermShort(value: boolean) {
    this.changeDetectorRef.detectChanges();
    this.showInvalidSearchAlert = value;
    if (value) {
      setTimeout(() => {
        const showSearchAlert = document.getElementById("search-failure-alert-type-err");
        if (showSearchAlert) {
          showSearchAlert.style.display = "none";
        }
      }, 2000);
      this.showInvalidSearchAlert = !value;
    }
  }
}
