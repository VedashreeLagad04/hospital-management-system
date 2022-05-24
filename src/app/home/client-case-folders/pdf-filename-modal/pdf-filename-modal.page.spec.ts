import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PdfFilenameModalPage } from './pdf-filename-modal.page';

describe('PdfFilenameModalPage', () => {
  let component: PdfFilenameModalPage;
  let fixture: ComponentFixture<PdfFilenameModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PdfFilenameModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PdfFilenameModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
