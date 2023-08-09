import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, HostListener, OnDestroy  } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, Subject, Subscription, combineLatest, filter, map, of, switchMap, takeUntil, tap } from 'rxjs';
import { BontoApiService } from 'src/app/bonto-api.service';
import { SearchService } from '../search/search.service';
import { CategoryPageService } from '../category-page.service';
import { SearchBarComponent } from 'src/app/search/search.component';
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
  
  @ViewChild('searchBar') searchBar!: SearchBarComponent;
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
  alkatreszList$:Observable<any[]> = this.service.getAlkatreszList();
  filteredAlkatreszek$: Observable<any[]> = this.alkatreszList$;
  showCategoryPage$!:Observable<any>;

  private unsubscribe$ = new Subject<void>();
  private afterViewInitSubscription: Subscription | undefined;
  private searchTermSubscription: Subscription | undefined;

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
  isSearchResultEmptyAlert: boolean = false;
  isFilterResultEmptyAlert: boolean = false;
  isVisitorQuery: boolean = true;
  dropdownFilterOptionNum: number = 0;
  lastScrollPosition: number = 0;
  searchCounter: number = 0;
  filterOrder: string = '';
  keyword: string | null = '';
  [key: string]: any;
  
  categoryFilter: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  orderFilter: BehaviorSubject<string> = new BehaviorSubject<string>('');

  ngOnInit() {
    this.showCategoryPage$ = this.categoryPageService.showCategoryPage$;
    this.route.paramMap.subscribe(params => {
      const category = params.get('category');
      this.keyword = params.get('talalatok') ?? '';
      const currentUrlSegments = this.location.path().split('/');
      const anchorId = currentUrlSegments.find(segment => {
        return segment === 'szolgaltatasok' || segment === 'vasarlasi_infok' || segment === 'kapcsolat';
      });

      if (this.keyword.length >= 3) {
        this.searchService.isSearchActive = true;
      } else if (category) {
        this.setCategoryPage(category);
        this.categoryPageService.setShowCategoryPage(true);
        this.searchService.isSearchActive = false;
      } else if (anchorId) {
        this.categoryPageService.setCategory('');
        this.categoryPageService.setShowCategoryPage(false);
        this.searchService.isSearchActive = false;
        this.scrollToAnchor(anchorId);
      } else {
        this.categoryPageService.setCategory('');
        this.categoryPageService.setShowCategoryPage(false);
        this.router.navigateByUrl('');
      }

      if (this.searchService.isSearchActive && this.keyword !== '') {
        const keyword = this.keyword ?? '';
        this.performSearch(keyword, true);
        this.categoryPageService.setShowCategoryPage(true);
      } else if (!this.searchService.isSearchActive && this.categoryPageService.getShowCategoryPage()) {
        this.performSearch('');
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.searchTermSubscription) {
      this.searchTermSubscription.unsubscribe();
    }
    if (this.afterViewInitSubscription) {
      this.afterViewInitSubscription.unsubscribe();
    }
  }

  performSearch(keyword: string, throughNav = false) {
    this.afterViewInitSubscription =
    combineLatest([
      this.filteredAlkatreszek$,
      this.categoryPageService.currentCategory$,
      this.categoryPageService.orderBy$,
    ]).pipe(
      switchMap(([_, category, orderBy]) => {
        const kategoria = category.replace(/^\s*;/, '').replace(/;\s*$/, '').trim();
        if (this.categoryPageService.previousCategory !== this.categoryPageService.category
          && this.categoryPageService.previousCategory !== '') {
          this.categoryPageService.previousCategory = '';
          this.deleteFilter();
          this.deleteOrder();
        }
        if (keyword.length > 0) {
          if (!this.isFilterActive) {
            this.isFilterResultEmptyAlert = false;
            return this.service.searchAlkatreszByKeyword(keyword, orderBy).pipe(
              takeUntil(this.unsubscribe$), tap(results => {
                if (results.length === 0 && throughNav) {
                  this.onAppliedFilterInvalid(true, true);
                }
              })
            ); 
          } else {
            if (this.searchCounter > 0) {
              this.searchCounter = 0;
              this.deleteFilter();
              return this.service.searchAlkatreszByKeyword(keyword, orderBy).pipe(
                takeUntil(this.unsubscribe$)
              )
            } else {
              return this.service.searchAlkatreszByKeywordAndCategories(keyword, kategoria, orderBy).pipe(
                takeUntil(this.unsubscribe$), 
                tap(results => {
                  if (results.length === 0 && this.isFilterActive) {
                    this.onAppliedFilterInvalid(true);
                  } else if (results.length > 0 && this.isFilterActive) {
                    this.searchCounter++;
                    this.isFilterResultEmptyAlert = false;
                  }
                })
              );
            }
          } 
        } else {
          return this.service.searchAlkatreszByCategories(kategoria, orderBy).pipe(
            takeUntil(this.unsubscribe$), 
            tap(results => {
              if (results.length === 0 && this.isFilterActive) {
                this.onAppliedFilterInvalid(true);
              } else {
                this.isFilterResultEmptyAlert = false;
              }
            })
          )
        }
      })
    ).subscribe(filteredAlkatreszek => {
      this.filteredAlkatreszek$ = of(filteredAlkatreszek);
    });
  }

  scrollToAnchor(anchorId: string) {
    setTimeout(() => {this.viewportScroller.scrollToAnchor(anchorId); }, 100);
  }

  setCategoryPage(category: string, anchorId = '') {
    if (category !== this.categoryPageService.getCategory() && category !== '') {
      this.categoryPageService.setCategory(category.trim());
      this.categoryPageService.setShowCategoryPage(true);
      if (this.searchBar) {
        this.searchBar.resetSearch();
      }
    } else if (anchorId !== 'home' && category === this.categoryPageService.getCategory() && this.searchService.isSearchActive) {
      if (this.searchBar) {
        this.searchBar.resetSearch();
      }
    } else if (category === '') {
      this.categoryPageService.setShowCategoryPage(false);
      this.categoryPageService.setCategory('');
      if (this.searchBar) {
        this.searchBar.resetSearch();
      }
      this.scrollToAnchor(anchorId);
    }
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
      const currentFilter = this.categoryFilter.getValue();
      const updateFilter: string[] = [];
      if (autoTipusokFormatted.length > 0 && autoTipusokFormatted !== currentFilter[0]) {
        const newValues = [autoTipusokFormatted].filter(value => !currentFilter.includes(value));
        updateFilter.push(...newValues);
        this.isFilterActive = true;
        this.categoryFilter.next(updateFilter);
        this.categoryPageService.setCategoryFilter(newValues[0]);
      }
      else {
        updateFilter[0] = this.categoryPageService.getCategory();
        this.categoryFilter.next(updateFilter);
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
