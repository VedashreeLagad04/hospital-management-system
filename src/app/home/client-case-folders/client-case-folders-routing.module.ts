import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClientCaseFoldersPage } from './client-case-folders.page';

const routes: Routes = [
  {
    path: '',
    component: ClientCaseFoldersPage,
  },
  {
    path: 'discharge-docs-checklist',
    // tslint:disable-next-line: max-line-length
    loadChildren: () => import('./discharge-docs-checklist/discharge-docs-checklist.module').then( (m) => m.DischargeDocsChecklistPageModule),
  },
  {
    path: 'camera',
    loadChildren: () => import('./camera/camera.module').then( (m) => m.CameraPageModule),
  },
  {
    path: 'gallery',
    loadChildren: () => import('./gallery/gallery.module').then( (m) => m.GalleryPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientCaseFoldersPageRoutingModule {}
