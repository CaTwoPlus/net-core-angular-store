import { Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest, map, of, startWith, takeUntil, tap } from 'rxjs';
import { BontoApiService } from "src/app/bonto-api.service";
import { SearchService } from 'src/app/search.service';
import { SearchBarComponent } from 'src/app/search/search.component';
import { CategoryPageService } from '../category-page.service';

@Component({
  selector: 'app-category-page',
  templateUrl: './category-page.component.html',
  styleUrls: ['./category-page.component.css']
})
export class CategoryPageComponent implements OnInit {
  @ViewChild('searchBar', { static: false }) searchBar!: SearchBarComponent;

  constructor(private service: BontoApiService, private searchService: SearchService,
    private categoryService: CategoryPageService) { }

  alkatreszList$!: Observable<any[]>;
  kategoriaList$!: Observable<any[]>;
  autoTipusList$!: Observable<any[]>;
  filteredAlkatreszek$!: Observable<any[]>;
  showCategoryPage$!: Observable<any>;

  isFilterActive: boolean = false;

  modalTitle: string = '';
  kategoriakLabel: string = '';
  autoTipusok: string[] = [];

  categoryFilter: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private unsubscribe$ = new Subject<void>();

  async ngOnInit() {
    this.alkatreszList$ = this.service.getAlkatreszList();
    this.kategoriaList$ = this.service.getKategoriaList();
    this.autoTipusList$ = this.service.getAutoTipusList();
    this.filteredAlkatreszek$ = this.alkatreszList$;
    this.showCategoryPage$ = this.categoryService.showCategoryPage$;
  }

  ngAfterViewInit(): void {
    combineLatest([
      this.filteredAlkatreszek$,
      this.categoryService.currentCategory$,
      this.searchBar ? this.searchBar.searchTerm.pipe(startWith('')) : of(''),
    ]).pipe(
      tap(([filteredAlkatreszek$, category, searchTermValue]) => {
        const kategoria = category.trim().replace(/\s+/g, ' ');
        const filter = searchTermValue ? searchTermValue.trim() : '';
        this.filteredAlkatreszek$ = this.service.searchAlkatreszByFilterAndCategories(filter, kategoria).pipe(
          takeUntil(this.unsubscribe$)
        );
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  filterByYear() {
    let isAutoTipusok = this.autoTipusok.length > 0;
    /*if (isAutoTipusok) {
      const autoTipusokFormatted = this.autoTipusok.map((value: string) => value.trim().replace(/\s+/g, ' '));
      const newValues = autoTipusokFormatted.filter((value: string) => !currentFilter.includes(value));
      this.searchService.setCategoryFilter([...currentFilter, ...newValues]);
      this.kategoriakLabel = this.kategoriakLabel.concat(currentFilter.join(";"),
       isKategoriak ? ";" : "", newValues.join(";"));
      this.autoTipusok = [];
      this.isFilterActive = true;
    }*/

    var closeModalBtn = document.getElementById('filter-alkatresz-modal-close');
    if (closeModalBtn) {
      closeModalBtn.click();
    }
  }

  deleteFilter() {
    this.searchService.setCategoriesFilter([]);
    this.kategoriakLabel = '';
    this.isFilterActive = false;
  }

  trackByItemId(index: number, item: any): string {
    return item.id; // Replace 'id' with the unique identifier property of your item
  }

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'https://localhost:7094/images/placeholder.png';
    imgElement.removeEventListener('error', this.handleImageError);
  }
}
