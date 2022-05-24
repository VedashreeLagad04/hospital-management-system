import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AssignedConsultantsModalPage } from './assigned-consultants-modal.page';

describe('AssignedConsultantsModalPage', () => {
  let component: AssignedConsultantsModalPage;
  let fixture: ComponentFixture<AssignedConsultantsModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignedConsultantsModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AssignedConsultantsModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
