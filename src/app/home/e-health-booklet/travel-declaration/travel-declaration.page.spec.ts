import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TravelDeclarationPage } from './travel-declaration.page';

describe('TravelDeclarationPage', () => {
  let component: TravelDeclarationPage;
  let fixture: ComponentFixture<TravelDeclarationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TravelDeclarationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TravelDeclarationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
