import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  isSearchActive: boolean = false;
  searchTermValue: string = '';
  searchTermValueAdmin: string = '';
  private searchTermSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSubject.asObservable();
  private searchTermSubjectAdmin: BehaviorSubject<string> = new BehaviorSubject<string>('');
  searchTermAdmin$ = this.searchTermSubjectAdmin.asObservable();

  setSearchTerm(searchTerm: string, admin = false) {
    if (admin) {
      this.searchTermValueAdmin = searchTerm;
      this.searchTermSubjectAdmin.next(searchTerm);
    } else {
      this.searchTermValue = searchTerm;
      this.searchTermSubject.next(searchTerm);
    }
  }

  getSearchTerm(): string {
    return this.searchTermValue;
  }

  getSearchState(): boolean {
    return this.isSearchActive;
  }

  setSearchState(set: boolean) {
    if (set) {
      this.isSearchActive = true;
    } else {
      // Reset
      this.isSearchActive = false;
      this.searchTermValue = '';
      this.searchTermSubject.next('');
    }
  }
}
