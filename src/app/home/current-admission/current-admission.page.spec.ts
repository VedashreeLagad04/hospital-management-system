import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CurrentAdmissionPage } from './current-admission.page';

describe('CurrentAdmissionPage', () => {
  let component: CurrentAdmissionPage;
  let fixture: ComponentFixture<CurrentAdmissionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentAdmissionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentAdmissionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
