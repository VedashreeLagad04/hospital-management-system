import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CasePage } from './case.page';

describe('CasePage', () => {
  let component: CasePage;
  let fixture: ComponentFixture<CasePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CasePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CasePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
