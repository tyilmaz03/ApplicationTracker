import { bootstrapApplication } from '@angular/platform-browser';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { App } from './app/app';
import { appConfig } from './app/app.config';

const extraProviders: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch())
  ],
};

bootstrapApplication(App, mergeApplicationConfig(appConfig, extraProviders))
  .catch(err => console.error(err));
