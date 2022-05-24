import { Component, OnInit } from '@angular/core';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.page.html',
  styleUrls: ['./invoices.page.scss'],
})
export class InvoicesPage implements OnInit {
  public invoices: any = [];
  public loggedInUser;
  public today = new Date().toString();
  public newInvoice = {
    doctor: '',
    invoiceNumber: '',
    amount: '',
    gst: '',
    totalAmount: '',
    reciptDate: '',
    tranche: '',
    invoiceDate: '',
    agentId: '',
    date: this.today,
  }
  public showNewInvoice = false;
  public showEdit: boolean;
  public addNew: boolean;
  internetCheckFlag = false;
  reloadAgain = true;
  public invoicesPresent = true;
  beforeEditObj: any = {};
  constructor(private dataService: AppDataService, private firebase: FirebaseService,
    private router: Router, private alertController: AlertController) { }
  public ionViewDidEnter() {
    this.dataService.present().then(loader => {
      loader.present();
      this.invoicesPresent = true;
      this.showNewInvoice = false;
      this.newInvoice = {
        doctor: '',
        invoiceNumber: '',
        amount: '',
        gst: '',
        totalAmount: '',
        reciptDate: '',
        tranche: '',
        invoiceDate: '',
        agentId: '',
        date: this.today,
      }
      this.loggedInUser = this.dataService.getUserData();
      // ? publish the header title you want to display in header
      const obj = {
        title: 'Invoices',
        backPage: '/user-home/' + this.loggedInUser.id,
      };
      this.dataService.setHeaderTitle(obj);
      this.getInvoices();
      this.dataService.dismiss();
    });
  }
  public ngOnInit() {
    this.dataService.mySubscription = this.dataService.createOnline$().subscribe(async (isOnline) => {
      if (isOnline === false) {
        this.internetCheckFlag = true;
        this.dataService.toastPresent('Internet disconnected');
        if (!this.reloadAgain) {
          this.dataService.dismiss();
          this.dataService.presentAlert('Please check your internet connection!');
        }
      } else if (isOnline === true && this.internetCheckFlag) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
          return false;
        };
        if (this.reloadAgain) {
          this.ionViewDidEnter();
        }
        this.dataService.toastPresent('Internet Connected');
        this.internetCheckFlag = false;
      }
    });
  }
  // tslint:disable-next-line: use-lifecycle-interface
  public ngOnDestroy() {
    if (this.dataService.mySubscription) {
      this.dataService.mySubscription.unsubscribe();
    }
  }
  public sortInvoices() {
    this.invoices = _.orderBy(this.invoices, [invoice => parseInt(invoice.invoiceNumber)], ['asc']);
  }
  public getInvoices() {
    this.invoices = [];
    this.firebase.getInvoices().subscribe(resp => {
      if (resp.docs) {
        resp.docs.forEach(data => {
          const temp: any = data.data();
          temp.id = data.id;
          temp.editMode = false;
          this.invoices.push(temp);
        });
        if (_.size(this.invoices) !== 0) {
          this.showEdit = true;
          this.addNew = false;
          this.invoicesPresent = true;
          this.sortInvoices();
        } else {
          this.invoicesPresent = false;
          this.addNew = true;
          this.showEdit = false;
        }
      }
      return;
    });
  }
  public setTwoNumberDecimal(value, field, type, index) {
    if (value.length === 0 || value === 0 || value === undefined) {
      value = 0;
    }
    const n = parseFloat(value).toFixed(2);
    value = this.formatNumber(n);
    if (type === 'new') {
      if (field === 'amount') {
        this.newInvoice.amount = value;
      } else if (field === 'gst') {
        this.newInvoice.gst = value;
        this.calculateTotal(0, this.newInvoice, type);
      }
    } else {
      if (field === 'amount') {
        this.invoices[index].amount = value;
      } else if (field === 'gst') {
        this.invoices[index].gst = value;
        this.calculateTotal(index, this.invoices[index], type);
      }
    }
  }
  public showNewInvoiceRow() {
    this.invoices.forEach(element => {
      element.editMode = false;
      element.takeAction = false;
    });
    if (!this.showNewInvoice) {
      this.invoicesPresent = true;
      // this.firebase.getLastInvoiceNumber().then(
      //   (result: any) => {
      //     this.newInvoice.invoiceNumber = result;
      //   }).catch((error) => {
      //   });
      this.newInvoice.agentId = this.loggedInUser.id;
      this.showNewInvoice = true;
    }
  }
  public cancelNewRow() {
    this.showNewInvoice = false;
    this.newInvoice = {
      doctor: '',
      invoiceNumber: '',
      amount: '',
      gst: '',
      totalAmount: '',
      reciptDate: '',
      tranche: '',
      invoiceDate: '',
      agentId: '',
      date: this.today,
    }
  }
  public editInvoice() {
    this.addNew = true;
    this.showEdit = false;
  }
  public calculateTotal(index, invoice, type) {
    if (type === 'new') {
      const m = Number(this.newInvoice.amount.replace(/,/g, '')) + Number(this.newInvoice.gst.replace(/,/g, ''));
      this.newInvoice.totalAmount = this.formatNumber(parseFloat(m.toString()).toFixed(2));
    } else {
      const m = Number(invoice.amount.replace(/,/g, '')) + Number(invoice.gst.replace(/,/g, ''));
      this.invoices[index].totalAmount = this.formatNumber(parseFloat(m.toString()).toFixed(2));
    }
  }
  public addNewInvoice() {
    this.reloadAgain = false;
    if (!this.internetCheckFlag) {
      if (this.newInvoice.doctor.length !== 0 && this.newInvoice.amount.length !== 0 &&
        this.newInvoice.gst.length !== 0) {
        this.firebase.addInvoice(this.newInvoice).then(resp => {
          if (resp.id) {
            this.dataService.presentAlert('Invoice added successfully!');
            // this.invoices.push(this.newInvoice);
            this.showEdit = true;
            this.addNew = false;
            this.reloadAgain = true;
            this.showNewInvoice = false;
            this.newInvoice = {
              doctor: '',
              invoiceNumber: '',
              amount: '',
              gst: '',
              totalAmount: '',
              reciptDate: '',
              tranche: '',
              invoiceDate: '',
              agentId: '',
              date: this.today,
            }
            this.getInvoices();
          }
        });
      } else {
        this.dataService.presentAlertMessage('Incomplete form', 'Please enter valid details to proceed!');
      }
    } else {
      this.dataService.presentAlert('Please check your internet connection!');
    }
  };
  public deleteInvoice(id) {
    this.dataService.present().then(a => {
      a.present();
      this.reloadAgain = false;
      if (!this.internetCheckFlag) {
        this.firebase.deleteInvoice(id).then(resp => {
          this.dataService.dismiss();
          this.reloadAgain = true;
          this.dataService.presentAlert('Invoice deleted successfully!');
          this.getInvoices();
        });
      } else {
        this.dataService.dismiss();
        this.dataService.presentAlert('Please check your internet connection!');
      }
    });
  }
  public editInvoiceRow(index) {
    if (this.showNewInvoice) {
      this.alertClearForm(index);
    } else {
      this.beforeEditObj = Object.assign({}, this.invoices[index]);
      this.invoices[index].editMode = true;
      this.invoices[index].takeAction = false;
    }
  }
  public cancelProcess(i) {
    this.invoices[i].editMode = false;
    this.invoices[i].takeAction = false;
    this.addNew = false;
    this.showEdit = true;
    this.showNewInvoice = false;
    this.invoices[i] = this.beforeEditObj;
    this.beforeEditObj = {};
  }
  public editInvoiceDetails(index) {
    this.dataService.present().then(a => {
      a.present();
      this.reloadAgain = false;
      if (!this.internetCheckFlag) {
        this.firebase.editInvoice(this.invoices[index]).then(resp => {
          this.invoices[index].takeAction = false;
          this.dataService.dismiss();
          this.reloadAgain = true;
          this.dataService.presentAlert('Invoice updated successfully!');
          this.newInvoice = {
            doctor: '',
            invoiceNumber: '',
            amount: '',
            gst: '',
            totalAmount: '',
            reciptDate: '',
            tranche: '',
            invoiceDate: '',
            agentId: '',
            date: this.today,
          }
          this.getInvoices();
        });
      } else {
        this.dataService.dismiss();
        this.dataService.presentAlert('Please check your internet connection!');
      }
    });
  }
  public openAction(i, event) {
    event.stopPropagation();
    this.invoices[i].takeAction = true;
    // tslint:disable-next-line: prefer-for-of
    for (let j = 0; j < this.invoices.length; j++) {
      if (i !== j) {
        this.invoices[j].takeAction = false;
      }
    }
  }
  public formatNumber(num) {
    var parts = num.toString().split(".");
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
  }
  public close() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.invoices.length; i++) {
      this.invoices[i].takeAction = false;
    }
  }
  public async alertClearForm(index) {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Clear Form',
        message: 'You will loose data if you proceed!',
        cssClass: 'alertDiv',
        buttons: [
          {
            text: 'Continue',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (cancel) => {
              this.invoices[index].editMode = false;
              this.invoices[index].takeAction = false;
              resolve('cancel');
            },
          }, {
            text: 'Clear',
            handler: (ok) => {
              this.cancelNewRow();
              this.beforeEditObj = Object.assign({}, this.invoices[index]);
              this.invoices[index].editMode = true;
              this.invoices[index].takeAction = false;
              resolve('ok');
            },
          },
        ],
      });
      await alert.present();
    });
  }
}
