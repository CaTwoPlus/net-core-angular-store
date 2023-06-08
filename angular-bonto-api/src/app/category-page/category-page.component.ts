import { Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest, map, takeUntil, tap } from 'rxjs';
import { BontoApiService } from "src/app/bonto-api.service";
import { SearchService } from 'src/app/search.service';
import { SearchBarComponent } from 'src/app/search/search.component';
import { CategoryPageService } from '../category-page.service';

@Component({
  selector: 'app-category-page',
  templateUrl: './category-page.component.html',
  styleUrls: ['./category-page.component.css']
})
export class CategoryPageComponent implements OnInit{
  @ViewChild('searchBar') searchBar!: SearchBarComponent;
  //showCategoryPage$ = this.categoryService.showCategoryPage$;

  constructor(private service:BontoApiService, private searchService: SearchService, 
    private categoryService: CategoryPageService) {}

  alkatreszList$!:Observable<any[]>;
  kategoriaList$!:Observable<any[]>;
  autoTipusList$!:Observable<any[]>;
  filteredAlkatreszek$!:Observable<any[]>;
  showCategoryPage$!:Observable<any>;
  isMenuClicked$!:Observable<any>;

  isFilterActive:boolean = false;

  modalTitle: string = '';
  kategoriakLabel: string = '';
  kategoria: string = '';
  autoTipusok: string[] = [];
  rowItems: any[][] = [];

  categoryFilter: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private unsubscribe$ = new Subject<void>();

  async ngOnInit() {
    this.alkatreszList$ = this.service.getAlkatreszList();
    this.kategoriaList$ = this.service.getKategoriaList();
    this.autoTipusList$ = this.service.getAutoTipusList();

    combineLatest([
    this.categoryService.currentCategory$,
    this.alkatreszList$
    ]).pipe(
      map(([category]) => {
        const kategoria = category.trim().replace(/\s+/g, ' ');
        this.searchService.setCategoryFilter(kategoria);
        return this.searchService.getCategorizedAlkatreszek(this.alkatreszList$);
      }),
      tap((filteredAlkatreszek) => {
        this.filteredAlkatreszek$ = filteredAlkatreszek;
        console.log("data:", filteredAlkatreszek);
      }),
      takeUntil(this.unsubscribe$)
    )
    .subscribe((filteredAlkatreszek) => {
      this.filteredAlkatreszek$ = filteredAlkatreszek;
    });
    
    //this.kategoria.push(this.categoryService.getCategory());
    //this.kategoria = this.kategoria.map((value: string) => value.trim().replace(/\s+/g, ' '));
    //this.searchService.setCategoryFilter(this.kategoria);
    //this.filteredAlkatreszek$ = this.searchService.getFilteredAlkatreszek(this.alkatreszList$);
    this.showCategoryPage$ = this.categoryService.showCategoryPage$;
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

  calculateRows(items: any[]): any[][] {
    const maxColumns = 6;
    const numRows = Math.ceil(items.length / maxColumns);
    const rows: any[][] = [];
  
    for (let i = 0; i < numRows; i++) {
      rows.push(items.slice(i * maxColumns, (i + 1) * maxColumns));
    }
  
    return rows;
  }
  
  getRowItems(items: any[], rowIndex: number): any[] {
    const maxColumns = 6;
    const rowItems = items.slice(rowIndex * maxColumns, (rowIndex + 1) * maxColumns);
    return rowItems;
  }

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'https://localhost:7094/images/placeholder.png';
    imgElement.removeEventListener('error', this.handleImageError);
  }
}
