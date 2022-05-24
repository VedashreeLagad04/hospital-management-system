import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClaimsManagementPage } from './claims-management.page';

describe('ClaimsManagementPage', () => {
  let component: ClaimsManagementPage;
  let fixture: ComponentFixture<ClaimsManagementPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimsManagementPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimsManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
