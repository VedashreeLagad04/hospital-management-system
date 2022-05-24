import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClientInformationPage } from './client-information.page';

describe('ClientInformationPage', () => {
  let component: ClientInformationPage;
  let fixture: ComponentFixture<ClientInformationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientInformationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientInformationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
