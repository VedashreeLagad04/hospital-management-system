import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClientProfilePage } from './client-profile.page';

describe('ClientProfilePage', () => {
  let component: ClientProfilePage;
  let fixture: ComponentFixture<ClientProfilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientProfilePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
