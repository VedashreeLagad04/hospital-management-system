import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClientCaseAppointmentsPage } from './client-case-appointments.page';

describe('ClientCaseAppointmentsPage', () => {
  let component: ClientCaseAppointmentsPage;
  let fixture: ComponentFixture<ClientCaseAppointmentsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientCaseAppointmentsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientCaseAppointmentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
