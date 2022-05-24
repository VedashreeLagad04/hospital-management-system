import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarOptions, EventApi, FullCalendarComponent } from '@fullcalendar/angular';
import { Calendar, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AlertController, ModalController } from '@ionic/angular';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { CaseUpdateStatusPage } from '../client-case-profile/case-update-status/case-update-status.page';
declare let gapi: any;
import * as copy from 'copy-to-clipboard';
import * as _ from 'lodash';
@Component({
  selector: 'app-client-case-appointment-add',
  templateUrl: './client-case-appointment-add.page.html',
  styleUrls: ['./client-case-appointment-add.page.scss'],
})
export class ClientCaseAppointmentAddPage implements OnInit {
  public typeList = [];
  nameToSearch = '';
  public appointment: any = {
    type: ''
  };
  public loggedInUser: any;
  public toShowTypeDropdown = false;
  public step1 = true;
  public step2 = false;
  public mode = 'add';
  public appointmentId = '';
  public caseData: any;
  public calendar: any;
  public calendarEl: any;
  public doctorsLocation = [];
  public clinicLocations = [];
  public hospitalsLocation = [];
  public eventArray: EventInput[] = [];
  public dateSelected: string;
  public events: { googleCalendarId: string };
  public caseId: any;
  public startTime = {
    timeInFormat: '',
    time: '',
    timezone: '',
  };
  public endTime = {
    timeInFormat: '',
    time: '',
    timezone: '',
  };
  public isAuthorized: boolean;
  public addeventResult;
  public editEvent: boolean;
  public date = new Date();
  public eventInstance: any;
  public startDate: string;
  public endDate: string;
  public start: any;
  public end: any;
  public isClicked = {
    start: false,
    end: false,
  };
  public errorTitleMsg: string;
  public formValid: boolean;
  public errorTimeMsg: string;
  public toShowDoctorDropdown = false;
  public toShowLocationDropdown = false;
  public title: any;
  public doctorList: any[];
  public hospitalList: any[];
  public selectedDoctor: any;
  public internetCheckFlag = false;
  public googleEvent: any;
  public selectedEvent: any = {};
  public activeRouteSubscriber: any;
  public selectedHospital;
  selectedLocation: any;
  public prevTitle: any;
  patient: any
  constructor(public dataService: AppDataService,
    private firebase: FirebaseService,
    private activeRoute: ActivatedRoute,
    public alertController: AlertController,
    public modalController: ModalController,
    public router: Router) { }
  public ngOnInit() {
    this.dataService.mySubscription = this.dataService.createOnline$().subscribe(async (isOnline) => {
      if (isOnline === false) {
        this.internetCheckFlag = true;
        this.dataService.toastPresent('Internet disconnected');
      } else if (isOnline === true && this.internetCheckFlag) {
        // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
          return false;
        };
        this.ionViewDidEnter();
        this.dataService.toastPresent('Internet Connected');
        this.internetCheckFlag = false;
      }
    });
  }
  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy() {
    if (this.dataService.mySubscription) {
      this.dataService.mySubscription.unsubscribe();
    }
  }
  public ionViewDidEnter() {
    this.activeRouteSubscriber = this.activeRoute.params.subscribe((params) => {
      this.mode = params.mode;
      this.nameToSearch = '';
      this.loggedInUser = this.dataService.getUserData();
      this.appointmentId = params.id;
      this.caseData = this.dataService.getSelectedCase();
      this.patient = this.dataService.getPatientData();
      this.firebase.getTypeOfAppointment().subscribe((resp: any) => {
        this.typeList = [];
        if (resp.size > 0) {
          _.forEach(resp.docs, (doc) => {
            this.typeList.push({ type: doc.data().appointment, show: true, isSelected: false });
          });
          this.appointment.type = this.typeList[0].type;
          this.typeList[0].isSelected = true;
        } else {
          this.typeList = [
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
      this.getDoctor();
    });
  }
  public getData() {
    let obj;
    if (this.mode === 'add') {
      if (this.appointmentId === '-1') {
        if (this.calendar === undefined) {
          this.getEvents(this.caseData.id);
          this.calendarEl = document.getElementById('calendar');
          this.initCalendar();
        }
        this.step1 = true;
        this.step2 = false;
        this.editEvent = false;
        obj = {
          title: 'New Appointment',
          backPage: 'client-case-appointments/' + this.caseData.id,
        };
      } else {
        this.step1 = false;
        this.step2 = true;
        this.editEvent = true;
        obj = {
          title: 'Edit Appointment',
          backPage: 'client-case-appointments/' + this.caseData.id,
        };
        this.getAppoitmentData();
      }
    }
    this.dataService.setHeaderTitle(obj);
  }
  public getDoctor() {
    this.firebase.getDoctorsClinic().subscribe((resp) => {
      const data = [];
      if (resp.size !== 0) {
        resp.docs.forEach((element) => {
          const temp: any = element.data();
          temp.id = element.id;
          data.push(temp);
        });
        const doctorList = [];
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
          doctorList.push(temp);
        });
        this.doctorList = doctorList;
      }
      this.getFacilities();
    });
  }
  public getFacilities() {
    this.firebase.getFacility().subscribe(resp => {
      const data = [];
      if (resp.size !== 0) {
        resp.docs.forEach(element => {
          const temp: any = element.data();
          temp.id = element.id;
          temp.show = true;
          temp.isSelected = false;
          data.push(temp);
        });
        this.clinicLocations = data;
        const hospitalList = [];
        _.map(_.groupBy(data, 'code'), (vals, code) => {
          const location: any = [];
          let name: '';
          vals.forEach((el) => {
            name = el.name;
            location.push({ location: el.address, clinicCode: el.code });
          });
          const temp = {
            hospitalName: name,
            code,
            location,
            show: true
          };
          hospitalList.push(temp);
        });
        this.hospitalList = hospitalList;
      }
      this.getData();
    });
  }
  public getAppoitmentData() {
    this.firebase.getAppointment(this.appointmentId, this.caseData.id).subscribe((resp) => {
      this.appointment = resp.data();
      this.appointment.id = resp.id;
      this.startDate = this.appointment.startDate;
      this.startTime = this.appointment.startTime;
      this.endTime = this.appointment.endTime;
      this.start = this.appointment.startDate + 'T' + this.appointment.startTime.time;
      this.end = this.appointment.endDate + 'T' + this.appointment.endTime.time;
      this.endDate = this.appointment.endDate;
      const doc = _.find(this.doctorList, ['doctorCode', this.appointment.doctor]);
      this.prevTitle = this.appointment.title;
      const temp = this.appointment.title.split('-');
      this.title = temp[0] + '-' + temp[1];
      if (doc) {
        this.selectAppointmentDoctor(doc);
      } else {
        const hosp = _.find(this.hospitalList, ['code', this.appointment.doctor]);
        if (hosp) {
          this.selectAppointmentHospital(hosp);
        }
      }
      if (this.isAuthorized) {
        this.appointment.eventId = this.dataService.getGoogleId();
      }
    });
  }
  public makeAnAppointment() {
    if (this.isValid()) {
      this.appointment.agentId = this.loggedInUser.id;
      this.appointment.startTime = this.startTime;
      if (this.appointment.endTime === '') {
        this.appointment.endTime = this.startTime;
      } else {
        this.appointment.endTime = this.endTime;
      }
      this.appointment.clientId = this.caseData.clientId;
      this.appointment.caseId = this.caseData.id;
      const datestr = this.date.toString();
      this.appointment.lastUpdate = datestr;
      this.dataService.present().then((a) => {
        a.present();
        this.firebase.addAppointment(this.appointment).then((resp) => {
          if (resp.id) {
            this.appointment.id = resp.id;
            if (this.isAuthorized) {
              this.createnewGoogleEvent();
            }
            this.updateTimeline();
            const isCaseApproved = _.findIndex(this.caseData.caseStatus, (o: any) => o.status === 'Approved');
            this.dataService.dismiss();
            if (isCaseApproved > -1) {
              this.appointmentAlert();
            } else {
              this.dataService.presentAlertThenRoute('Appointment added successfully!', 'client-case-appointments/' + this.caseData.id);
            }
          } else {
            this.dataService.dismiss();
            this.dataService.presentAlert('Something went wrong!');
          }
        });
      });
    } else {
      this.dataService.presentAlert('Please complete the form to proceed');
    }
  }
  public validateTitle() {
    if (this.appointment.title !== undefined && this.appointment.title.length !== 0) {
      this.errorTitleMsg = '';
    } else {
      this.errorTitleMsg = 'Please enter title';
    }
  }
  public validateTime() {
    if (this.startTime && this.startTime.time.length !== 0) {
      this.errorTimeMsg = '';
    } else {
      this.errorTimeMsg = 'Please select time';
    }
  }
  public isValid() {
    this.validateTitle();
    this.validateTime();
    if (this.errorTitleMsg === '' && this.errorTimeMsg === '') {
      return true;
    } else {
      return false;
    }
  }
  public updateTimeline() {
    const newDate = this.appointment.startDate + 'T' + this.appointment.startTime.time;
    const timelineStatus: any = {
      date: new Date(newDate).toString(),
      activity: this.appointment.title,
      userType: this.loggedInUser.type,
      userId: this.loggedInUser.id,
      caseId: this.caseData.id,
    };
    let clientTimelineDetails; let clientTimelineId;
    this.firebase.getclientDetails(this.caseData.clientId).subscribe((resp) => {
      resp.docs.forEach((temp) => {
        clientTimelineDetails = temp.data();
        clientTimelineId = temp.id;
      });
      clientTimelineDetails.timeline.push(timelineStatus);
      this.firebase.editClientDetails(clientTimelineDetails, clientTimelineId);
    });
  }
  public updateEvent(event) {
    this.dataService.present().then((a) => {
      a.present();
      const datestr = this.date.toString();
      this.appointment.lastUpdate = datestr;
      this.appointment.startTime = this.startTime;
      this.appointment.endTime = this.endTime;
      this.firebase.editAppointment(this.appointment).then((resp) => {
        if (this.isAuthorized) {
          this.updateGoogleEvent(this.appointment);
        }
        let clientTimelineDetails: any; let clientTimelineId;
        this.firebase.getclientDetails(event.clientId).subscribe((res) => {
          res.docs.forEach((element) => {
            clientTimelineDetails = element.data();
            clientTimelineId = element.id;
          });
          const timelineEvent = _.findIndex(clientTimelineDetails.timeline, ['activity', this.prevTitle]);
          clientTimelineDetails.timeline[timelineEvent].activity = this.appointment.title;
          const newDate = this.appointment.startDate + 'T' + this.appointment.startTime.time;
          clientTimelineDetails.timeline[timelineEvent].date = new Date(newDate).toString();
          clientTimelineDetails.timeline[timelineEvent].userType = this.loggedInUser.type;
          clientTimelineDetails.timeline[timelineEvent].userId = this.loggedInUser.id;
          this.firebase.editClientDetails(clientTimelineDetails, clientTimelineId).then(el => {
            const page = 'client-case-appointments/' + this.caseData.id;
            this.dataService.presentAlertThenRoute('Appointment updated successfully!!', page);
            this.dataService.dismiss();
          });
        });
      });
    });
  }
  public closeDropdownAll() {
    this.toShowTypeDropdown = false;
    this.toShowDoctorDropdown = false;
    this.toShowLocationDropdown = false;
  }
  public showTypeDropdown($event) {
    $event.stopPropagation();
    if (this.mode !== 'view') {
      this.nameToSearch = '';
      // ? reset 'show' of all options to true
      this.typeList = this.dataService.searchFromDropdownList(this.typeList, this.nameToSearch, 'type');
      this.toShowTypeDropdown = !this.toShowTypeDropdown;
      this.toShowDoctorDropdown = false;
      this.toShowLocationDropdown = false;
    }
  }
  public selectAppointmentType(type) {
    this.appointment.location = '';
    this.selectedHospital = '';
    this.selectedDoctor = '';
    const prevType = this.appointment.type;
    this.appointment.type = type.type;
    this.toShowTypeDropdown = false;
    if ((prevType === 'Consultation' || prevType === 'Follow-Up')
      && (this.appointment.type !== 'Consultation' && this.appointment.type !== 'Follow-Up')) {
      this.appointment.consultationNo = 0;
    }
    this.appointment.doctor = '';
    this.appointment.locationCode = '';
    this.appendTitle();
  }
  public showDoctorDropdown($event) {
    $event.stopPropagation();
    if (this.mode !== 'view') {
      this.nameToSearch = '';
      this.doctorList = this.dataService.searchFromDropdownList(this.doctorList, this.nameToSearch, 'doctorName');
      this.hospitalList = this.dataService.searchFromDropdownList(this.hospitalList, this.nameToSearch, 'hospitalName');
      this.toShowDoctorDropdown = !this.toShowDoctorDropdown;
      this.toShowLocationDropdown = false;
      this.toShowTypeDropdown = false;
    }
  }
  public makeAppointmentTitle() {
    this.appointment.title = '';
    let user: any;
    this.firebase.getUserDetails(this.caseData.clientId).subscribe((resp) => {
      user = resp.data();
      const agentName = this.dataService.getClientNameInitials(this.loggedInUser.name);
      this.appointment.title = agentName + '-' + user.name;
      this.title = this.appointment.title;
      if (this.appointment.type) {
        this.appointment.title = this.appointment.title + '-' + this.appointment.type;
      }
    });
  }
  public appendTitle() {
    this.appointment.title = this.title;
    if (this.appointment.type && this.appointment.type.length !== 0) {
      if ((this.appointment.type === 'Consultation' || this.appointment.type === 'Follow-Up') && this.appointment.consultationNo) {
        let consultNo;
        if (this.appointment.consultationNo === '1') {
          consultNo = this.appointment.consultationNo + 'st';
        } else if (this.appointment.consultationNo === '2') {
          consultNo = this.appointment.consultationNo + 'nd';
        } else if (this.appointment.consultationNo === '3') {
          consultNo = this.appointment.consultationNo + 'rd';
        } else {
          consultNo = this.appointment.consultationNo + 'th';
        }
        this.appointment.title = this.appointment.title + '-' + consultNo + this.appointment.type;
      } else {
        this.appointment.title = this.appointment.title + '-' + this.appointment.type;
      }
    }
    // eslint-disable-next-line max-len
    // if ((this.appointment.type == "Admission" || this.appointment.type == "Discharge") && (this.appointment.location && this.appointment.location.length !== 0)) {
    //   this.appointment.title = this.appointment.title + '-' + this.appointment.location;
    // }
    // eslint-disable-next-line max-len
    if ((this.appointment.type === 'Consultation' || this.appointment.type === 'Follow-Up') && (this.appointment.locationCode && this.appointment.locationCode.length !== 0)) {
      this.appointment.title = this.appointment.title + '-' + this.appointment.locationCode;
    }
    if (this.appointment.doctor && this.appointment.doctor.length !== 0) {
      this.appointment.title = this.appointment.title + '-' + this.appointment.doctor;
    }
  }
  public selectAppointmentDoctor(doctor) {
    this.doctorsLocation = [];
    if (this.selectedDoctor && this.selectedDoctor !== doctor.doctorName) {
      this.appointment.location = '';
    }
    this.selectedDoctor = doctor.doctorName;
    this.appointment.doctor = doctor.doctorCode;
    this.doctorsLocation = doctor.location;
    this.toShowDoctorDropdown = false;
    this.selectedLocation = '';
    this.appointment.locationCode = '';
    this.appendTitle();
  }
  public selectAppointmentHospital(hospital) {
    this.hospitalsLocation = [];
    if (this.selectedHospital && this.selectedHospital !== hospital.hospitalName) {
      this.appointment.location = '';
    }
    this.selectedHospital = hospital.hospitalName;
    this.appointment.doctor = hospital.code;
    this.hospitalsLocation = hospital.location;
    this.toShowDoctorDropdown = false;
    this.selectedLocation = '';
    this.appendTitle();
  }
  public showLocationDropdown($event) {
    $event.stopPropagation();
    if (this.mode !== 'view') {
      this.nameToSearch = '';
      this.doctorsLocation = this.dataService.searchFromDropdownList(this.doctorsLocation, this.nameToSearch, 'location');
      this.hospitalsLocation = this.dataService.searchFromDropdownList(this.hospitalsLocation, this.nameToSearch, 'location');
      this.toShowLocationDropdown = !this.toShowLocationDropdown;
      this.toShowTypeDropdown = false;
      this.toShowDoctorDropdown = false;
    }
  }
  public selectAppointmentLocation(location) {
    this.selectedLocation = location.location;
    this.appointment.location = location.location;
    this.appointment.locationCode = location.clinicCode;
    this.toShowLocationDropdown = false;
    this.appendTitle();
  }
  public selectAppointmentAddress(location) {
    this.appointment.location = location.location;
    this.toShowLocationDropdown = false;
    this.appendTitle();
  }
  public getEvents(caseId) {
    this.eventArray = [];
    this.firebase.getAppointmentEvents(caseId).subscribe((resp) => {
      resp.docs.forEach((temp) => {
        const eventInstance: any = temp.data();
        const data = {
          id: temp.id,
          title: eventInstance.title,
          start: eventInstance.startDate + 'T' + eventInstance.startTime.time,
          end: eventInstance.endDate + 'T' + eventInstance.endTime.time,
          extendedProps: {
            location: eventInstance.location,
          },
        };
        eventInstance.id = temp.id;
        if (eventInstance) {
          this.eventArray.push(data);
          this.renderAgain(data);
        }
      });
    });
  }
  public renderAgain(arrayOb) {
    this.calendar.batchRendering(() => {
      this.calendar.changeView('dayGridMonth');
      this.calendar.addEvent(arrayOb);
    });
  }
  public initCalendar() {
    let allowed;
    this.calendar = new Calendar(this.calendarEl, {
      headerToolbar: {
        left: 'prev next title',
        center: '',
        right: '',
      },
      dayHeaderFormat: { weekday: 'short' },
      initialView: 'dayGridMonth',
      moreLinkClick: 'popover',
      plugins: [dayGridPlugin, interactionPlugin],
      weekends: true,
      editable: true,
      selectable: true,
      showNonCurrentDates: true,
      fixedWeekCount: false,
      height: 'auto',
      aspectRatio: 0.5,
      eventSources: [{
        events: this.eventArray,
        color: '#007aff',
        textColor: 'white',
      }],
      eventDisplay: 'list-item',
      eventTimeFormat: {
        hour: 'numeric',
        minute: '2-digit',
        meridiem: 'short'
      },
      eventOrder: 'start',
      dayMaxEvents: 3,
      dayPopoverFormat: { month: 'long', day: 'numeric', year: 'numeric' },
      eventClick: this.handleEventClick.bind(this),
      dateClick: this.handleDateClick.bind(this),
    });
    this.calendar.render();
  }
  public goToAppiontment() {
    this.step2 = false;
    this.step1 = true;
  }
  public goToAddAppiontment() {
    this.step1 = false;
    this.step2 = true;
  }
  public handleEventClick(info) {
    this.selectedEvent = info.event;
    this.selectedEvent.location = info.event.extendedProps.location;
    const apptime = this.dataService.formatMonth(this.selectedEvent.start);
    const apptimeEnd = this.dataService.formatMonth(this.selectedEvent.start);
    const weekDay = new Date(this.selectedEvent.start).toString().split(' ')[0];
    if (apptime === apptimeEnd) {
      this.selectedEvent.time = weekDay + ' ' + apptime + ' '
        + this.dataService.timeConverter(this.selectedEvent.start).timeInFormat + '-'
        + this.dataService.timeConverter(this.selectedEvent.end).timeInFormat;
    } else {
      this.selectedEvent.time = weekDay + ' ' + apptime + ' '
        + this.dataService.timeConverter(this.selectedEvent.start).timeInFormat + '-'
        + apptimeEnd + ' ' + this.dataService.timeConverter(this.selectedEvent.end).timeInFormat;
    }
    info.el.style.borderColor = 'red';
    const div = document.getElementById('selectedEvent');
    div.style.display = 'block';
    div.style.position = 'absolute';
    div.style.top = (info.jsEvent.pageY - 50) + 'px';
    if (info.jsEvent.pageX < 260) {
      div.style.left = (info.jsEvent.pageX - 80) + 'px';
    } else if (info.jsEvent.pageX > 800) {
      div.style.left = (info.jsEvent.pageX - 500) + 'px';
    } else {
      div.style.left = (info.jsEvent.pageX - 300) + 'px';
    }
  }
  public closeEventpopUp() {
    const div = document.getElementById('selectedEvent');
    this.selectedEvent = {};
    div.style.display = 'none';
  }
  public comingSoonAlert() {
    this.closeEventpopUp();
    this.dataService.presentAlert('Coming Soon...!');
  }
  public handleDateClick(info) {
    this.appointment = {
      type: this.typeList[0].type,
    };
    this.makeAppointmentTitle();
    this.dateSelected = info.dateStr;
    this.appointment.startDate = this.startDate = this.dateSelected;
    this.appointment.endDate = this.endDate = this.dateSelected;
    this.goToAddAppiontment();
  }
  public changeTimeFormat(time, type) {
    const nTime = new Date(time);
    const endTime = nTime.setHours(nTime.getHours() + 1);
    const temp = this.dataService.timeConverter(time);
    const tempEnd = this.dataService.timeConverter(endTime);
    if (type === 'start' && this.isClicked.start === true) {
      this.startTime = temp;
      this.endTime = tempEnd;
      this.end = this.appointment.endDate + 'T' + this.endTime.time;
    } else if (type === 'end' && this.isClicked.end === true) {
      if (this.appointment.startDate === this.appointment.endDate && temp.time <= this.startTime.time) {
        this.dataService.presentAlertConfirm('Confirm', 'End Time selected is not valid').then(() => {
          document.getElementById('endTimepicker').click();
        });
      } else {
        this.endTime = temp;
      }
    }
  }
  public clickedItem(click) {
    if (click === 'start') {
      this.isClicked.start = true;
      this.validateTime();
    } else {
      this.isClicked.end = true;
    }
  }
  public changeDateFormat(data, type) {
    data = data.split('T')[0];
    if (type === 'start') {
      this.appointment.startDate = data;
    } else {
      this.appointment.endDate = data;
    }
  }
  public handleClientLoad() {
    gapi.load('client:auth2', this.initClient());
  }
  public initClient() {
    gapi.client.init({
      apiKey: this.dataService.API_KEY,
      clientId: this.dataService.CLIENT_ID,
      discoveryDocs: this.dataService.DISCOVERY_DOCS,
      scope: this.dataService.SCOPES,
    }).then(() => {
      this.dataService.presentAlert('in google sync init function');
      const userLoggedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
      if (userLoggedIn) {
        this.dataService.presentAlert('already loggedIn User');
        this.isAuthorized = true;
        this.getGoogleEvent();
      } else {
        this.dataService.presentAlert('user is not loggedIn');
        this.isAuthorized = false;
        this.dataService.googleLogin().then((result) => {
          if (result) {
            this.isAuthorized = true;
            this.getGoogleEvent();
          }
        });
      }
    }, (error) => {
    });
    gapi.client.load('calendar', 'v3', () => { });
  }
  public getGoogleEvent() {
    gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 1,
      sharedExtendedProperty: 'id = ' + this.appointment.id,
    }).then((response) => {
      this.googleEvent = response.result.items[0];
    });
  }
  public createnewGoogleEvent() {
    const newEvent = {
      summary: 'PremiumCare:-' + this.appointment.title,
      location: this.appointment.location,
      description: this.appointment.comments,
      start: {
        dateTime: this.appointment.startDate + 'T' + this.appointment.startTime.time,
        timeZone: this.appointment.startTime.timezone,
      },
      end: {
        dateTime: this.appointment.endDate + 'T' + this.appointment.endTime.time,
        timeZone: this.appointment.endTime.timezone,
      },
      attendees: [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
      extendedProperties: {
        shared: {
          clientId: this.appointment.clientId,
          caseId: this.caseData.id,
          agentId: this.loggedInUser.id,
          id: this.appointment.id,
          type: this.appointment.type,
        },
      },
    };
    const request = gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: newEvent,
    });
    request.execute((result) => {
    });
  }
  public updateGoogleEvent(eventUp) {
    let event;
    event = this.googleEvent;
    event = {
      summary: this.appointment.title,
      location: this.appointment.location,
      type: this.appointment.type,
      description: this.appointment.comments,
      start: {
        dateTime: this.appointment.startDate + 'T' + this.appointment.startTime.time,
        timeZone: this.appointment.startTime.timezone,
      },
      end: {
        dateTime: this.appointment.endDate + 'T' + this.appointment.endTime.time,
        timeZone: this.appointment.endTime.timezone,
      },
    };
    const request = gapi.client.calendar.events.patch({
      calendarId: 'primary',
      eventId: eventUp.eventId,
      resource: event,
    });
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    request.execute(function () {
    });
  }
  public async appointmentAlert() {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Appointment Created',
        message: 'You can update case status now or skip to do it later',
        cssClass: 'alertDiv',
        buttons: [
          {
            text: 'Update Now',
            role: 'update',
            cssClass: 'secondary',
            handler: (update) => {
              resolve('update');
              this.openStatusModal();
            },
          }, {
            text: 'Skip',
            handler: (skip) => {
              const route = 'client-case-appointments/' + this.caseData.id;
              this.dataService.routeChange(route);
              resolve(skip);
            },
          },
        ],
      });
      await alert.present();
    });
  }
  public async openStatusModal() {
    const modalPage = await this.modalController.create({
      component: CaseUpdateStatusPage,
      backdropDismiss: false,
      cssClass: 'updateCaseStatus-modal',
      componentProps: {
        case: this.caseData,
      },
    });
    modalPage.onDidDismiss().then((resp) => {
      if (this.caseData.currentStatus !== 'Admitted' && this.caseData.currentStatus !== 'Discharge') {
        const route = 'client-case-appointments/' + this.caseData.id;
        if (resp.data.data === true) {
          this.dataService.presentAlertThenRoute('Case status updated successfully!', route);
        } else {
          this.dataService.presentAlertThenRoute('Appointment added successfully!', route);
        }
      } else {
        if (resp.data.data === true) {
          this.dataService.presentAlert('Case status updated successfully!');
        } else {
          this.dataService.presentAlert('Appointment added successfully!');
        }
      }
    });
    await modalPage.present();
  }
  public copyToClipBoard(event) {
    copy(document.getElementById('copy-info').innerText);
    this.dataService.presentAlert('Copied to clipboard');
  }
  public ionViewDidLeave() {
    if (this.activeRouteSubscriber) {
      this.activeRouteSubscriber.unsubscribe();
    }
  }
}
