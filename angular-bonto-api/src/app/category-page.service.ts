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
  previousCategoryFilter: string = '';
  isCategoryFilterApplied: boolean = false;

  getCategory(): string {
    return this.category;
  }

  setCategory(categoryIn: string) {
    this.category = categoryIn;
    this.currentCategorySubject.next(categoryIn);
  }

  setCategoryFilter(categoryIn: string) {
    if (this.isCategoryFilterApplied) {
      const currentValue = this.currentCategorySubject.getValue().trim();
      if(!currentValue.includes(categoryIn)) {
        const updatedValue = [currentValue.replace(this.previousCategoryFilter, categoryIn)];
        this.currentCategorySubject.next(updatedValue.join(";"));
        this.previousCategoryFilter = categoryIn;
      }
    } else {
      const currentValue = this.currentCategorySubject.getValue().trim();
      if(!currentValue.includes(categoryIn)) {
        const updatedValue = [currentValue, categoryIn];
        this.currentCategorySubject.next(updatedValue.join(";"));
        this.previousCategoryFilter = categoryIn;
        this.isCategoryFilterApplied = true;
      }
    }
  }

  resetCategories() {
    this.currentCategorySubject.next(this.category);
    this.isCategoryFilterApplied = false;
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

  getShowCategoryPage() {
    return this.showCategoryPageSubject.value;
  }

  constructor() { }
}
