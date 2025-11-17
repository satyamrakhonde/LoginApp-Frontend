export interface Incident {
    id?: number;
    date: string; //yyyy-mm-dd
    type: 'INC' | 'CHG' | 'Alert';
    description?: string;
    status: 'Open'|'WIP'|'Completed'|'Closed'|'Cancelled'|'Rescheduled'|'Rollbacked'|'Monitoring';
    environment: 'PROD'|'PAS'|'DEV'|'UAT'|'DR'|'CERT';
    application?: string;
    closedDate?: string | null;
}