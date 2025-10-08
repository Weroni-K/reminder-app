import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReminderService } from '../reminder.service';
import { ReminderCardComponent } from './reminder-card.component';

@Component({
  selector: 'app-upcoming-reminders',
  standalone: true,
  imports: [CommonModule, ReminderCardComponent],
  template: `
    <div *ngIf="reminderService.getUpcomingReminders().length > 0" class="upcoming-reminders">
      <h2 class="upcoming-title">🚨 Upcoming Reminders (Next 10 minutes)</h2>
      <div class="upcoming-list">
        <app-reminder-card 
          *ngFor="let reminder of reminderService.getUpcomingReminders()" 
          [reminder]="reminder"
          class="upcoming-card">
        </app-reminder-card>
      </div>
    </div>
  `,
  styleUrls: ['./upcoming-reminders.component.css']
})
export class UpcomingRemindersComponent {
  constructor(public reminderService: ReminderService) {}
}