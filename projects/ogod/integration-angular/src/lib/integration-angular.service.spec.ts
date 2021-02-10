import { TestBed } from '@angular/core/testing';

import { IntegrationAngularService } from './integration-angular.service';

describe('IntegrationAngularService', () => {
  let service: IntegrationAngularService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntegrationAngularService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
