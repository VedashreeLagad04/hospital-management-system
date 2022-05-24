import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.page.html',
  styleUrls: ['./calculator.page.scss'],
})
export class CalculatorPage implements OnInit {
  @Input() noOfDays;
  public selectCount = 0;
  public surgeryType = 'inpatient';
  // public noOfDays;
  public finalLimit;
  public capLimit = 7550;
  public totalContent: any = [
    // {
    //   values: [
    //     // { a: '250', b: '350', c: '450', aShowBlue: false, bShowBlue: false, cShowBlue: false },
    //     // { a: '600', b: '750', c: '950', aShowBlue: false, bShowBlue: false, cShowBlue: false },
    //     // { a: '1250', b: '1550', c: '1850', aShowBlue: false, bShowBlue: false, cShowBlue: false },
    //     // { a: '2150', b: '2600', c: '2850', aShowBlue: false, bShowBlue: false, cShowBlue: false },
    //     // { a: '3150', b: '3550', c: '3950', aShowBlue: false, bShowBlue: false, cShowBlue: false },
    //     // { a: '4650', b: '5150', c: '5650', aShowBlue: false, bShowBlue: false, cShowBlue: false },
    //     // { a: '6200', b: '6900', c: '7550', aShowBlue: false, bShowBlue: false, cShowBlue: false },
    //   ],
    //   selected: '',
    // },
  ];
  public container: HTMLElement;
  public selectedCol = {
    table1: '',
    table2: '',
    table3: '',
  };
  constructor(private modalCtrl: ModalController, private firebase: FirebaseService) { }
  public ngOnInit() {
  }
  ionViewDidEnter() {
    this.firebase.getWithdrawalLimit().subscribe((resp) => {
      const temp: any = resp.docs[0].data();
      temp.selected = '';
      for (let i = 0; i < temp.values.length; i++) {
        temp.values[i].aShowBlue = false;
        temp.values[i].bShowBlue = false;
        temp.values[i].cShowBlue = false;
      }
      const temp1 = _.cloneDeep(temp);
      const temp2 = _.cloneDeep(temp);
      this.totalContent.push(temp);
      this.totalContent.push(temp1);
      this.totalContent.push(temp2);
    })
  }
  public dismiss() {
    const obj = {
      type: this.surgeryType.charAt(0).toUpperCase() + this.surgeryType.slice(1),
      noOfDays: this.noOfDays,
      table1: {
        selectedAmt: this.totalContent[0].selected,
        selectedCol: this.selectedCol.table1,
      },
      table2: {
        selectedAmt: this.totalContent[1].selected,
        selectedCol: this.selectedCol.table2,
      },
      table3: {
        selectedAmt: this.totalContent[2].selected,
        selectedCol: this.selectedCol.table3,
      },
      withdrawalLimit: this.finalLimit,
    };
    this.modalCtrl.dismiss(obj);
    // this.modalCtrl.dismiss({
    //   data: this.finalLimit,
    // });
  }
  public typeChange() {
    // if (this.surgeryType === 'daysurgery') {
    //   this.noOfDays = 1;
    //   this.capLimit = 300;
    //   this.calculateTotal();
    // } else {
    this.noOfDays = 1;
    this.capLimit = 7550;
    this.calculateTotal();
    // }
  }
  public addBlueBackground(i, type, selectIndex) {
    this.deselectAll(selectIndex);
    if (type === 'A') {
      this.totalContent[selectIndex].values[i].aShowBlue = !this.totalContent[selectIndex].values[i].aShowBlue;
      this.totalContent[selectIndex].selected = this.totalContent[selectIndex].values[i].A;
      // this.dismiss(this.tableContent[i].a);
    } else if (type === 'B') {
      this.totalContent[selectIndex].values[i].bShowBlue = !this.totalContent[selectIndex].values[i].bShowBlue;
      this.totalContent[selectIndex].selected = this.totalContent[selectIndex].values[i].B;
      // this.dismiss(this.tableContent[i].b);
    } else if (type === 'C') {
      this.totalContent[selectIndex].values[i].cShowBlue = !this.totalContent[selectIndex].values[i].cShowBlue;
      this.totalContent[selectIndex].selected = this.totalContent[selectIndex].values[i].C;
    }
    if (selectIndex === 0) {
      this.selectedCol.table1 = (i + 1) + type.toUpperCase();
    } else if (selectIndex === 1) {
      this.selectedCol.table2 = (i + 1) + type.toUpperCase();
    } else if (selectIndex === 2) {
      this.selectedCol.table3 = (i + 1) + type.toUpperCase();
    }
    this.calculateTotal();
    // this.container = document.getElementById('tableContent');
    // this.container.scrollTop += 100;
  }
  public deselectAll(contentIndex) {
    this.totalContent[contentIndex].values.forEach((el) => {
      el.aShowBlue = false;
      el.bShowBlue = false;
      el.cShowBlue = false;
    });
    this.totalContent[contentIndex].selected = '';
    this.calculateTotal();
  }
  public calculateTotal() {
    let totalSelect = 0;
    this.totalContent.forEach((element) => {
      if (element.selected !== '') {
        totalSelect += Number(element.selected);
      }
    });
    if (this.noOfDays === 0) {
      this.finalLimit = '';
    } else if (this.noOfDays && this.noOfDays !== '') {
      // const tempTotal = Number(this.noOfDays) * totalSelect;
      // const tempTotal = Number(this.noOfDays) * totalSelect;
      if (this.surgeryType === 'inpatient') {
        // ? changing per day amount as per client feedback on 04-03-2021
        // ? if inpatient, for 1st 2 days, $550 per day;
        // ? 3rd day onwards, $400 per day
        let perDayAmt;
        if (this.noOfDays <= 2) {
          perDayAmt = this.noOfDays * 550;
        } else {
          perDayAmt = (2 * 550) + ((this.noOfDays - 2) * 400);
        }
        const tempTotal = perDayAmt + (Number(totalSelect));
        // const tempTotal = (this.noOfDays * 450) + (Number(totalSelect));
        if (tempTotal < this.capLimit) {
          this.finalLimit = tempTotal;
        } else {
          this.finalLimit = this.capLimit + perDayAmt;
          // this.finalLimit = this.capLimit + (this.noOfDays * 450);
        }
      } else {
        const tempTotal = (this.noOfDays * 300) + (Number(totalSelect));
        if (tempTotal < this.capLimit) {
          this.finalLimit = tempTotal;
        } else {
          this.finalLimit = this.capLimit + (this.noOfDays * 300);
        }
      }
    }
  }
}
