import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClientCaseAppointmentAddPage } from './client-case-appointment-add.page';

describe('ClientCaseAppointmentAddPage', () => {
  let component: ClientCaseAppointmentAddPage;
  let fixture: ComponentFixture<ClientCaseAppointmentAddPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientCaseAppointmentAddPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientCaseAppointmentAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
