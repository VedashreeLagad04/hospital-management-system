import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CaseManagementPage } from './case-management.page';

describe('CaseManagementPage', () => {
  let component: CaseManagementPage;
  let fixture: ComponentFixture<CaseManagementPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaseManagementPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CaseManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
