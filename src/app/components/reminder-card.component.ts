import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReminderService } from '../reminder.service';
import { Reminder } from '../interfaces';

@Component({
  selector: 'app-reminder-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reminder-card" [class.disabled]="!reminder.enabled">
      <div class="reminder-info">
        <div class="reminder-header">
          <span class="reminder-name">{{ reminder.name }}</span>
        </div>
        
        <div class="reminder-schedule">
          <span *ngIf="reminder.scheduleType === 'exact'">
            {{ reminderService.formatTime(reminder.time) }}
          </span>
          <span *ngIf="reminder.scheduleType === 'interval'">
            Every {{ reminderService.formatInterval(reminder.intervalMinutes) }}
          </span>
        </div>
        
        <div class="reminder-status">
          Last triggered: {{ reminderService.formatLastTriggered(reminder.lastTriggered) }}
        </div>

        <div class="reminder-next-trigger">
          <span class="next-trigger-label">Next trigger: </span>
          <span class="next-trigger-time" [class.due-now]="isOverdue()">
            {{ reminderService.formatNextTrigger(reminder) }}
          </span>
        </div>

        <div class="reminder-dnd-setting">
          <div class="toggle-container">
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                [(ngModel)]="reminder.respectDoNotDisturb"
                (ngModelChange)="onDndChange()"
              >
              <span class="slider"></span>
            </label>
            <span class="toggle-label">
              {{ reminder.respectDoNotDisturb ? 'Quiet hours enabled; reminder disabled' : 'Quiet hours ignored; reminder enabled' }}
            </span>
          </div>
        </div>

        <div class="toggle-container">
          <label class="toggle-switch">
            <input 
              type="checkbox" 
              [(ngModel)]="reminder.enabled"
              (ngModelChange)="onToggleChange()"
            >
            <span class="slider"></span>
          </label>
          <span class="toggle-label">{{ reminder.enabled ? 'Reminder enabled' : 'Reminder disabled' }}</span>
        </div>
        
        <button 
          (click)="reminderService.triggerReminderNow(reminder)" 
          class="test-btn"
        >
          Test Now
        </button>
        
        <button 
          (click)="confirmDelete()" 
          class="delete-btn"
        >
          Delete
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./reminder-card.component.css'],
})
export class ReminderCardComponent {
  @Input() reminder!: Reminder;

  constructor(public reminderService: ReminderService) {}

  onDndChange(): void {
    this.reminderService.updateReminder(this.reminder.id, {
      respectDoNotDisturb: this.reminder.respectDoNotDisturb
    });
  }

onToggleChange(): void {
  this.reminderService.updateReminder(this.reminder.id, {
    enabled: this.reminder.enabled
  });
}


  confirmDelete(): void {
    const confirmed = confirm(`Are you sure you want to delete the reminder "${this.reminder.name}"?`);
    if (confirmed) {
      this.reminderService.deleteReminder(this.reminder.id);
    }
  }

  isOverdue(): boolean {
    if (!this.reminder.nextTrigger) return false;
    
    const nextTriggerDate = this.reminder.nextTrigger instanceof Date 
      ? this.reminder.nextTrigger 
      : new Date(this.reminder.nextTrigger);
    
    return nextTriggerDate.getTime() <= new Date().getTime();
  }
}