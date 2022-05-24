import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClientCaseProfilePage } from './client-case-profile.page';

describe('ClientCaseProfilePage', () => {
  let component: ClientCaseProfilePage;
  let fixture: ComponentFixture<ClientCaseProfilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientCaseProfilePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientCaseProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
