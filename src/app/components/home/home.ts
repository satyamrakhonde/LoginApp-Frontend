import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ɵInternalFormsSharedModule } from "@angular/forms";
import { User } from '../../models/user.model';
import { error } from 'console';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../service/services/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [ɵInternalFormsSharedModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  searchForm: FormGroup;
  foundUser: User | null = null;
  message: string | null = null;
  loading: boolean = false;

  constructor(private fb: FormBuilder, private userSvc: UserService) {
    this.searchForm = this.fb.group({
      username: ['', Validators.required]
    });
  }

  onSearch() {
    this.foundUser = null;
    this.message = null;

    const username = this.searchForm.value.username?.trim();
    if(!username) {
      this.message = "Please enter a username to search.";
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
        if(err.status === 404) {
          this.message = "User not found.";
        } else {
          this.message = "Server error occurred. Please try again later.";
        }
      }
  });
}
}
