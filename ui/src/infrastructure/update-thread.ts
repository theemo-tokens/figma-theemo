import { settings } from '../settings';
import { messenger } from '../infrastructure';
import type { StatsPayload } from '@theemo-figma/core/events';

let autoUpdate = false;
settings.subscribe((settings) => {
  autoUpdate = settings['tools.auto-update-references'];
});

let counter = 1;
// values to control thread refresh frequency
const base = 120;
const ratio = 1.1;
let interval = base + 1 * ratio;
let updateThreadId;

messenger.addListener('stats-collected', (result: StatsPayload) => {
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

  interval = base + result.total * ratio;

  updateThreadId = window.setInterval(() => {
    if (autoUpdate) {
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
});
messenger.send('collect-stats');


