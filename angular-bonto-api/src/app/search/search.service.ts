import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  isSearchActive: boolean = false;
  searchTermValue: string = '';
   private searchTermSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
   searchTerm$ = this.searchTermSubject.asObservable();

   setSearchTerm(searchTerm: string) {
    this.searchTermValue = searchTerm;
    this.searchTermSubject.next(searchTerm);
  }

  getSearchTerm(): string {
    return this.searchTermValue;
  }

  getSearchState(): boolean {
    return this.isSearchActive;
  }
}
