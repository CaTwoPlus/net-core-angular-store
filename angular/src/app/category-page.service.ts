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
  private currentYearSubject = new BehaviorSubject<string>('');
  currentYear$ = this.currentYearSubject.asObservable();
  private orderBySubject = new BehaviorSubject<string>('');
  orderBy$ = this.orderBySubject.asObservable();
  category: string = '';
  yearFilter: string = ''
  previousCategory: string = '';
  previousYearFilter: string = '';
  isYearFilterApplied: boolean = false;

  getCategory(): string {
    return this.category;
  }

  setCategory(categoryIn: string) {
    this.previousCategory = this.category;
    this.category = categoryIn;
    this.currentCategorySubject.next(categoryIn);
  }

  getYearFilter(): string {
    return this.currentYearSubject.getValue().trim();
  }

  setYearFilter(yearFilter: string) {
    if (this.yearFilter !== '') {
      this.previousYearFilter = this.yearFilter;
    }
    this.yearFilter = yearFilter;
    this.currentYearSubject.next(yearFilter);
    this.isYearFilterApplied = true;
  }

  resetYearFilter() {
    this.yearFilter = '';
    this.currentYearSubject.next('');
    this.isYearFilterApplied = false;
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
}
