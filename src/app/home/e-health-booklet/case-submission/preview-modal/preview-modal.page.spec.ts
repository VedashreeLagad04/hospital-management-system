import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PreviewModalPage } from './preview-modal.page';

describe('SignatureModalPage', () => {
  let component: PreviewModalPage;
  let fixture: ComponentFixture<PreviewModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewModalPage ],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PreviewModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
