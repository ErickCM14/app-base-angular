import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AutoFocusDirective } from '../../shared/directives/auto-focus.directive';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { AuthService } from "../../core/services/auth.service";
import { NotificationAlert } from 'src/app/shared/services/notification-alert/notification-alert';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    AutoFocusDirective,
    CapitalizePipe,
    MatSnackBarModule
  ],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-center text-3xl font-extrabold text-gray-900">
          {{ 'create your account' | capitalize }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <a routerLink="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
            sign in to your existing account
          </a>
        </p>
      </div>
      
      <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Name</mat-label>
          <input matInput type="text" formControlName="name" required autocomplete="name" appAutoFocus>
          <mat-error *ngIf="signupForm.get('name')?.hasError('required')">Full name is required</mat-error>
          <mat-error *ngIf="signupForm.get('name')?.hasError('minlength')">Full name must be at least 2 characters</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Last Name</mat-label>
          <input matInput type="text" formControlName="lastname" required autocomplete="lastname" appAutoFocus>
          <mat-error *ngIf="signupForm.get('lastname')?.hasError('required')">Lastname is required</mat-error>
          <mat-error *ngIf="signupForm.get('lastname')?.hasError('minlength')">Lastname must be at least 2 characters</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Email address</mat-label>
          <input matInput type="email" formControlName="email" required autocomplete="email">
          <mat-error *ngIf="signupForm.get('email')?.hasError('required')">Email is required</mat-error>
          <mat-error *ngIf="signupForm.get('email')?.hasError('email')">Please enter a valid email address</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Phone</mat-label>
          <input matInput type="tel" formControlName="phone" required autocomplete="phone">
          <mat-error *ngIf="signupForm.get('phone')?.hasError('required')">Phone is required</mat-error>
          <!-- <mat-error *ngIf="signupForm.get('phone')?.hasError('phone')">Please enter a valid phone address</mat-error> -->
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" required autocomplete="new-password">
          <mat-error *ngIf="signupForm.get('password')?.hasError('required')">Password is required</mat-error>
          <mat-error *ngIf="signupForm.get('password')?.hasError('minlength')">Password must be at least 6 characters</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Confirm Password</mat-label>
          <input matInput type="password" formControlName="confirmPassword" required autocomplete="new-password">
          <mat-error *ngIf="signupForm.get('confirmPassword')?.hasError('required')">Confirm password is required</mat-error>
          <mat-error *ngIf="signupForm.hasError('passwordMismatch')">Passwords do not match</mat-error>
        </mat-form-field>

        <button 
          mat-raised-button 
          color="primary" 
          type="submit"
          class="w-full"
          [disabled]="signupForm.invalid || loading()"
        >
          <mat-icon *ngIf="loading()" class="animate-spin mr-2">refresh</mat-icon>
          Create Account
        </button>
      </form>
    </div>
  `
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  signupForm: FormGroup;
  loading = signal(false);
  private authService = inject(AuthService);
  private notification = inject(NotificationAlert);

  constructor(private snackBar: MatSnackBar) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]+$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    const form = this.signupForm.value;
    console.log(form);
    if (this.signupForm.valid) {
      this.loading.set(true);

      

      this.authService
        .register(form)
        .subscribe({
          next: () => {
            this.loading.set(false);
            this.router.navigate(['/auth/login']);
          },
          error: (error) => {
            this.loading.set(false);
            const errorMessage =
              error?.message || "Login failed. Please try again.";
            this.snackBar.open(errorMessage, "Close", { duration: 3000 });
            console.error("Login error:", error);
          },
        });

      // Mock signup for development
      // setTimeout(() => {
      //   this.loading.set(false);
      //   this.router.navigate(['/auth/login']);
      // }, 1000);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }
} 