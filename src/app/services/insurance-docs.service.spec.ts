import { TestBed } from '@angular/core/testing';

import { InsuranceDocsService } from './insurance-docs.service';

describe('InsuranceDocsService', () => {
  let service: InsuranceDocsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InsuranceDocsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
