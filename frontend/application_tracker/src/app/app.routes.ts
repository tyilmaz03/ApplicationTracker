import { Routes } from '@angular/router';
import { ApplicationForm } from './features/application/application-form/application-form';
import { ApplicationTable } from './features/application/application-table/application-table';

export const routes: Routes = [
  {
    path: 'application/new',
    component: ApplicationForm,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'application/new',
  },
  { path: 'applications', component: ApplicationTable },


];
