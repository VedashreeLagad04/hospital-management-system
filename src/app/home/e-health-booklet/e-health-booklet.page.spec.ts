import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EHealthBookletPage } from './e-health-booklet.page';

describe('EHealthBookletPage', () => {
  let component: EHealthBookletPage;
  let fixture: ComponentFixture<EHealthBookletPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EHealthBookletPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EHealthBookletPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
