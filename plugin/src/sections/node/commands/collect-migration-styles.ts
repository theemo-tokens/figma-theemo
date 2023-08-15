import { serialize } from '../../../utils';
import { getContexts, getMigrationStyles } from '../migrate/-styles';
import NodeCommand from './command';

export default class CollectMigrationStylesCommand extends NodeCommand {
  NAME = 'collect-migration-styles';

  execute() {
    const paintStyles = figma.getLocalPaintStyles();
    const contextPrefix = this.container.settings.get('context.prefix');

    this.emitter.sendEvent('migration-styles-collected', getMigrationStyles(this.container).map((style) => {
      const contexts = getContexts(style, paintStyles, contextPrefix);
      let name = style.name;

      if (contexts.length > 0) {
        const contextNames = contexts.map(contextualStyle => contextualStyle.name.replace(`${style.name}${contextPrefix}`, ''));
        name = `${style.name} (${contextNames.join(', ')})`;
      }

      return {
        ...style,
        name
      };
    }).map(serialize));
  }
}