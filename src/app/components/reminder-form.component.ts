import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReminderService } from '../reminder.service';
import { Reminder } from '../interfaces';

@Component({
  selector: 'app-reminder-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Success Alert -->
    <div class="alert alert-success" *ngIf="successMessage">
      <div class="alert-content">
        <span class="alert-text">{{ successMessage }}</span>
        <button class="alert-close" (click)="clearSuccess()">×</button>
      </div>
    </div>

    <!-- Error Alert -->
    <div class="alert alert-error" *ngIf="hasErrors()">
      <div class="alert-content">
        <div class="alert-text">
          <strong>Please fix the following errors:</strong>
          <ul class="error-list">
            <li *ngIf="errors.name">{{ errors.name }}</li>
            <li *ngIf="errors.time">{{ errors.time }}</li>
            <li *ngIf="errors.interval">{{ errors.interval }}</li>
          </ul>
        </div>
        <button class="alert-close" (click)="clearErrors()">×</button>
      </div>
    </div>

    <form (ngSubmit)="addReminder()" class="reminder-form">
      <div class="form-row">
        <input 
          [(ngModel)]="newReminder.name" 
          name="reminderName"   
          placeholder="Reminder name (e.g.: Stretch break, Meal)" 
          required
          maxlength="32"
          class="reminder-name"
          [class.error]="errors.name"
        >
      </div>

      <div class="form-row">
        <label class="schedule-type">
          <input 
            type="radio" 
            [(ngModel)]="newReminder.scheduleType" 
            name="scheduleType" 
            value="exact"
          >
          Exact time:
        </label>
        <input 
          type="time" 
          [(ngModel)]="newReminder.time" 
          name="reminderTime"
          [disabled]="newReminder.scheduleType !== 'exact'"
          class="time-input"
          [class.error]="errors.time"
        ></div>
<div class="form-row">
        <label class="schedule-type">
          <input 
            type="radio" 
            [(ngModel)]="newReminder.scheduleType" 
            name="scheduleType" 
            value="interval"
          >
          Every:
        </label>
        <input 
          type="number" 
          [(ngModel)]="newReminder.intervalMinutes" 
          name="interval"
          min="1"
          placeholder="60"
          [disabled]="newReminder.scheduleType !== 'interval'"
          class="interval-input"
          [class.error]="errors.interval"
        > minutes
      </div>

      <div class="form-row">
        <label class="dnd-option">
          <input 
            type="checkbox" 
            [(ngModel)]="newReminder.respectDoNotDisturb" 
            name="respectDoNotDisturb"
          >
          Respect "Do Not Disturb" hours
        </label>
      </div>

      <button type="submit" class="add-btn">Add Reminder</button>
    </form>
  `,
  styleUrls: ['./reminder-form.component.css'],
})
export class ReminderFormComponent {
  newReminder: Partial<Reminder> = {
    name: '',
    scheduleType: 'exact',
    time: '',
    intervalMinutes: 60,
    enabled: true,
    respectDoNotDisturb: true
  };

  errors: {
    name?: string;
    time?: string;
    interval?: string;
  } = {};

  successMessage: string = '';

  constructor(private reminderService: ReminderService) {}

  addReminder(): void {
    this.clearMessages();
    
    if (this.validateForm()) {
      this.reminderService.addReminder(this.newReminder as Omit<Reminder, 'id'>);
      this.showSuccess(`✨ Reminder "${this.newReminder.name}" added successfully!`);
      this.resetForm();
    }
  }

  private validateForm(): boolean {
    let isValid = true;

    if (!this.newReminder.name?.trim()) {
      this.errors.name = 'Reminder name is required';
      isValid = false;
    } else if (this.newReminder.name.trim().length > 32) {
      this.errors.name = 'Reminder name must be 32 characters or less';
      isValid = false;
    }

    if (this.newReminder.scheduleType === 'exact') {
      if (!this.newReminder.time?.trim()) {
        this.errors.time = 'Exact time is required';
        isValid = false;
      }
    } else if (this.newReminder.scheduleType === 'interval') {
      if (!this.newReminder.intervalMinutes || this.newReminder.intervalMinutes < 1) {
        this.errors.interval = 'Interval must be at least 1 minute';
        isValid = false;
      }
    }

    return isValid;
  }

  clearErrors(): void {
    this.errors = {};
  }

  clearSuccess(): void {
    this.successMessage = '';
  }

  private clearMessages(): void {
    this.clearErrors();
    this.clearSuccess();
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  private resetForm(): void {
    this.newReminder = {
      name: '',
      scheduleType: 'exact',
      time: '',
      intervalMinutes: 60,
      enabled: true,
      respectDoNotDisturb: true
    };
    this.clearErrors();
  }
}