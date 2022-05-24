import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ResubmissionModalPage } from './resubmission-modal.page';

describe('ResubmissionModalPage', () => {
  let component: ResubmissionModalPage;
  let fixture: ComponentFixture<ResubmissionModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResubmissionModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ResubmissionModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
