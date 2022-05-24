import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MedicalConditionPage } from './medical-condition.page';

describe('MedicalConditionPage', () => {
  let component: MedicalConditionPage;
  let fixture: ComponentFixture<MedicalConditionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MedicalConditionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MedicalConditionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
