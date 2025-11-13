import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import {
  MatDatepickerModule,
  MatDatepickerInputEvent,
} from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  DateAdapter,
  MatDateFormats,
} from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Router } from '@angular/router';

import { parsePhoneNumberFromString } from 'libphonenumber-js';
import * as countriesLib from 'i18n-iso-countries';
import * as frLocale from 'i18n-iso-countries/langs/fr.json';

import {
  ApplicationService,
  ApplicationRequest,
} from '../application.service';

export const FR_DATE_FORMATS: MatDateFormats = {
  parse: { dateInput: 'dd/MM/yyyy' },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

type CountryOption = { code: string; name: string };

function validateDateOrder(group: FormGroup) {
  const pubDate = group.get('publicationDate')?.value as Date | null;
  const appDate = group.get('applicationDate')?.value as Date | null;

  if (pubDate && appDate && pubDate > appDate) {
    return { invalidDateOrder: true };
  }
  return null;
}

@Component({
  selector: 'app-application-form',
  standalone: true,
  templateUrl: './application-form.html',
  styleUrls: ['./application-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: MAT_DATE_FORMATS, useValue: FR_DATE_FORMATS },
  ],
})
export class ApplicationForm {
  private readonly fb = inject(FormBuilder);
  private readonly dateAdapter = inject<DateAdapter<Date>>(DateAdapter);
  private readonly dialog = inject(MatDialog);
  private readonly appService = inject(ApplicationService);
  private readonly router = inject(Router);

  readonly separatorKeysCodes = [ENTER, COMMA];

  readonly today = new Date();

  invalidEmail: string | null = null;
  invalidDomain: string | null = null;
  invalidPhone: string | null = null;

  readonly statuses: string[] = [
    'Envoyée',
    'En attente',
    'Entretien prévu',
    'Refus',
    'Offre reçue',
  ];

  readonly availableFiles: string[] = [
    'CV_Junior_Dev.pdf',
    'Lettre_Motivation.pdf',
    'Portfolio.pdf',
    'Références.pdf',
  ];

  countries: CountryOption[] = [];
  filteredCountries: CountryOption[] = [];

  constructor() {
    this.dateAdapter.setLocale('fr-FR');

    countriesLib.registerLocale(frLocale as unknown as countriesLib.LocaleData);
    const names = countriesLib.getNames('fr') as Record<string, string>;

    this.countries = Object.entries(names).map(([code, name]) => ({
      code,
      name,
    }));

    this.filteredCountries = this.countries;
  }

  form = this.fb.group(
    {
      country: this.fb.control<string>('FR', {
        nonNullable: true,
      }),
      companyName: this.fb.control<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      jobTitle: this.fb.control<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      jobLink: this.fb.control<string>('', {
        nonNullable: true,
      }),
      publicationDate: this.fb.control<Date | null>(this.today),
      applicationDate: this.fb.control<Date>(this.today, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      status: this.fb.control<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      contacts: this.fb.group({
        names: this.fb.array<FormControl<string>>([]),
        emails: this.fb.array<FormControl<string>>([]),
        domains: this.fb.array<FormControl<string>>([]),
        phones: this.fb.array<FormControl<string>>([]),
      }),
      followUpDates: this.fb.array<FormControl<Date>>([
        this.fb.control(this.today, { nonNullable: true }),
      ]),
      sentFiles: this.fb.control<string[]>([], { nonNullable: true }),
    },
    {
      validators: [validateDateOrder],
    }
  );

  get contacts(): FormGroup {
    return this.form.get('contacts') as FormGroup;
  }
  get names(): FormArray<FormControl<string>> {
    return this.contacts.get('names') as FormArray<FormControl<string>>;
  }
  get emails(): FormArray<FormControl<string>> {
    return this.contacts.get('emails') as FormArray<FormControl<string>>;
  }
  get domains(): FormArray<FormControl<string>> {
    return this.contacts.get('domains') as FormArray<FormControl<string>>;
  }
  get phones(): FormArray<FormControl<string>> {
    return this.contacts.get('phones') as FormArray<FormControl<string>>;
  }
  get followUpDates(): FormArray<FormControl<Date>> {
    return this.form.get('followUpDates') as FormArray<FormControl<Date>>;
  }

  // --- chips (identique à ta version, je laisse tel quel) ---
  addItem(array: FormArray<FormControl<string>>, raw: string) {
    const trimmed = raw?.trim();
    if (!trimmed) return;

    const isEmailArray = array === this.emails;
    const isDomainArray = array === this.domains;
    const isPhoneArray = array === this.phones;

    const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/;
    const domainRegex = /^([\w-]+\.)+[\w-]{2,}$/;

    if (isEmailArray && !emailRegex.test(trimmed)) {
      this.invalidEmail = trimmed;
      setTimeout(() => (this.invalidEmail = null), 2500);
      return;
    }

    if (isDomainArray && !domainRegex.test(trimmed)) {
      this.invalidDomain = trimmed;
      setTimeout(() => (this.invalidDomain = null), 2500);
      return;
    }

    if (isPhoneArray) {
      const selectedCountryCode = this.form.get('country')!.value || 'FR';

      const phoneNumber = parsePhoneNumberFromString(trimmed, {
        defaultCountry: selectedCountryCode as any,
      });

      if (!phoneNumber || !phoneNumber.isValid()) {
        this.invalidPhone = trimmed;
        setTimeout(() => (this.invalidPhone = null), 2500);
        return;
      }

      const formatted = phoneNumber.formatInternational();
      const country = phoneNumber.country || selectedCountryCode;
      console.log(`📞 Numéro valide (${country}):`, formatted);

      if (!array.value.includes(formatted)) {
        array.push(this.fb.control(formatted, { nonNullable: true }));
      }
      return;
    }

    if (!array.value.includes(trimmed)) {
      array.push(this.fb.control(trimmed, { nonNullable: true }));
    }

    if (isEmailArray) {
      const domain = trimmed.substring(trimmed.lastIndexOf('@') + 1);
      if (!this.domains.value.includes(domain)) {
        this.domains.push(this.fb.control(domain, { nonNullable: true }));
      }
    }
  }

  removeItem(array: FormArray, index: number) {
    array.removeAt(index);
  }

  addFollowUpDate(date: Date = this.today) {
    const exists = this.followUpDates.value.some(
      (d) => d.getTime() === date.getTime()
    );
    if (!exists) {
      this.followUpDates.push(this.fb.control(date, { nonNullable: true }));
    }
  }

  removeFollowUpDate(index: number) {
    this.followUpDates.removeAt(index);
  }

  onDateSelected(
    event: MatDatepickerInputEvent<Date>,
    input: HTMLInputElement
  ) {
    const date = event.value;
    if (date) this.addFollowUpDate(date);
    input.value = '';
  }

  countryFlag(code: string): string {
    if (!code) return '';
    return code
      .toUpperCase()
      .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
  }

  onCountrySearch(term: string) {
    const value = term.toLowerCase().trim();
    if (!value) {
      this.filteredCountries = this.countries;
      return;
    }

    this.filteredCountries = this.countries.filter(
      (c) =>
        c.name.toLowerCase().includes(value) ||
        c.code.toLowerCase().includes(value)
    );
  }

  onCountryOpened(opened: boolean, input?: HTMLInputElement) {
    if (opened) {
      setTimeout(() => input?.focus());
    } else {
      this.filteredCountries = this.countries;
    }
  }

  private toYMD(date: Date | null | undefined): string | null {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private resetFormAfterSuccess(): void {
    this.form.reset({
      country: 'FR',
      companyName: '',
      jobTitle: '',
      jobLink: '',
      publicationDate: null,
      applicationDate: this.today,
      status: '',
      contacts: {
        names: [],
        emails: [],
        domains: [],
        phones: [],
      },
      followUpDates: [],
      sentFiles: [],
    });

    this.names.clear();
    this.emails.clear();
    this.domains.clear();
    this.phones.clear();
    this.followUpDates.clear();

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.open(FeedbackDialog, {
        data: {
          title: 'Erreur',
          message: 'Le formulaire est incomplet ou contient des erreurs.',
        },
        width: '350px',
      });
      return;
    }

    const v = this.form.getRawValue();

    if (!this.domains.length && this.emails.length) {
      const emailDomains = this.emails.value
        .filter((e) => !!e)
        .map((e) => e.substring(e.lastIndexOf('@') + 1))
        .filter((d, i, arr) => d && arr.indexOf(d) === i);

      this.domains.clear();
      emailDomains.forEach((d) =>
        this.domains.push(this.fb.control(d, { nonNullable: true }))
      );
    }

    const payload: ApplicationRequest = {
      country: v.country,
      companyName: v.companyName,
      jobTitle: v.jobTitle,
      jobLink: v.jobLink || '',
      publicationDate: this.toYMD(v.publicationDate),
      applicationDate: this.toYMD(v.applicationDate)!,
      status: v.status,
      contacts: {
        names: this.names.value,
        emails: this.emails.value,
        domains: this.domains.value,
        phones: this.phones.value,
      },
      followUpDates: this.followUpDates.value.map((d) => this.toYMD(d)!),
      sentFiles: v.sentFiles ?? [],
    };

    console.log('📤 Payload envoyé à l’API :', payload);

    this.appService.createApplication(payload).subscribe({
      next: (res) => {
        console.log('✅ Application créée :', res);

        const dialogRef = this.dialog.open(ApplicationSuccessDialog, {
          data: {
            title: 'Succès',
            message: 'Votre candidature a bien été enregistrée 🎉',
          },
          width: '380px',
        });

        dialogRef.afterClosed().subscribe((action) => {
          if (action === 'new') {
            this.resetFormAfterSuccess();
          } else if (action === 'list') {
            this.router.navigate(['/applications']);
          }
        });
      },
      error: (err) => {
        console.error('❌ Erreur API :', err);
        this.dialog.open(FeedbackDialog, {
          data: {
            title: 'Erreur serveur',
            message: "Impossible d'enregistrer la candidature.",
          },
          width: '350px',
        });
      },
    });
  }
}

// ---- Dialog simple pour les erreurs ----
@Component({
  selector: 'app-feedback-dialog',
  standalone: true,
  template: `
    <h2 mat-dialog-title [class.error]="data.title === 'Erreur'">
      {{ data.title }}
    </h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close color="primary">Fermer</button>
    </mat-dialog-actions>
  `,
  imports: [MatDialogModule, MatButtonModule],
})
export class FeedbackDialog {
  readonly data = inject<{ title: string; message: string }>(MAT_DIALOG_DATA);
}

// ---- Dialog succès ---
@Component({
  selector: 'app-application-success-dialog',
  standalone: true,
  template: `
    <h2 mat-dialog-title>
      {{ data.title }}
    </h2>

    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="onAddNew()">
        Ajouter une autre candidature
      </button>
      <button mat-raised-button color="primary" (click)="onGoToList()">
        Retour à la liste
      </button>
    </mat-dialog-actions>
  `,
  imports: [MatDialogModule, MatButtonModule],
})
export class ApplicationSuccessDialog {
  readonly data = inject<{ title: string; message: string }>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ApplicationSuccessDialog>);

  onAddNew(): void {
    this.dialogRef.close('new');
  }

  onGoToList(): void {
    this.dialogRef.close('list');
  }
}
