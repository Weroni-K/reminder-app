import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReminderService } from '../reminder.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Settings</h1>

    <div class="settings-section">
      <h2>Notification Settings</h2>
      
      <div class="setting-item">
        <label>Test Alert:</label>
        <button (click)="reminderService.sendTestNotification()" class="test-btn">
          Send Test Alert
        </button>
      </div>
    </div>

    <div class="settings-section">
      <h2>Do Not Disturb Hours</h2>
      
      <div class="setting-item">
        <label>
          <input 
            type="checkbox" 
            [ngModel]="reminderService.dndSettings().enabled" 
            (ngModelChange)="updateDndEnabled($event)"
          >
          Enable Do Not Disturb
        </label>
      </div>

      <div class="setting-item" *ngIf="reminderService.dndSettings().enabled">
        <label>Sleep Time (No reminders after):</label>
        <input 
          type="time" 
          [ngModel]="reminderService.dndSettings().start"
          (ngModelChange)="updateDndStart($event)"
          class="time-input"
        >
      </div>

      <div class="setting-item" *ngIf="reminderService.dndSettings().enabled">
        <label>Wake Time (No reminders before):</label>
        <input 
          type="time" 
          [ngModel]="reminderService.dndSettings().end"
          (ngModelChange)="updateDndEnd($event)"
          class="time-input"
        >
      </div>

      <div class="setting-item" *ngIf="reminderService.dndSettings().enabled">
        <p class="dnd-info">
          ⏰ Reminders will be paused from {{ reminderService.dndSettings().start }} to {{ reminderService.dndSettings().end }}
        </p>
      </div>
    </div>
  `,
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  constructor(public reminderService: ReminderService) {}

  updateDndEnabled(enabled: boolean): void {
    this.reminderService.updateDndSettings({ enabled });
  }

  updateDndStart(start: string): void {
    this.reminderService.updateDndSettings({ start });
  }

  updateDndEnd(end: string): void {
    this.reminderService.updateDndSettings({ end });
  }
}