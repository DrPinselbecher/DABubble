import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmojiBoardComponent } from './emoji-board.component';

describe('EmojiBoardComponent', () => {
  let component: EmojiBoardComponent;
  let fixture: ComponentFixture<EmojiBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmojiBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmojiBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
