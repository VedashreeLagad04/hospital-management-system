import { Injectable } from '@angular/core';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Platform } from '@ionic/angular';
import { AppDataService } from './app-data.service';

@Injectable({
  providedIn: 'root'
})
export class DownloadFileService {
  fileTransfer: FileTransferObject;
  constructor(private file: File,
    private transfer: FileTransfer,
    private platform: Platform,
    private androidPermission: AndroidPermissions,
    private dataservice: AppDataService) {
    platform.ready().then(() => {
      console.log('platform ready in download file service');
      this.fileTransfer = this.transfer.create();
    });
  }

  async downloadFile(file: any, mode?) {
    console.log('file: ', file);
    let uri;
    if (mode && mode === 'blob') {
      uri = file.filePath;
    } else {
      uri = encodeURI(file.filePath);
    }
    const path = await this.getDownloadPath();
    console.log('path: ', path);
    this.dataservice.presentOnlyLoader().then(async (loader) => {
      loader.present();
      // this.download(uri, path, file);
      // ? create dir and then download file in that dir
      // !todo - need to create directories 1 by 1
      // !TODO:- 1. create main 'Premium care' dir
      const dirPaths = file.fileDir.split('/');
      const mainDirPath = dirPaths[0];
      const clientDirPath = dirPaths[1];
      const caseDirPath = dirPaths[2];
      const mainDirCreated = await this.createMainDirectory(path, mainDirPath);
      if (mainDirCreated) {
        // !TODO:- 2. create client name dir
        const clientDirCreated = await this.createClientNameDirectory(path, mainDirPath, clientDirPath);
        if (clientDirCreated) {
          if (caseDirPath) {
            // !TODO:- 3. create case name dir
            const caseDirCreated = await this.createCaseNameDirectory(path, mainDirPath + '/' + clientDirPath, caseDirPath);
            if (caseDirCreated) {
              // ? download file in 'Downloads/Premium Care/Client Name/Case Name' folder
              this.download(uri, path + file.fileDir, file);
            } else {
              // ? case name dir not created; hence download file in 'Premium Care/ client name' folder directly
              this.download(uri, path + file.fileDir, file);
            }
          } else {
            // ? case name not present in file.dileDir; hence download file in 'Premium Care/ client name' folder directly
            this.download(uri, path + mainDirPath + '/' + clientDirPath, file);
          }
        } else {
          // ? client name dir not created; hence download file in 'Downloads/Premium Care' folder directly
          this.download(uri, path + mainDirPath + '/' + clientDirPath, file);
        }
      } else {
        // ? main 'Premium care' dir not created; hence download file in 'Downloads' folder directly
        this.download(uri, path, file);
      }
    });
  }
  createMainDirectory(path, dirPath) {
    return new Promise((resolve) => {
      this.file.checkDir(path, dirPath).then((resp) => {
        console.log('resp: ', resp);
        console.log(dirPath, ' Dir already exists!');
        resolve(true);
      }).catch((error) => {
        console.log('error: ', error);
        console.log(dirPath, ' Dir does not exist!');
        this.file.createDir(path, dirPath, false).then((res) => {
          console.log('res: ', res);
          console.log(dirPath, ' Dir created!');
          resolve(true);
        }).catch((err) => {
          console.log('err: ', err);
          console.log(dirPath, ' Dir not created!');
          if (err.code === 12) {        // ? dir with same name already exists
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    });
  }
  createCaseNameDirectory(path, mainDirPath, dirPath) {
    return new Promise((resolve) => {
      this.file.checkDir(path + mainDirPath, dirPath).then((resp) => {
        console.log('resp: ', resp);
        console.log(mainDirPath, dirPath, ' Dir already exists!');
        resolve(true);
      }).catch((error) => {
        console.log('error: ', error);
        console.log(mainDirPath, dirPath, ' Dir does not exist!');
        this.file.createDir(path + mainDirPath, dirPath, false).then((res) => {
          console.log('res: ', res);
          console.log(mainDirPath, dirPath, ' Dir created!');
          resolve(true);
        }).catch((err) => {
          console.log('err: ', err);
          console.log(mainDirPath, dirPath, ' Dir not created!');
          if (err.code === 12) {        // ? dir with same name already exists
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    });
  }
  createClientNameDirectory(path, mainDirPath, dirPath) {
    return new Promise((resolve) => {
      this.file.checkDir(path + mainDirPath, dirPath).then((resp) => {
        console.log('resp: ', resp);
        console.log(mainDirPath, dirPath, ' Dir already exists!');
        resolve(true);
      }).catch((error) => {
        console.log('error: ', error);
        console.log(mainDirPath, dirPath, ' Dir does not exist!');
        this.file.createDir(path + mainDirPath, dirPath, false).then((res) => {
          console.log('res: ', res);
          console.log(mainDirPath, dirPath, ' Dir created!');
          resolve(true);
        }).catch((err) => {
          console.log('err: ', err);
          console.log(mainDirPath, dirPath, ' Dir not created!');
          if (err.code === 12) {        // ? dir with same name already exists
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    });
  }
  download(uri, path, file) {
    const headers = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Access-Control-Allow-Origin': '*',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Access-Control-Allow-Methods': '*'
    };
    this.dataservice.presentAlert('File downloaded!');
    this.fileTransfer.download(uri, path + '/' + file.fileName, true, { headers }).then((resp) => {
      console.log('resp: ', resp);
      this.dataservice.dismiss();
    }).catch((err) => {
      console.log('err: ', err);
      this.dataservice.dismiss();
      this.dataservice.presentAlert('Error while downloading file!');
    });
  }
  async getDownloadPath() {
    if (this.platform.is('ios')) {
      return this.file.documentsDirectory;
    }
    // To be able to save files on Android, we first need to ask the user for permission. 
    // We do not let the download proceed until they grant access
    await this.androidPermission.checkPermission(this.androidPermission.PERMISSION.WRITE_EXTERNAL_STORAGE).then((result) => {
      if (!result.hasPermission) {
        return this.androidPermission.requestPermission(this.androidPermission.PERMISSION.WRITE_EXTERNAL_STORAGE);
      }
    });
    // return this.file.dataDirectory + 'Download/';
    return this.file.externalRootDirectory + 'Download/';
  }
}
