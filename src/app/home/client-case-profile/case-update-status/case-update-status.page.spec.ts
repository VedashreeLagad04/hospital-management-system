import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CaseUpdateStatusPage } from './case-update-status.page';

describe('CaseUpdateStatusPage', () => {
  let component: CaseUpdateStatusPage;
  let fixture: ComponentFixture<CaseUpdateStatusPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaseUpdateStatusPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CaseUpdateStatusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
