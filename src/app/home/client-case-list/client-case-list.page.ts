/* eslint-disable @typescript-eslint/prefer-for-of */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AwsService } from 'src/app/services/aws.service';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-client-case-list',
  templateUrl: './client-case-list.page.html',
  styleUrls: ['./client-case-list.page.scss'],
})
export class ClientCaseListPage implements OnInit {
  allowToCreateCase = false;
  public caseCount = 0;
  public clientDetails: any = {};
  public clientStatus;
  public isCaseAvailable = false;
  public clientId;
  public caseNo = [];
  public deleteCommonEhealth = false;
  public caseList: any = [];
  public loggedInUser;
  public sortFlag = 'asc';
  public allAdmissions = [];
  public date;
  public newCase: any = {
    clientId: '',
    assignTo: [],
    caseNumber: '',
    name: '',
    type: 'Normal',
    description: '',
    caseStatus: [],
    currentStatus: 'Pending',
    referralSource: '',
    referrer: '',
  };
  public internetCheckFlag = false;
  public activeRouteSubscription;
  public sortNameFlag = 'asc';
  caselistSnapshotSub: any;
  allAdmSnapshotSubscriber: any;
  constructor(
    private dataService: AppDataService,
    private firebase: FirebaseService,
    private activeRoute: ActivatedRoute,
    private alertCtrl: AlertController,
    private awsService: AwsService,
    private router: Router
  ) { }
  public ngOnInit() {
    this.dataService.mySubscription = this.dataService
      .createOnline$()
      .subscribe(async (isOnline) => {
        if (isOnline === false) {
          this.internetCheckFlag = true;
          this.dataService.toastPresent('Internet disconnected');
        } else if (isOnline === true && this.internetCheckFlag) {
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          this.ionViewDidEnter();
          this.dataService.toastPresent('Internet Connected');
          this.internetCheckFlag = false;
        }
      });
  }
  public ionViewDidEnter() {
    this.activeRouteSubscription = this.activeRoute.paramMap.subscribe(
      (params) => {
        this.clientId = params.get('id');
        this.dataService.present().then((a) => {
          a.present();
          this.caseList = [];
          this.caseNo = [];
          const obj = {
            title: 'Case',
            backPage: 'client-profile/' + this.clientId,
          };
          this.dataService.setHeaderTitle(obj);
          this.loggedInUser = this.dataService.getUserData();
          this.firebase.getUserDetails(this.clientId).subscribe((data) => {
            const temp = data.data();
            this.clientDetails = temp;
            this.clientStatus = this.clientDetails.currentStatus;
            this.allowToCreateCase = true;
            if (this.loggedInUser.type === 'agent') {
              // ? check if loggedInUser is assigned to this.clientDetails;
              // ? if yes, then get all data; else dont
              if (this.clientDetails.assignedTo.includes(this.loggedInUser.id)) {
                this.allAdmSnapshotSubscriber = this.firebase.getAllAdmissions().subscribe((adm) => {
                  this.allAdmissions = adm;
                  this.getUserCases();
                });
              } else {
                this.allowToCreateCase = false;
                this.caseList = [];
                this.caseCount = 0;
                this.dataService.dismiss();
              }
            } else {
              this.allAdmSnapshotSubscriber = this.firebase.getAllAdmissions().subscribe((adm) => {
                this.allAdmissions = adm;
                this.getUserCases();
              });
            }
          },
            (error) => {
              this.dataService.dismiss();
            }
          );
        });
      }
    );
  }
  public ngOnDestroy() {
    if (this.dataService.mySubscription) {
      this.dataService.mySubscription.unsubscribe();
    }
  }
  public getUserCases() {
    this.caseList = [];
    if (this.loggedInUser.type === 'agent') {
      this.caselistSnapshotSub = this.firebase
        .getCaseListAssignedToAgent(this.clientId, this.loggedInUser.id)
        .subscribe(
          (cases) => {
            this.caseCount = 0;
            this.caseList = [];
            cases.forEach((data) => {
              if (data.currentStatus === 'Pending') {
                this.caseCount++;
                data.currentStatus = 'Pending Submission';
              }
              this.caseList.push(data);
            });
            console.log('this.caseList: ', this.caseList);
            this.mergeArrays();
          },
          () => {
            this.dataService.dismiss();
          }
        );
    } else {
      this.firebase.getCase(this.clientId).subscribe(
        (cases) => {
          this.caseCount = 0;
          this.caseList = [];
          let temp;
          cases.docs.forEach((data) => {
            temp = data.data();
            temp.id = data.id;
            if (temp.currentStatus === 'Pending') {
              this.caseCount++;
              temp.currentStatus = 'Pending Submission';
            }
            this.caseList.push(temp);
          });
          this.mergeArrays();
        },
        () => {
          this.dataService.dismiss();
        }
      );
    }
  }
  public mergeArrays() {
    this.dataService.setCaseList(this.caseList);
    for (let i = 0; i < this.caseList.length; i++) {
      this.caseList[i].admissionDate = '';
      for (let j = 0; j < this.allAdmissions.length; j++) {
        if (this.caseList[i].id === this.allAdmissions[j].caseId) {
          this.caseList[i].admissionDate = this.allAdmissions[
            j
          ].case.admissionDate;
          if (
            this.caseList[i].admissionDate &&
            this.caseList[i].admissionDate.length > 0
          ) {
            const date = new Date(this.allAdmissions[j].case.admissionDate);
            const today = this.dataService.formatDateAndMonth(date);
            this.caseList[i].admissionDate = today.split('/')[0];
          }
          this.caseList[i].diagnosis = this.allAdmissions[j].case.diagnosis;
        }
      }
    }
    this.specificCaseNo();
    this.sortAdmissionDateAsc();
    this.sortByNameAsc();
    this.dataService.dismiss();
  }
  public sortCases() {
    this.caseList = this.caseList.sort((a, b) => {
      const dateA = new Date(a.lastUpdateDate);
      const dateB = new Date(b.lastUpdateDate);
      if (dateA < dateB) {
        return 1;
      } else {
        return -1;
      }
    });
  }
  public specificCaseNo() {
    if (this.caseList.length === 0) {
      this.isCaseAvailable = false;
    } else {
      this.isCaseAvailable = true;
    }
    return;
  }
  public backButton() {
    this.dataService.routeChange('/client-profile/' + this.clientId);
  }
  public openCaseDetails(caseDetails) {
    delete caseDetails.admissionDate;
    this.dataService.setSelectedCase(caseDetails);
    this.router.navigate(['/client-case-profile']);
  }
  public createNewCase() {
    this.dataService.present().then((loader) => {
      loader.present();
      this.date = new Date();
      this.newCase.clientId = this.clientDetails.id || this.clientId;
      this.newCase.lastUpdateDate = this.date;
      this.newCase.createdDate = this.date;
      this.newCase.lastUpdateTimestamp = new Date(this.date).getTime();
      this.firebase
        .getLastCaseNumber()
        .then((result) => {
          this.newCase.caseNumber = result;
          this.firebase.addCase(this.newCase).then((resp) => {
            if (resp.id) {
              this.newCase.id = resp.id;
              this.createCaseDetails(this.newCase);
            } else {
              this.dataService.dismiss();
              this.dataService.presentAlert('Couldn\'t create case. Try again!');
            }
          });
        })
        .catch((error) => { });
    });
  }
  public createCaseDetails(caseData) {
    const medicalCondition = {
      caseId: caseData.id,
      gastroenterology: {},
      orthopaedic: {},
      cardiology: {},
      gynaecology: {},
      urology: {},
      ent: {},
      respiratory: {},
      general: {},
    };
    this.firebase.addMedicalDoc(medicalCondition).then((resp) => {
      if (resp.id) {
        if (!this.clientDetails.homeContactNo) {
          this.clientDetails.homeContactNo = '';
        }
        const booklet = {
          caseId: caseData.id,
          profile: this.clientDetails,
          case: caseData,
          activePolicies: [],
          insuranceDoc: [],
          medicalConditionId: resp.id,
          preExistingCondition: [],
          travelDeclaration: {},
          signature: [],
          caseSubmission: {},
          letterOfConsent: {},
        };
        this.firebase.addEhealthBooklet(booklet).then((resp) => {
          if (resp.id) {
            const timelineStatus: any = {
              date: this.date,
              activity: 'Case Created',
              userType: this.loggedInUser.type,
              userId: this.loggedInUser.id,
              caseId: caseData.id,
            };
            this.dataService.updateTimelineData(
              timelineStatus,
              caseData.clientId
            );
            this.hideLoaderSetCaseAndRoute();
          } else {
            this.dataService.dismiss();
            this.dataService.presentAlert('Couldn\'t create case. Try again!');
          }
        });
      }
    });
  }
  public hideLoaderSetCaseAndRoute() {
    this.dataService.setSelectedCase(this.newCase);
    this.dataService.dismiss();
    this.dataService.routeChange(
      '/e-health-booklet/case/' + this.newCase.clientId
    );
  }
  public sortAdmissionDateAsc() {
    this.caseList = _.orderBy(
      this.caseList,
      [
        (casedata) => casedata.admissionDate !== ''
          ? new Date(casedata.admissionDate)
          : '',
      ],
      ['asc']
    );
    this.sortFlag = 'desc';
  }
  public sortAdmissionDateDesc() {
    this.caseList = _.orderBy(
      this.caseList,
      [
        (casedata) => casedata.admissionDate !== ''
          ? new Date(casedata.admissionDate)
          : '',
      ],
      ['desc']
    );
    this.sortFlag = 'asc';
  }
  public sortByNameAsc() {
    this.caseList = _.orderBy(
      this.caseList,
      [(user) => user.name.toLowerCase()],
      ['asc']
    );
    this.sortNameFlag = 'desc';
  }
  public sortByNameDesc() {
    this.caseList = _.orderBy(
      this.caseList,
      [(user) => user.name.toLowerCase()],
      ['desc']
    );
    this.sortNameFlag = 'asc';
  }
  public goToLetterOfEngagement() {
    this.dataService.setPathForLoe('client-profile/' + this.clientId);
    this.dataService.routeChange('/letter-of-engagement/' + this.clientId);
  }
  public ionViewDidLeave() {
    if (this.activeRouteSubscription) {
      this.activeRouteSubscription.unsubscribe();
    }
    if (this.caselistSnapshotSub) {
      this.caselistSnapshotSub.unsubscribe();
    }
    if (this.allAdmSnapshotSubscriber) {
      this.allAdmSnapshotSubscriber.unsubscribe();
    }
  }
  public deleteCaseAndCommonEhealth(obj, i) {
    this.deleteCommonEhealth = false;
    this.alertCtrl
      .create({
        header: 'Confirm Delete',
        message: 'Are you sure you want to delete case:- ' + obj.name + '?',
        cssClass: 'alertDiv',
        inputs: [
          {
            name: 'checkbox',
            type: 'checkbox',
            label: 'Delete common ehealth data',
            value: 'value',
            checked: false,
            handler: () => {
              this.deleteCommonEhealth = !this.deleteCommonEhealth;
            },
          },
        ],
        buttons: [
          {
            text: 'No',
            role: 'cancel',
          },
          {
            text: 'Yes',
            handler: () => {
              if (!this.deleteCommonEhealth) {
                this.deleteDocuments(obj, i);
              } else {
                this.dataService.present().then((a) => {
                  a.present();
                  this.firebase.getMedicalId(obj.id).subscribe((resp) => {
                    let MedicalConditionId;
                    resp.docs.forEach((temp) => {
                      MedicalConditionId = temp.id;
                    });
                    this.firebase.deleteMedical(MedicalConditionId).then(() => {
                      this.firebase.getEhealthId(obj.id).subscribe((resp) => {
                        let ehealthId;
                        resp.docs.forEach((temp) => {
                          ehealthId = temp.id;
                        });
                        this.firebase.deleteEhealth(ehealthId).then(() => {
                          this.firebase
                            .getCommonEheallthData(this.clientId)
                            .subscribe((resp) => {
                              if (resp.size > 0) {
                                const id = resp.docs[0].id;
                                this.firebase
                                  .deleteCommonEhealthData(id)
                                  .then(() => {
                                    this.deleteFilesFromAws(obj, i);
                                  });
                              } else {
                                this.deleteFilesFromAws(obj, i);
                              }
                            });
                        });
                      });
                    });
                  });
                });
              }
            },
          },
        ],
      })
      .then((alert) => {
        alert.present();
      });
  }
  public deleteFilesFromAws(obj, i) {
    const file =
      environment.aws.bucketAccessRootPath +
      environment.aws.bucketRootKey +
      this.clientId +
      obj.id;
    this.awsService.deleteFileAWS(file).then(() => {
      this.firebase.deleteCase(obj.id).then(() => {
        if (this.loggedInUser.type !== 'agent') {
          this.caseList.splice(i, 1);
        }
        this.caseCount--;
        this.dataService.dismiss();
        this.dataService.presentAlert('Case deleted successfully');
      });
    });
  }
  public deleteCase(obj, i) {
    this.alertCtrl
      .create({
        header: 'Confirm Delete',
        message: 'Are you sure you want to delete case:- ' + obj.name + '?',
        cssClass: 'alertDiv',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
          },
          {
            text: 'Yes',
            handler: () => {
              this.deleteDocuments(obj, i);
            },
          },
        ],
      })
      .then((alert) => {
        alert.present();
      });
  }
  deleteDocuments(obj, i) {
    this.dataService.present().then((a) => {
      a.present();
      this.firebase.getMedicalId(obj.id).subscribe((resp) => {
        let MedicalConditionId;
        resp.docs.forEach((temp) => {
          MedicalConditionId = temp.id;
        });
        this.firebase.deleteMedical(MedicalConditionId).then(() => {
          this.firebase.getEhealthId(obj.id).subscribe((resp) => {
            let ehealthId;
            resp.docs.forEach((temp) => {
              ehealthId = temp.id;
            });
            this.firebase.deleteEhealth(ehealthId).then(() => {
              this.deleteFilesFromAws(obj, i);
            });
          });
        });
      });
    });
  }
  showReason(event, index) {
    event.stopPropagation();
    this.caseList[index].showReason = !this.caseList[index].showReason;
    for (let i = 0; i < this.caseList.length; i++) {
      if (i !== index) {
        this.caseList[i].showReason = false
      }
    }
  }
  closeAll() {
    for (let i = 0; i < this.caseList.length; i++) {
      this.caseList[i].showReason = false
    }
  }
}
