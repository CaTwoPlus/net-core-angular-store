import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SearchService } from 'src/app/search.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  template: `
  <div class="container">
    <div class="input-group">
      <input
       class="form-control" 
       style="width: 460px;" 
       [(ngModel)]="searchTermValue" 
       (input)="onSearchInput(searchTermValue)"
       [typeahead]="options" 
       [isAnimated]="true"
       [typeaheadMinLength]="1"
       [typeaheadScrollable]="true"
       [typeaheadOptionsInScrollableView]="20"
       [placeholder]="placeholder" />
       <button class="btn btn-secondary" type="button">
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
  searchTermValue = '';
  showOptions = false;
  options!: any[];
  placeholder = 'Keresés';
  activateFilteredAlkatreszekList:boolean = false;

  constructor(private searchService: SearchService) {}

  onSearchInput(searchTerm: string) {
    this.searchTermValue = searchTerm.toLowerCase();
    if (this.searchTermValue) {
      this.showOptions = true;
      this.alkatreszList$.subscribe((list) => {
        this.options = list
          .filter((option) =>
            option.nev.toLowerCase().includes(this.searchTermValue.toLowerCase()))
          .map((option) => option.nev);
      });
    }
    else {
      this.showOptions = false;
      this.options = [];
    }
    this.searchService.setSearchTerm(this.searchTermValue);
  }
}