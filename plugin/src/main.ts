import { UI_DIMENSIONS } from './config';
import Commander from './infrastructure/commander';
import Emitter from './infrastructure/emitter';
import SettingsManager from './infrastructure/settings-manager';
import { setupNode } from './sections/node/setup';
import { setupStyles } from './sections/styles/setup';
import { setupSystem } from './sections/system/setup';

figma.showUI(__html__, {
  ...UI_DIMENSIONS, 
  themeColors: true
});

const emitter = new Emitter();
const commander = new Commander(emitter);
const settings = new SettingsManager();

const infrastructure = { commander, emitter, settings };

setupNode(infrastructure);
setupSystem(infrastructure);
setupStyles(infrastructure);

commander.run('migrate');

