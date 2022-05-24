import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-follow-up-memo',
  templateUrl: './follow-up-memo.page.html',
  styleUrls: ['./follow-up-memo.page.scss'],
})
export class FollowUpMemoPage implements OnInit {
  public ehealth: any = {};
  public types = ['Consultation', 'Follow-Up'];
  public doctors = ['241', '123'];
  public instructions = ['Admission', 'Follow-up', 'Open Date'];
  public clinics = ['1', '2'];
  public revisions = ['1', '2'];
  public selectedDoctor = '';
  public selectedInstruction = '';
  public selectedClinic = '';
  public selectedType = '';
  public selectedRevision = '';
  public showTypeDropdown = false;
  public showDoctorDropdown = false;
  public showInstructionDropdown = false;
  public showClinicDropdown = false;
  public showRevisionDropdown = false;
  public clientId;
  public case;
  public consultationMemo: any = {
    type: '',
    doctor: '',
    memoDesc: '',
    instruction: '',
    clinic: '',
    revision: '',
  };
  public clientName = '';
  public clientNric = '';
  public clientInitials = '';
  public loggedInUser: any;
  public pdfDate = '';
  public pdfTime = '';
  public pdfFilename;
  public sortFlag = 'desc';
  public internetCheckFlag = false;
  public activeRouteSubscriber: any;
  // tslint:disable-next-line: max-line-length
  constructor(private activeRoute: ActivatedRoute, private firebase: FirebaseService, private dataService: AppDataService, private loadingCtrl: LoadingController, private router: Router) { }
  public ngOnInit() {
    this.dataService.mySubscription = this.dataService.createOnline$().subscribe(async (isOnline) => {
      if (isOnline === false) {
        this.internetCheckFlag = true;
        this.dataService.toastPresent('Internet disconnected');
      } else if (isOnline === true && this.internetCheckFlag) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
          return false;
        };
        this.ionViewDidEnter();
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
  public ionViewDidEnter() {
    this.dataService.present().then((a) => {
      a.present();
      this.activeRouteSubscriber = this.activeRoute.paramMap.subscribe((params) => {
        this.clientId = params.get('id');
        this.loggedInUser = this.dataService.getUserData();
        this.case = this.dataService.getSelectedCase();
        // this.firebase.getEhealth(this.case.id).subscribe((resp) => {
        //   resp.docs.forEach((temp) => {
        //     this.ehealth = temp.data();
        //     this.ehealth.id = temp.id;
        //     
        //   });
        this.ehealth = this.dataService.getEhealthData();
        if (this.ehealth.profile.name) {
          this.clientName = this.ehealth.profile.name;
          this.clientNric = this.ehealth.profile.nric || this.ehealth.profile.fin;
          this.dataService.dismiss();
        } else {
          this.firebase.getUserDetails(this.clientId).subscribe((resp) => {
            if (resp.data() && resp.data().name) {
              this.clientName = resp.data().name;
              this.clientNric = resp.data().nric || resp.data().fin;
            }
            this.dataService.dismiss();
          });
        }
        this.ehealth.consultationMemo.forEach((element) => {
          if (element.pdfFile) {
            element.pdfFile.actualFilename = element.pdfFile.fileKey;
            element.pdfFile.filename = (element.pdfFile.fileKey.split('/')[4]).replace(/_/g, ' ');
            // tslint:disable-next-line: max-line-length
            element.pdfFile.fulldate = element.pdfFile.date.split(' ')[2] + ' ' + element.pdfFile.date.split(' ')[1] + ' ' + element.pdfFile.date.split(' ')[3];
            element.pdfFile.time = element.pdfFile.date.split(' ')[4];
          }
        });
        this.sortByDate('desc');
      });
      // });
    });
  }
  public sortByDate(type) {
    this.ehealth.consultationMemo.sort((a, b) => {
      const B = new Date(b.pdfFile.date).getTime();
      const A = new Date(a.pdfFile.date).getTime();
      if (type === 'desc') {
        this.sortFlag = 'desc';
        if (B > A) {
          return 1;
        } else if (B < A) {
          return -1;
        }
      } else {
        this.sortFlag = 'asc';
        if (B > A) {
          return -1;
        } else if (B < A) {
          return 1;
        }
      }
    });
  }
  public openPdf(pdfObj) {
    pdfObj.filename = (pdfObj.filename).replace(/ /g, '_');
    const tempObj = {
      actualFilename: pdfObj.awsFileName,
      fileUploadKey: pdfObj.fileKey,
      fileName: pdfObj.filename,
      date: pdfObj.date,
    };
    this.dataService.setMemoFile(tempObj);
    this.dataService.routeChange('/client-case-folders');
  }
  public ionViewwillLeave() {
    if (this.activeRouteSubscriber) {
      this.activeRouteSubscriber.unsubscribe();
    }
  }
}
