import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, startWith, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private categories: string[] = [];
  private category: string = '';
  private searchTerm: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private categoriesFilter: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private categoryFilter: BehaviorSubject<string> = new BehaviorSubject<string>('');

  setSearchTerm(term: string) {
    this.searchTerm.next(term);
  }

  setCategoriesFilter(categoriesIn: string[]) {
    if (categoriesIn.length === 0) {
      this.categories = []; // Clear the categories
    } else {
      const currentCategories = this.categories || []; // Get the current categories (if any)
      const newCategories = [...currentCategories, ...categoriesIn]; // Concatenate the new categories with the existing ones
      this.categories = newCategories; // Update the categories
    }
    
    this.categoriesFilter.next(this.categories); // Emit the updated categories
  }

  setCategoryFilter(categoriesIn: string) {
    if (categoriesIn.length === 0) {
      this.category = '';
    } else {
      this.category = categoriesIn;
    }
    
    this.categoryFilter.next(this.category); // Emit the updated categories
  }

  getCategoryFilter(): string[] {
    return this.categories;
  }

  getFilteredAlkatreszek(alkatreszList$: Observable<any[]>): Observable<any[]> {
    return combineLatest([this.searchTerm, this.categoriesFilter]).pipe(
      switchMap(([searchTerm, categoriesFilter]) => {
        if (!searchTerm && categoriesFilter.length === 0) {
          return alkatreszList$;
        } else {
          return alkatreszList$.pipe(
            map(alkatreszek =>
              alkatreszek.filter(alkatresz =>
                alkatresz.nev && alkatresz.nev.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (categoriesFilter.length === 0 || categoriesFilter.every((category: string) =>
                 alkatresz.kategoriak && alkatresz.kategoriak.toLowerCase().split(';').map(
                  (c: string) => c.trim()).includes(category.toLowerCase()))
                )
              )
            )
          );
        }
      })
    );
  }

  getCategorizedAlkatreszek(alkatreszList$: Observable<any[]>): Observable<any[]> {
    return combineLatest([this.searchTerm, this.categoryFilter]).pipe(
      switchMap(([searchTerm, categoryFilter]) => {
        const filterValue = categoryFilter ? categoryFilter.toLowerCase() : '';
        if (!searchTerm && !filterValue) {
          return alkatreszList$;
        } else {
          return alkatreszList$.pipe(
            map(alkatreszek =>
              alkatreszek.filter(alkatresz =>
                alkatresz.nev && alkatresz.nev.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (!filterValue || alkatresz.kategoriak && alkatresz.kategoriak.toLowerCase().split(';').map(
                  (c: string) => c.trim()).includes(filterValue)
                )
              )
            )
          );
        }
      })
    );
  }
}
