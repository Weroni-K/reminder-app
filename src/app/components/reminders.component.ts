import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReminderService } from '../reminder.service';
import { ReminderFormComponent } from './reminder-form.component';
import { ReminderCardComponent } from './reminder-card.component';
import { UpcomingRemindersComponent } from './upcoming-reminders.component';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [CommonModule, FormsModule, ReminderFormComponent, ReminderCardComponent, UpcomingRemindersComponent],
  template: `
    <h1 class= "reminders-title">Well-being Reminders</h1>
    <p class="reminders-description">Create personalized reminders for movement breaks, meals, hydration, and other activities of your choice to stay healthy and focused.</p>
    
    <app-reminder-form></app-reminder-form>

    <app-upcoming-reminders></app-upcoming-reminders>

    <div class="reminders-list">
      <h2 class="reminders-subtitle">All Reminders</h2>
      
      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">Total Reminders: </span>
          <span class="stat-value">{{ reminderService.reminders().length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Active Reminders: </span>
          <span class="stat-value">{{ reminderService.getEnabledRemindersCount() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Upcoming Soon: </span>
          <span class="stat-value">{{ reminderService.getUpcomingReminders().length }}</span>
        </div>
      </div>

      <div *ngIf="reminderService.reminders().length === 0" class="no-reminders">
        <p class="no-reminders-text">No reminders yet. Add your first reminder above!</p>
      </div>

      <app-reminder-card 
        *ngFor="let reminder of reminderService.reminders()" 
        [reminder]="reminder">
      </app-reminder-card>
    </div>
  `,
  styleUrls: ['./reminders.component.css']
})
export class RemindersComponent {
  constructor(public reminderService: ReminderService) {}
}