import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-create-memo-modal',
  templateUrl: './create-memo-modal.page.html',
  styleUrls: ['./create-memo-modal.page.scss'],
})
export class CreateMemoModalPage implements OnInit {
  @Input() public appointment: any;
  nameToSearch = '';
  public types = [];
  public doctors: any[];
  public instructions = [];
  public clinics: any[];
  public revisions = [];
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    appointment_title: '',
  };
  public ehealth: any;
  public clientName = '';
  public clientNric = '';
  public clientForeignId = '';
  public clientInitials = '';
  public loggedInUser: any;
  public pdfDate = '';
  public pdfTime = '';
  public pdfFilename;
  public pdfFiledate;
  ehealthSnapshotSub: any;
  constructor(private activeRoute: ActivatedRoute, private modalCtrl: ModalController,
    private firebase: FirebaseService,
    public dataService: AppDataService, private loadingCtrl: LoadingController) { }
  public ngOnInit() {
    this.dataService.present().then((a) => {
      a.present();
      this.clientId = this.appointment.clientId;
      this.loggedInUser = this.dataService.getUserData();
      this.case = this.dataService.getSelectedCase();
      this.firebase.getInstructionsInMemo().subscribe((resp: any) => {
        this.instructions = [];
        if (resp.size > 0) {
          _.forEach(resp.docs, (doc) => {
            this.instructions.push({ instruction: doc.data().memo, show: true, isSelected: false });
          });
        } else {
          this.instructions = [
            {
              instruction: 'Admission',
              show: true
            },
            {
              instruction: 'Follow-up',
              show: true
            },
            {
              instruction: 'Open Date',
              show: true
            }
          ];
        }
      });
      this.firebase.getRevisionsInMemo().subscribe((resp: any) => {
        this.revisions = [];
        if (resp.size > 0) {
          _.forEach(resp.docs, (doc) => {
            this.revisions.push({ revision: doc.data().memo, show: true, isSelected: false });
          });
        } else {
          this.revisions = [
            {
              revision: '1',
              show: true
            },
            {
              revision: '2',
              show: true
            }
          ];
        }
      });
      this.firebase.getTypeOfAppointment().subscribe((resp: any) => {
        this.types = [];
        if (resp.size > 0) {
          _.forEach(resp.docs, (doc) => {
            this.types.push({ type: doc.data().appointment, show: true, isSelected: false });
          });
        } else {
          this.types = [
            {
              type: 'Consultation',
              show: true,
              isSelected: false
            },
            {
              type: 'Admission',
              show: true,
              isSelected: false
            },
            {
              type: 'Discharge',
              show: true,
              isSelected: false
            },
            {
              type: 'Follow-Up',
              show: true,
              isSelected: false
            },
            {
              type: 'Others',
              show: true,
              isSelected: false
            }
          ];
        }
      });
      this.getDoctors();
      this.ehealthSnapshotSub = this.firebase.getEhealth(this.case.id).subscribe((resp) => {
        if (resp[0].caseId === this.case.id) {
          this.ehealth = resp[0];
          this.dataService.setEhealthData(this.ehealth);
          this.processEhealthData();
          this.dataService.dismiss();
        }
      });
      this.consultationMemo.appointment_title = this.appointment.title;
      this.consultationMemo.consultationNo = this.appointment.consultationNo || 0;
      this.selectedType = this.appointment.type;
      this.consultationMemo.type = this.appointment.type;
    });
  }
  public processEhealthData() {
    if (this.ehealth.consultationMemo === undefined) {
      this.ehealth.consultationMemo = [];
    } else {
      let sortedFiles = [];
      if (this.ehealth.consultationMemo.length > 1) {
        sortedFiles = this.sortFilenames(this.ehealth.consultationMemo);
        this.pdfFilename = sortedFiles[0].pdfFile.fileKey;
        this.pdfFiledate = sortedFiles[0].pdfFile.date;
      } else if (this.ehealth.consultationMemo.length === 1) {
        this.pdfFilename = this.ehealth.consultationMemo[0].pdfFile.fileKey;
        this.pdfFiledate = this.ehealth.consultationMemo[0].pdfFile.date;
      } else {
        this.pdfFilename = '';
        this.pdfFiledate = null;
      }
    }
    if (this.ehealth.profile.name) {
      this.clientName = this.ehealth.profile.name;
      if (this.ehealth.profile.nric && this.ehealth.profile.nric !== '') {
        this.clientNric = this.ehealth.profile.nric || this.ehealth.profile.fin;
      }
      if (this.ehealth.profile.foreignId && this.ehealth.profile.foreignId !== '') {
        this.clientForeignId = this.ehealth.profile.foreignId;
      }
      return;
    } else {
      this.firebase.getUserDetails(this.clientId).subscribe((resp) => {
        if (resp.data() && resp.data().name) {
          this.clientName = resp.data().name;
          this.clientNric = resp.data().nric || resp.data().fin;
        }
        return;
      });
    }
  }
  public sortFilenames(files) {
    let allFilenames = [];
    allFilenames = files.sort((a, b) => {
      const dateA = new Date(a.pdfFile.date).getTime();
      const dateB = new Date(b.pdfFile.date).getTime();
      if (dateA < dateB) {
        return 1;
      } else {
        return -1;
      }
    });
    return allFilenames;
  }
  public dismiss(status) {
    this.modalCtrl.dismiss({
      data: status,
    });
  }
  public openTypeDropdown() {
    this.nameToSearch = '';
    this.types = this.dataService.searchFromDropdownList(this.types, this.nameToSearch, 'type');
    this.showTypeDropdown = !this.showTypeDropdown;
    this.showClinicDropdown = false;
    this.showInstructionDropdown = false;
    this.showRevisionDropdown = false;
    this.showDoctorDropdown = false;
  }
  public openDoctorDropdown() {
    this.nameToSearch = '';
    this.doctors = this.dataService.searchFromDropdownList(this.doctors, this.nameToSearch, 'doctorName');
    this.showDoctorDropdown = !this.showDoctorDropdown;
    this.showClinicDropdown = false;
    this.showInstructionDropdown = false;
    this.showRevisionDropdown = false;
    this.showTypeDropdown = false;
  }
  public openInstructionDropdown() {
    this.nameToSearch = '';
    this.instructions = this.dataService.searchFromDropdownList(this.instructions, this.nameToSearch, 'instruction');
    this.showInstructionDropdown = !this.showInstructionDropdown;
    this.showClinicDropdown = false;
    this.showRevisionDropdown = false;
    this.showDoctorDropdown = false;
    this.showTypeDropdown = false;
  }
  public openClinicDropdown() {
    this.nameToSearch = '';
    console.log('this.clinics: ', this.clinics);
    this.clinics = this.dataService.searchFromDropdownList(this.clinics, this.nameToSearch, 'code');
    this.showClinicDropdown = !this.showClinicDropdown;
    this.showInstructionDropdown = false;
    this.showRevisionDropdown = false;
    this.showDoctorDropdown = false;
    this.showTypeDropdown = false;
  }
  public openRevisionDropdown() {
    this.nameToSearch = '';
    this.revisions = this.dataService.searchFromDropdownList(this.revisions, this.nameToSearch, 'revision');
    this.showRevisionDropdown = !this.showRevisionDropdown;
    this.showInstructionDropdown = false;
    this.showClinicDropdown = false;
    this.showDoctorDropdown = false;
    this.showTypeDropdown = false;
  }
  public selectType(type) {
    this.showTypeDropdown = false;
    this.selectedType = type.type;
    this.consultationMemo.type = type.type;
  }
  public selectDoctor(doctor) {
    this.clinics = [];
    this.showDoctorDropdown = false;
    this.selectedDoctor = doctor.doctorName + '-' + doctor.doctorCode;
    this.consultationMemo.doctor = doctor.doctorCode;
    this.selectedClinic = '';
    this.consultationMemo.clinic = '';
    if (this.consultationMemo.instruction !== 'Admission') {
      doctor.location.forEach(element => {
        this.clinics.push({ code: element.clinicCode, show: true });
      });
    } else {
      this.selectInstruction('Admission');
    }
  }
  public selectRevision(revision) {
    this.showRevisionDropdown = false;
    this.selectedRevision = revision;
    this.consultationMemo.revision = revision;
  }
  public getDoctors() {
    this.firebase.getDoctorsClinic().subscribe(resp => {
      const data = [];
      if (resp.size !== 0) {
        resp.docs.forEach(element => {
          const temp: any = element.data();
          temp.id = element.id;
          if (temp.doctorCode === this.appointment.doctor) {
            this.selectedDoctor = temp.doctorName + '-' + temp.doctorCode;
            this.consultationMemo.doctor = temp.doctorCode;
          }
          data.push(temp);
        });
        const doctors = [];
        _.map(_.groupBy(data, 'doctorCode'), (vals, doctorCode) => {
          const location: any = [];
          let name: '';
          vals.forEach((el) => {
            name = el.doctorName;
            location.push({ location: el.location, clinicCode: el.clinicCode, show: true });
          });
          const temp = {
            doctorName: name,
            doctorCode,
            location,
            show: true
          };
          doctors.push(temp);
        });
        this.doctors = doctors;
      }
    });
  }
  public selectInstruction(instruction) {
    this.showInstructionDropdown = false;
    this.selectedInstruction = instruction;
    this.selectedClinic = '';
    this.consultationMemo.clinic = '';
    if (instruction === 'Admission') {
      this.clinics = [];
      this.firebase.getFacility().subscribe(resp => {
        const data = [];
        if (resp.size !== 0) {
          resp.docs.forEach(element => {
            const temp: any = element.data();
            temp.id = element.id;
            data.push({ code: temp.code, show: true });
          });
          this.clinics = data;
        }
      });
    } else {
      this.clinics = [];
      const doc = _.find(this.doctors, ['doctorCode', this.consultationMemo.doctor]);
      doc.location.forEach(element => {
        this.clinics.push({ code: element.clinicCode, show: true });
      });
    }
    this.consultationMemo.instruction = instruction;
  }
  public selectClinic(clinic) {
    this.showClinicDropdown = false;
    this.selectedClinic = clinic;
    this.consultationMemo.clinic = clinic;
  }
  public add() {
    this.ehealth.memo.followUpMemo.push(
      {
        type: '',
        doctor: '',
        memo: '',
        instruction: '',
        clinic: '',
      },
    );
  }
  public delete(index) {
    this.ehealth.memo.followUpMemo.splice(index);
  }
  public checkFields() {
    if (this.consultationMemo.type.length !== 0 &&
      this.consultationMemo.memoDesc.length !== 0 &&
      this.consultationMemo.instruction.length !== 0 &&
      this.consultationMemo.doctor.length !== 0) {
      return true;
    } else {
      this.dataService.presentAlert('Please complete form to proceed!');
      return false;
    }
  }
  public saveChanges() {
    this.ehealth.consultationMemo.push(this.consultationMemo);
    this.firebase.editEhealth(this.ehealth).then(() => {
      this.dismiss('success');
      this.dataService.presentAlert('Consultation memo created successfully!');
    });
  }
  public exportPdf() {
    if (this.checkFields()) {
      // ? if any data not present, set '-'
      this.consultationMemo.doctor = (this.consultationMemo.doctor !== '') ? this.consultationMemo.doctor : '-';
      this.consultationMemo.type = (this.consultationMemo.type !== '') ? this.consultationMemo.type : '-';
      this.consultationMemo.clinic = (this.consultationMemo.clinic !== '') ? this.consultationMemo.clinic : '-';
      // tslint:disable-next-line: max-line-length
      this.consultationMemo.instruction = (this.consultationMemo.instruction !== '') ? this.consultationMemo.instruction : '-';
      this.consultationMemo.revision = (this.consultationMemo.revision !== '') ? this.consultationMemo.revision : '-';
      // tslint:disable-next-line: max-line-length
      this.consultationMemo.memoDesc = (this.consultationMemo.memoDesc !== '') ? this.consultationMemo.memoDesc : '-';
      const date = new Date();
      const dateToString = date.toString();
      let month;
      month = date.getMonth();
      month = month + 1;
      if (month.toString().length === 1) {
        month = '0' + month;
      }
      let day;
      day = date.getDate();
      if (day.toString().length === 1) {
        day = '0' + day;
      }
      const M = date.toDateString().substr(4, 3);
      const splitDate = dateToString.split(' ');
      this.pdfDate = day + ' ' + M + ' ' + splitDate[3];
      const timeSplit = splitDate[4].split(':');
      this.pdfTime = timeSplit[0] + ':' + timeSplit[1];
      const pageName = 'Consultation_Memo';
      // eslint-disable-next-line max-len
      this.dataService.exportPdf('memo-pdf-wrap', this.clientName, environment.aws.bucketAdmissionDocumentsPath, pageName, this.clientId, this.ehealth.caseId, this.pdfFilename, this.pdfFiledate).then((resp) => {
        const response: any = resp;
        if (response.status === 'success') {
          // tslint:disable-next-line: no-shadowed-variable
          const dateString = new Date().toString();
          this.consultationMemo.pdfFile = {
            fileKey: response.awsFileName,
            date: dateString,
            awsFileName: response.awsFileName
          };
          this.saveChanges();
        }
      }).catch((err) => {
        this.dataService.presentAlert('Couldn\'t create pdf. Try again!');
      });
    }
  }
  ionViewWillLeave() {
    if (this.ehealthSnapshotSub) {
      this.ehealthSnapshotSub.unsubscribe();
    }
  }
}
