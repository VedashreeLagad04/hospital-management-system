import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PreAdmissionChecklistPage } from './pre-admission-checklist.page';

describe('PreAdmissionChecklistPage', () => {
  let component: PreAdmissionChecklistPage;
  let fixture: ComponentFixture<PreAdmissionChecklistPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreAdmissionChecklistPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PreAdmissionChecklistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
