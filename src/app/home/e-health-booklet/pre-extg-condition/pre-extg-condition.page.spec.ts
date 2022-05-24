import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PreExtgConditionPage } from './pre-extg-condition.page';

describe('PreExtgConditionPage', () => {
  let component: PreExtgConditionPage;
  let fixture: ComponentFixture<PreExtgConditionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreExtgConditionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PreExtgConditionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
