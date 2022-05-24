import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LetterOfConsentPage } from './letter-of-consent.page';

describe('LetterOfConsentPage', () => {
  let component: LetterOfConsentPage;
  let fixture: ComponentFixture<LetterOfConsentPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LetterOfConsentPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LetterOfConsentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
