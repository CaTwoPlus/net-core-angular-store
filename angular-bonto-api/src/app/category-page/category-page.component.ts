import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { BontoApiService } from "src/app/bonto-api.service";
import { SearchBarComponent } from 'src/app/search/search.component';
import { CategoryPageService } from '../category-page.service';

@Component({
  selector: 'app-category-page',
  templateUrl: './category-page.component.html',
  styleUrls: ['./category-page.component.css']
})
export class CategoryPageComponent implements OnInit {
  @Input() alkatreszList$!: Observable<any[]>;
  @ViewChild('searchBar', { static: false }) searchBar!: SearchBarComponent;

  constructor(private service: BontoApiService, private categoryService: CategoryPageService) { }

  kategoriaList$!: Observable<any[]>;
  autoTipusList$!: Observable<any[]>;
  showCategoryPage$!: Observable<any>;

  isFilterActive: boolean = false;

  modalTitle: string = '';
  kategoriakLabel: string = '';
  autoTipusok: string[] = [];

  categoryFilter: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  async ngOnInit() {
    this.kategoriaList$ = this.service.getKategoriaList();
    this.autoTipusList$ = this.service.getAutoTipusList();
    this.showCategoryPage$ = this.categoryService.showCategoryPage$;
  }

  filterByYear() {
    let isAutoTipusok = this.autoTipusok.length > 0;
    /*if (isAutoTipusok) {
      const autoTipusokFormatted = this.autoTipusok.map((value: string) => value.trim().replace(/\s+/g, ' '));
      const newValues = autoTipusokFormatted.filter((value: string) => !currentFilter.includes(value));
      this.searchService.setCategoryFilter([...currentFilter, ...newValues]);
      this.kategoriakLabel = this.kategoriakLabel.concat(currentFilter.join(";"),
       isKategoriak ? ";" : "", newValues.join(";"));
      this.autoTipusok = [];
      this.isFilterActive = true;
    }*/

    var closeModalBtn = document.getElementById('filter-alkatresz-modal-close');
    if (closeModalBtn) {
      closeModalBtn.click();
    }
  }

  trackByItemId(index: number, item: any): string {
    return item.id; // Replace 'id' with the unique identifier property of your item
  }
}
