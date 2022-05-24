import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExportInfoPage } from './export-info.page';

describe('ExportInfoPage', () => {
  let component: ExportInfoPage;
  let fixture: ComponentFixture<ExportInfoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportInfoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExportInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
