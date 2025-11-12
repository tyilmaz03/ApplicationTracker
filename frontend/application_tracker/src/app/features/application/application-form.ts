import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';
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
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import * as countriesLib from 'i18n-iso-countries';
import * as frLocale from 'i18n-iso-countries/langs/fr.json';
import { ApplicationService } from './application.service';


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
  const pubDate = group.get('publicationDate')?.value;
  const appDate = group.get('applicationDate')?.value;

  if (pubDate && appDate && pubDate > appDate) {
    return { invalidDateOrder: true };
  }
  return null;
}

@Component({
  selector: 'app-application-form',
  standalone: true,
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
  templateUrl: './application-form.html',
  styleUrls: ['./application-form.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: MAT_DATE_FORMATS, useValue: FR_DATE_FORMATS },
  ],
})
export class ApplicationForm {
  private fb = inject(FormBuilder);

  today = new Date();

  // messages d’erreur pour les chips
  invalidEmail: string | null = null;
  invalidDomain: string | null = null;
  invalidPhone: string | null = null;

  // listes statiques
  statuses = ['Envoyée', 'En attente', 'Entretien prévu', 'Refus', 'Offre reçue'];
  availableFiles = [
    'CV_Junior_Dev.pdf',
    'Lettre_Motivation.pdf',
    'Portfolio.pdf',
    'Références.pdf',
  ];

  // pays
  countries: CountryOption[] = [];
  filteredCountries: CountryOption[] = [];

  constructor(
    private dateAdapter: DateAdapter<Date>,
    private dialog: MatDialog,
    private appService: ApplicationService
  ) {
    this.dateAdapter.setLocale('fr-FR');

    // pays ISO en français
    countriesLib.registerLocale(frLocale as any);
    const names = countriesLib.getNames('fr');

    this.countries = Object.entries(names).map(([code, name]) => ({
      code,
      name,
    }));

    this.filteredCountries = this.countries;
  }

  // Form principal
  form = this.fb.group({
    country: this.fb.control('FR'),
    companyName: this.fb.control('', Validators.required),
    jobTitle: this.fb.control('', Validators.required),
    jobLink: this.fb.control(''),
    publicationDate: this.fb.control<Date | null>(this.today),
    applicationDate: this.fb.control<Date>(this.today, Validators.required),
    status: this.fb.control('', Validators.required),

    contacts: this.fb.group({
      names: this.fb.array<FormControl<string>>([]),
      emails: this.fb.array<FormControl<string>>([]),
      domains: this.fb.array<FormControl<string>>([]),
      phones: this.fb.array<FormControl<string>>([]),
    }),

    followUpDates: this.fb.array<FormControl<Date>>([
      this.fb.control(this.today, { nonNullable: true }),
    ]),

    sentFiles: this.fb.control<string[]>([]),
  },
  {
    validators: [validateDateOrder],
  }
);

  // Getters pratiques
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

  // ----------------------
  // Gestion des chips
  // ----------------------
  addItem(array: FormArray<FormControl<string>>, value: string) {
    const trimmed = value?.trim();
    if (!trimmed) return;

    const isEmailArray = array === this.emails;
    const isDomainArray = array === this.domains;
    const isPhoneArray = array === this.phones;

    const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/;
    const domainRegex = /^([\w-]+\.)+[\w-]{2,}$/;

    // ---- Email ----
    if (isEmailArray && !emailRegex.test(trimmed)) {
      this.invalidEmail = trimmed;
      setTimeout(() => (this.invalidEmail = null), 2500);
      return;
    }

    // ---- Domaine ----
    if (isDomainArray && !domainRegex.test(trimmed)) {
      this.invalidDomain = trimmed;
      setTimeout(() => (this.invalidDomain = null), 2500);
      return;
    }

    // ---- Téléphone ----
    if (isPhoneArray) {
      const selectedCountryCode = (this.form.get('country')?.value as string) || 'FR';

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

    // ---- Ajout générique (noms, domaines, emails déjà validés) ----
    if (!array.value.includes(trimmed)) {
      array.push(this.fb.control(trimmed, { nonNullable: true }));
    }

    // ---- Si email : ajout auto du domaine ----
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

  // ----------------------
  // Dates de suivi
  // ----------------------
  addFollowUpDate(date: Date = this.today) {
    if (!this.followUpDates.value.find((d) => d.getTime() === date.getTime())) {
      this.followUpDates.push(this.fb.control(date, { nonNullable: true }));
    }
  }

  removeFollowUpDate(index: number) {
    this.followUpDates.removeAt(index);
  }

  onDateSelected(event: MatDatepickerInputEvent<Date>, input: HTMLInputElement) {
    const date = event.value;
    if (date) this.addFollowUpDate(date);
    input.value = '';
  }

  // ----------------------
  // Pays (drapeau + recherche)
  // ----------------------
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
      setTimeout(() => {
        input?.focus();
      });
    } else {
      this.filteredCountries = this.countries;
    }
  }

  // ----------------------
  // Soumission du formulaire
  // ----------------------
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.warn('❌ Formulaire invalide', this.form.value);

      this.dialog.open(FeedbackDialog, {
        data: {
          title: 'Erreur',
          message:
            'Le formulaire est incomplet ou contient des erreurs. Merci de vérifier.',
        },
        width: '350px',
      });

      return;
    }

    // --- Génération automatique des domaines à partir des emails ---
    const contacts = this.contacts.value;

    const emailDomains = (contacts.emails || [])
      .filter((e: string) => !!e)
      .map((e: string) => e.substring(e.lastIndexOf('@') + 1))
      .filter((d: string, i: number, arr: string[]) => d && arr.indexOf(d) === i);

    if (emailDomains.length && (!contacts.domains || !contacts.domains[0])) {
      this.domains.clear();
      emailDomains.forEach((d: string) =>
        this.domains.push(this.fb.control(d, { nonNullable: true }))
      );
    }

    // --- Construction du payload pour le backend ---
    const value = this.form.value;

    const payload = {
      country: value.country!,               
      companyName: value.companyName!,        
      jobTitle: value.jobTitle!,              
      jobLink: value.jobLink || '',
      publicationDate: value.publicationDate || null,
      applicationDate: value.applicationDate!, 
      status: value.status!,                 
    };

    console.log('📤 Payload envoyé à l’API :', payload);

    // --- Appel API vers POST /applications ---
    this.appService.createApplication(payload).subscribe({
      next: (response) => {
        console.log('✅ Application créée :', response);

        this.dialog.open(FeedbackDialog, {
          data: {
            title: 'Succès',
            message: 'Votre candidature a bien été enregistrée 🎉',
          },
          width: '350px',
        });

        // Reset propre du formulaire après succès
        this.form.reset({
          country: 'FR',
          applicationDate: new Date(),
        });

        this.form.markAsPristine();
        this.form.markAsUntouched();
      },
      error: (err) => {
        console.error('❌ Erreur API :', err);
        this.dialog.open(FeedbackDialog, {
          data: {
            title: 'Erreur serveur',
            message: "Impossible d'enregistrer la candidature. Réessayez plus tard.",
          },
          width: '350px',
        });
      },
    });
  }

}

// ------------------------------------------------------
//   Dialog de feedback (succès / erreur)
// ------------------------------------------------------
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
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }) {}
}
