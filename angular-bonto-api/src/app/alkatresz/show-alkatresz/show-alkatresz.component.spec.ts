import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowAlkatreszComponent } from './show-alkatresz.component';

describe('ShowAlkatreszComponent', () => {
  let component: ShowAlkatreszComponent;
  let fixture: ComponentFixture<ShowAlkatreszComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowAlkatreszComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowAlkatreszComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
