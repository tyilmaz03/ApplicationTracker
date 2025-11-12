import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface ContactsDTO {
  names: string[];
  emails: string[];
  domains: string[];
  phones: string[];
}

export interface ApplicationRequest {
  country: string;
  companyName: string;
  jobTitle: string;
  jobLink?: string;
  publicationDate?: string | null;
  applicationDate: string;
  status: string;
  contacts: ContactsDTO;
  followUpDates: string[];
  sentFiles: string[];
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
