import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmojisReaktionComponent } from './emojis-reaktion.component';

describe('EmojisReaktionComponent', () => {
  let component: EmojisReaktionComponent;
  let fixture: ComponentFixture<EmojisReaktionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmojisReaktionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmojisReaktionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
