import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PreviewClientInfoPage } from './preview-client-info.page';

describe('PreviewClientInfoPage', () => {
  let component: PreviewClientInfoPage;
  let fixture: ComponentFixture<PreviewClientInfoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewClientInfoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PreviewClientInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
