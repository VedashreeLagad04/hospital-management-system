import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditDocumentFileNamesPage } from './edit-document-file-names.page';

describe('EditDocumentFileNamesPage', () => {
  let component: EditDocumentFileNamesPage;
  let fixture: ComponentFixture<EditDocumentFileNamesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDocumentFileNamesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditDocumentFileNamesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
