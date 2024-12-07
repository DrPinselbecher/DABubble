import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFilteredListComponent } from './user-filtered-list.component';

describe('FiltredListComponent', () => {
  let component: UserFilteredListComponent;
  let fixture: ComponentFixture<UserFilteredListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFilteredListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UserFilteredListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
