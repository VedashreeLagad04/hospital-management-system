import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GenerateReportPage } from './generate-report.page';

describe('GenerateReportPage', () => {
  let component: GenerateReportPage;
  let fixture: ComponentFixture<GenerateReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GenerateReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
