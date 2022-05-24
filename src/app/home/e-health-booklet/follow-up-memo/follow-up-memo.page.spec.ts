import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FollowUpMemoPage } from './follow-up-memo.page';

describe('CaseApprovalPage', () => {
  let component: FollowUpMemoPage;
  let fixture: ComponentFixture<FollowUpMemoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FollowUpMemoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FollowUpMemoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
