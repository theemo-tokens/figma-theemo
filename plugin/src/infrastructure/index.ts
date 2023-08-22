import Commander from './commander';
import Emitter from './emitter';
import SettingsManager from './settings-manager';

export interface Infrastructure {
  commander: Commander;
  emitter: Emitter;
  settings: SettingsManager;
}