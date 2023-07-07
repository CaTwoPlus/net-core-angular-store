import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BontoApiService } from '../bonto-api.service';
import { CategoryPageService } from '../category-page.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  template: `
  <div class="container">
    <div class="input-group">
      <input type="text"
      class="form-control" 
      [(ngModel)]="searchTermValue"
      name="searchInput" 
      (input)="onSearchInput()"
      [typeahead]="options"
      [isAnimated]="true"
      [typeaheadMinLength]="3"
      [typeaheadScrollable]="true"
      [typeaheadOptionsInScrollableView]="20"
      [placeholder]="placeholder" 
      [class.is-invalid]="invalidInput"/>
      <button *ngIf="isSearchFilterApplied" class="btn btn-secondary" type="button" (click)="deleteSearchTerm()"
      data-toggle="tooltip" data-placement="bottom" title="Törlés és visszatérés a kezdőlapra">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square-fill" viewBox="0 0 16 16">
          <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708z"/>
        </svg>
      </button>
      <button *ngIf="!isSearchFilterApplied" (click)="emitValues()" class="btn btn-secondary" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
      </button>
    </div>
  </div>
  `,
  styleUrls: ['./search.component.css']
})
export class SearchBarComponent {
  @Input() alkatreszList$!: Observable<any[]>;
  @Output() searchTerm = new EventEmitter<string>();
  @Output() isSearchTermInvalid = new EventEmitter<boolean>(false);
  searchTermValue = '';
  showOptions = false;
  options!: any[];
  placeholder = 'Keresés';
  isSearchFilterApplied: boolean = false;
  invalidInput: boolean = false;
  currentSearchTermValue: string = '';
  previousSearchTermValue: string = '';

  constructor(private service: BontoApiService, private categoryService: CategoryPageService) {}

  emitValues() {
    if (this.searchTermValue.length >= 3) {
      if (this.previousSearchTermValue !== this.currentSearchTermValue) {
        this.isSearchFilterApplied = true;
        this.invalidInput = false;
        this.searchTerm.emit(this.currentSearchTermValue);
        this.isSearchTermInvalid.emit(false);
        if (!this.categoryService.getShowCategoryPage()) {
          this.categoryService.setShowCategoryPage(true);
        }
        this.previousSearchTermValue = this.currentSearchTermValue;
      }
    } else {
      this.invalidInput = true;
      this.isSearchTermInvalid.emit(true);
    }
  }

  onSearchInput() {
    if (this.searchTermValue.length >= 2) {
      const enteredValue = this.searchTermValue.toLowerCase();
      this.showOptions = true;
      this.service.searchAlkatreszByFilter(enteredValue, '').subscribe((list) => {
        this.options = list
          .filter((option) =>
            option.nev.toLowerCase().includes(enteredValue))
          .map((option) => option.nev);
      });
      if (this.currentSearchTermValue !== enteredValue && enteredValue.length >= 3) {
        this.currentSearchTermValue = enteredValue;
      } else if (this.currentSearchTermValue === enteredValue && enteredValue.length >= 3) {
        // Reset the entered value to the previous one
        this.searchTermValue = this.previousSearchTermValue;
      }
    } else {
      this.showOptions = false;
      this.options = [];
      this.searchTermValue = '';
      this.currentSearchTermValue = '';
      this.isSearchFilterApplied = false;
    }
  }
  
  resetSearch() {
    this.searchTermValue = '';
    this.currentSearchTermValue = '';
    this.previousSearchTermValue = '';
    this.isSearchFilterApplied = false;
    this.searchTerm.emit('');
  }

  deleteSearchTerm() {
    this.searchTermValue = '';
    this.currentSearchTermValue = '';
    this.previousSearchTermValue = '';
    this.isSearchFilterApplied = false;
    this.categoryService.setShowCategoryPage(false);
  }
}