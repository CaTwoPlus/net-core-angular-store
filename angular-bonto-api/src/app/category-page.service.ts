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
  category: string = '';

  getCategory(): string {
    return this.category;
  }

  setCategory(categoryIn: string) {
    this.category = categoryIn;
    this.currentCategorySubject.next(categoryIn);
  }

  setShowCategoryPage(showCategoryPage: boolean) {
    this.showCategoryPageSubject.next(showCategoryPage);
  }

  constructor() { }
}
