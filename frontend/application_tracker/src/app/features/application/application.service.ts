import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApplicationRequest {
  country: string;
  companyName: string;
  jobTitle: string;
  jobLink?: string;
  publicationDate?: string | null;
  applicationDate: string;
  status: string;
}

export interface ApplicationResponse extends ApplicationRequest {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private apiUrl = '/api/applications';

  constructor(private http: HttpClient) {}

  createApplication(request: ApplicationRequest): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(this.apiUrl, request);
  }
}
