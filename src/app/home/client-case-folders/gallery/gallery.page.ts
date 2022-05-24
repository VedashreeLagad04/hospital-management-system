import { Component, ElementRef, OnInit } from '@angular/core';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NavController, AlertController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.page.html',
  styleUrls: ['./gallery.page.scss'],
})
export class GalleryPage implements OnInit {
  public mode = 'edit';
  public selectedImages: any = [];
  public currentImage: any;
  public currentImageIndex: any = 0;
  public uploadProgress: any = 0;
  public showProgressBar = false;
  public uploadPercent: any = 0;
  public existingFiles: any;
  public imageNameUpdate: any = new Subject<string>();
  public isBlank = false;
  public isNameExists = false;
  public pdfContent: any = [];
  constructor(private imagePicker: ImagePicker,
    private componentDom: ElementRef,
    private modalController: ModalController
  ) { }

  public ngOnInit() {
  }
  public showSelectedImage(image, index) {
    this.currentImage = image;
    this.currentImageIndex = index;
  }
}
