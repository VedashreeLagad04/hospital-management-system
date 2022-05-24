import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ActivePoliciesPage } from './active-policies.page';

describe('ActivePoliciesPage', () => {
  let component: ActivePoliciesPage;
  let fixture: ComponentFixture<ActivePoliciesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivePoliciesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivePoliciesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
