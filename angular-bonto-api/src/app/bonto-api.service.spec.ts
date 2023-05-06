import { TestBed } from '@angular/core/testing';

import { BontoApiService } from './bonto-api.service';

describe('BontoApiService', () => {
  let service: BontoApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BontoApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
