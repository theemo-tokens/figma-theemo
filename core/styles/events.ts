import { Config } from './index';

export enum EventName {
  StylesInitiated = 'styles.styles-initiated',
  StyleCreated = 'styles.style-created',
  StyleUpdated = 'styles.style-updated',
  StyleDeleted = 'styles.style-deleted',
  ConfigArrived = 'styles.config-arrived'
}

export interface Events {
  [EventName.ConfigArrived]: Config;
}
