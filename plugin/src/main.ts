import { UI_DIMENSIONS } from './config';
import Commander from './infrastructure/commander';
import Emitter from './infrastructure/emitter';
import { setupStyles } from './sections/styles/setup';
import { setupSystem } from './sections/system/setup';

figma.showUI(__html__, {
  ...UI_DIMENSIONS,
  themeColors: true,
});

const emitter = new Emitter();
const commander = new Commander(emitter);

const infrastructure = { commander, emitter };

setupSystem(infrastructure);
setupStyles(infrastructure);

commander.run('migrate');
