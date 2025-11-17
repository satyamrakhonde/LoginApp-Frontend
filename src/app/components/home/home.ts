import { Component } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  ɵInternalFormsSharedModule,
} from '@angular/forms';
import { User } from '../../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../service/services/user';
import { CommonModule } from '@angular/common';
import { Incident } from '../../models/incident.model';
import { IncidentService } from '../../service/services/incident-service';
import { AuthService } from '../../service/services/auth-service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  searchForm: FormGroup;
  foundUser: User | null = null;
  message: string | null = null;
  loading: boolean = false;

  constructor(private fb: FormBuilder, private userSvc: UserService, private svc: IncidentService, public auth: AuthService) {
    this.searchForm = this.fb.group({
      username: ['', Validators.required],
    });
  }

  onSearch() {
    this.foundUser = null;
    this.message = null;

    const username = this.searchForm.value.username?.trim();
    if (!username) {
      this.message = 'Please enter a username to search.';
      return;
    }

    this.loading = true;
    // Simulate an API call
    this.userSvc.getByUsername(username).subscribe({
      next: (user) => {
        this.loading = false;
        this.foundUser = user;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        if (err.status === 404) {
          this.message = 'User not found.';
        } else {
          this.message = 'Server error occurred. Please try again later.';
        }
      },
    });
  }

  form!: FormGroup;
  types = ['INC', 'CHG', 'Alert'];
  statuses = [
    'Open',
    'WIP',
    'Completed',
    'Closed',
    'Cancelled',
    'Rescheduled',
    'Rollbacked',
    'Monitoring',
  ];
  envs = ['PROD', 'PAS', 'DEV', 'UAT', 'DR', 'CERT'];

  ngOnInit() {
    this.form = this.fb.group({
      rows: this.fb.array([]),
    });

    this.svc.getAll().subscribe((data) => {
      if (data && data.length) {
        data.forEach((d) => this.addRowFromData(d));
      } else {
        this.addRow();
      }
    });
  }

  get rows(): FormArray {
    return this.form.get('rows') as FormArray;
  }

  newRow(): FormGroup {
    return this.fb.group({
      id: [null],
      date: [null, Validators.required],
      type: [this.types[0], Validators.required],
      description: [''],
      status: ['Open', Validators.required],
      environment: [this.envs[0], Validators.required],
      application: [''],
      closedDate: [{ value: null, disabled: true }],
    });
  }

  addRow() {
    const rg = this.newRow();
    rg.get('status')!.valueChanges.subscribe((val) => this.onStatusChange(rg, val));
    this.rows.push(rg);
  }

  addRowFromData(d: Incident) {
    const rg = this.fb.group({
      id: [d.id],
      date: [d.date, Validators.required],
      type: [d.type, Validators.required],
      description: [d.description || ''],
      status: [d.status, Validators.required],
      environment: [d.environment, Validators.required],
      application: [d.application || ''],
      closedDate: [{ value: d.closedDate || null, disabled: d.status !== 'Closed' }],
    });
    // rg.get('status')!.valueChanges.subscribe(val => this.onStatusChange(rg, val));
    rg.get('status')!.valueChanges.subscribe((val) => this.onStatusChange(rg, val || ''));
    this.rows.push(rg);
  }

  onStatusChange(row: AbstractControl, status: string) {
    const closedControl = row.get('closedDate')!;

    if (status === 'Closed') {
      closedControl.enable();
      closedControl.setValidators([Validators.required]);
    } else {
      closedControl.disable();
      closedControl.clearValidators();
      closedControl.setValue(null);
    }

    closedControl.updateValueAndValidity();
  }

  removeRow(index: number) {
    const ctrl = this.rows.at(index);
    const id = ctrl.get('id')!.value;

    if (id != null) {
      // checks for null OR undefined
      this.svc.delete(id).subscribe({
        next: () => {
          // remove row only when server confirms deletion
          this.rows.removeAt(index);
        },
        error: (err) => {
          console.error('Failed to delete on server', err);
          // optionally notify the user
          alert('Could not delete row on server. Try again.');
        },
      });
    } else {
      // row was never saved to server — remove locally
      this.rows.removeAt(index);
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // map rows -> raw values (including disabled closedDate)
    const payload = this.rows.controls.map((r: AbstractControl) => {
      // r is a FormGroup for a row; getRawValue returns the value object
      return (r as FormGroup).getRawValue();
    });

    this.svc.saveAll(payload).subscribe({
      next: () => {
        alert('Saved successfully');
        // refresh list from server
        this.svc.getAll().subscribe({
          next: (data) => {
            while (this.rows.length) this.rows.removeAt(0);
            data.forEach((d) => this.addRowFromData(d));
          },
          error: (err) => {
            console.error('Failed to reload after save', err);
          },
        });
      },
      error: (err) => {
        console.error('Save failed', err);
        alert('Save failed');
      },
    });
  }

  cancel() {
    this.svc.getAll().subscribe((data) => {
      while (this.rows.length) this.rows.removeAt(0);
      if (data.length) data.forEach((d) => this.addRowFromData(d));
      else this.addRow();
    });
  }

  logout() {
    this.auth.logout(true);
  }

}
