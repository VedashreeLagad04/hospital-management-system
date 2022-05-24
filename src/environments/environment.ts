// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
//  ? developer version =>
const bucketName = 'premium-care-bucket';
// ! premium care sg version =>
// const bucketName = 'premium-care-sg-bucket';
const bucketRootKey = 'root';
// ? developer version =>
const bucketAccessRootPath = 'https://' + bucketName + '.s3.ap-south-1.amazonaws.com/';
// ! premium care sg version =>
// const bucketAccessRootPath = 'https://' + bucketName + '.s3.ap-southeast-1.amazonaws.com/';
const bucketAdmissionDocumentsPath = 'admission';
const bucketInsuranceDocumentsPath = 'insurance';
const bucketMedicalConditionImagePath = 'medical-condition';
const bucketDischargeDocumentsPath = 'discharge';
const bucketInvoiceDocumentsPath = 'invoices';
const bucketMedicalReportsPath = 'medical-reports';
const bucketClaimDocumentsPath = 'claims';
const bucketChatArchivePath = 'chat-archive';
const bucketPersonalParticularsPath = 'personal-particulars';
const bucketCaseSubmissionFilePath = 'case-submission';
const isWeb = true;
export const environment = {
  isWeb,
  production: false,
  firebaseConfig: {

    // ? HiFi Tech Database
    apiKey: 'AIzaSyBG-L2ofBPi04zUgBFD1WIK3FfMH4k1U0Q',
    authDomain: 'premiumcare-370d1.firebaseapp.com',
    databaseURL: 'https://premiumcare-370d1.firebaseio.com',
    projectId: 'premiumcare-370d1',
    storageBucket: 'premiumcare-370d1.appspot.com',
    messagingSenderId: '1005914850349',
    appId: '1:1005914850349:web:17dd919fda2b4f645ca4a4',
    measurementId: 'G-F0R7T05CY8'

    // ! Premium Care SG
    // apiKey: "AIzaSyBDwpQV4NdjABoONtr3ZYp5mqCtsKMJQ24",
    // authDomain: "premium-care-sg.firebaseapp.com",
    // databaseURL: "https://premium-care-sg.firebaseio.com",
    // projectId: "premium-care-sg",
    // storageBucket: "premium-care-sg.appspot.com",
    // messagingSenderId: "259071304222",
    // appId: "1:259071304222:web:27027bbd4cb84cb1f5440f",
    // measurementId: "G-S4GH07E123"

    //Siddharth
    // apiKey: "AIzaSyCaiGV-4u0qGSeECVhbnYbFejURBASFvfA",
    // authDomain: "superadmin-47bb2.firebaseapp.com",
    // databaseURL: "https://superadmin-47bb2.firebaseio.com",
    // projectId: "superadmin-47bb2",
    // storageBucket: "superadmin-47bb2.appspot.com",
    // messagingSenderId: "827779009599",
    // appId: "1:827779009599:web:1492d41e479a508fcf7c8a",
    // measurementId: "G-MJK4RZV7S0"
  },
  // ? developer version =>
  awsConfig: {
    // accessKeyId: 'AKIAI7TCQNFNFSCMUDFA',
    // secretAccessKey: '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',
    // region: 'ap-south-1',
    accessKeyId: 'AKIARQZAL3LXVNZLVGJM',
    secretAccessKey: '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',
    region: 'ap-south-1'
  },
  // ! premium care sg
  // awsConfig: {
  //   accessKeyId: 'AKIAUJP3C6KJKHT6MFOH',
  //   secretAccessKey: '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',
  //   region: 'ap-southeast-1',
  // },
  aws: {
    bucketName,
    bucketAccessRootPath,
    bucketAdmissionDocumentsPath,
    bucketInsuranceDocumentsPath,
    bucketRootKey,
    bucketMedicalConditionImagePath,
    bucketPersonalParticularsPath,
    bucketChatArchivePath,
    bucketClaimDocumentsPath,
    bucketDischargeDocumentsPath,
    bucketMedicalReportsPath,
    bucketInvoiceDocumentsPath,
    // bucketDischargeSummaryPath,
    // bucketInterimBillPath,
    // bucketHospitalisationLeavePath,
    // bucketDischargeMedicalReport,
    // bucketDischargeDocsChecklist,
    bucketCaseSubmissionFilePath,
  },
  usersCollectionName: 'Users',
  clientDetailsCollectionName: 'ClientDetails',
  casesCollectionName: 'Case',
  appointmentCollectionName: 'Appointment',
  staticDetailsCollectionName: 'staticDetails',
  ehealthCollectionName: 'E-healthBooklet',
  medicalConditionCollectionName: 'MedicalConditions',
  consentCollectionName: 'LetterOfConsent',
  admissionCollectionName: 'Admission',
  invoiceCollectionName: 'Invoices',
  referralSourceCollectionName: 'referralSource',
  insurerCollectionName: 'insurer',
  surgicalCodeCollectionName: 'surgicalCode',
  institutionCollectionName: 'institution',
  facilityCollectionName: 'facility',
  doctorCollectionName: 'doctor',
  riderPlanCollectionName: 'riderPlan',
  withdrawalLimitCollectionName: 'withdrawalLimit',
  insuranceParameterCollectionName: 'insuranceParameter',
  globalParameterCollectionName: 'globalParameters',
  commonEhealthCollectionName: 'commonEhealth',
  // ? dropdowns from superadmin
  frequencyOfPaymentCollectionName: 'frequencyOfPayment',
  mainModeOfPaymentCollectionName: 'mainModeOfPayment',
  riderModeOfPaymentCollectionName: 'riderModeOfPayment',
  typeOfVaccinationCollectionName: 'typeOfVaccination',
  medicalHistoryCollectionName: 'medicalHistory',
  typeOfAppointmentCollectionName: 'typeOfAppointment',
  serviceTypeCollectionName: 'serviceType',
  claimsZeroizedCollectionName: 'claimsZeroized',
  claimsStatusCollectionName: 'claimsStatus',
  caseTypeCollectionName: 'caseType',
  memoInstructionCollectionName: 'memo-instructions',
  memoRevisionCollectionName: 'memo-revisions'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
