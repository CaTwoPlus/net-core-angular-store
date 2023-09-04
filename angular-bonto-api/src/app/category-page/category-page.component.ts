import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryPageService } from '../category-page.service';

@Component({
  selector: 'app-category-page',
  templateUrl: './category-page.component.html',
  styleUrls: ['./category-page.component.css'],
})
export class CategoryPageComponent implements OnInit {
  @Input() alkatreszList: any[] = [];

  constructor(private categoryService: CategoryPageService, 
    private cdr: ChangeDetectorRef ) { }

  showCategoryPage$!: Observable<any>;

  async ngOnInit() {
    this.showCategoryPage$ = this.categoryService.showCategoryPage$;
  }

  trackByItemId(index: number, item: any): string {
    return item.id;
  }

  triggerChangeDetection() {
    this.cdr.detectChanges();
  }
}
