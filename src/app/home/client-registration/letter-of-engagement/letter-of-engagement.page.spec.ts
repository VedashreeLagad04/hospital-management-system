import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LetterOfEngagementPage } from './letter-of-engagement.page';

describe('LetterOfEngagementPage', () => {
  let component: LetterOfEngagementPage;
  let fixture: ComponentFixture<LetterOfEngagementPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LetterOfEngagementPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LetterOfEngagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
