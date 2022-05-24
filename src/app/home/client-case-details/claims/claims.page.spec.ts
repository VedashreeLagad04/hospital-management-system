import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClaimsPage } from './claims.page';

describe('ClaimsPage', () => {
  let component: ClaimsPage;
  let fixture: ComponentFixture<ClaimsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
