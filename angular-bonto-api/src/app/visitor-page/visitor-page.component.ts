import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject, combineLatest, map, of, startWith, switchMap, takeUntil, tap } from 'rxjs';
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
  alkatreszList$!:Observable<any[]>;
  filteredAlkatreszek$!: Observable<any[]>;
  showCategoryPage$!:Observable<any>;
  private unsubscribe$ = new Subject<void>();

  constructor(private service: BontoApiService, public categoryPageService: CategoryPageService) {}

  ngOnInit(): void {
    this.kategoriaList$ = this.service.getKategoriaList();
    this.alkatreszList$ = this.service.getAlkatreszList();
    this.filteredAlkatreszek$ = this.alkatreszList$;
    this.showCategoryPage$ = this.categoryPageService.showCategoryPage$;
  }

  ngAfterViewInit(): void {
    combineLatest([
      this.filteredAlkatreszek$,
      this.categoryPageService.currentCategory$,
      this.searchBar ? this.searchBar.searchTerm.pipe(startWith('')) : of(''),
    ]).pipe(
      tap(([_, category, searchTermValue]) => {
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

  setCategoryPage(category: string) {
    if (category !== this.categoryPageService.getCategory()) {
      this.categoryPageService.setCategory(category);
      this.categoryPageService.setShowCategoryPage(true);
    }
  }
}
