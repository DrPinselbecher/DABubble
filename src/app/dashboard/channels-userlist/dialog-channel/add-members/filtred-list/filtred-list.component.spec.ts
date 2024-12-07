import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltredListComponent } from './filtred-list.component';

describe('FiltredListComponent', () => {
  let component: FiltredListComponent;
  let fixture: ComponentFixture<FiltredListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltredListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltredListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
