import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, HostListener, OnDestroy  } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, combineLatest, of, startWith, switchMap, takeUntil, tap } from 'rxjs';
import { BontoApiService } from 'src/app/bonto-api.service';
import { CategoryPageService } from '../category-page.service';
import { SearchBarComponent } from 'src/app/search/search.component';
import { NavigationEnd, Router } from '@angular/router';

@Component({ 
  selector: 'app-visitor-page',
  templateUrl: './visitor-page.component.html',
  styleUrls: ['./visitor-page.component.css']
})

export class VisitorPageComponent implements OnInit, OnDestroy {
  constructor(private service: BontoApiService, private categoryPageService: CategoryPageService, 
    private router: Router, private changeDetectorRef: ChangeDetectorRef, private elementRef: ElementRef) {}

  @ViewChild('searchBar') searchBar!: SearchBarComponent;
  @ViewChild('scrollTarget', { static: false }) scrollTarget!: ElementRef;
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    const mainBg = this.elementRef.nativeElement.querySelector('.main-container') as HTMLElement;
    const scrollOffset = window.scrollY;
    const initialY = 55;
    const scrollDirection = scrollOffset > this.lastScrollPosition ? 'down' : 'up';
    const updatedY = scrollDirection === 'down' ? initialY - scrollOffset * 0.2 : this.lastScrollPosition - scrollOffset * 0.01 ;
    if (mainBg) {
      mainBg.style.backgroundPositionY = `${updatedY}%`;
      mainBg.style.backgroundPositionX = 'right 70%';
      this.lastScrollPosition = updatedY;
    }
  }

  @HostListener('window:load', ['$event'])
  onWindowLoad() {
    if (window.location.hash) {
      // Clear the fragment by navigating to the same URL without the fragment
      this.router.navigateByUrl(window.location.pathname);
    }
  }

  title = 'ford';
  kategoriaList$!:Observable<any[]>;
  autoTipusList$!: Observable<any[]>;
  alkatreszList$!:Observable<any[]>;
  filteredAlkatreszek$!: Observable<any[]>;
  showCategoryPage$!:Observable<any>;

  private unsubscribe$ = new Subject<void>();
  private routerEventsSubscription: Subscription | undefined;
  private afterViewInitSubscription: Subscription | undefined;

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
  showContactPage: boolean = false;
  dropdownFilterOptionNum: number = 0;
  lastScrollPosition = 0;
  filterOrder: string = '';
  [key: string]: any;

  categoryFilter: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  orderFilter: BehaviorSubject<string> = new BehaviorSubject<string>('');

  ngOnInit(): void {
    this.kategoriaList$ = this.service.getKategoriaList();
    this.alkatreszList$ = this.service.getAlkatreszList();
    this.autoTipusList$ = this.service.getAutoTipusList();
    this.filteredAlkatreszek$ = this.alkatreszList$;
    this.showCategoryPage$ = this.categoryPageService.showCategoryPage$;
  }

  ngAfterViewInit(): void {
    this.afterViewInitSubscription =
    combineLatest([
      this.filteredAlkatreszek$,
      this.categoryPageService.currentCategory$,
      this.categoryPageService.orderBy$,
      this.searchBar ? (this.searchBar.searchTerm.pipe(startWith(''))) : of(''),
    ]).pipe(
      switchMap(([_, category, orderBy, searchTermValue ]) => {
        const kategoria = category.trim().replace(/\s+/g, ' ');
        const filter = searchTermValue ? searchTermValue.trim() : '';
        if (this.categoryPageService.previousCategory !== this.categoryPageService.category
          && this.categoryPageService.previousCategory !== '') {
          this.categoryPageService.previousCategory = '';
          this.deleteFilter();
          this.deleteOrder();
        }
        if (filter.length > 0) {
          this.isFilterResultEmptyAlert = false;
          return this.service.searchAlkatreszByFilter(filter, orderBy).pipe(
            takeUntil(this.unsubscribe$)
          );
        } else {
          this.routerEventsSubscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd && this.showContactPage) {
              const urlTree = this.router.parseUrl(event.urlAfterRedirects);
              const fragment = urlTree.fragment;
              if (fragment === 'kapcsolat') {
                setTimeout(() => {
                  if (this.scrollTarget) {
                    this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
                    this.showContactPage = false;
                    this.isFilterResultEmptyAlert = false;
                    this.deleteFilter();
                    this.deleteOrder();
                  }
                }, 100);
              }
              if (fragment === 'szolgaltatasok') {
                setTimeout(() => {
                  if (this.scrollTarget) {
                    this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
                    this.showContactPage = false;
                    this.isFilterResultEmptyAlert = false;
                    this.deleteFilter();
                    this.deleteOrder();
                  }
                }, 100);
              }
              if (fragment === 'vasarlasi_infok') {
                setTimeout(() => {
                  if (this.scrollTarget) {
                    this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
                    this.showContactPage = false;
                    this.isFilterResultEmptyAlert = false;
                    this.deleteFilter();
                    this.deleteOrder();
                  }
                }, 100);
              }
            }});
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

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.routerEventsSubscription) {
      this.routerEventsSubscription.unsubscribe();
    }
    if (this.afterViewInitSubscription) {
      this.afterViewInitSubscription.unsubscribe();
    }
  }

  setCategoryPage(category: string) {
    if (category !== this.categoryPageService.getCategory() && category !== '') {
      this.categoryPageService.setCategory(category.trim());
      this.categoryPageService.setShowCategoryPage(true);
      this.searchBar.resetSearch();
    } else if (category === '') {
      this.categoryPageService.setShowCategoryPage(false);
      this.categoryPageService.setCategory('');
      this.searchBar.resetSearch();
      this.showContactPage = true;
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

  onSearchTermInvalid(value: boolean): void {
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

  onAppliedFilterInvalid(value: boolean): void {
    this.changeDetectorRef.detectChanges();
    this.isFilterResultEmptyAlert = value;
    if (value) {
      setTimeout(() => {
        const showSearchAlert = document.getElementById("filter-failure-alert");
        if (showSearchAlert) {
          showSearchAlert.style.display = "none";
          this.isSearchResultEmptyAlert = !value;
          this.deleteFilter();
        }
      }, 2000);
    }
  }

  onSearchTermShort(value: boolean): void {
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

  scrollToElement(): void {
    if (this.scrollTarget) {
      this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
