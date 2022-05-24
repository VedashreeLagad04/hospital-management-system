import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CaseSubmissionPage } from './case-submission.page';

describe('CaseSubmissionPage', () => {
  let component: CaseSubmissionPage;
  let fixture: ComponentFixture<CaseSubmissionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaseSubmissionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CaseSubmissionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
