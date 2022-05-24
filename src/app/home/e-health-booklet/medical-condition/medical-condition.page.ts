/* eslint-disable radix */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prefer-const */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable max-len */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import * as _ from 'lodash';
// tslint:disable-next-line: ordered-imports
import { AppDataService } from 'src/app/services/app-data.service';
import { AwsService } from 'src/app/services/aws.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { environment } from 'src/environments/environment';
import { CalculationModalPage } from './calculation-modal/calculation-modal.page';
declare let fabric: any;
declare let $: any;
@Component({
  selector: 'app-medical-condition',
  templateUrl: './medical-condition.page.html',
  styleUrls: ['./medical-condition.page.scss'],
})
export class MedicalConditionPage implements OnInit {
  public clientId: string;
  public activetab: string;
  public case;
  public age;
  public fileToUpload = [];
  public uploadProgress: any = 0;
  public uploadPercent = 0;
  public mode = 'checklist';
  public entMode = 'checklist';
  public gastroMode = 'checklist';
  public ehealth;
  public agentMode = 'enable';
  public MedicalConditions: any = {
    gastroenterology: {},
    orthopaedic: {
      uploadedImages: [
        {
          fileUploadDate: '',
          fileUploadKey: '',
        },
      ],
    },
    cardiology: {},
    gynaecology: {},
    urology: {},
    ent: {
      checklist: {},
      stopBang: {},
      berlin: {},
    },
    respiratory: {},
    general: {},
  };
  public user: {
    name: '',
    height: '',
    weight: '',
    gender: '',
    bmi: ''
  };
  public internetCheckFlag = false;
  public reloadAgain = true;
  public activeRouteSubscriber;
  public loggedInUser: any;
  public loader: any;
  @ViewChild('uploadFile', { static: false }) public inputFile: ElementRef;
  // ? for drawing circle on ortho images
  public defaultImagesAlreadyPushed = false;
  public imgNameNotUploadedToBucket = 'both';
  public isDrawingOnSkeletonCanvas = false;
  public isDrawingOnMuscleCanvas = false;
  public drawOnCanvas = 'skeleton';
  public skeletonCanvas: any;
  public muscleCanvas: any;
  public startedDrawingOnSkeletonCanvas = false;
  public startedDrawingOnMuscleCanvas = false;
  // ? for drawing circle on gastro image
  public anatomyCanvas: any;
  public startedDrawingOnAnatomyCanvas = false;
  public isDrawingOnAnatomyCanvas = false;
  // tslint:disable-next-line: max-line-length
  constructor(private activeRoute: ActivatedRoute, private modalCtrl: ModalController, private firebase: FirebaseService, private dataService: AppDataService, private awsService: AwsService, private loadingCtrl: LoadingController, private router: Router) { }
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
  public ionViewWillEnter() {
    // if (document.getElementById('gastro-container')) {
    //   document.getElementById('gastro-container').scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
    // }
    // if (document.getElementById('ortho-container')) {
    //   document.getElementById('ortho-container').scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
    // }
    // if (document.getElementById('gynaec-container')) {
    //   document.getElementById('gynaec-container').scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
    // }
  }
  public ionViewDidEnter() {
    this.mode = 'checklist';
    this.entMode = 'checklist';
    this.gastroMode = 'checklist';
    this.activeRouteSubscriber = this.activeRoute.paramMap.subscribe((params) => {
      this.clientId = params.get('id');
      this.activetab = params.get('tab');
      this.loggedInUser = this.dataService.getUserData();
      if (this.loggedInUser.type !== 'agent' && this.loggedInUser.type !== 'Claims Manager' && this.loggedInUser.type !== 'Finance Manager' && this.loggedInUser.type !== 'Management') {
        this.agentMode = 'disable';
      }
      this.case = this.dataService.getSelectedCase();
      // this.firebase.getEhealth(this.case.id).subscribe((resp) => {
      //   resp.docs.forEach((temp) => {
      //     this.ehealth = temp.data();
      //     this.ehealth.id = temp.id;
      //     
      //   });
      this.ehealth = this.dataService.getEhealthData();
      this.user = this.ehealth.profile;
      const date = new Date(this.ehealth.profile.dateOfBirth);
      this.calculateAge(date);
      if (this.activetab === 'gastroenterology') {
        if (document.getElementById('gastro-container')) {
          document.getElementById('gastro-container').scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }
      }
      if (this.activetab === 'orthopaedic') {
        this.startedDrawingOnSkeletonCanvas = false;
        this.startedDrawingOnMuscleCanvas = false;
        if (document.getElementById('ortho-container')) {
          document.getElementById('ortho-container').scrollIntoView(true);
        }
      }
      if (this.activetab === 'gynaecology' && document.getElementById('gynaec-container')) {
        document.getElementById('gynaec-container').scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
      }
      this.MedicalConditions = this.dataService.getMedicalData();
      console.log('this.MedicalConditions: ', this.MedicalConditions);
      if (!this.MedicalConditions) {
        this.dataService.present().then((a) => {
          a.present();
          this.firebase.getMedicalId(this.case.id).subscribe((resp) => {
            resp.docs.forEach((temp) => {
              this.MedicalConditions = temp.data();
              this.MedicalConditions.id = temp.id;
            });
            this.dataService.setMedicalData(this.MedicalConditions);
            // this.caseSubmission = submission.caseSubmission;
            if (this.MedicalConditions.orthopaedic.uploadedImages === undefined || (_.size(this.MedicalConditions.orthopaedic.uploadedImages) === 0)) {
              this.MedicalConditions.orthopaedic.uploadedImages = [];
              this.defaultImagesAlreadyPushed = true;
              // ? if uploadedIamges array is empty, push 2 objects for skeleton and muscle images;
              this.MedicalConditions.orthopaedic.uploadedImages.push({
                fileUploadKey: '',
                fileUploadDate: '',
                mode: 'preview',
              });
              this.MedicalConditions.orthopaedic.uploadedImages.push({
                fileUploadKey: '',
                fileUploadDate: '',
                mode: 'preview',
              });
            }
            // ? if uploadedImages array is not empty, check if both skeleton and muscle images are present in the array;
            // ? if both images are present, show them as it is;
            // ? if both images are not present or any 1 image is not present, show those images in html from local storage i.e. assets;
            if (_.size(this.MedicalConditions.orthopaedic.uploadedImages) > 0) {
              this.checkIfDefaultImagesArePresent();
            }
            // ? check if gastroenterology has image obj
            // ? if not; add it
            if (_.size(this.MedicalConditions.gastroenterology) === 0 || (this.MedicalConditions.gastroenterology && _.size(this.MedicalConditions.gastroenterology.anatomyImage) === 0)) {
              this.MedicalConditions.gastroenterology.anatomyImage = {
                fileUploadKey: '',
                fileUploadDate: '',
                mode: 'preview',
              };
            }
            this.dataService.dismiss();
          });
        });
      } else {
        // ? check if gastroenterology has image obj
        // ? if not; add it
        if (_.size(this.MedicalConditions.gastroenterology) === 0 || (this.MedicalConditions.gastroenterology && _.size(this.MedicalConditions.gastroenterology.anatomyImage) === 0)) {
          this.MedicalConditions.gastroenterology.anatomyImage = {
            fileUploadKey: '',
            fileUploadDate: '',
            mode: 'preview',
          };
        }
        if (this.MedicalConditions.orthopaedic.uploadedImages === undefined || (_.size(this.MedicalConditions.orthopaedic.uploadedImages) === 0)) {
          this.MedicalConditions.orthopaedic.uploadedImages = [];
          this.defaultImagesAlreadyPushed = true;
          // ? if uploadedIamges array is empty, push 2 objects for skeleton and muscle images;
          this.MedicalConditions.orthopaedic.uploadedImages.push({
            fileUploadKey: '',
            fileUploadDate: '',
            mode: 'preview',
          });
          this.MedicalConditions.orthopaedic.uploadedImages.push({
            fileUploadKey: '',
            fileUploadDate: '',
            mode: 'preview',
          });
        }
        // ? if uploadedImages array is not empty, check if both skeleton and muscle images are present in the array;
        // ? if both images are present, show them as it is;
        // ? if both images are not present or any 1 image is not present, show those images in html from local storage i.e. assets;
        if (!this.defaultImagesAlreadyPushed && _.size(this.MedicalConditions.orthopaedic.uploadedImages) > 0) {
          this.checkIfDefaultImagesArePresent();
        }
        if (this.MedicalConditions.ent.stopBang === undefined) {
          this.MedicalConditions.ent.stopBang = {};
        }
        if (this.MedicalConditions.ent.checklist === undefined) {
          this.MedicalConditions.ent.checklist = {};
        }
        if (this.MedicalConditions.ent.berlin === undefined) {
          this.MedicalConditions.ent.berlin = {};
        }
      }
    });
  }
  public checkIfDefaultImagesArePresent() {
    let defaultImgCount = 0;
    // ? check if fileUploadKey at 0 is 'skeleton.png' or '';
    // ? if it is 'skeleton.png' or ''; increment the count;do not add img obj
    // ? similarly, for 'muscle.png'
    if (this.MedicalConditions.orthopaedic.uploadedImages[0] && (this.MedicalConditions.orthopaedic.uploadedImages[0].fileUploadKey === '' ||
      (this.MedicalConditions.orthopaedic.uploadedImages[0].fileUploadKey !== '' && this.MedicalConditions.orthopaedic.uploadedImages[0].fileUploadKey.split('_')[3] === 'skeleton.png'))) {
      defaultImgCount++;
      this.imgNameNotUploadedToBucket = 'muscle';
    } else if (this.MedicalConditions.orthopaedic.uploadedImages[0] && this.MedicalConditions.orthopaedic.uploadedImages[0].fileUploadKey !== '' && this.MedicalConditions.orthopaedic.uploadedImages[0].fileUploadKey.split('_')[3] !== 'skeleton.png') {
      defaultImgCount++;
      this.imgNameNotUploadedToBucket = 'skeleton';
    }
    if (this.MedicalConditions.orthopaedic.uploadedImages[1] && (this.MedicalConditions.orthopaedic.uploadedImages[1].fileUploadKey === '' ||
      (this.MedicalConditions.orthopaedic.uploadedImages[1].fileUploadKey !== '' && this.MedicalConditions.orthopaedic.uploadedImages[1].fileUploadKey.split('_')[3] === 'muscle.png'))) {
      defaultImgCount++;
      this.imgNameNotUploadedToBucket = 'skeleton';
    } else if (this.MedicalConditions.orthopaedic.uploadedImages[1] && this.MedicalConditions.orthopaedic.uploadedImages[1].fileUploadKey !== '' && this.MedicalConditions.orthopaedic.uploadedImages[1].fileUploadKey.split('_')[3] === 'muscle.png') {
      defaultImgCount++;
      this.imgNameNotUploadedToBucket = 'muscle';
    }
    if ((this.MedicalConditions.orthopaedic.uploadedImages[0] && this.MedicalConditions.orthopaedic.uploadedImages[0].fileUploadKey !== '' && this.MedicalConditions.orthopaedic.uploadedImages[0].fileUploadKey.split('_')[3] !== 'skeleton.png')
      &&
      (!this.MedicalConditions.orthopaedic.uploadedImages[1] ||
        (this.MedicalConditions.orthopaedic.uploadedImages[1] && this.MedicalConditions.orthopaedic.uploadedImages[1].fileUploadKey !== '' && this.MedicalConditions.orthopaedic.uploadedImages[1].fileUploadKey.split('_')[3] !== 'muscle.png'))) {
      defaultImgCount = 0;
      this.imgNameNotUploadedToBucket = 'both';
    }
    if (defaultImgCount === 2) {
      this.imgNameNotUploadedToBucket = 'none';
      this.defaultImagesAlreadyPushed = false;
      this.MedicalConditions.orthopaedic.uploadedImages[0].mode = 'preview';
      this.MedicalConditions.orthopaedic.uploadedImages[1].mode = 'preview';
    } else {
      if (this.imgNameNotUploadedToBucket === 'muscle') {
        // ? insert image element at index 1
        this.MedicalConditions.orthopaedic.uploadedImages.splice(1, 0, {
          fileUploadKey: '',
          fileUploadDate: '',
          mode: 'preview',
        });
        // ? add mode = 'preview' for both img
        this.MedicalConditions.orthopaedic.uploadedImages[0].mode = 'preview';
        this.MedicalConditions.orthopaedic.uploadedImages[1].mode = 'preview';
      } else if (this.imgNameNotUploadedToBucket === 'skeleton') {
        // ? insert image element at index 0
        this.MedicalConditions.orthopaedic.uploadedImages.unshift({
          fileUploadKey: '',
          fileUploadDate: '',
          mode: 'preview',
        });
        // ? add mode = 'preview' for both img
        this.MedicalConditions.orthopaedic.uploadedImages[0].mode = 'preview';
        this.MedicalConditions.orthopaedic.uploadedImages[1].mode = 'preview';
      } else if (this.imgNameNotUploadedToBucket === 'both' && !this.defaultImagesAlreadyPushed) {
        // ? insert image element at index 0
        this.MedicalConditions.orthopaedic.uploadedImages.unshift({
          fileUploadKey: '',
          fileUploadDate: '',
          mode: 'preview',
        });
        // ? insert image element at index 1
        this.MedicalConditions.orthopaedic.uploadedImages.splice(1, 0, {
          fileUploadKey: '',
          fileUploadDate: '',
          mode: 'preview',
        });
      }
    }
    return;
  }
  public saveChanges() {
    this.dataService.present().then((a) => {
      a.present();
      this.reloadAgain = false;
      this.ehealth.preview.signatureFlag = true;
      delete this.MedicalConditions.orthopaedic.uploadedImages[0].mode;
      delete this.MedicalConditions.orthopaedic.uploadedImages[1].mode;
      // // ? if any of skeleton or muscle img is not saved (very first time);
      // // ? remove that element from uploadedImages array
      // // ? because fileUploadKey = '' in this case
      // // ? and this obj is rendered in preview, approval-preview and export-info pages with broken images
      // const removedImg = _.remove(this.MedicalConditions.orthopaedic.uploadedImages, ['fileUploadKey', ''])
      // ? not removed element with fileUploadkey = '' because there needs to be too much handling for adding default images
      this.ehealth.preview.MedicalConditions = this.MedicalConditions;
      if (!this.internetCheckFlag) {
        this.firebase.editMedical(this.MedicalConditions).then(() => {
          this.dataService.setMedicalData(this.MedicalConditions);
          if (this.activetab === 'orthopaedic') {
            this.MedicalConditions.orthopaedic.uploadedImages[0].mode = 'preview';
            this.MedicalConditions.orthopaedic.uploadedImages[1].mode = 'preview';
            // ? dispose/remove canvas objects used for fabric.js initialization
            if (this.skeletonCanvas) {
              // ? '.canvas-container' is displayed; whereas '.skeleton-canvas' is display: none
              // ? make '.canvas-container' as display:none;
              $('#skeleton-img .canvas-container').css('display', 'none');
              // this.skeletonCanvas.dispose();
              // $(this.skeletonCanvas.wrapperEl).remove();
            }
            if (this.muscleCanvas) {
              // ? '.canvas-container' is displayed; whereas '.muscle-canvas' is display: none
              // ? make '.canvas-container' as display:none;
              $('#muscle-img .canvas-container').css('display', 'none');
              // this.muscleCanvas.dispose();
              // // ? to remove canvas wrapper element (which contains upper and lower canvases used by Fabric).
              // // ? This can be done AFTER you call dispose, if the goal is to completely remove Fabric canvas
              // // ? from a document
              // $(this.muscleCanvas.wrapperEl).remove();
            }
          } else if (this.activetab === 'gastroenterology') {
            this.MedicalConditions.gastroenterology.anatomyImage.mode = 'preview';
            if (this.anatomyCanvas) {
              $('#anatomy-img .canvas-container').css('display', 'none');
            }
          }
          const obj = {
            tabName: this.activetab,
            value: true,
          };
          this.dataService.setCheckboxValue(obj);
          if (this.activetab === 'gastroenterology') {
            this.ehealth.checkboxValue.gastroTab = true;
            this.ehealth.checkboxValue.medicalConditionTab = true;
          } else if (this.activetab === 'orthopaedic') {
            this.ehealth.checkboxValue.orthoTab = true;
            this.ehealth.checkboxValue.medicalConditionTab = true;
          } else if (this.activetab === 'cardiology') {
            this.ehealth.checkboxValue.cardioTab = true;
            this.ehealth.checkboxValue.medicalConditionTab = true;
          } else if (this.activetab === 'gynaecology') {
            this.ehealth.checkboxValue.gynoTab = true;
            this.ehealth.checkboxValue.medicalConditionTab = true;
          } else if (this.activetab === 'respiratory') {
            this.ehealth.checkboxValue.respiratoryTab = true;
            this.ehealth.checkboxValue.medicalConditionTab = true;
          } else if (this.activetab === 'general') {
            this.ehealth.checkboxValue.generalTab = true;
            this.ehealth.checkboxValue.medicalConditionTab = true;
          } else if (this.activetab === 'urology') {
            this.ehealth.checkboxValue.uroTab = true;
            this.ehealth.checkboxValue.medicalConditionTab = true;
          } else if (this.activetab === 'ent') {
            this.ehealth.checkboxValue.entTab = true;
            this.ehealth.checkboxValue.medicalConditionTab = true;
          }
          this.firebase.editEhealth(this.ehealth).then(() => {
            this.dataService.setEhealthData(this.ehealth);
            this.dataService.dismiss();
            this.reloadAgain = true;
            // ? capitalize activetab variable string;
            this.dataService.presentAlert(this.activetab.charAt(0).toUpperCase() + this.activetab.slice(1) + ' ' + 'updated successfully!');
          }).catch(() => {
            // tslint:disable-next-line: no-unused-expression
            this.dataService.dismiss();
          });
        }).catch(() => {
          // tslint:disable-next-line: no-unused-expression
          this.dataService.dismiss();
        });
      } else {
        this.dataService.dismiss();
        this.dataService.presentAlert('Please check your internet connection!');
      }
    });
  }
  public checklist() {
    this.mode = 'checklist';
    this.entMode = 'checklist';
    this.MedicalConditions.orthopaedic.uploadedImages[0].mode = 'preview';
    this.MedicalConditions.orthopaedic.uploadedImages[1].mode = 'preview';
    $('#skeleton-img .canvas-container').css('display', 'none');
    $('#muscle-img .canvas-container').css('display', 'none');
  }
  public entStopBang() {
    this.entMode = 'stopBang';
  }
  public entBerlin() {
    this.entMode = 'berlin';
  }
  public diagram() {
    this.mode = 'diagram';
    this.MedicalConditions.orthopaedic.uploadedImages[0].mode = 'preview';
    this.MedicalConditions.orthopaedic.uploadedImages[1].mode = 'preview';
  }
  public drawCircleOnCanvas(index) {
    this.isDrawingOnSkeletonCanvas = false;
    this.isDrawingOnMuscleCanvas = false;
    if (index === 0) {
      // ? draw on skeleton image
      this.isDrawingOnSkeletonCanvas = true;
      this.listenSkeletonCanvasClick();
    } else {
      // ? draw on muscle image
      this.isDrawingOnMuscleCanvas = true;
      this.listenMuscleCanvasClick();
    }
  }
  public drawCircleOnAnatomyCanvas() {
    this.isDrawingOnAnatomyCanvas = true;
    this.listenAnatomyCanvasClick();
  }
  public listenSkeletonCanvasClick() {
    this.startedDrawingOnSkeletonCanvas = false;
    let divPos: any = {};
    const x = 0;
    const y = 0;
    const that = this;
    const offset = $('#skeleton-canvas').offset();
    this.skeletonCanvas.on('mouse:up', function (e) {
      if (that.isDrawingOnSkeletonCanvas && !that.startedDrawingOnSkeletonCanvas) {
        that.startedDrawingOnSkeletonCanvas = true;
        const radius = 31;
        divPos = {
          left: e.pointer.x - radius,
          top: e.pointer.y - radius,
        };
        const circle = new fabric.Circle({
          left: divPos.left,
          top: divPos.top,
          // left: divPos.left,
          // top: divPos.top,
          radius,
          stroke: '#007AFF',
          strokeWidth: 3,
          strokeDashArray: [15, 7],
          fill: '#55C7F221',
          id: 'current',
        });
        that.skeletonCanvas.add(circle);
        that.skeletonCanvas.setActiveObject(circle);
        // that.startedDrawingOnSkeletonCanvas = false;
      }
    });
    // this.skeletonCanvas.on('mouse:move', function (e) {
    //   that.startedDrawingOnSkeletonCanvas = true;
    // });
  }
  public listenMuscleCanvasClick() {
    this.startedDrawingOnMuscleCanvas = false;
    let divPos: any = {};
    const that = this;
    const offset = $('#muscle-canvas').offset();
    this.muscleCanvas.on('mouse:up', function (e) {
      if (that.isDrawingOnMuscleCanvas && !that.startedDrawingOnMuscleCanvas) {
        that.startedDrawingOnMuscleCanvas = true;
        const radius = 31;
        divPos = {
          left: e.pointer.x - radius,
          top: e.pointer.y - radius,
        };
        const circle = new fabric.Circle({
          left: divPos.left,
          top: divPos.top,
          // left: divPos.left,
          // top: divPos.top,
          radius,
          stroke: '#007AFF',
          strokeWidth: 3,
          strokeDashArray: [15, 7],
          fill: '#55C7F221',
        });
        that.muscleCanvas.add(circle);
        that.muscleCanvas.setActiveObject(circle);
      }
    });
    // this.muscleCanvas.on('mouse:move', function (e) {
    //   that.startedDrawingOnMuscleCanvas = true;
    // });
  }
  public listenAnatomyCanvasClick() {
    this.startedDrawingOnAnatomyCanvas = false;
    let divPos: any = {};
    const that = this;
    const offset = $('#anatomy-canvas').offset();
    this.anatomyCanvas.on('mouse:up', function (e) {
      if (that.isDrawingOnAnatomyCanvas && !that.startedDrawingOnAnatomyCanvas) {
        that.startedDrawingOnAnatomyCanvas = true;
        const radius = 31;
        divPos = {
          left: e.pointer.x - radius,
          top: e.pointer.y - radius,
        };
        const circle = new fabric.Circle({
          left: divPos.left,
          top: divPos.top,
          // left: divPos.left,
          // top: divPos.top,
          radius,
          stroke: '#007AFF',
          strokeWidth: 3,
          strokeDashArray: [15, 7],
          fill: '#55C7F221',
        });
        that.anatomyCanvas.add(circle);
        that.anatomyCanvas.setActiveObject(circle);
      }
    });
    // this.anatomyCanvas.on('mouse:move', function (e) {
    //   that.startedDrawingOnAnatomyCanvas = true;
    // });
  }
  public editImage(img, index) {
    img.mode = 'edit';
    this.drawImageOnCanvas(img, index);
  }
  public editAnatomyImage(img) {
    img.mode = 'edit';
    this.drawImageOnAnatomyCanvas(img);
  }
  public drawImageOnCanvas(img, index) {
    const that = this;
    let imgSrc;
    if (index === 0) {
      // ? check if img.fileUploadKey is empty string or not;
      // ? if it is an empty string; draw skeleton img from assets on canvas
      // ? if it is not empty; draw skeleton img from aws on canvas
      if (!this.skeletonCanvas) {
        $('#skeleton-img .canvas-container').css('display', 'block');
        this.skeletonCanvas = new fabric.Canvas('skeleton-canvas');
        this.skeletonCanvas.renderAll();
      } else {
        $('#skeleton-img .canvas-container').css('display', 'block');
        this.skeletonCanvas.clear();
      }
      if (_.size(img.fileUploadKey) > 0) {
        imgSrc = this.getImageUrl(img.fileUploadKey);
        // tslint:disable-next-line: max-line-length
        fabric.Image.fromURL(imgSrc, function (myImg) {
          // add background image
          that.skeletonCanvas.setBackgroundImage(myImg, that.skeletonCanvas.renderAll.bind(that.skeletonCanvas), {
            scaleX: that.skeletonCanvas.width / 450,
            scaleY: that.skeletonCanvas.height / 530,
          });
        }, {
          crossOrigin: 'anonymous',
        });
      } else {
        // this.skeletonCanvas = new fabric.Canvas('skeleton-canvas');
        // this.skeletonCanvas.renderAll();
        imgSrc = '../../../../assets/images/skeleton.png';
        fabric.Image.fromURL(imgSrc, function (myImg) {
          // add background image
          that.skeletonCanvas.setBackgroundImage(myImg, that.skeletonCanvas.renderAll.bind(that.skeletonCanvas), {
            scaleX: that.skeletonCanvas.width / 450,
            scaleY: that.skeletonCanvas.height / 530,
          });
        });
      }
    } else {
      if (!this.muscleCanvas) {
        $('#muscle-img .canvas-container').css('display', 'block');
        this.muscleCanvas = new fabric.Canvas('muscle-canvas');
        this.muscleCanvas.renderAll();
      } else {
        $('#muscle-img .canvas-container').css('display', 'block');
        this.muscleCanvas.clear();
      }
      // ? check if img.fileUploadKey is empty string or not;
      // ? if ti is an empty string; draw muscle img from assets on canvas
      // ? if it is not empty; draw muscle img from aws on canvas
      if (_.size(img.fileUploadKey) > 0) {
        imgSrc = this.getImageUrl(img.fileUploadKey);
        // tslint:disable-next-line: max-line-length
        fabric.Image.fromURL(imgSrc, function (myImg) {
          // add background image
          that.muscleCanvas.setBackgroundImage(myImg, that.muscleCanvas.renderAll.bind(that.muscleCanvas), {
            scaleX: that.muscleCanvas.width / 450,
            scaleY: that.muscleCanvas.height / 594,
          });
        }, {
          crossOrigin: 'anonymous',
        });
      } else {
        imgSrc = '../../../../assets/images/muscle.png';
        fabric.Image.fromURL(imgSrc, function (myImg) {
          // add background image
          that.muscleCanvas.setBackgroundImage(myImg, that.muscleCanvas.renderAll.bind(that.muscleCanvas), {
            scaleX: that.muscleCanvas.width / 450,
            scaleY: that.muscleCanvas.height / 594,
          });
        });
      }
    }
  }
  public drawImageOnAnatomyCanvas(img) {
    const that = this;
    let imgSrc;
    // ? check if img.fileUploadKey is empty string or not;
    // ? if it is an empty string; draw skeleton img from assets on canvas
    // ? if it is not empty; draw skeleton img from aws on canvas
    if (!this.anatomyCanvas) {
      this.anatomyCanvas = new fabric.Canvas('anatomy-canvas');
      this.anatomyCanvas.renderAll();
    } else {
      $('#anatomy-img .canvas-container').css('display', 'block');
      this.anatomyCanvas.clear();
    }
    if (_.size(img.fileUploadKey) > 0) {
      imgSrc = this.getImageUrl(img.fileUploadKey);
      // tslint:disable-next-line: max-line-length
      fabric.Image.fromURL(imgSrc, function (myImg) {
        // add background image
        that.anatomyCanvas.setBackgroundImage(myImg, that.anatomyCanvas.renderAll.bind(that.anatomyCanvas), {
          scaleX: that.anatomyCanvas.width / 450,
          scaleY: that.anatomyCanvas.height / 530,
        });
      }, {
        crossOrigin: 'anonymous',
      });
    } else {
      // this.skeletonCanvas = new fabric.Canvas('skeleton-canvas');
      // this.skeletonCanvas.renderAll();
      imgSrc = '../../../../assets/images/anatomy_of_human_body.png';
      fabric.Image.fromURL(imgSrc, function (myImg) {
        // add background image
        that.anatomyCanvas.setBackgroundImage(myImg, that.anatomyCanvas.renderAll.bind(that.anatomyCanvas), {
          scaleX: that.anatomyCanvas.width / 450,
          scaleY: that.anatomyCanvas.height / 530,
        });
      });
    }
  }
  public saveImageToAws(img, index) {
    this.dataService.present().then((loader) => {
      this.loader = loader;
      loader.present();
      let toSaveImg: any;
      let imageWidth;
      let imageHeight;
      let canvasType: any;
      if (index === 0) {
        canvasType = 'skeleton';
        this.isDrawingOnSkeletonCanvas = false;
        toSaveImg = this.skeletonCanvas.toDataURL();
        imageWidth = this.skeletonCanvas.width;
        imageHeight = this.skeletonCanvas.height;
      } else {
        canvasType = 'muscle';
        this.isDrawingOnMuscleCanvas = false;
        toSaveImg = this.muscleCanvas.toDataURL();
        imageWidth = this.muscleCanvas.width;
        imageHeight = this.muscleCanvas.height;
      }
      // ? check if img.fileUplaodKey is empty string or not
      // ? if it is an empty string, create new filename;
      // ? if it is not empty, use previous filename;
      let filename;
      let date;
      const fileObjectToUpload: any = {};
      date = new Date();
      if (_.size(img.fileUploadKey) === 0) {
        const year = date.getFullYear();
        let month = date.getMonth();
        month = month + 1;
        // if (month.toString.length === 1) {
        if (month < 10) {
          month = '0' + month;
        }
        let day = date.getDate();
        // if (day.toString.length === 1) {
        if (day < 10) {
          day = '0' + day;
        }
        filename = year + '' + month + '' + day + '_'
          + 'Orthopaedic_Image_' + canvasType + '.png';
        fileObjectToUpload.key = environment.aws.bucketRootKey + '/'
          + this.clientId + '/'
          + this.MedicalConditions.caseId + '/'
          + environment.aws.bucketMedicalConditionImagePath + '/'
          + filename;
        // ? if uploadedImages[index] is reassigned here; 403 error occurs as image is not yet uploaded to bucket
        // ? and we are trying to load that image from bucket here
        // ? hence, reassign it in uploadToAws() callback;
        // const obj = {
        //   fileUploadKey: fileObjectToUpload.key,
        //   fileUploadDate: date.toString(),
        // };
        // this.MedicalConditions.orthopaedic.uploadedImages[index] = obj;
      } else {
        filename = img.fileUploadKey.split('/')[4];
        fileObjectToUpload.key = img.fileUploadKey;
      }
      // ? convert png to arraybuffer and then upload to aws;
      const toUploadImg = this.pngToArrayBuffer(toSaveImg);
      fileObjectToUpload.body = toUploadImg;
      fileObjectToUpload.name = filename;
      fileObjectToUpload.size = imageWidth * imageHeight;
      fileObjectToUpload.arrayBuffer = toUploadImg;
      this.fileToUpload.push(fileObjectToUpload);
      this.uploadFilesToAWS('canvas', index);
    });
  }
  public saveAnatomyImageToAws(img) {
    this.dataService.present().then((loader) => {
      this.loader = loader;
      loader.present();
      let toSaveImg: any;
      let imageWidth;
      let imageHeight;
      let canvasType: any;
      canvasType = 'anatomy';
      this.isDrawingOnAnatomyCanvas = false;
      toSaveImg = this.anatomyCanvas.toDataURL();
      imageWidth = this.anatomyCanvas.width;
      imageHeight = this.anatomyCanvas.height;
      // ? check if img.fileUplaodKey is empty string or not
      // ? if it is an empty string, create new filename;
      // ? if it is not empty, use previous filename;
      let filename;
      let date;
      const fileObjectToUpload: any = {};
      date = new Date();
      if (_.size(img.fileUploadKey) === 0) {
        const year = date.getFullYear();
        let month = date.getMonth();
        month = month + 1;
        // if (month.toString.length === 1) {
        if (month < 10) {
          month = '0' + month;
        }
        let day = date.getDate();
        // if (day.toString.length === 1) {
        if (day < 10) {
          day = '0' + day;
        }
        filename = year + '' + month + '' + day + '_'
          + 'Gastroenterology_Image_' + canvasType + '.png';
        fileObjectToUpload.key = environment.aws.bucketRootKey + '/'
          + this.clientId + '/'
          + this.MedicalConditions.caseId + '/'
          + environment.aws.bucketMedicalConditionImagePath + '/'
          + filename;
        // ? if uploadedImages[index] is reassigned here; 403 error occurs as image is not yet uploaded to bucket
        // ? and we are trying to load that image from bucket here
        // ? hence, reassign it in uploadToAws() callback;
        // const obj = {
        //   fileUploadKey: fileObjectToUpload.key,
        //   fileUploadDate: date.toString(),
        // };
        // this.MedicalConditions.orthopaedic.uploadedImages[index] = obj;
      } else {
        filename = img.fileUploadKey.split('/')[4];
        fileObjectToUpload.key = img.fileUploadKey;
      }
      // ? convert png to arraybuffer and then upload to aws;
      const toUploadImg = this.pngToArrayBuffer(toSaveImg);
      fileObjectToUpload.body = toUploadImg;
      fileObjectToUpload.name = filename;
      fileObjectToUpload.size = imageWidth * imageHeight;
      fileObjectToUpload.arrayBuffer = toUploadImg;
      this.fileToUpload.push(fileObjectToUpload);
      this.uploadFilesToAWS('anatomy-canvas', null);
    });
  }
  public pngToArrayBuffer(dataURL) {
    // tslint:disable-next-line: variable-name
    const string_base64 = dataURL.replace(/^data:image\/png;base64,/, '');
    // tslint:disable-next-line: variable-name
    const binary_string = window.atob(string_base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      const ascii = binary_string.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes.buffer;
  }
  // public clear(img, index) {
  //   // this.drawImageOnCanvas(img, index);
  // }
  public clearImage(img, index) {
    img.fileUploadKey = '';
    img.fileUploadDate = '';
    this.clearCanvasAndRedrawImage(img, index);
  }
  public clearCanvasAndRedrawImage(img, index) {
    const that = this;
    let imgSrc;
    if (index === 0) {
      this.isDrawingOnSkeletonCanvas = false;
      this.skeletonCanvas.clear();
      if (_.size(img.fileUploadKey) > 0) {
        imgSrc = this.getImageUrl(img.fileUploadKey);
        // tslint:disable-next-line: max-line-length
        fabric.Image.fromURL(imgSrc, function (myImg) {
          // add background image
          that.skeletonCanvas.setBackgroundImage(myImg, that.skeletonCanvas.renderAll.bind(that.skeletonCanvas), {
          });
        }, {
          crossOrigin: 'anonymous',
        });
      } else {
        imgSrc = '../../../../assets/images/skeleton.png';
        fabric.Image.fromURL(imgSrc, function (myImg) {
          // add background image
          that.skeletonCanvas.setBackgroundImage(myImg, that.skeletonCanvas.renderAll.bind(that.skeletonCanvas), {
          });
        });
      }
    } else {
      this.isDrawingOnMuscleCanvas = false;
      this.muscleCanvas.clear();
      // ? check if img.fileUploadKey is empty string or not;
      // ? if ti is an empty string; draw muscle img from assets on canvas
      // ? if it is not empty; draw muscle img from aws on canvas
      if (_.size(img.fileUploadKey) > 0) {
        imgSrc = this.getImageUrl(img.fileUploadKey);
        // tslint:disable-next-line: max-line-length
        fabric.Image.fromURL(imgSrc, function (myImg) {
          // add background image
          that.muscleCanvas.setBackgroundImage(myImg, that.muscleCanvas.renderAll.bind(that.muscleCanvas), {
          });
        }, {
          crossOrigin: 'anonymous',
        });
      } else {
        imgSrc = '../../../../assets/images/muscle.png';
        fabric.Image.fromURL(imgSrc, function (myImg) {
          // add background image
          that.muscleCanvas.setBackgroundImage(myImg, that.muscleCanvas.renderAll.bind(that.muscleCanvas), {
          });
        });
      }
    }
  }
  public clearAnatomyImage(img) {
    img.fileUploadKey = '';
    img.fileUploadDate = '';
    this.clearAnatomyCanvasAndRedrawImage(img);
  }
  public clearAnatomyCanvasAndRedrawImage(img) {
    const that = this;
    let imgSrc;
    this.isDrawingOnAnatomyCanvas = false;
    this.anatomyCanvas.clear();
    if (_.size(img.fileUploadKey) > 0) {
      imgSrc = this.getImageUrl(img.fileUploadKey);
      // tslint:disable-next-line: max-line-length
      fabric.Image.fromURL(imgSrc, function (myImg) {
        // add background image
        that.anatomyCanvas.setBackgroundImage(myImg, that.anatomyCanvas.renderAll.bind(that.anatomyCanvas), {
        });
      }, {
        crossOrigin: 'anonymous',
      });
    } else {
      imgSrc = '../../../../assets/images/anatomy_of_human_body.png';
      fabric.Image.fromURL(imgSrc, function (myImg) {
        // add background image
        that.anatomyCanvas.setBackgroundImage(myImg, that.anatomyCanvas.renderAll.bind(that.anatomyCanvas), {
        });
      });
    }
  }
  public fileClick() {
    this.inputFile.nativeElement.value = '';
  }
  public uploadFiles(event) {
    // this.openModal(event.target.files, index);
    if (event.target.files.length > 0) {
      this.dataService.present().then((loader) => {
        this.loader = loader;
        loader.present();
        let date;
        date = new Date();
        const year = date.getFullYear();
        let month = date.getMonth();
        month = month + 1;
        // if (month.toString.length === 1) {
        if (month < 10) {
          month = '0' + month;
        }
        let day = date.getDate();
        // if (day.toString.length === 1) {
        if (day < 10) {
          day = '0' + day;
        }
        // tslint:disable-next-line: prefer-for-of
        // for (let i = 0; i < event.target.files.length; i++) {
        const fileObjectToUpload = {
          body: '',
          name: '',
          size: 0,
          key: '',
          arrayBuffer: null,
        };
        // const selectedFilename = event.target.files[0].name.split('.')[0];
        const splitArr = event.target.files[0].name.split('.');
        splitArr.splice(-1);
        const selectedFilename = splitArr.join('.');
        const splittedName = selectedFilename.replace(/[!&\/\\#., +=^()$~%'":*?<>{}]/g, '_');
        const filename = year + '' + month + '' + day + '_'
          + 'Orthopaedic_Image_' + splittedName + '.' + event.target.files[0].name.split('.')[event.target.files[0].name.split('.').length - 1];
        let splittedFileName;
        const fileCountArr = [];
        // const alreadyPresentName = _.find(this.files, (o) => {
        const alreadyPresentName = _.filter(this.MedicalConditions.orthopaedic.uploadedImages, (o) => {
          if (_.size(o.fileUploadKey) > 0) {
            // const currFilename = o.fileName.replace(/\(/, '-').replace(/\)\./, '.');
            splittedFileName = o.fileUploadKey.split('/')[4].split('.')[0];
            // if (_.includes(splittedFileName, splittedName)) {
            if (splittedFileName === filename) {
              const filenumber = splittedFileName.split('-');
              const isnum = /^\d+$/.test(filenumber[filenumber.length - 1]);
              let concatFilename;
              concatFilename = filenumber[0];
              if (filenumber.length > 1) {
                for (let i = 1; i < filenumber.length - 1; i++) {
                  concatFilename = concatFilename + '-' + filenumber[i];
                }
              }
              // if (splittedFileName === splittedName) {
              if (splittedFileName === filename) {
                fileCountArr.push(0);
                return o;
                // } else if (isnum && concatFilename === splittedName) {
              } else if (isnum && concatFilename === filename) {
                const count = filenumber[filenumber.length - 1].split('.')[0];
                fileCountArr.push(parseInt(count));
                return o;
              }
            }
          }
        });
        const extension = event.target.files[0].name.split('.')[event.target.files[0].name.split('.').length - 1];
        if (alreadyPresentName && alreadyPresentName.length > 0) {
          const maxCount = _.max(fileCountArr);
          if (maxCount !== undefined) {
            // fileObjectToUpload.name = splittedName +
            fileObjectToUpload.name = filename +
              '-' + (maxCount + 1) + '.' + extension;
          } else {
            // fileObjectToUpload.name = splittedName + '.' + event.target.files[0].name.split('.')[1];
            fileObjectToUpload.name = filename + '.' + extension;
          }
        } else {
          // fileObjectToUpload.name = splittedName + '.' + event.target.files[0].name.split('.')[1];
          fileObjectToUpload.name = filename + '.' + extension;
        }
        // const filename = year + '' + month + '' + day + '_'
        //   + 'Orthopaedic_Image_' + event.target.files[0].name.replace(/[!&\/\\#., +=^()$~%'":*?<>{}]/g, '_');
        fileObjectToUpload.body = event.target.files[0];
        // fileObjectToUpload.name = event.target.files[0].name;
        fileObjectToUpload.size = event.target.files[0].size;
        fileObjectToUpload.key = environment.aws.bucketRootKey + '/'
          + this.clientId + '/'
          + this.MedicalConditions.caseId + '/'
          + environment.aws.bucketMedicalConditionImagePath + '/'
          + filename;
        fileObjectToUpload.arrayBuffer = event.target.files[0];
        this.fileToUpload.push(fileObjectToUpload);
        // const obj = {
        //   fileUploadKey: fileObjectToUpload.key,
        //   fileUploadDate: date.toString(),
        // };
        // this.MedicalConditions.orthopaedic.uploadedImages.push(obj);
        // this.MedicalConditions.orthopaedic.fileUploadKey = fileObjectToUpload.key;
        // this.MedicalConditions.orthopaedic.fileUploadDate = date;
        // }
        // this.dataService.dismiss();
        this.uploadFilesToAWS('file', null);
      });
    }
  }
  public getImageUrl(src) {
    return environment.aws.bucketAccessRootPath + src;
  }
  public uploadFilesToAWS(uploadType, index) {
    this.uploadPercent = 0;
    this.loader.message = '<span class="upload - percent">Uploading... ' + this.uploadPercent + ' %</span>';
    this.dataService.currentLoader = 'aws';
    this.awsService.uploadFilesAWS(this.fileToUpload, () => {
      // this.ehealth.checkboxValue.orthoTab = true;
      // this.ehealth.checkboxValue.medicalConditionTab = true;
      // this.firebase.editMedical(this.MedicalConditions).then(() => {
      //   this.dataService.dismiss();
      //   // this.saveChanges();
      // });
      // ? if uploadType is canvas, reassign fileToUpload obj to uploadedImages[index];
      if (uploadType === 'canvas') {
        this.MedicalConditions.orthopaedic.uploadedImages[index].fileUploadKey = this.fileToUpload[0].key;
        this.MedicalConditions.orthopaedic.uploadedImages[index].fileUploadDate = new Date().toString();
        this.MedicalConditions.orthopaedic.uploadedImages[index].mode = 'preview';
      } else if (uploadType === 'anatomy-canvas') {
        this.MedicalConditions.gastroenterology.anatomyImage.fileUploadKey = this.fileToUpload[0].key;
        this.MedicalConditions.gastroenterology.anatomyImage.fileUploadDate = new Date().toString();
        this.MedicalConditions.gastroenterology.anatomyImage.mode = 'preview';
      } else {
        const obj = {
          fileUploadKey: this.fileToUpload[0].key,
          fileUploadDate: new Date().toString(),
        };
        this.MedicalConditions.orthopaedic.uploadedImages.push(obj);
        this.mode = 'diagram';
      }
      this.fileToUpload = [];
      this.dataService.dismiss();
      this.saveChanges();
    }, (err) => {
      this.dataService.dismiss();
    }, (progress) => {
      this.uploadPercent = Math.ceil(progress.uploadedPercent) > 100 ? 100 : Math.ceil(progress.uploadedPercent);
      this.uploadProgress = this.uploadPercent / 100;
      // tslint:disable-next-line: max-line-length
      const progressVal = '<span class="upload-percent">Uploading... ' + this.uploadPercent + ' %</span>';
      // tslint:disable-next-line: max-line-length
      // let progressVal = '<ion-progress-bar [value]="0.4"></ion-progress-bar><span class="upload-percent">Uploading... ' + this.uploadPercent + ' %</span>';
      this.loader.message = progressVal;
    });
    // });
  }
  public deleteImages(fileUploadKey, i) {
    // tslint:disable-next-line: no-unused-expression
    this.awsService.deleteFileAWS(fileUploadKey).then(() => {
      this.MedicalConditions.orthopaedic.uploadedImages.splice(i, 1);
      // this.firebase.editMedical(this.MedicalConditions).then(() => {
      //   this.ehealth.preview.MedicalConditions = this.MedicalConditions;
      //   this.firebase.editEhealth(this.ehealth).then(() => {
      //     this.dataService.setEhealthData(this.ehealth);
      //     this.dataService.presentAlert('Image deleted successfully');
      //   });
      // });
      this.saveChanges();
    });
    // this.saveChanges();
  }
  public ionViewWillLeave() {
    this.activeRouteSubscriber.unsubscribe();
    this.skeletonCanvas = undefined;
    this.muscleCanvas = undefined;
    this.anatomyCanvas = undefined;
  }
  public calculateScore() {
    let count = 0;
    if (this.MedicalConditions.ent.stopBang.age === 'yes') {
      count++;
    }
    if (this.MedicalConditions.ent.stopBang.bmi === 'yes') {
      count++;
    }
    if (this.MedicalConditions.ent.stopBang.gender === 'yes') {
      count++;
    }
    if (this.MedicalConditions.ent.stopBang.neck === 'yes') {
      count++;
    }
    if (this.MedicalConditions.ent.stopBang.observed === 'yes') {
      count++;
    }
    if (this.MedicalConditions.ent.stopBang.pressure === 'yes') {
      count++;
    }
    if (this.MedicalConditions.ent.stopBang.snore === 'yes') {
      count++;
    }
    if (this.MedicalConditions.ent.stopBang.tired === 'yes') {
      count++;
    }
    this.MedicalConditions.ent.stopBang.totalScore = count;
    this.calculateRisk();
  }
  public calculateCategory1Score() {
    let count = 0;
    if (this.MedicalConditions.ent.berlin.snore === 'yes') {
      count++;
    } else {
      this.MedicalConditions.ent.berlin.snoreType = '';
    }
    // tslint:disable-next-line: max-line-length
    if (this.MedicalConditions.ent.berlin.snoreType === 'As loud as talking' || this.MedicalConditions.ent.berlin.snoreType === 'Louder than talking') {
      count++;
    }
    // tslint:disable-next-line: max-line-length
    if (this.MedicalConditions.ent.berlin.snoringFrequency === 'Almost every day' || this.MedicalConditions.ent.berlin.snoringFrequency === '3-4 times per week') {
      count++;
    }
    if (this.MedicalConditions.ent.berlin.snoringBothered === 'yes') {
      count++;
    }
    // tslint:disable-next-line: max-line-length
    if (this.MedicalConditions.ent.berlin.stopBreathing === 'Almost every day' || this.MedicalConditions.ent.berlin.stopBreathing === '3-4 times per week') {
      count = count + 2;
    }
    if (count >= 2) {
      this.MedicalConditions.ent.berlin.category1 = 'positive';
    } else {
      this.MedicalConditions.ent.berlin.category1 = 'negative';
    }
    this.MedicalConditions.ent.berlin.category1Score = count;
    this.calculateRemark();
  }
  public calculateCategory2Score() {
    let count = 0;
    // tslint:disable-next-line: max-line-length
    if (this.MedicalConditions.ent.berlin.tiredAfterSleeping === 'Almost every day' || this.MedicalConditions.ent.berlin.tiredAfterSleeping === '3-4 times per week') {
      count++;
    }
    if (this.MedicalConditions.ent.berlin.fallenAsleep === 'yes') {
      count++;
    }
    // tslint:disable-next-line: max-line-length
    if (this.MedicalConditions.ent.berlin.tiredDuringWaking === 'Almost every day' || this.MedicalConditions.ent.berlin.tiredDuringWaking === '3-4 times per week') {
      count++;
    }
    if (count >= 2) {
      this.MedicalConditions.ent.berlin.category2 = 'positive';
    } else {
      this.MedicalConditions.ent.berlin.category2 = 'negative';
    }
    this.MedicalConditions.ent.berlin.category2Score = count;
    this.calculateRemark();
  }
  public calculateCategory3Score() {
    if (this.MedicalConditions.ent.berlin.highBloodPressure === 'yes' || this.ehealth.profile.bmi > 30) {
      this.MedicalConditions.ent.berlin.category3 = 'positive';
    } else {
      this.MedicalConditions.ent.berlin.category3 = 'negative';
    }
    this.calculateRemark();
  }
  public calculateRemark() {
    let count = 0;
    if (this.MedicalConditions.ent.berlin.category1 === 'positive') {
      count++;
    }
    if (this.MedicalConditions.ent.berlin.category2 === 'positive') {
      count++;
    }
    if (this.MedicalConditions.ent.berlin.category3 === 'positive') {
      count++;
    }
    if (count >= 2) {
      this.MedicalConditions.ent.berlin.remark = 'High Risk';
    } else {
      this.MedicalConditions.ent.berlin.remark = 'Low Risk';
    }
  }
  public calculateRisk() {
    if (this.MedicalConditions.ent.stopBang.totalScore <= 2) {
      this.MedicalConditions.ent.stopBang.risk = 'Low risk of OSA';
    }
    if (this.MedicalConditions.ent.stopBang.totalScore === 3 || this.MedicalConditions.ent.stopBang.totalScore === 4) {
      this.MedicalConditions.ent.stopBang.risk = 'Intermediate risk of OSA';
    }
    if (this.MedicalConditions.ent.stopBang.totalScore >= 5) {
      this.MedicalConditions.ent.stopBang.risk = 'High risk of OSA';
    }
  }
  public calculateAge(date) {
    const timeDiff = Math.abs(Date.now() - date);
    const years = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
    const remaining = Math.floor(timeDiff % (365.25 * 24 * 60 * 60 * 1000));
    const months = Math.floor(remaining / ((365.25 / 12) * 24 * 60 * 60 * 1000));
    const remainingDays = Math.floor(remaining % ((365.25 / 12) * 24 * 60 * 60 * 1000));
    const days = Math.floor(remainingDays / (24 * 60 * 60 * 1000));
    if (years === 0 && months === 0) {
      this.age = days + ' ' + 'days';
    } else if (years === 0) {
      this.age = months + ' ' + 'months';
    } else {
      this.age = years + ' ' + 'years';
    }
  }
  public formatDate() {
    if (this.MedicalConditions && this.MedicalConditions.gynaecology.lastCycle) {
      const date = this.dataService.formatDateAndMonth(this.MedicalConditions.gynaecology.lastCycle);
      this.MedicalConditions.gynaecology.lastCycle = date.split('/')[0];
    }
    if (this.MedicalConditions && this.MedicalConditions.gynaecology.lastMammogram) {
      const date = this.dataService.formatDateAndMonth(this.MedicalConditions.gynaecology.lastMammogram);
      this.MedicalConditions.gynaecology.lastMammogram = date.split('/')[0];
    }
    if (this.MedicalConditions && this.MedicalConditions.gynaecology.lastPapSmear) {
      const date = this.dataService.formatDateAndMonth(this.MedicalConditions.gynaecology.lastPapSmear);
      this.MedicalConditions.gynaecology.lastPapSmear = date.split('/')[0];
    }
  }
  public openModal() {
    return new Promise(async (resolve) => {
      this.modalCtrl.create({
        component: CalculationModalPage,
        cssClass: 'calculation-modal',
        componentProps: {},
      }).then((modal) => {
        modal.present();
      });
    });
  }
  public gastroChangeMode(mode) {
    this.gastroMode = mode;
    this.MedicalConditions.gastroenterology.anatomyImage.mode = 'preview';
    this.anatomyCanvas = undefined;
  }
}
