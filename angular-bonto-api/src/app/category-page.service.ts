import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryPageService {
  private showCategoryPageSubject = new BehaviorSubject<boolean>(false);
  showCategoryPage$ = this.showCategoryPageSubject.asObservable();
  private currentCategorySubject = new BehaviorSubject<string>('');
  currentCategory$ = this.currentCategorySubject.asObservable();
  private orderBySubject = new BehaviorSubject<string>('');
  orderBy$ = this.orderBySubject.asObservable();
  category: string = '';

  getCategory(): string {
    return this.category;
  }

  setCategory(categoryIn: string) {
    this.category = categoryIn;
    this.currentCategorySubject.next(categoryIn);
  }

  setCategories(categoryIn: BehaviorSubject<string[]>) {
    categoryIn.subscribe((categories: string[]) => {
        const currentValue = this.currentCategorySubject.getValue().trim();
        categories.map(category => {
          if(!currentValue.includes(category)) {
            const updatedValue = [currentValue, ...categories];
            this.currentCategorySubject.next(updatedValue.join(";"));
          }
        })
    });
  }

  resetCategories() {
    this.currentCategorySubject.next(this.category);
  }

  resetOrderFilter() {
    this.orderBySubject.next('');
  }

  setOrderByParam(orderBy: string) {
    this.orderBySubject.next(orderBy);
  }

  setShowCategoryPage(showCategoryPage: boolean) {
    this.showCategoryPageSubject.next(showCategoryPage);
  }

  constructor() { }
}
