import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReminderService } from '../reminder.service';
import { ReminderFormComponent } from './reminder-form.component';
import { ReminderCardComponent } from './reminder-card.component';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [CommonModule, FormsModule, ReminderFormComponent, ReminderCardComponent],
  template: `
    <h1>Well-being Reminders</h1>
        <p class="description">Create personalized reminders for movement breaks, meals, hydration, and other activities of your choice to stay healthy and focused.</p>
        
        <app-reminder-form></app-reminder-form>

        <!-- Upcoming Reminders Section -->
        <div *ngIf="reminderService.getUpcomingReminders().length > 0" class="upcoming-reminders">
          <h2 class="upcoming-title">Upcoming Reminders (Next 10 minutes)</h2>
          <div class="upcoming-list">
            <app-reminder-card 
              *ngFor="let reminder of reminderService.getUpcomingReminders()" 
              [reminder]="reminder"
              class="upcoming-card">
            </app-reminder-card>
          </div>
        </div>

        <div class="reminders-list">
          <h2>All Reminders</h2>
          
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">Total Reminders:</span>
              <span class="stat-value">{{ reminderService.reminders().length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Active Reminders:</span>
              <span class="stat-value">{{ reminderService.getEnabledRemindersCount() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Upcoming Soon:</span>
              <span class="stat-value">{{ reminderService.getUpcomingReminders().length }}</span>
            </div>
          </div>

          
          
          <div *ngIf="reminderService.reminders().length === 0" class="no-reminders">
            <p>No reminders yet. Add your first reminder above!</p>
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