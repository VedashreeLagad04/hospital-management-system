import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClientCaseFoldersPage } from './client-case-folders.page';

describe('ClientCaseFoldersPage', () => {
  let component: ClientCaseFoldersPage;
  let fixture: ComponentFixture<ClientCaseFoldersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientCaseFoldersPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientCaseFoldersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
