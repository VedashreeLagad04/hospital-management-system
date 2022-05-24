import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SignatureModalPage } from './signature-modal.page';

describe('SignatureModalPage', () => {
  let component: SignatureModalPage;
  let fixture: ComponentFixture<SignatureModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignatureModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SignatureModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
