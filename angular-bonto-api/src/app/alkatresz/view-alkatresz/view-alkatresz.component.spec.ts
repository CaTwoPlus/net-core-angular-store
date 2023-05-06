import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAlkatreszComponent } from './view-alkatresz.component';

describe('ViewAlkatreszComponent', () => {
  let component: ViewAlkatreszComponent;
  let fixture: ComponentFixture<ViewAlkatreszComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAlkatreszComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAlkatreszComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
