import { Injectable } from '@angular/core';
import * as AWS from 'aws-sdk';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AwsService {
  public s3 = null;
  constructor() { }
  public initializeAWS() {
    AWS.config.update(
      {
        accessKeyId: environment.awsConfig.accessKeyId,
        secretAccessKey: environment.awsConfig.secretAccessKey,
        region: environment.awsConfig.region,
      });
    AWS.config.apiVersions = {
      s3: '2006-03-01',
      // other service API versions
    };
    this.s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      params: { Bucket: environment.aws.bucketName },
    });
  }
  public uploadFilesAWS(files, successCB, errorCB, uploadProgressCB) {
    if (this.s3 == null) {
      this.initializeAWS();
    }
    const filesData = [];
    let sizeTotal = 0;
    const loaded = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < files.length; i++) {
      filesData.push({ name: files[i].name, size: files[i].size });
      sizeTotal += files[i].size;
      loaded[files[i].name] = 0;
    }
    if (files.length === 0) {
      successCB({ result: 'No file to Uploaded' });
    }
    let uploadCount = 0;
    for (let i = 0, filesLen = files.length; i < filesLen; i++) {
      // tslint:disable-next-line: max-line-length
      const params = { Key: files[i].key, Body: files[i].arrayBuffer, Bucket: environment.aws.bucketName, ACL: 'public-read', content_type: files[i].type };
      const that = this;
      // tslint:disable-next-line: only-arrow-functions
      (function (i, params) {
        // tslint:disable-next-line: only-arrow-functions
        that.s3.upload(params, function (err, data) {
          if (err) {
            // alert('File Upload error');
            errorCB({ err: err.toString() });
          }
          uploadCount++;
          if (files.length === uploadCount) {
            successCB({ result: files.length + 'Files Uploaded' });
          }
          // tslint:disable-next-line: only-arrow-functions
        }).on('httpUploadProgress', function (e) {
          loaded[files[i].name] = e.loaded;
          let loadedTotal = 0;
          // tslint:disable-next-line: forin
          for (const j in loaded) {
            loadedTotal += loaded[j];
          }
          const progress = Math.round(loadedTotal / sizeTotal * 100);
          uploadProgressCB({ uploadedPercent: progress });
        });
      })(i, params);
    }
  }
  public deleteFileAWS(fileAccessURL) {
    return new Promise((resolve, reject) => {
      const keyToDelete = fileAccessURL.replace(environment.aws.bucketAccessRootPath, '');
      if (this.s3 == null) {
        this.initializeAWS();
      }
      const params = { Bucket: environment.aws.bucketName, Key: keyToDelete };
      this.s3.deleteObject(params, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }
  public getFiles(folderName) {
    console.log('folderName: ', folderName);
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: environment.aws.bucketName,
        Prefix: folderName + '/',
        Delimiter: '/'        // ? get only files (exclude archive folder)
      };
      if (this.s3 == null) {
        this.initializeAWS();
      }
      this.s3.listObjects(params, (err, data) => {
        if (err) {
          reject(err);
        }
        const allFiles = [];
        if (data) {
          let fileObj;
          console.log('data.Contents: ', data.Contents);
          data.Contents.forEach((file) => {
            if (file.Size > 0) {
              fileObj = {
                fileUploadKey: file.Key,
                fileUploadDate: file.LastModified,
                fileUploadSize: file.Size,
              };
              allFiles.push(fileObj);
            }
          });
        }
        resolve(allFiles);
      });
    });
  }
}