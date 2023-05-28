import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, startWith, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private categories: string[] = [];
  private searchTerm: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private categoryFilter: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  setSearchTerm(term: string) {
    this.searchTerm.next(term);
  }

  setCategoryFilter(categoriesIn: string[]) {
    this.categories = categoriesIn;
    this.categoryFilter.next(categoriesIn);
  }

  getCategoryFilter(): string[] {
    return this.categories;
  }

  getFilteredAlkatreszek(alkatreszList$: Observable<any[]>): Observable<any[]> {
    return combineLatest([this.searchTerm, this.categoryFilter]).pipe(
      switchMap(([searchTerm, categoryFilter]) => {
        if (!searchTerm && categoryFilter.length === 0) {
          return alkatreszList$;
        } else {
          return alkatreszList$.pipe(
            map(alkatreszek =>
              alkatreszek.filter(alkatresz =>
                alkatresz.nev && alkatresz.nev.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (categoryFilter.length === 0 || categoryFilter.every((category: string) =>
                 alkatresz.kategoriak && alkatresz.kategoriak.toLowerCase().split(';').map(
                  (c: string) => c.trim()).includes(category.toLowerCase())))
              )
            )
          );
        }
      })
    );
  }
}
