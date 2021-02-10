import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrationAngularComponent } from './integration-angular.component';

describe('IntegrationAngularComponent', () => {
  let component: IntegrationAngularComponent;
  let fixture: ComponentFixture<IntegrationAngularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntegrationAngularComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationAngularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
