import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { FullCalendarModule } from '@fullcalendar/angular';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery/ngx';
import { CameraPreview } from '@ionic-native/camera-preview/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { CaseUpdateStatusPage } from './home/client-case-profile/case-update-status/case-update-status.page';
// tslint:disable-next-line: max-line-length
import { AngularFireAuthModule } from '@angular/fire/auth';
import { UploadFormModalPage } from './home/client-case-profile/upload-form-modal/upload-form-modal.page';
// tslint:disable-next-line: max-line-length
// eslint-disable-next-line max-len
import { ClientRegistrationTermsModalPage } from './home/client-registration/client-registration-terms-modal/client-registration-terms-modal.page';
import { SignatureModalPage } from './home/signature-modal/signature-modal.page';
import { AppDataService } from './services/app-data.service';
import { AwsService } from './services/aws.service';
import { InsuranceDocsService } from './services/insurance-docs.service';
import { AuthService } from './services/auth.service';
import { SignaturePadModule } from 'angular2-signaturepad';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { DownloadFileService } from './services/download-file.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
@NgModule({
  declarations: [AppComponent,
    SignatureModalPage,
    CaseUpdateStatusPage,
    UploadFormModalPage,
    ClientRegistrationTermsModalPage,],
  entryComponents: [SignatureModalPage, CaseUpdateStatusPage, UploadFormModalPage, ClientRegistrationTermsModalPage],
  imports: [BrowserModule, IonicModule.forRoot({ animated: false }), AppRoutingModule, IonicStorageModule.forRoot(),
    FormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig, 'PremiumCare'),
    AngularFirestoreModule,
    AngularFireAuthModule,
    HttpClientModule,
    FullCalendarModule,
    PdfViewerModule,
    NgxDocViewerModule,
    Ng2SearchPipeModule,
    SignaturePadModule
  ],
  providers: [
    StatusBar,
    SplashScreen, AppDataService, SocialSharing,
    AwsService,
    AuthService,
    InsuranceDocsService,
    ScreenOrientation,
    ImagePicker,
    Base64ToGallery,
    CameraPreview,
    FileTransfer,
    File,
    DownloadFileService,
    AndroidPermissions,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }
