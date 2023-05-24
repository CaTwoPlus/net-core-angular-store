import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoryPageService {
  category: string = '';

  getCategory(): string {
    return this.category;
  }

  setCategory(categoryIn: string) {
    this.category = categoryIn;
  }

  constructor() { }
}
