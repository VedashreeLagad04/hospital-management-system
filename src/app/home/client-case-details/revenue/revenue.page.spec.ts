import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RevenuePage } from './revenue.page';

describe('RevenuePage', () => {
  let component: RevenuePage;
  let fixture: ComponentFixture<RevenuePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RevenuePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RevenuePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
