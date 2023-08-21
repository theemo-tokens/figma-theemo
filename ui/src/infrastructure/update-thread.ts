import { settings } from '../settings';
import { messenger } from '../infrastructure';
import type { StatsPayload } from '@theemo-figma/core/node/events';

let autoUpdate = false;
settings.subscribe((settings) => {
  autoUpdate = settings['tools.auto-update-references'];
});

let version = '1';
let counter = 1;
// values to control thread refresh frequency
const base = 120;
const ratio = 1.1;
let interval = base + 1 * ratio;
let updateThreadId;
let stats;

function updateStylesThread(v: string, s: StatsPayload) {
  // early exist, when the thread isn't needed
  if (v === '2' || s === undefined) {
    if (updateThreadId) {
      window.clearInterval(updateThreadId);
    }

    return;
  }

  // the auto-update "thread"
  // fires "constantly" update commands to the plugin
  // not gonna use `requestAnimationFrame` here on purpose!
  // be able to control the update interval here!
  // -> maybe make it an option somewhen

  // for now interval time is dynamic and depends on the number
  // of references to NOT freeze figma
  if (updateThreadId) {
    window.clearInterval(updateThreadId);
  }

  interval = base + s.total * ratio;

  updateThreadId = window.setInterval(() => {
    if (version === '1' && autoUpdate) {
      // counter mechanics to give figma some time to breath and actually
      // save the changes
      counter++;
      if (counter >= 50 && counter < 60) {
        return;
      }
      if (counter === 60) {
        counter = 0;
      }
      messenger.send('update-styles');
    }
  }, interval);
}

messenger.addListener('version-changed', (result: string) => {
  version = result;

  updateStylesThread(version, stats);
});

messenger.addListener('stats-collected', (result: StatsPayload) => {
  stats = result;
  
  updateStylesThread(version, stats);
});

messenger.send('collect-stats');


