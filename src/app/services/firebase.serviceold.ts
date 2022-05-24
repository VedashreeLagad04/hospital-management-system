import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import * as _ from 'lodash';
/* import { Item } from './item'; */
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppDataService } from './app-data.service';
@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  public usersCollection: AngularFirestoreCollection<any>;
  public clientDetailsCollection: AngularFirestoreCollection<any>;
  public caseCollection: AngularFirestoreCollection<any>;
  public appointmentCollection: AngularFirestoreCollection<any>;
  public staticDetailsCollection: AngularFirestoreCollection<any>;
  public medicalConditionCollection: AngularFirestoreCollection<any>;
  public ehealthCollection: AngularFirestoreCollection<any>;
  public consentCollection: AngularFirestoreCollection<any>;
  public admissionCollection: AngularFirestoreCollection<any>;
  public cases: Observable<any[]>;
  public users: Observable<any[]>;
  public clientDetails: Observable<any[]>;
  public appointments: Observable<any[]>;
  public clientDetailsDoc: AngularFirestoreDocument<any>;
  public usersDoc: AngularFirestoreDocument<any>;
  public caseDoc: AngularFirestoreDocument<any>;
  public appointmentDoc: AngularFirestoreDocument<any>;
  public admissionDoc: AngularFirestoreDocument<any>;
  public ehealthDoc: AngularFirestoreDocument<any>;
  public medicalDoc: AngularFirestoreDocument<any>;
  invoiceCollection: AngularFirestoreCollection<unknown>;
  constructor(public afs: AngularFirestore) {
    this.usersCollection = afs.collection(environment.usersCollectionName);
    this.clientDetailsCollection = afs.collection(environment.clientDetailsCollectionName);
    this.caseCollection = afs.collection(environment.casesCollectionName);
    this.appointmentCollection = afs.collection(environment.appointmentCollectionName);
    this.staticDetailsCollection = afs.collection(environment.staticDetailsCollectionName);
    this.medicalConditionCollection = afs.collection(environment.medicalConditionCollectionName);
    this.ehealthCollection = afs.collection(environment.ehealthCollectionName);
    this.consentCollection = afs.collection(environment.consentCollectionName);
    this.admissionCollection = afs.collection(environment.admissionCollectionName);
    this.invoiceCollection = afs.collection(environment.invoiceCollectionName);
    /* this.itemsCollection = afs.collection(environment.usersCollectionName);
    this.items = this.itemsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Item;
        data.id = a.payload.doc.id;
        return data;
      });
    })); */
  }
  // get users by their specific type
  public getUsers(type) {
    // type is user type you want to fetch
    // tslint:disable-next-line: max-line-length
    return this.afs.collection(environment.usersCollectionName, (ref) => ref.where('type', '==', type)).snapshotChanges().pipe(map((changes) => {
      return changes.map((a) => {
        let data: any;
        data = a.payload.doc.data();
        data.id = a.payload.doc.id;
        return data;
      });
    }));
  }// get users by their specific type
  public getUsersByAgent(type, agentId) {
    return this.afs.collection(environment.usersCollectionName, (ref) => ref.where('type', '==', type)
      .where('assignedToAgentId', '==', agentId)).snapshotChanges().pipe(map((changes) => {
        return changes.map((a) => {
          let data: any;
          data = a.payload.doc.data();
          data.id = a.payload.doc.id;
          return data;
        });
      }));
  }
  public getCasesAssignedToAgent(agentId) {
    return this.afs.collection(environment.casesCollectionName, (ref) => ref
      .where('assignTo', 'array-contains', agentId))
      .snapshotChanges().pipe(map((changes) => {
        return changes.map((a) => {
          let data: any;
          data = a.payload.doc.data();
          data.id = a.payload.doc.id;
          return data;
        });
      }));
  }
  public getCaseListAssignedToAgent(clientId, agentId) {
    return this.afs.collection(environment.casesCollectionName, (ref) => ref
      .where('clientId', '==', clientId)
      .where('assignTo', 'array-contains', agentId))
      .snapshotChanges().pipe(map((changes) => {
        return changes.map((a) => {
          let data: any;
          data = a.payload.doc.data();
          data.id = a.payload.doc.id;
          return data;
        });
      }));
  }
  public getUserByEmail(email) {
    return this.afs.collection(environment.usersCollectionName, (ref) => ref.where('email', '==', email)).get();
  }
  // get last accountId
  public getLastAccountId() {
    return new Promise((resolve, reject) => {
      const item = this.afs.collection(environment.usersCollectionName, (ref) => ref.orderBy('accountId', 'desc').limit(1)).get();
      item.subscribe((res) => {
        let newId = 100000;
        // res.docs.length
        if (res.size !== 0) {
          if (res.size > 1) {
          } else {
            const newData = res.docs[0].data();
            newId = newData.accountId + 1;
          }
        }
        resolve(newId);
      }, (err) => {
        reject(err);
      });
    });
  }
  //  new user insertion
  public addUser(data) {
    return this.usersCollection.add(data);
  }
  // user ehealthbook insertion
  public addClientDetails(data) {
    return this.clientDetailsCollection.add(data);
  }
  // delete existing user
  public deleteUser(id) {
    this.usersDoc = this.afs.doc(environment.usersCollectionName + '/' + id);
    return this.usersDoc.delete();
  }
  // update existing User
  public editUser(data) {
    this.usersDoc = this.afs.doc(environment.usersCollectionName + '/' + data.id);
    return this.usersDoc.update(data);
  }
  // update existing User
  public editClientDetails(data, docId) {
    this.clientDetailsDoc = this.afs.doc(environment.clientDetailsCollectionName + '/' + docId);
    return this.clientDetailsDoc.update(data);
  }
  // id specific record from user
  public getUserDetails(id) {
    return this.usersCollection.doc(id).get();
  }
  // ? get client details based on nric
  public getClientDetailsByNric(nric) {
    return this.afs.collection(environment.usersCollectionName, (ref) => ref.where('nric', '==', nric)).get();
  }
  // id specific record from clientDetails
  public getclientDetails(id) {
    return this.afs.collection(environment.clientDetailsCollectionName, (ref) => ref.where('clientId', '==', id)).get();
  }
  /* // get specific field or data from id
  getspecificdata(datafield, id) {
    return this.usersCollection.doc(id).get();
  } */
  // login function
  public login(email, password) {
    // tslint:disable-next-line: max-line-length
    return this.afs.collection(environment.usersCollectionName, (ref) => ref.where('email', '==', email).where('password', '==', password)).get();
  }
  // check is email present?
  public isAlreadyPresent(field, fieldValue) {
    return this.afs.collection(environment.usersCollectionName, (ref) => ref.where(field, '==', fieldValue)).get();
  }
  // ? get cases for client
  public getCase(id) {
    return this.afs.collection(environment.casesCollectionName, (ref) => ref.where('clientId', '==', id)).get();
  }
  // ? below function gets only one case using caseid
  public getOneCase(id) {
    // return this.caseCollection.doc(id).get();
    return this.afs.doc(environment.casesCollectionName + '/' + id).snapshotChanges().pipe(
      map((doc: any) => {
        const data: any = doc.payload.data();
        // tslint:disable-next-line: no-shadowed-variable
        const id = doc.payload.id;
        data.id = id;
        return data;
      }));
  }
  public addCase(caseDetails) {
    return this.caseCollection.add(caseDetails);
  }
  public addEhealthBooklet(booklet) {
    return this.ehealthCollection.add(booklet);
  }
  public addMedicalDoc(data) {
    return this.medicalConditionCollection.add(data);
  }
  public addConsentDoc(data) {
    return this.consentCollection.add(data);
  }
  public editCase(caseDetails) {
    this.caseDoc = this.afs.doc(environment.casesCollectionName + '/' + caseDetails.id);
    return this.caseDoc.update(caseDetails);
  }
  // add appointment
  public addAppointment(appData) {
    return this.appointmentCollection.add(appData);
  }
  // get appointment
  public getAppointment(id, caseId) {
    //  return this.appointmentCollection.doc(id).get();
    // tslint:disable-next-line: max-line-length
    return this.afs.collection(environment.appointmentCollectionName, (ref) => ref.where('caseId', '==', caseId).orderBy('startDate')).doc(id).get();
  }
  public getAppointmentEvents(caseId) {
    return this.afs.collection(environment.appointmentCollectionName, (ref) => ref.where('caseId', '==', caseId)).get();
  }
  // getAppointmentEventsAfterToday(dateTime, caseId) {
  // tslint:disable-next-line: max-line-length
  //   return this.afs.collection(environment.appointmentCollectionName, ref => ref.where('caseId', '==', caseId).where('startDate', '>', date)..where('startTime', '>', time)).get();
  // }
  public editAppointment(event) {
    const eventDoc = this.afs.doc(environment.appointmentCollectionName + '/' + event.id);
    return eventDoc.update(event);
  }
  public deleteAppointment(id) {
    this.usersDoc = this.afs.doc(environment.appointmentCollectionName + '/' + id);
    return this.usersDoc.delete();
  }
  public getPendingCases() {
    // ? subscribe snapshot changes
    return this.afs.collection(environment.casesCollectionName, (ref) => ref
      .where('currentStatus', '==', 'Pending Approval')).snapshotChanges().pipe(map((changes) => {
        return changes.map((a) => {
          let data: any;
          data = a.payload.doc.data();
          data.id = a.payload.doc.id;
          return data;
        });
      }));
  }
  public getCountries() {
    return this.staticDetailsCollection.get();
  }
  public getAllAdmissions() {
    return this.admissionCollection.snapshotChanges().pipe(map((changes) => {
      return changes.map((a) => {
        let data: any;
        data = a.payload.doc.data();
        data.id = a.payload.doc.id;
        return data;
      });
    }));
  }
  public getAdmission(caseId) {
    // return this.afs.collection(environment.admissionCollectionName, (ref) => ref.where('caseId', '==', caseId)).get();
    return this.afs.collection(environment.admissionCollectionName, (ref) => ref.where('caseId', '==', caseId)).snapshotChanges().pipe(map((changes) => {
      return changes.map((a) => {
        let data: any;
        data = a.payload.doc.data();
        data.admissionId = a.payload.doc.id;
        return data;
      });
    }));
  }
  public addAdmission(admissionData) {
    return this.admissionCollection.add(admissionData);
  }
  public editAdmission(admissionData) {
    this.admissionDoc = this.afs.doc(environment.admissionCollectionName + '/' + admissionData.admissionId);
    return this.admissionDoc.update(admissionData);
  }
  public getEhealth(caseId) {
    // return this.afs.collection(environment.ehealthCollectionName, (ref) => ref.where('caseId', '==', caseId)).get();
    // tslint:disable-next-line: max-line-length
    return this.afs.collection(environment.ehealthCollectionName, (ref) => ref.where('caseId', '==', caseId)).snapshotChanges().pipe(map((changes) => {
      return changes.map((a) => {
        let data: any;
        data = a.payload.doc.data();
        data.id = a.payload.doc.id;
        return data;
      });
    }));
  }
  public editEhealth(policy) {
    this.ehealthDoc = this.afs.doc(environment.ehealthCollectionName + '/' + policy.id);
    return this.ehealthDoc.update(policy);
  }
  public getMedicalId(caseId) {
    return this.afs.collection(environment.medicalConditionCollectionName, (ref) => ref.where('caseId', '==', caseId)).get();
  }
  public editMedical(data) {
    const medicalDoc = this.afs.doc(environment.medicalConditionCollectionName + '/' + data.id);
    return medicalDoc.update(data);
  }
  public getAllCases() {
    // return this.caseCollection.get();
    return this.caseCollection.snapshotChanges().pipe(map((changes) => {
      return changes.map((a) => {
        let data: any;
        data = a.payload.doc.data();
        data.id = a.payload.doc.id;
        data.show = true;
        return data;
      });
    }));
  }
  public getAllPatients() {
    return this.afs.collection(environment.usersCollectionName, (ref) => ref.where('type', '==', 'client')).get();
  }
  // get last CaseNumber
  public getLastCaseNumber() {
    return new Promise((resolve, reject) => {
      const item = this.afs.collection(environment.casesCollectionName, (ref) => ref.orderBy('caseNumber', 'desc').limit(1)).get();
      item.subscribe((res) => {
        let newId = 800001;
        // res.docs.length
        if (res.size !== 0) {
          if (res.size > 1) {
          } else {
            const newData = res.docs[0].data();
            newId = newData.caseNumber + 1;
          }
        }
        resolve(newId);
      }, (err) => {
        reject(err);
      });
    });
  }
  public getLastAdmissionId() {
    return new Promise((resolve, reject) => {
      const item = this.afs.collection(environment.admissionCollectionName, (ref) => ref.orderBy('case.admissionNumber', 'desc').limit(1)).get();
      // const item = this.admissionCollection.get();
      item.subscribe((res) => {
        const today = new Date();
        let year;
        year = today.getFullYear();
        year = year.toString().substr(-2);
        let month;
        month = today.getMonth();
        month = (month + 1).toString();
        if (month.length === 1) {
          month = '0' + month;
        }
        let newId;
        newId = year + month + '0001';
        // tslint:disable-next-line: one-variable-per-declaration
        let lastId, lastMonth, lastYear;
        lastId = '0000';
        lastMonth = '';
        lastYear = '';
        const admissionArr = [];
        res.docs.forEach((data) => {
          const temp: any = data.data();
          admissionArr.push(temp);
        });
        _.forEach(admissionArr, (admission) => {
          // tslint:disable-next-line: variable-name
          let number: string;
          let admissionyear;
          let admissionmonth;
          if (admission.case && admission.case.admissionNumber) {
            admissionyear = admission.case.admissionNumber.substr(0, 2);
            admissionmonth = admission.case.admissionNumber.substr(2, 2);
            number = admission.case.admissionNumber.substr(4);
            if (admissionyear === year) {
              if (admissionmonth === month) {
                // ? find max value of admission number
                // tslint:disable-next-line: radix
                if (parseInt(number) > parseInt(lastId)) {
                  lastId = number;
                }
              }
            }
          }
        });
        lastId = (Number(lastId) + 1).toString();
        if (lastId.length === 1) {
          lastId = '000' + lastId;
        } else if (lastId.length === 2) {
          lastId = '00' + lastId;
        } else if (lastId.length === 3) {
          lastId = '0' + lastId;
        }
        newId = year + month + lastId;
        // tslint:disable-next-line: radix
        // res.docs.length
        // if (res.size !== 0) {
        //   if (res.size > 1) {
        //     
        //   } else {
        //     const newData = res.docs[0].data();
        //     
        //     // newId = newData.accountId + 1;
        //   }
        // }
        resolve(newId);
      }, (err) => {
        reject(err);
      });
    });
  }
  // invoices
  public getLastInvoiceNumber() {
    return new Promise((resolve, reject) => {
      const item = this.afs.collection(environment.invoiceCollectionName, (ref) => ref.orderBy('invoiceNumber', 'desc').limit(1)).get();
      item.subscribe((res) => {
        let newId = 20000001;
        // res.docs.length
        if (res.size !== 0) {
          if (res.size > 1) {
          } else {
            const newData = res.docs[0].data();
            newId = newData.invoiceNumber + 1;
          }
        }
        resolve(newId);
      }, (err) => {
        reject(err);
      });
    });
  }
  public getInvoices(id) {
    // return this.invoiceCollection.doc(id).get();
    return this.afs.collection(environment.invoiceCollectionName, (ref) => ref.where('agentId', '==', id)).get();
  }
  public addInvoice(invoice) {
    return this.invoiceCollection.add(invoice);
  }
  public deleteInvoice(id) {
    this.usersDoc = this.afs.doc(environment.invoiceCollectionName + '/' + id);
    return this.usersDoc.delete();
  }
  // update existing User
  public editInvoice(data) {
    this.usersDoc = this.afs.doc(environment.invoiceCollectionName + '/' + data.id);
    return this.usersDoc.update(data);
  }
}
