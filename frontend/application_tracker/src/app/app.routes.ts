import { Routes } from '@angular/router';
import { ApplicationForm } from './features/application/application-form';

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

];
