import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleDescriptionComponent } from './title-description.component';

describe('TitleDescriptionComponent', () => {
  let component: TitleDescriptionComponent;
  let fixture: ComponentFixture<TitleDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitleDescriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TitleDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
