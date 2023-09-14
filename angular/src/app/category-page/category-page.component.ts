import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryPageService } from '../category-page.service';
import { StateChange } from 'ng-lazyload-image';

@Component({
  selector: 'app-category-page',
  templateUrl: './category-page.component.html',
  styleUrls: ['./category-page.component.css'],
})
export class CategoryPageComponent implements OnInit {
  @Input() alkatreszList: any[] = [];
  imageLoaded: boolean = false;

  constructor(private categoryService: CategoryPageService, 
    private cdr: ChangeDetectorRef ) { }

  showCategoryPage$!: Observable<any>;

  async ngOnInit() {
    this.showCategoryPage$ = this.categoryService.showCategoryPage$;
  }

  trackByItemId(index: number, item: any): string {
    return item.id;
  }

  triggerChangeDetection(event: StateChange) {
    switch (event.reason) {
      case 'loading-succeeded':
        this.imageLoaded = true;
        this.cdr.detectChanges();
    }
  }
}
