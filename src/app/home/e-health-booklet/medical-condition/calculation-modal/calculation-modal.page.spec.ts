import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CalculationModalPage } from './calculation-modal.page';

describe('CalculationModalPage', () => {
  let component: CalculationModalPage;
  let fixture: ComponentFixture<CalculationModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculationModalPage ],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CalculationModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
