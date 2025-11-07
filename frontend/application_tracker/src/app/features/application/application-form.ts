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
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import * as countriesLib from 'i18n-iso-countries';
import * as frLocale from 'i18n-iso-countries/langs/fr.json';


export const FR_DATE_FORMATS: MatDateFormats = {
  parse: { dateInput: 'dd/MM/yyyy' },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

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
    MatDialogModule
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
  invalidEmail: string | null = null;
  invalidDomain: string | null = null;
  invalidPhone: string | null = null;


  statuses = ['Envoyée', 'En attente', 'Entretien prévu', 'Refus', 'Offre reçue'];
  availableFiles = [
    'CV_Junior_Dev.pdf',
    'Lettre_Motivation.pdf',
    'Portfolio.pdf',
    'Références.pdf',
  ];
  countries: { code: string; name: string }[] = []; 


  constructor(
    private dateAdapter: DateAdapter<Date>,
    private dialog: MatDialog
  ) {
    this.dateAdapter.setLocale('fr-FR');
    countriesLib.registerLocale(frLocale);
    
    const names = countriesLib.getNames('fr');
    this.countries = Object.entries(names).map(([code, name]) => ({
      code,
      name,
    }));

  }
  

  form = this.fb.group({
    country: this.fb.control('France'),
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
  });

  // Getters
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

  // Chips helpers
  addItem(array: FormArray<FormControl<string>>, value: string) {
    const trimmed = value?.trim();
    if (!trimmed) return;

    const isEmailArray = array === this.emails;
    const isDomainArray = array === this.domains;
    const isPhoneArray = array === this.phones;

    const emailRegex = /^[\w\.-]+@([\w-]+\.)+[\w-]{2,}$/;
    const domainRegex = /^([\w-]+\.)+[\w-]{2,}$/;
    const phoneRegex =
      /^(\+?\d{1,3}[\s.-]?)?(\(?\d{1,4}\)?[\s.-]?)?(\d[\s.-]?){6,10}\d$/;

    // --- Validation Email ---
    if (isEmailArray && !emailRegex.test(trimmed)) {
      this.invalidEmail = trimmed;
      setTimeout(() => (this.invalidEmail = null), 2500);
      return;
    }

    // --- Validation Domaine ---
    if (isDomainArray && !domainRegex.test(trimmed)) {
      this.invalidDomain = trimmed;
      setTimeout(() => (this.invalidDomain = null), 2500);
      return;
    }

    // --- Validation Téléphone ---
  if (isPhoneArray) {

    const selectedCountry = this.form.get('country')?.value || 'France';
    const countryMap: Record<string, string> = {
      France: 'FR',
      Belgique: 'BE',
      Suisse: 'CH',
      Canada: 'CA',
      Allemagne: 'DE',
    };
    const defaultRegion = countryMap[selectedCountry] || 'FR';

    const phoneNumber = parsePhoneNumberFromString(trimmed, { defaultCountry: defaultRegion as any });
    
    if (!phoneNumber || !phoneNumber.isValid()) {
      this.invalidPhone = trimmed;
      setTimeout(() => (this.invalidPhone = null), 2500);
      return;
    }

    // Normalise le numéro en format international (+33...)
    const formatted = phoneNumber.formatInternational();
    const country = phoneNumber.country || 'Inconnu';
    console.log(`📞 Numéro valide (${country}):`, formatted);

    // Empêche les doublons
    if (!array.value.includes(formatted)) {
      array.push(this.fb.control(formatted, { nonNullable: true }));
    }
    return;
  }

    // --- Ajout de l’élément principal ---
    if (!array.value.includes(trimmed)) {
      array.push(this.fb.control(trimmed, { nonNullable: true }));
    }

    // --- Si c’est un email valide, ajoute son domaine automatiquement ---
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
    input.value = ''; // vide le champ après sélection
  }

  countryFlag(code: string): string {
    if (!code) return '';
    // code ISO2 -> emoji (FR -> 🇫🇷)
    return code
      .toUpperCase()
      .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.warn('❌ Formulaire invalide', this.form.value);

      this.dialog.open(FeedbackDialog, {
        data: {
          title: 'Erreur',
          message: 'Le formulaire est incomplet ou contient des erreurs. Merci de vérifier.',
        },
        width: '350px',
      });

      return;
    }

    const value = this.form.value;

    // Génération automatique des domaines
    const emailDomains = (value.contacts?.emails || [])
      .filter((e) => !!e)
      .map((e) => e.substring(e.lastIndexOf('@') + 1))
      .filter((d, i, arr) => d && arr.indexOf(d) === i);

    if (emailDomains.length && (!value.contacts?.domains || !value.contacts.domains[0])) {
      this.domains.clear();
      emailDomains.forEach((d) =>
        this.domains.push(this.fb.control(d, { nonNullable: true }))
      );
    }

    console.log('✅ Données du formulaire envoyées :', this.form.value);

    // --- ✅ Dialogue de succès
    this.dialog.open(FeedbackDialog, {
      data: {
        title: 'Succès',
        message: 'Votre candidature a bien été enregistrée 🎉',
      },
      width: '350px',
    });

    this.form.reset({
      country: 'France',
      applicationDate: new Date(),
    });
  }
}


@Component({
  selector: 'app-feedback-dialog',
  standalone: true,
  template: `
    <h2 mat-dialog-title [class.error]="data.title === 'Erreur'">{{ data.title }}</h2>
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


