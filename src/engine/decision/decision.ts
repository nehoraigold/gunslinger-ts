import { Event } from '../event';

export type Decision = Omit<Event, 'action'>;
