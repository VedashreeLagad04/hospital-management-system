import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ApprovalPreviewPage } from './approval-preview.page';

describe('ApprovalPreviewPage', () => {
  let component: ApprovalPreviewPage;
  let fixture: ComponentFixture<ApprovalPreviewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApprovalPreviewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ApprovalPreviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
