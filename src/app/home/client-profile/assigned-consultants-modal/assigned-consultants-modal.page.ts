import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppDataService } from 'src/app/services/app-data.service';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'app-assigned-consultants-modal',
  templateUrl: './assigned-consultants-modal.page.html',
  styleUrls: ['./assigned-consultants-modal.page.scss'],
})
export class AssignedConsultantsModalPage implements OnInit {
  @Input() patient;
  primaryConsultant = '';
  assignedConsultants = [];
  ifAssignedConsultants = true;
  constructor(private modalCntrl: ModalController, private firebase: FirebaseService, private dataService: AppDataService) { }

  ngOnInit() {
  }
  ionViewDidEnter() {
    if (this.patient.assignedToAgentId !== '') {
      this.dataService.present().then((loader) => {
        loader.present();
        this.firebase.getUserDetails(this.patient.assignedToAgentId).subscribe((resp: any) => {
          this.primaryConsultant = resp.data().name;
          if (this.patient.assignedTo.length > 0) {
            let count = 0;
            this.patient.assignedTo.forEach(element => {
              count++;
              this.firebase.getUserDetails(element).subscribe((res: any) => {
                this.assignedConsultants.push(res.data().name);
                console.log('count: ', count);
                if (count === this.assignedConsultants.length) {
                  this.dataService.dismiss();
                }
              });
            });
          } else {
            this.ifAssignedConsultants = false;
            this.dataService.dismiss();
          }
        });
      });
    }
  }

  closeModal() {
    this.modalCntrl.dismiss();
  }
}
