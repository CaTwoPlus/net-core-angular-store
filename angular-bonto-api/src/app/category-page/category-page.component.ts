import { Component, Input, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BontoApiService } from "src/app/bonto-api.service";
import { SearchBarComponent } from 'src/app/search/search.component';
import { CategoryPageService } from '../category-page.service';

@Component({
  selector: 'app-category-page',
  templateUrl: './category-page.component.html',
  styleUrls: ['./category-page.component.css'],
})
export class CategoryPageComponent implements OnInit {
  @Input() alkatreszList$!: Observable<any[]>;
  @ViewChild('searchBar', { static: false }) searchBar!: SearchBarComponent;

  constructor(private service: BontoApiService, private categoryService: CategoryPageService, 
    private cdr: ChangeDetectorRef ) { }

  kategoriaList$!: Observable<any[]>;
  autoTipusList$!: Observable<any[]>;
  showCategoryPage$!: Observable<any>;

  isFilterActive: boolean = false;

  modalTitle: string = '';
  kategoriakLabel: string = '';
  autoTipusokInput: string[] = [];

  categoryFilter: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  async ngOnInit() {
    this.kategoriaList$ = this.service.getKategoriaList();
    this.autoTipusList$ = this.service.getAutoTipusList();
    this.showCategoryPage$ = this.categoryService.showCategoryPage$;
  }

  trackByItemId(index: number, item: any): string {
    return item.id;
  }

  triggerChangeDetection() {
    this.cdr.detectChanges();
  }
}
