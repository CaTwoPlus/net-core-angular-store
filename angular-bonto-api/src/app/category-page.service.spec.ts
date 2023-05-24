import { TestBed } from '@angular/core/testing';

import { CategoryPageService } from './category-page.service';

describe('CategoryPageService', () => {
  let service: CategoryPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
