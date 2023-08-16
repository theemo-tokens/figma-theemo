export enum EventName {
  VersionChanged = 'version-changed'
}

export interface Events {
  [EventName.VersionChanged]: string;
}