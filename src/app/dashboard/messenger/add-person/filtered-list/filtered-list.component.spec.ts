import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilteredListComponent } from './filtered-list.component';

describe('FilteredListComponent', () => {
  let component: FilteredListComponent;
  let fixture: ComponentFixture<FilteredListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilteredListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilteredListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
