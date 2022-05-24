import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-isp-calculator',
  templateUrl: './isp-calculator.page.html',
  styleUrls: ['./isp-calculator.page.scss'],
})
export class IspCalculatorPage implements OnInit {
  public selectCount = 0;
  public surgeryType = 'inpatient';
  public noOfDays;
  public finalLimit;
  public capLimit = 7550;
  public totalContent = [
    {
      content: [
        { a: '250', b: '350', c: '450', aShowBlue: false, bShowBlue: false, cShowBlue: false },
        { a: '600', b: '750', c: '950', aShowBlue: false, bShowBlue: false, cShowBlue: false },
        { a: '1250', b: '1550', c: '1850', aShowBlue: false, bShowBlue: false, cShowBlue: false },
        { a: '2150', b: '2600', c: '2850', aShowBlue: false, bShowBlue: false, cShowBlue: false },
        { a: '3150', b: '3550', c: '3950', aShowBlue: false, bShowBlue: false, cShowBlue: false },
        { a: '4650', b: '5150', c: '5650', aShowBlue: false, bShowBlue: false, cShowBlue: false },
        { a: '6200', b: '6900', c: '7550', aShowBlue: false, bShowBlue: false, cShowBlue: false },
      ],
      selected: '',
    },
    {
      content: [
        { a: '250', b: '350', c: '450', aShowBlue: false, bShowBlue: false, cShowBlue: false },
        { a: '600', b: '750', c: '950', aShowBlue: false, bShowBlue: false, cShowBlue: false },
        { a: '1250', b: '1550', c: '1850', aShowBlue: false, bShowBlue: false, cShowBlue: false },
        { a: '2150', b: '2600', c: '2850', aShowBlue: false, bShowBlue: false, cShowBlue: false },
        { a: '3150', b: '3550', c: '3950', aShowBlue: false, bShowBlue: false, cShowBlue: false },
        { a: '4650', b: '5150', c: '5650', aShowBlue: false, bShowBlue: false, cShowBlue: false },
        { a: '6200', b: '6900', c: '7550', aShowBlue: false, bShowBlue: false, cShowBlue: false },
      ],
      selected: '',
    }, {
      content: [
        { a: '250', b: '350', c: '450', aShowBlue: false, bShowBlue: false, cShowBlue: false },
        { a: '600', b: '750', c: '950', aShowBlue: false, bShowBlue: false, cShowBlue: false },
        { a: '1250', b: '1550', c: '1850', aShowBlue: false, bShowBlue: false, cShowBlue: false },
        { a: '2150', b: '2600', c: '2850', aShowBlue: false, bShowBlue: false, cShowBlue: false },
        { a: '3150', b: '3550', c: '3950', aShowBlue: false, bShowBlue: false, cShowBlue: false },
        { a: '4650', b: '5150', c: '5650', aShowBlue: false, bShowBlue: false, cShowBlue: false },
        { a: '6200', b: '6900', c: '7550', aShowBlue: false, bShowBlue: false, cShowBlue: false },
      ],
      selected: '',
    },
  ];
  public container: HTMLElement;
  public selectedCol = {
    table1: '',
    table2: '',
    table3: '',
  };
  constructor(private modalCtrl: ModalController) { }
  public ngOnInit() {
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
    if (type === 'a') {
      this.totalContent[selectIndex].content[i].aShowBlue = !this.totalContent[selectIndex].content[i].aShowBlue;
      this.totalContent[selectIndex].selected = this.totalContent[selectIndex].content[i].a;
      // this.dismiss(this.tableContent[i].a);
    } else if (type === 'b') {
      this.totalContent[selectIndex].content[i].bShowBlue = !this.totalContent[selectIndex].content[i].bShowBlue;
      this.totalContent[selectIndex].selected = this.totalContent[selectIndex].content[i].b;
      // this.dismiss(this.tableContent[i].b);
    } else if (type === 'c') {
      this.totalContent[selectIndex].content[i].cShowBlue = !this.totalContent[selectIndex].content[i].cShowBlue;
      this.totalContent[selectIndex].selected = this.totalContent[selectIndex].content[i].c;
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
    this.totalContent[contentIndex].content.forEach((el) => {
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
