import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UploadFormModalPage } from './upload-form-modal.page';

describe('UploadFormModalPage', () => {
  let component: UploadFormModalPage;
  let fixture: ComponentFixture<UploadFormModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadFormModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadFormModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
