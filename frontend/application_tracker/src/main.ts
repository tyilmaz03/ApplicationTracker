import { bootstrapApplication } from '@angular/platform-browser';
import { ApplicationConfig, mergeApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { MatSortModule } from '@angular/material/sort';

import { App } from './app/app';
import { appConfig } from './app/app.config';

const extraProviders: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    importProvidersFrom(MatSortModule),
  ],
};

bootstrapApplication(App, mergeApplicationConfig(appConfig, extraProviders))
  .catch(err => console.error(err));
