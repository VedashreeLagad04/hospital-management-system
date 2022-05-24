import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClientCaseAddPage } from './client-case-add.page';

describe('ClientCaseAddPage', () => {
  let component: ClientCaseAddPage;
  let fixture: ComponentFixture<ClientCaseAddPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientCaseAddPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientCaseAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
