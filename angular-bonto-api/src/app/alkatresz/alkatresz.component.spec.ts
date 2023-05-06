import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlkatreszComponent } from './alkatresz.component';

describe('AlkatreszComponent', () => {
  let component: AlkatreszComponent;
  let fixture: ComponentFixture<AlkatreszComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlkatreszComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlkatreszComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
