import { Config, StyleDescriptor } from './index';

export enum EventName {
  StylesInitiated = 'styles.styles-initiated',
  StyleCreated = 'styles.style-created',
  StyleUpdated = 'styles.style-updated',
  StyleDeleted = 'styles.style-deleted',
  ConfigArrived = 'styles.config-arrived'
}

export interface Events {
  [EventName.StyleCreated]: StyleDescriptor;
  [EventName.StyleUpdated]: StyleDescriptor;
  [EventName.StyleDeleted]: StyleDescriptor;
  [EventName.ConfigArrived]: Config;
}
