import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditAlkatreszComponent } from './add-edit-alkatresz.component';

describe('AddEditAlkatreszComponent', () => {
  let component: AddEditAlkatreszComponent;
  let fixture: ComponentFixture<AddEditAlkatreszComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditAlkatreszComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditAlkatreszComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
