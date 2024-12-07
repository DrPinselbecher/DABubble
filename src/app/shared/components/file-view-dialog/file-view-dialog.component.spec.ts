import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileViewDialogComponent } from './file-view-dialog.component';

describe('FileViewDialogComponent', () => {
  let component: FileViewDialogComponent;
  let fixture: ComponentFixture<FileViewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileViewDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileViewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
