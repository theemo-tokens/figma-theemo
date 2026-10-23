import Command from '../../../infrastructure/command';

export default class MigrateCommand extends Command {
  NAME = 'migrate';

  execute() {
    // stamp the file as v2 - future plugin versions use this marker
    // to run migrations from a known baseline
    if (figma.root.getPluginData('version') !== '2') {
      figma.root.setPluginData('version', '2');
      // discard v1 settings leftovers
      figma.root.setPluginData('settings', '');
    }
  }
}
