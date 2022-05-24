import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppDataService } from 'src/app/services/app-data.service';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
})
export class BreadcrumbsComponent implements OnInit {
  @Input() clientDetails;
  @Input() caseDetails;
  constructor(private router: Router, private dataService: AppDataService) { }

  ngOnInit() { }
  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngAfterViewInit() {
    console.log('caseDetails', this.caseDetails);
  }
  goToAllCases() {
    this.router.navigateByUrl('/client-case-list/' + this.clientDetails.id);
  }
  goToCaseProfile() {
    this.dataService.setSelectedCase(this.caseDetails);
    this.router.navigateByUrl('/client-case-profile');
  }
}
