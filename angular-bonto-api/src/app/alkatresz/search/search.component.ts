import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  template: `
  <div class="container">
    <div class="input-wrapper">
      <input class="form-control" style="width: 480px" [(ngModel)]="searchTermValue" (input)="onSearchInput(searchTermValue)" [placeholder]="placeholder" />
      <div *ngIf="showOptions && options?.length">
        <div *ngFor="let option of options">
          {{ option }}
        </div>
      </div>
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

  onSearchInput(searchTerm: string) {
    this.searchTermValue = searchTerm.toLowerCase();
    if (this.searchTermValue) {
      this.showOptions = true;
      this.alkatreszList$.subscribe((list) => {
        this.options = list
          .filter((option) =>
            option.nev.toLowerCase().includes(this.searchTermValue.toLowerCase())
          )
          .map((option) => option.nev);
      });
    }
    else {
      this.showOptions = false;
      this.options = [];
    }
    this.searchTerm.emit(this.searchTermValue);
  }
}