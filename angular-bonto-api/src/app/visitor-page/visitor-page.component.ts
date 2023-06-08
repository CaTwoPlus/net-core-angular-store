import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, map, startWith, switchMap } from 'rxjs';
import { BontoApiService } from 'src/app/bonto-api.service';
import { CategoryPageService } from '../category-page.service';
import { SearchBarComponent } from 'src/app/search/search.component';

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
  showCategoryPage$!:Observable<any>;

  constructor(private service: BontoApiService, public categoryPageService: CategoryPageService) {}

  ngOnInit(): void {
    this.kategoriaList$ = this.service.getKategoriaList();
    this.alkatreszList$ = this.service.getAlkatreszList();
    this.showCategoryPage$ = this.categoryPageService.showCategoryPage$;
  }

  setCategoryPage(category: string) {
    if (category !== this.categoryPageService.getCategory()) {
      this.categoryPageService.setCategory(category);
      this.categoryPageService.setShowCategoryPage(true);
    }
  }
}
