import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private categories: string[] = [];
  private category: string = '';
  private categoriesFilter: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private categoryFilter: BehaviorSubject<string> = new BehaviorSubject<string>('');

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
}
