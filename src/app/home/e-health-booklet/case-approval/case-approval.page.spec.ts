import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CaseApprovalPage } from './case-approval.page';

describe('CaseApprovalPage', () => {
  let component: CaseApprovalPage;
  let fixture: ComponentFixture<CaseApprovalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaseApprovalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CaseApprovalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
