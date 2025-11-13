import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
} from '@angular/material/paginator';
import {
  MatSort,
  MatSortModule,
} from '@angular/material/sort';
import {
  MatFormFieldModule,
} from '@angular/material/form-field';
import {
  MatInputModule,
} from '@angular/material/input';
import {
  MatProgressSpinnerModule,
} from '@angular/material/progress-spinner';

import { Router } from '@angular/router';

import {
  ApplicationService,
  ApplicationResponse,
} from '../application.service';

@Component({
  selector: 'app-application-table',
  standalone: true,
  templateUrl: './application-table.html',
  styleUrl: './application-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
})
export class ApplicationTable implements OnInit {

  // Colonnes affichées dans le tableau
  readonly displayedColumns: string[] = [
    'companyName',
    'jobTitle',
    'country',
    'status',
    'applicationDate',
    'publicationDate',
    'jobLink',
  ];

  // DataSource Material (tri, filtre, pagination inclus)
  readonly dataSource = new MatTableDataSource<ApplicationResponse>([]);

  // État de chargement
  loading = true;

  @ViewChild(MatPaginator)
  set matPaginator(paginator: MatPaginator | undefined) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  @ViewChild(MatSort)
  set matSort(sort: MatSort | undefined) {
    if (sort) {
      this.dataSource.sort = sort;
    }
  }

  private readonly applicationService = inject(ApplicationService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // Filtre custom (company / job / country / status)
    this.dataSource.filterPredicate = (data, filter) => {
      const f = filter.trim().toLowerCase();
      return (
        (data.companyName ?? '').toLowerCase().includes(f) ||
        (data.jobTitle ?? '').toLowerCase().includes(f) ||
        (data.country ?? '').toLowerCase().includes(f) ||
        (data.status ?? '').toLowerCase().includes(f)
      );
    };

    // Chargement des données depuis l'API
    this.applicationService.getAll().subscribe({
      next: (rows) => {
        this.dataSource.data = rows;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur de chargement des candidatures', err);
        this.loading = false;
      },
    });
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

    goToNewApplication(): void {
    this.router.navigate(['/application/new']);
  }
}
