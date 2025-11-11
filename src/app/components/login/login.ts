import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { UserService } from '../../service/services/user';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/services/auth-service';

@Component({
  selector: 'app-login',
  imports: [ ReactiveFormsModule, CommonModule ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  form: FormGroup;
  submitted = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService, private userService: UserService) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      // required behaviour: show "Enter valid credentials" when fields empty
      this.errorMessage = 'Enter valid credentials';
      return;
    }

    const { username, password } = this.form.value;
    this.authService.login(username, password).subscribe({
      next: (res) => {
        // successful login -> navigate to home
        this.router.navigate(['/home']);
      },
      error: (err) => {
        if (err.status === 404) this.errorMessage = 'User does not exists';
        else if (err.status === 401) this.errorMessage = 'Invalid credentials';
        else this.errorMessage = (err.error && typeof err.error === 'string') ? err.error : 'Error logging in';
      }
    });
  }

  onCreate() {
    this.router.navigate(['/create']);
  }
}
