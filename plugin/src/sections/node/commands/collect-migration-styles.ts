import { serialize } from '../../../utils';
import { getMigrationStyles } from '../migrate/-styles';
import NodeCommand from './command';

export default class CollectMigrationStylesCommand extends NodeCommand {
  NAME = 'collect-migration-styles';

  execute() {
    this.emitter.sendEvent('migration-styles-collected', getMigrationStyles(this.container).map(serialize));
  }
}