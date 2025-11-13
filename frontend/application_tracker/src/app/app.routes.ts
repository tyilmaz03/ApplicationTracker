import { Routes } from '@angular/router';
import { ApplicationForm } from './features/application/application-form/application-form';
import { ApplicationTable } from './features/application/application-table/application-table';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'applications',
  },
  {
    path: 'application/new',
    component: ApplicationForm,
  },
  { path: 'applications', component: ApplicationTable },


];
