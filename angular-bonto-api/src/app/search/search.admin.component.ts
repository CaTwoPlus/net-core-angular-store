import { Component, ViewEncapsulation } from '@angular/core';
import { BontoApiService } from '../bonto-api.service';
import { SearchService } from './search.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';

@Component({
  selector: 'app-admin-search-bar',
  template: `
  <div class="container" id="searchBarContainerAdmin">
    <div class="input-group">
      <input type="text"
      style="z-index: 4"
      class="form-control" 
      [(ngModel)]="searchTermValue"
      name="searchInput" 
      (input)="searchTermValue.length >= 2 ? onSearchInput() : null"
      (typeaheadNoResults)="searchTermValue.length >= 3 ? typeaheadNoResults($event) : null"
      (typeaheadOnSelect)="onTypeaheadSelect($event)"
      [typeahead]="options"
      [typeaheadWaitMs]="500"
      [isAnimated]="true"
      [typeaheadMinLength]="3"
      [typeaheadScrollable]="true"
      [typeaheadOptionsInScrollableView]="19"
      [placeholder]="placeholder" 
      [class.is-invalid]="invalidInput"/>
      <ng-container *ngIf="!invalidInput && searchTermValue.length >= 3; else btnDisabled">
          <button (click)="checkValueEmission()" class="btn btn-secondary" type="submit" style="margin-left: -2px; z-index: 2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </button>
      </ng-container>
      <ng-template #btnDisabled>
        <button (click)="checkValueEmission()" class="btn btn-secondary" type="button" style="margin-left: -2px" [disabled]="invalidInput || searchTermValue.length < 3 ? true : null">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
        </button>
      </ng-template>
      <button class="btn btn-secondary" type="button" style="margin-left: -40px; z-index: 4"
      (click)="resetSearch()" [ngClass]="{'d-none' : isSearchFilterApplied === false}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square-fill" viewBox="0 0 16 16">
          <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708z"/>
        </svg>
      </button>
    </div>
  </div>
  `,
  styleUrls: ['./search.admin.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AdminSearchBarComponent {

  searchTermValue = '';
  showOptions = false;
  options!: any[];
  placeholder = 'Keresés';
  isSearchFilterApplied: boolean = false;
  invalidInput: boolean = false;
  currentSearchTermValue: string = '';
  previousSearchTermValue: string = '';

  constructor(private service: BontoApiService, private searchService: SearchService) {}

  checkValueEmission() {
    if (this.searchTermValue.length >= 3) {
      // Only set the same search term as the previous one if category search was used after the previous keyword search
      if (this.previousSearchTermValue !== this.currentSearchTermValue
        || this.previousSearchTermValue !== this.searchTermValue) {
        if (this.currentSearchTermValue !== this.searchTermValue) {
          this.previousSearchTermValue = this.searchTermValue;
          this.emitValues();
        } else {
          this.previousSearchTermValue = this.currentSearchTermValue;
          this.emitValues();
        }
      }
    }
  }

  emitValues() {
    this.searchService.setSearchTerm(this.searchTermValue.trim(), true);
    this.isSearchFilterApplied = true;
  }

  onSearchInput() {
    const enteredValue = this.searchTermValue.toLowerCase();
    // Save the current value before it's modified
    const previousValue = this.currentSearchTermValue;
    this.service.searchAlkatreszByKeyword(enteredValue, '').subscribe((list) => {
      this.options = list
        .filter((option) =>
          option.nev.toLowerCase().includes(enteredValue))
        .map((option) => option.nev);
    });
    if (this.currentSearchTermValue !== enteredValue && enteredValue.length >= 3) {
      this.currentSearchTermValue = enteredValue;
    } else if (this.currentSearchTermValue === enteredValue && enteredValue.length >= 3) {
      // Reset the entered value to the previous one
      this.searchTermValue = previousValue;
    }
  }  
  
  resetSearch() {
    // Reset search state through the service, erase search bar content, reset search logic 
    this.searchTermValue = '';
    this.currentSearchTermValue = '';
    this.previousSearchTermValue = '';
    this.isSearchFilterApplied = false;
    this.searchService.setSearchTerm('', true)
  }

  onTypeaheadSelect(event: TypeaheadMatch) {
    this.invalidInput = false;
  }

  typeaheadNoResults(event: boolean) {
    if (event && this.searchTermValue.length < 3 && this.searchTermValue.length >= this.previousSearchTermValue.length) {
      this.invalidInput = event;
    } else if (event && this.searchTermValue.length >= 3) {
      this.invalidInput = event;
    } else if (this.invalidInput && !event && this.searchTermValue.length >= 3) {
      this.invalidInput = false;
    }
  }
}