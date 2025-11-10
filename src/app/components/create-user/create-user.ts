import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/services/auth-service';

@Component({
  selector: 'app-create-user',
  imports: [ ReactiveFormsModule ],
  templateUrl: './create-user.html',
  styleUrl: './create-user.css',
})
export class CreateUser {

  regForm: FormGroup;
  serverErrors: string | null = null;
  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.regForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{8,}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      age: [null, [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      phone: ['', Validators.required]
    });
  }

  get f(): { [k: string]: AbstractControl } { return this.regForm.controls; }

  onCancel() {
    this.regForm.reset();
    this.serverErrors = null;
  }

  onReturn() {
    this.router.navigate(['/login']);
  }


  onCreate() {
    this.serverErrors = null;

    // If any field empty -> show incomplete validation message (exact behavior requested)
    if (this.regForm.invalid) {
      // Find first error and create message
      if (this.f['username'].invalid) {
        if (this.f['username'].errors?.['required']) {
          this.serverErrors = 'All fields are mandatory';
        } else if (this.f['username'].errors?.['pattern']) {
          this.serverErrors = 'Username should have only letters and minimum of 8 characters';
        }
      } else if (this.f['password'].invalid) {
        if (this.f['password'].errors?.['required']) this.serverErrors = 'All fields are mandatory';
        else if (this.f['password'].errors?.['minlength']) this.serverErrors = 'Password should have 8 characters minimum';
      } else {
        this.serverErrors = 'All fields are mandatory';
      }
      return;
    }

    // Submit to backend
    this.loading = true;
    const payload = this.regForm.value;
    this.auth.register(payload).subscribe({
      next: (resp) => {
        this.loading = false;
        // Assuming 201 Created -> redirect to login with a success message
        this.router.navigate(['/login'], { state: { msg: 'User created successfully' } });
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        if (err.status === 409) {
          this.serverErrors = 'Username already exists';
        } else if (err.status === 400) {
          this.serverErrors = 'Validation failed. Please check input.';
        } else {
          this.serverErrors = 'Server error. Please try later.';
        }
      }
    });
  }
}
