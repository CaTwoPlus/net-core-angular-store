import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  alkatreszList$!: Observable<any[]>;

  search(searchTerm: string): Observable<string[]> {
    const searchTermValue = searchTerm.toLowerCase();
    return this.alkatreszList$.pipe(
      map((list) =>
        list
          .filter((option) =>
            option.nev.toLowerCase().includes(searchTermValue)
          )
          .map((option) => option.nev)
      )
    );
  }
}
