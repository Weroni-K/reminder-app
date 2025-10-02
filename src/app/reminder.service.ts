import { Injectable, signal } from '@angular/core';
import { Reminder, DoNotDisturbSettings } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private remindersSignal = signal<Reminder[]>([]);
  public reminders = this.remindersSignal.asReadonly();

  private dndSignal = signal<DoNotDisturbSettings>({
    enabled: true,
    start: '22:00',
    end: '06:00'
  });
  public dndSettings = this.dndSignal.asReadonly();

  private checkInterval?: number;

  constructor() {
    this.loadData();
    this.startReminderChecker();
  }

  addReminder(reminderData: Omit<Reminder, 'id'>): void {
    const reminder: Reminder = {
      id: Date.now().toString(),
      ...reminderData,
      nextTrigger: this.calculateNextTrigger(reminderData) || undefined
    };
    this.remindersSignal.update(reminders => [...reminders, reminder]);
    this.saveReminders();
  }

  deleteReminder(id: string): void {
    this.remindersSignal.update(reminders => 
      reminders.filter(reminder => reminder.id !== id)
    );
    this.saveReminders();
  }

  toggleReminder(reminder: Reminder): void {
    this.remindersSignal.update(reminders =>
      reminders.map(r => {
        if (r.id === reminder.id) {
          const updated = { ...r, enabled: !r.enabled };
          return { ...updated, nextTrigger: this.calculateNextTrigger(updated) || undefined };
        }
        return r;
      })
    );
    this.saveReminders();
  }

  updateReminder(id: string, updates: Partial<Reminder>): void {
    this.remindersSignal.update(reminders =>
      reminders.map(r => {
        if (r.id === id) {
          const updated = { ...r, ...updates };
          return { ...updated, nextTrigger: this.calculateNextTrigger(updated) || undefined };
        }
        return r;
      })
    );
    this.saveReminders();
  }

  async requestNotificationPermission(): Promise<void> {
  }

  refreshNotificationPermission(): void {
  }

  sendTestNotification(): void {
    alert('Test notification: This is a test!');
  }

  triggerReminderNow(reminder: Reminder): void {
    alert(`Reminder: ${reminder.name}`);
    this.updateReminder(reminder.id, { lastTriggered: new Date() });
  }

  updateDndSettings(updates: Partial<DoNotDisturbSettings>): void {
    this.dndSignal.update(current => ({ ...current, ...updates }));
    this.saveDndSettings();
  }

  getEnabledRemindersCount(): number {
    return this.remindersSignal().filter(r => r.enabled).length;
  }

  clearAllReminders(): void {
    if (confirm('Are you sure you want to delete all reminders? This cannot be undone.')) {
      this.remindersSignal.set([]);
      this.saveReminders();
    }
  }

  clearInactiveReminders(): void {
    const inactiveCount = this.remindersSignal().filter(r => !r.enabled).length;
    if (inactiveCount === 0) {
      alert('No inactive reminders to clear.');
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${inactiveCount} inactive reminder${inactiveCount > 1 ? 's' : ''}? This cannot be undone.`)) {
      this.remindersSignal.update(reminders => reminders.filter(r => r.enabled));
      this.saveReminders();
    }
  }

  formatTime(time?: string): string {
    if (!time) return 'Not set';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  formatInterval(minutes?: number): string {
    if (!minutes) return 'Not set';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${remainingMinutes}m`;
  }

  formatLastTriggered(lastTriggered?: Date): string {
    if (!lastTriggered) return 'Never';
    const now = new Date();
    const diff = now.getTime() - new Date(lastTriggered).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  getUpcomingReminders(): Reminder[] {
    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + (10 * 60 * 1000));
    const dndSettings = this.dndSignal();
    
    return this.remindersSignal()
      .filter(reminder => {
        if (!reminder.enabled || !reminder.nextTrigger) return false;
        
        const nextTriggerDate = reminder.nextTrigger instanceof Date 
          ? reminder.nextTrigger 
          : new Date(reminder.nextTrigger);
          
        if (nextTriggerDate.getTime() > tenMinutesFromNow.getTime()) return false;

        if (reminder.respectDoNotDisturb && this.isDoNotDisturbTime(nextTriggerDate, dndSettings)) {
          return false; 
        }
        
        return true;
      })
      .sort((a, b) => {
        const aDate = a.nextTrigger instanceof Date ? a.nextTrigger : new Date(a.nextTrigger!);
        const bDate = b.nextTrigger instanceof Date ? b.nextTrigger : new Date(b.nextTrigger!);
        return aDate.getTime() - bDate.getTime();
      });
  }

  getRegularReminders(): Reminder[] {
    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + (10 * 60 * 1000));
    
    return this.remindersSignal()
      .filter(reminder => {
        if (!reminder.enabled || !reminder.nextTrigger) return true;
        
        const nextTriggerDate = reminder.nextTrigger instanceof Date 
          ? reminder.nextTrigger 
          : new Date(reminder.nextTrigger);
          
        return nextTriggerDate.getTime() > tenMinutesFromNow.getTime();
      });
  }

  private calculateNextTrigger(reminderData: Partial<Reminder>): Date | null {
    if (!reminderData.enabled) return null;

    const now = new Date();

    if (reminderData.scheduleType === 'exact' && reminderData.time) {
      const [hours, minutes] = reminderData.time.split(':').map(Number);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

      if (today <= now) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
      }
      
      return today;
    }

    if (reminderData.scheduleType === 'interval' && reminderData.intervalMinutes) {
      return new Date(now.getTime() + (reminderData.intervalMinutes * 60 * 1000));
    }

    return null;
  }

  getNextTriggerTime(reminder: Reminder): Date | null {
    if (!reminder.enabled) return null;

    const now = new Date();

    if (reminder.scheduleType === 'exact' && reminder.time) {
      const [hours, minutes] = reminder.time.split(':').map(Number);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
      
      if (today <= now) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
      }
      
      return today;
    }

    if (reminder.scheduleType === 'interval' && reminder.intervalMinutes) {
      const lastTriggered = reminder.lastTriggered ? new Date(reminder.lastTriggered) : null;
      
      if (!lastTriggered) {
        return new Date(now.getTime() + (reminder.intervalMinutes * 60 * 1000));
      }
      
      const nextTrigger = new Date(lastTriggered.getTime() + (reminder.intervalMinutes * 60 * 1000));
      
      if (nextTrigger <= now) {
        return now;
      }
      
      return nextTrigger;
    }

    return null;
  }

  formatNextTrigger(reminder: Reminder): string {
    const nextTrigger = this.getNextTriggerTime(reminder);
    
    if (!nextTrigger) return 'Disabled';
    
    const now = new Date();
    const diff = nextTrigger.getTime() - now.getTime();
    
    if (diff <= 0) {
      const overdueDiff = Math.abs(diff);
      const overdueSeconds = Math.floor(overdueDiff / 1000);
      const overdueMinutes = Math.floor(overdueSeconds / 60);
      const overdueHours = Math.floor(overdueMinutes / 60);
      
      if (overdueSeconds < 60) return `Overdue by ${overdueSeconds} second${overdueSeconds !== 1 ? 's' : ''}`;
      if (overdueMinutes < 60) return `Overdue by ${overdueMinutes} minute${overdueMinutes > 1 ? 's' : ''}`;
      return `Overdue by ${overdueHours} hour${overdueHours > 1 ? 's' : ''}`;
    }
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      const remainingHours = hours % 24;
      if (remainingHours === 0) {
        return `In ${days} day${days > 1 ? 's' : ''}`;
      }
      return `In ${days}d ${remainingHours}h`;
    }
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `In ${hours} hour${hours > 1 ? 's' : ''}`;
      }
      return `In ${hours}h ${remainingMinutes}m`;
    }
    
    if (minutes > 0) {
      return `In ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    
    return `In ${seconds} second${seconds !== 1 ? 's' : ''}`;
  }

  private loadData(): void {
    this.loadReminders();
    this.loadDndSettings();
  }

  private loadReminders(): void {
    const saved = localStorage.getItem('wellbeing-reminders');
    if (saved) {
      try {
        const reminders = JSON.parse(saved);
        reminders.forEach((reminder: Reminder) => {
          if (reminder.lastTriggered) {
            reminder.lastTriggered = new Date(reminder.lastTriggered);
          }
          if (reminder.nextTrigger) {
            reminder.nextTrigger = new Date(reminder.nextTrigger);
          }
          if (reminder.respectDoNotDisturb === undefined) {
            reminder.respectDoNotDisturb = true;
          }
        });
        this.remindersSignal.set(reminders);
      } catch (error) {
        console.error('Error loading reminders:', error);
      }
    }
  }

  private saveReminders(): void {
    localStorage.setItem('wellbeing-reminders', JSON.stringify(this.remindersSignal()));
  }

  private loadDndSettings(): void {
    const saved = localStorage.getItem('wellbeing-dnd-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        this.dndSignal.set({
          enabled: settings.enabled ?? true,
          start: settings.start ?? '22:00',
          end: settings.end ?? '06:00'
        });
      } catch (error) {
        console.error('Error loading DND settings:', error);
      }
    }
  }

  private saveDndSettings(): void {
    localStorage.setItem('wellbeing-dnd-settings', JSON.stringify(this.dndSignal()));
  }

  private startReminderChecker(): void {
    this.checkInterval = window.setInterval(() => {
      this.checkForDueReminders();
    }, 30000);
  }

  private checkForDueReminders(): void {
    const now = new Date();
    const dndSettings = this.dndSignal();
    const isDoNotDisturbTime = this.isDoNotDisturbTime(now, dndSettings);
    
    this.remindersSignal().forEach(reminder => {
      if (reminder.enabled && this.isReminderDue(reminder, now)) {
        if (isDoNotDisturbTime && reminder.respectDoNotDisturb) {
          return;
        }
        
        this.triggerReminderNow(reminder);
      }
    });
  }

  private isReminderDue(reminder: Reminder, now: Date): boolean {
    if (reminder.scheduleType === 'exact' && reminder.time) {
      const [hours, minutes] = reminder.time.split(':').map(Number);
      const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
      const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
      const withinMinute = timeDiff < 60000;
      const lastTriggered = reminder.lastTriggered ? new Date(reminder.lastTriggered) : null;
      const notTriggeredRecently = !lastTriggered || (now.getTime() - lastTriggered.getTime()) > 50000;
      return withinMinute && notTriggeredRecently;
    }

    if (reminder.scheduleType === 'interval' && reminder.intervalMinutes) {
      const lastTriggered = reminder.lastTriggered ? new Date(reminder.lastTriggered) : null;
      
      if (!lastTriggered) {
        if (!reminder.nextTrigger) return false; 
        const nextTriggerDate = reminder.nextTrigger instanceof Date 
          ? reminder.nextTrigger 
          : new Date(reminder.nextTrigger);
        return now.getTime() >= nextTriggerDate.getTime();
      }
      
      const intervalMs = reminder.intervalMinutes * 60 * 1000;
      return (now.getTime() - lastTriggered.getTime()) >= intervalMs;
    }

    return false;
  }

  private isDoNotDisturbTime(now: Date, settings: DoNotDisturbSettings): boolean {
    if (!settings.enabled) return false;
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const startTime = this.timeStringToNumber(settings.start);
    const endTime = this.timeStringToNumber(settings.end);
    
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }

  private timeStringToNumber(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 100 + minutes;
  }
}