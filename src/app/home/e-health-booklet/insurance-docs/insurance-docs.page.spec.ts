import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InsuranceDocsPage } from './insurance-docs.page';

describe('InsuranceDocsPage', () => {
  let component: InsuranceDocsPage;
  let fixture: ComponentFixture<InsuranceDocsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsuranceDocsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InsuranceDocsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
