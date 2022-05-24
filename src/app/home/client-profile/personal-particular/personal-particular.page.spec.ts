import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PersonalParticularPage } from './personal-particular.page';

describe('PersonalParticularPage', () => {
  let component: PersonalParticularPage;
  let fixture: ComponentFixture<PersonalParticularPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonalParticularPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalParticularPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
