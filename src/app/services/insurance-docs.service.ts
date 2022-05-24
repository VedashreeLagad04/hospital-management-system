import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class InsuranceDocsService {
  private filesCollections: any;
  private existingFiles: any;
  private selectedImages: any;
  private orientation: any;
  public currentlyAddedFile: any;
  constructor(
    private afs: AngularFirestore,
    private alertCtrl: AlertController) {
    this.filesCollections = afs.collection('insuranceDocs');
  }
  public addFiles(docs: any) {
    for (const doc of docs) {
      this.afs.collection('insuranceDocs').add(doc);
    }
  }
  public setSelectedImages(selectedImages: any) {
    this.selectedImages = selectedImages;
  }
  public getSelectedImages() {
    return this.selectedImages;
  }
  public getInsuranceDocs() {
    return this.afs.collection('insuranceDocs', ref => ref.orderBy('uploadDate', 'desc')).get();
  }
  public setExistingFiles(docs: any) {
    this.existingFiles = docs;
  }
  public getExistingFiles() {
    return this.existingFiles;
  }
  public emptySelectedFiles() {
    this.selectedImages = [];
  }
  public async presentAlert(alertMessage: string) {
    const alert = await this.alertCtrl.create({
      message: alertMessage,
      buttons: ['ok'],
    });
    await alert.present();
  }
  public setCurrentlyAddedFile(file) {
    this.currentlyAddedFile = file;
  }
  public getCurrentlyAddedFile() {
    return this.currentlyAddedFile;
  }
  // setScreenOrientation(orientation:any)
  // {
  //   this.orientation = orientation;
  // }
  // getScreenOrientation()
  // {
  //   return this.orientation;
  // }
  // getDoc(fileName:any)
  // {
  //   return this.afs.collection('insuranceDocs',ref => ref.where('fileName','==',fileName)).get();
  // }
}
