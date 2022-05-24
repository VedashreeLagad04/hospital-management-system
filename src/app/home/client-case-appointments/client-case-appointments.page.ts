import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { ModalController } from '@ionic/angular';
import * as _ from 'lodash';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { environment } from 'src/environments/environment';
import { CreateMemoModalPage } from './create-memo-modal/create-memo-modal.page';
declare var gapi: any;
@Component({
  selector: 'app-client-case-appointments',
  templateUrl: './client-case-appointments.page.html',
  styleUrls: ['./client-case-appointments.page.scss'],
})
export class ClientCaseAppointmentsPage implements OnInit {
  isWeb = environment.isWeb;
  public caseId: string;
  public caseData: any;
  public isAuthorized: boolean;
  public GoogleAuth; // Google Auth object.
  public currentApiRequest;
  public errors: any;
  public events: any;
  public eventInstance: any;
  public eventArray: any = [];
  public openActionDiv = [];
  public timeline: any = [];
  public message;
  public subject;
  public file: string;
  public link: string;
  public internetCheckFlag = false;
  public routeParams: any;
  clientDetails: any;
  constructor(private activeRoute: ActivatedRoute,
    private firebaseService: FirebaseService,
    private socialSharing: SocialSharing,
    private dataService: AppDataService,
    private router: Router,
    private modalController: ModalController) { }
  public ngOnInit() {
    this.dataService.mySubscription = this.dataService.createOnline$().subscribe(async isOnline => {
      if (isOnline === false) {
        this.internetCheckFlag = true;
        this.dataService.toastPresent('Internet disconnected');
      } else if (isOnline === true && this.internetCheckFlag) {
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
          return false;
        };
        // add your code you want to perform on re-loading page here
        this.ionViewDidEnter();
        this.dataService.toastPresent('Internet Connected');
        this.internetCheckFlag = false;
      }
    });
  }
  public ngOnDestroy() {
    if (this.dataService.mySubscription) {
      this.dataService.mySubscription.unsubscribe();
    }
  }
  public ionViewDidLeave() {
    this.eventArray = [];
    if (this.routeParams) {
      this.routeParams.unsubscribe();
    }
  }
  public ionViewDidEnter() {
    this.eventArray = [];
    this.dataService.present().then((a) => {
      a.present();
      const obj = {
        title: 'Appointments',
        backPage: 'client-case-profile',
      };
      this.dataService.setHeaderTitle(obj);
      this.routeParams = this.activeRoute.paramMap.subscribe((params) => {
        this.caseId = params.get('id');
        this.caseData = this.dataService.getSelectedCase();
        this.clientDetails = this.dataService.getPatientData();
        this.getEvents();
        this.getTimelineDetails();
      });
      // this.handleClientLoad();
    });
  }
  public getTimelineDetails() {
    this.timeline = [];
    this.firebaseService.getclientDetails(this.caseData.clientId).subscribe((resp) => {
      resp.docs.forEach((temp) => {
        const data: any = temp.data();
        console.log('data: ', data);
        const timelineComplete = data.timeline;
        _.map(timelineComplete, (a) => {
          if (a.caseId === this.caseData.id) {
            a.firstEvent = false;
            this.timeline.push(a);
          }
        });
        //  = _.map(, ['caseId', this.caseData.id]);
        this.timeline = this.timeline.sort().reverse();
        this.timeline.forEach((events) => {
          const newDate = new Date(events.date).toString().split(' ');
          events.date = newDate[2] + ' ' + newDate[1] + ' ' + newDate[3];
          events.time = this.timeConverter24(newDate[4]);
        });
        this.timeline = this.timelineByDate(this.timeline);
      });
      this.dataService.dismiss();
    }, (err) => {
      this.dataService.dismiss();
    });
  }
  public openAction($event, i) {
    $event.stopPropagation();
    this.closeAllAction();
    // 
    if (this.eventArray[i]) {
      this.eventArray[i].showAction = true;
    }
  }
  public closeAllAction() {
    for (let i = 0; i < this.eventArray.length; i++) {
      this.eventArray[i].showAction = false;
    }
  }
  public timelineByDate(list) {
    let event: any = [];
    _.map(_.groupBy(list, 'date'), function (vals, id) {
      const temp: any = {};
      temp.date = id;
      temp.value = vals;
      event.push(temp);
    });
    event = this.sortTimeLine(event);
    event[0].firstEvent = true;
    return event;
  }
  public sortTimeLine(events) {
    events = events.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA < dateB) {
        return 1;
      } else {
        return -1;
      }
    });
    return events;
  }
  public timeConverter24(time24) {
    let h, H, ts;
    ts = time24;
    H = +ts.substr(0, 2);
    h = (H % 12) || 12;
    h = (h < 10) ? ('0' + h) : h;  // leading 0 at the left for 1 digit hours
    const ampm = H < 12 ? ' AM' : ' PM';
    ts = h + ts.substr(2, 3) + ampm;
    return ts;
  }
  public changeRoute(pageName, appointmentId, eventId) {
    let page;
    if (pageName === 'add') {
      page = '/client-case-appointment-add/add/-1';
    } else if (pageName === 'view') {
      page = '/client-case-appointment-add/view/' + appointmentId;
    } else if (pageName === 'edit') {
      if (eventId) {
        this.dataService.setGoogleId(eventId);
      } else {
        this.dataService.setGoogleId('');
      }
      page = '/client-case-appointment-add/add/' + appointmentId;
    }
    this.dataService.routeChange(page);
  }
  // ? functions for db calendar
  // ? get events from db calendar
  public getEvents() {
    this.eventArray = [];
    this.firebaseService.getAppointmentEvents(this.caseId).subscribe((resp) => {
      resp.docs.forEach((temp) => {
        this.eventInstance = temp.data();
        this.eventInstance.id = temp.id;
        if (this.eventInstance) {
          this.eventInstance.showAction = false;
          const date = this.dataService.formatDateAndMonth(this.eventInstance.startDate);
          this.eventInstance.showStartDate = date.split('/')[0];
          this.eventArray.push(this.eventInstance);
        }
      });
      this.eventArray = _.orderBy(this.eventArray, [(evt) => new Date(evt.startDate)], ['desc']);
    });
  }
  // ? delete event from db calendar
  public deleteApppointment($event, event, index) {
    $event.stopPropagation();
    this.closeAllAction();
    // tslint:disable-next-line: max-line-length
    this.dataService.presentAlertConfirm('Delete Appointment', 'This action cannot be reversed. Are you sure you want to delete?').then((resp) => {
      if (resp === 'ok') {
        this.firebaseService.deleteAppointment(event.id).then(() => {
          this.eventArray.splice(index, 1);
          this.updateTimelineEvent(event);
          // this.listUpcomingEvents();
          // gapi.client.events.delete('primary', appointmentId);
          // const userLoggedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
          // if (userLoggedIn) {
          //   // ? delete event from google calendar
          //   this.googleDelete(event.eventId);
          // }
          // this.getEvents();
        });
      } else {
        // this.dataService.presentAlertMessage('Canceled', ' Delete event is canceld');
      }
    });
  }
  updateTimelineEvent(event) {
    let clientTimelineDetails: any, clientTimelineId;
    this.firebaseService.getclientDetails(event.clientId).subscribe((resp) => {
      resp.docs.forEach((element) => {
        clientTimelineDetails = element.data();
        clientTimelineId = element.id;
      });
      const timelineEvent = _.findIndex(clientTimelineDetails.timeline, ['activity', event.title]);
      clientTimelineDetails.timeline[timelineEvent].activity = clientTimelineDetails.timeline[timelineEvent].activity + '- Deleted ';
      this.firebaseService.editClientDetails(clientTimelineDetails, clientTimelineId).then(el => {
        this.getTimelineDetails();
      });
    });
  }
  // ? functions for google calendar
  public handleClientLoad() {
    this.eventArray = [];
    gapi.load('client:auth2', this.initClient());
  }
  /* Sign out the user upon button click.        */
  public handleSignoutClick(event) {
    this.dataService.presentAlertConfirm('Logout', 'Are you sure you want to stop syncing with google calendar?').then((resp) => {
      if (resp === 'ok') {
        gapi.auth2.getAuthInstance().signOut().then(() => {
          this.eventArray = [];
          this.getEvents();
        });
      }
    });
  }
  // ? sync with google
  public checkSyncStatus() {
    if (this.caseData.allowGoogleCalendar === false || this.caseData.allowGoogleCalendar === undefined) {
      this.dataService.presentAlertPrompt('Sign In', 'Do you want to sync events to google calendar??').then((resp) => {
        if (resp !== 'cancel') {
          this.dataService.googleLogin().then((result) => {
            if (resp && result) {
              this.caseData.allowGoogleCalendar = true;
              this.firebaseService.editCase(this.caseData).then(() => {
                this.listUpcomingEvents();
              });
            } else if (resp === false && result) {
              this.listUpcomingEvents();
            }
          });
          // ? never show is true
        } else {
          this.caseData.allowGoogleCalendar = false;
          this.firebaseService.editCase(this.caseData).then(() => {
            this.getEvents();
          });
        }
      });
    } else {
      this.listUpcomingEvents();
    }
  }
  // ? google init
  public initClient() {
    gapi.client.init({
      apiKey: this.dataService.API_KEY,
      clientId: this.dataService.CLIENT_ID,
      discoveryDocs: this.dataService.DISCOVERY_DOCS,
      scope: this.dataService.SCOPES,
    }).then(() => {
      this.updateSigninStatus();
    }, (error) => {
      this.errors.append(JSON.stringify(error, null, 2));
    });
    gapi.client.load('calendar', 'v3', () => { });
  }
  public updateSigninStatus() {
    const userLoggedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
    if (userLoggedIn) {
      this.isAuthorized = true;
      this.listUpcomingEvents();
    } else {
      this.isAuthorized = false;
      this.checkSyncStatus();
    }
  }
  // ? get events from google calendar
  public listUpcomingEvents() {
    gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: 'startTime',
      sharedExtendedProperty: 'caseId = ' + this.caseId,
    }).then((response) => {
      this.events = response.result.items;
      // this.getCalendarEvents(this.events);
    });
  }
  public compareDateToUpdate(dbdate, googledate) {
    let indiaTime, d1, d2, updateEvent;
    indiaTime = new Date(googledate).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    d2 = new Date(indiaTime);
    d1 = new Date(dbdate); // yyyy-mm-dd hh:mm:ss
    if (d1 > d2) {
      // db is updated recently
      updateEvent = 'google';
    } else if (d1 < d2) {
      // google is updated recently
      updateEvent = 'db';
    } else {
      // both are same
      updateEvent = 'none';
    }
    return updateEvent;
  }
  public eventsAfterDay(arrayE) {
    const date = new Date();
    const dateS = date.toString();
    const today = this.dataService.formatDate(dateS);
    let mm = date.getMonth();
    mm = mm + 1;
    const dateT = dateS.split(' ')[3] + '-' + mm + '-' + dateS.split(' ')[2];
    const time = dateS.split(' ')[4];
    const futureEvents = [], pastEvents = [];
    let result;
    arrayE.some(function (el) {
      if (Date.parse(el.startDate) > Date.parse(dateT)) {
        futureEvents.push(el);
      } else {
        pastEvents.push(el);
      }
    });
    // this.eventArray = pastEvents;
    return futureEvents;
  }
  public getCalendarEvents(events) {
    this.eventInstance = {};
    this.firebaseService.getAppointmentEvents(this.caseId).subscribe((resp) => {
      resp.docs.forEach((temp) => {
        this.eventInstance = temp.data();
        this.eventInstance.id = temp.id;
        if (this.eventInstance) {
          this.eventArray.push(this.eventInstance);
        }
      });
      const nextDateEvent = this.eventsAfterDay(this.eventArray);
      if (events.length !== nextDateEvent.length) {
        nextDateEvent.forEach((el) => {
          const find = _.find(events, ['id', el.id]);
          if (find === undefined) {
            this.addToGoogle(el).then((res) => {
              if (res) {
                el.eventId = res;
                this.eventArray.push(el);
              }
            });
          } else {
            this.eventArray.push(el);
          }
        });
      }
      events.forEach((element) => {
        const checkType = element.summary.split(':-')[0];
        if (checkType && checkType === 'PremiumCare') {
          const appointmentId = element.extendedProperties.shared.id;
          const find2 = _.find(this.eventArray, ['id', appointmentId]);
          if (find2 !== undefined) {
            find2.eventId = element.id;
            this.eventInstance = find2;
            this.eventInstance.link = element.htmlLink;
          }
          const newArr = _.map(this.eventArray, (a) => {
            return a.id === find2.id ? find2 : a;
          });
          const result = this.compareDateToUpdate(this.eventInstance.lastUpdate, element.updated);
          if (result === 'db') {
            this.updateDbEvent(element, this.eventInstance);
          }
          if (this.eventInstance) {
          }
        }
      });
    });
  }
  // ? delete event from google calendar
  public googleDelete(eventId) {
    const request = gapi.client.calendar.events.delete({
      calendarId: 'primary',
      eventId
    });
    request.execute(() => {
      this.eventArray = [];
      this.dataService.presentAlertMessage('Delete', 'Event deleted successfully!');
      this.listUpcomingEvents();
    });
  }
  public updateDbEvent(event, dbEvent) {
    const endTime = this.AmPmConvert(event.end.dateTime, 'db');
    const startTime = this.AmPmConvert(event.start.dateTime, 'db');
    const sT = this.dataService.timeConverter(event.start.dateTime);
    const eT = this.dataService.timeConverter(event.end.dateTime);
    this.dataService.present().then((a) => {
      a.present();
      // event: from google
      if (event.description) {
        dbEvent.comments = event.description;
      }
      dbEvent.endDate = endTime.date;
      dbEvent.endTime = eT;
      dbEvent.eventId = event.id;
      dbEvent.id = event.extendedProperties.shared.id;
      dbEvent.lastUpdate = event.updated;
      if (event.location) {
        dbEvent.location = event.location;
      }
      dbEvent.startDate = startTime.date;
      dbEvent.startTime = sT;
      dbEvent.title = event.summary.split(':-')[1];
      dbEvent.type = event.extendedProperties.shared.type;
      this.firebaseService.editAppointment(dbEvent).then(() => {
        this.dataService.dismiss();
      });
    });
  }
  public AmPmConvert(time, formatType) {
    let newTime;
    if (formatType === 'db') {
      let tt;
      const date = time.split('T')[0];
      tt = time.split('T')[1];
      tt = tt.split('+')[0];
      newTime = {
        date,
        time: tt,
      };
    } else if (formatType === 'google') {
      let hh = time.split(':')[0];
      let mm = time.split(':')[1];
      mm = mm.split(' ')[0];
      const AMPM = mm.split(' ')[1];
      if (AMPM === 'PM' && hh < 12) { hh = hh + 12; }
      if (AMPM === 'AM' && hh === 12) { hh = hh - 12; }
      newTime = hh + ':' + mm + ':00';
    }
    return newTime;
  }
  public async addToGoogle(event) {
    const newEvent = {
      description: event.comments,
      end: { dateTime: event.endDate + 'T' + event.endTime.time, timeZone: event.endTime.timezone },
      extendedProperties: {
        shared: {
          agentId: event.agentId,
          caseId: event.caseId,
          clientId: event.clientId,
          id: event.id,
          type: event.type,
        },
      },
      location: event.location,
      start: { dateTime: event.startDate + 'T' + event.startTime.time, timeZone: event.startTime.timezone },
      summary: 'PremiumCare:-' + event.title,
    };
    let resultData;
    const request = gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: newEvent,
    });
    await request.execute((result) => {
      resultData = result.id;
    });
    return resultData;
  }
  // ? code for sharing
  public shareSocialMedia(event) {
    let user: any = {};
    this.firebaseService.getUserDetails(event.clientId).subscribe(res => {
      user = res.data();
      this.subject = 'PremiumCare Appointment';
      this.message = 'Hello ' + user.name + ', you have booked appointment for ' + event.type +
        ' on date ' + event.startDate + ' - ' + event.startTime.timeInFormat + ' At '
        + event.location + ', Thank You ';
      this.socialSharing.share(this.message, this.subject, this.file, this.link)
        .then(() => {
        })
        .catch(() => {
        });
    });
  }
  public async openMemoModal(event, appointmentData) {
    event.stopPropagation();
    this.closeAllAction();
    const modalPage = await this.modalController.create({
      component: CreateMemoModalPage,
      backdropDismiss: false,
      cssClass: 'create-memo-modal',
      componentProps: {
        appointment: appointmentData,
        // ? data you want to send to modal
      },
    });
    modalPage.onDidDismiss().then((resp) => {
      if (resp.data.data === true) {
        this.dataService.presentAlertMessage('Consultation Memo', 'Added new memo successfully!');
      }
    });
    await modalPage.present();
  }
}