import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { BontoApiService } from '../bonto-api.service';
import { SearchService } from './search.service';
import { CategoryPageService } from '../category-page.service';
import { Observable } from 'rxjs';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Router  } from '@angular/router';

@Component({
  selector: 'app-search-bar',
  template: `
  <div class="container" id="searchBarContainer">
    <div class="input-group">
      <input type="text"
      style="z-index: 4"
      class="form-control" 
      [(ngModel)]="searchTermValue"
      name="searchInput" 
      (input)="searchTermValue.length >= 2 ? onSearchInput() : null"
      (typeaheadNoResults)="searchTermValue.length >= 3 ? typeaheadNoResults($event) : 
        (searchTermValue.length < 3 && isSearchFilterApplied ? isSearchFilterApplied = !isSearchFilterApplied : null)"
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
          <button (click)="emitValues()" class="btn btn-secondary" type="submit" style="margin-left: -2px; z-index: 2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </button>
      </ng-container>
      <ng-template #btnDisabled>
        <button (click)="emitValues()" class="btn btn-secondary" type="button" style="margin-left: -2px" [disabled]="invalidInput || searchTermValue.length < 3 ? true : null">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
        </button>
      </ng-template>
      <button class="btn btn-secondary" type="button" style="margin-left: -40px; z-index: 3"
      (click)="deleteSearchTerm()" [ngClass]="{'d-none' : searchTermValue.length === 0 || searchTermValue.length > previousSearchTermValue.length
       || !isSearchFilterApplied}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square-fill" viewBox="0 0 16 16">
          <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708z"/>
        </svg>
      </button>
    </div>
  </div>
  `,
  styleUrls: ['./search.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SearchBarComponent {
  @Input() alkatreszList$!: Observable<any[]>;
  @Input() isVisitorQuery!: boolean;
  @Output() searchTerm = new EventEmitter<string>();
  @Output() isSearchTermInvalid = new EventEmitter<boolean>(false);
  @Output() isSearchTermShort = new EventEmitter<boolean>(false);

  searchTermValue = '';
  showOptions = false;
  options!: any[];
  placeholder = 'Keresés';
  isSearchFilterApplied: boolean = false;
  invalidInput: boolean = false;
  currentSearchTermValue: string = '';
  previousSearchTermValue: string = '';

  constructor(private service: BontoApiService, private categoryService: CategoryPageService, 
    private searchService: SearchService, private router: Router) {}

  emitValues() {
    if (this.searchTermValue.length >= 3) {
      if (this.previousSearchTermValue !== this.currentSearchTermValue
        || this.previousSearchTermValue !== this.searchTermValue) {
        this.isSearchFilterApplied = true;
        if (this.currentSearchTermValue !== this.searchTermValue) {
          this.searchService.isSearchActive = true;
          this.searchService.setSearchTerm(this.searchTermValue.trim());
          this.previousSearchTermValue = this.searchTermValue;
          this.service.searchTerm = this.searchTermValue.trim();
          if (this.service.searchByKeywordResponse) {
            this.setFilterCache();
          }
          if (this.isVisitorQuery) {
            this.router.navigate(['/alkatreszek', { talalatok: this.searchTermValue.trim() }]);
          } else {
            this.searchTerm.emit(this.searchTermValue.trim());
          }
        } else {
          this.searchService.isSearchActive = true;
          this.searchService.setSearchTerm(this.searchTermValue.trim());
          this.previousSearchTermValue = this.currentSearchTermValue;
          if (this.service.searchByKeywordResponse) {
            this.setFilterCache();
          }
          if (this.isVisitorQuery) {
            this.router.navigate(['/alkatreszek', { talalatok: this.currentSearchTermValue.trim() }]);
          } else {
            this.searchTerm.emit(this.currentSearchTermValue.trim());
          }
        }
        this.isSearchTermInvalid.emit(false);
        if (!this.categoryService.getShowCategoryPage()) {
          this.categoryService.setShowCategoryPage(true);
        }
      }
    }
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
    this.searchTermValue = '';
    this.currentSearchTermValue = '';
    this.previousSearchTermValue = '';
    this.isSearchFilterApplied = false;
    this.searchService.isSearchActive = false;
    this.searchService.setSearchTerm('');
    this.searchTerm.emit('');
  }

  deleteSearchTerm() {
    if (!this.isVisitorQuery) {
      this.resetSearch();
    } else {
      this.searchTermValue = '';
      this.currentSearchTermValue = '';
      this.isSearchFilterApplied = false;
    }
  }

  onTypeaheadSelect(event: TypeaheadMatch) {
    this.invalidInput = false;
  }

  typeaheadNoResults(event: boolean) {
    if (event && this.searchTermValue.length < 3 && this.searchTermValue.length >= this.previousSearchTermValue.length) {
      this.invalidInput = event;
      this.isSearchTermShort.emit(true);
    } else if (event && this.searchTermValue.length >= 3) {
      this.invalidInput = event;
      this.isSearchTermInvalid.emit(true);
    } else if (this.invalidInput && !event && this.searchTermValue.length >= 3) {
      this.invalidInput = false;
    }
  }

  setFilterCache() {
    const response = this.service.searchByKeywordResponse;
    const newETag = response?.headers.get('ETag') || '';
    const keyword = this.searchTermValue.trim();
    this.service.cachedFilteredAlkatreszek[keyword] = { data: response?.body as any[], eTag: newETag };
    localStorage.setItem(`cachedFilteredAlkatreszek=${keyword}`, JSON.stringify(this.service.cachedFilteredAlkatreszek[keyword]));
  }

  /*setCombinedResponseCache() {
    const response = this.service.searchByKeywordAndCategoriesResponse;
    const keyword = this.searchTermValue.trim();
    const categories = this.service.categories;
    const keywordETag = response[0]?.headers.get('Etag') || '';
    const categoriesETag = response[1]?.headers.get('Etag') || '';
    const combinedData = this.service.searchByKeywordAndCategoriesData;
    this.service.cachedFilteredCategorizedAlkatreszek[keyword][''] = { data: [], keywordETag: keywordETag, categoriesETag: '' };
    if (this.service.cachedFilteredCategorizedAlkatreszek[keyword]) {
      this.service.cachedFilteredCategorizedAlkatreszek[keyword][categories] = { data: combinedData, 
        keywordETag: keywordETag, categoriesETag: categoriesETag};
      localStorage.setItem(`cachedFilteredCategorizedAlkatreszek=${keyword}_${categories}`, JSON.stringify(
        this.service.cachedFilteredCategorizedAlkatreszek[keyword][categories]));
    }
  }*/
}