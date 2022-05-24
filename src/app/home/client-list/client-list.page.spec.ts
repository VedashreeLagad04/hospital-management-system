import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClientListPage } from './client-list.page';

describe('ClientListPage', () => {
  let component: ClientListPage;
  let fixture: ComponentFixture<ClientListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
