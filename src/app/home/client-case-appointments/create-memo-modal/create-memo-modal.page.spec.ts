import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CreateMemoModalPage } from './create-memo-modal.page';

describe('CreateMemoModalPage', () => {
  let component: CreateMemoModalPage;
  let fixture: ComponentFixture<CreateMemoModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateMemoModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateMemoModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
