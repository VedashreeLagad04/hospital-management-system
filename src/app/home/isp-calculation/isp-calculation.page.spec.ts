import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IspCalculationPage } from './isp-calculation.page';

describe('IspCalculationPage', () => {
  let component: IspCalculationPage;
  let fixture: ComponentFixture<IspCalculationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IspCalculationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IspCalculationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
