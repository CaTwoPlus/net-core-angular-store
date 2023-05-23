import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, map, startWith, switchMap } from 'rxjs';
import { BontoApiService } from 'src/app/bonto-api.service';
import { SearchBarComponent } from 'src/app/alkatresz/search/search.component';

@Component({
  selector: 'app-visitor-page',
  templateUrl: './visitor-page.component.html',
  styleUrls: ['./visitor-page.component.css']
})

export class VisitorPageComponent implements OnInit{
  @ViewChild('searchBar') searchBar!: SearchBarComponent;
  title = 'ford';
  kategoriaList$!:Observable<any[]>;
  alkatreszList$!:Observable<any[]>;
  filteredAlkatreszek$!:Observable<any[]>;

  constructor(private service: BontoApiService) {}

  ngOnInit(): void {
    this.kategoriaList$ = this.service.getKategoriaList();
    this.alkatreszList$ = this.service.getAlkatreszList();
  }

  ngAfterViewInit(): void {
    this.filteredAlkatreszek$ = this.searchBar.searchTerm.pipe(
      startWith(''),
      switchMap(term => {
        if (!term) {
          return this.alkatreszList$;
        } else {
          return this.alkatreszList$.pipe(
            map(alkatreszek =>
              alkatreszek.filter(alkatresz =>
                alkatresz.nev.toLowerCase().includes(term.toLowerCase())
              )
            )
          );
        }
      })
    );
  }
}
