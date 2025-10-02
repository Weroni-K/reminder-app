import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './components/settings.component';
import { RemindersComponent } from './components/reminders.component';
import { ReminderService } from './reminder.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SettingsComponent,
    RemindersComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  activeTab: 'reminders' | 'settings' = 'reminders';

  constructor(public reminderService: ReminderService) {}
}