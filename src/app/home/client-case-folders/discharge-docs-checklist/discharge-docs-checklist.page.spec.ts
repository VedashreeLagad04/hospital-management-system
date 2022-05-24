import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DischargeDocsChecklistPage } from './discharge-docs-checklist.page';

describe('DischargeDocsChecklistPage', () => {
  let component: DischargeDocsChecklistPage;
  let fixture: ComponentFixture<DischargeDocsChecklistPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DischargeDocsChecklistPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DischargeDocsChecklistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
