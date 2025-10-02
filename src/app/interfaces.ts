export interface Reminder {
  id: string;
  name: string;
  scheduleType: 'exact' | 'interval';
  time?: string;
  intervalMinutes?: number;
  lastTriggered?: Date;
  nextTrigger?: Date;
  enabled: boolean;
  respectDoNotDisturb: boolean;
}

export interface DoNotDisturbSettings {
  enabled: boolean;
  start: string;
  end: string;
}