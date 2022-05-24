import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IspCalculatorPage } from './isp-calculator.page';

describe('IspCalculatorPage', () => {
  let component: IspCalculatorPage;
  let fixture: ComponentFixture<IspCalculatorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IspCalculatorPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IspCalculatorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
