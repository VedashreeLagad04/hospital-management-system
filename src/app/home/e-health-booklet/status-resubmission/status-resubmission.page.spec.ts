import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StatusResubmissionPage } from './status-resubmission.page';

describe('StatusResubmissionPage', () => {
  let component: StatusResubmissionPage;
  let fixture: ComponentFixture<StatusResubmissionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusResubmissionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusResubmissionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
