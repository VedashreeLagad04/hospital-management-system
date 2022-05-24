import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClientRegistrationTermsModalPage } from './client-registration-terms-modal.page';

describe('ClientRegistrationTermsModalPage', () => {
  let component: ClientRegistrationTermsModalPage;
  let fixture: ComponentFixture<ClientRegistrationTermsModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientRegistrationTermsModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientRegistrationTermsModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
