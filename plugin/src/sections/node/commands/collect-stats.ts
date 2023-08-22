import { StatsPayload } from '@theemo-figma/core/node/events';
import NodeCommand from './command';

export default class CollectStatsCommand extends NodeCommand {
  NAME = 'collect-stats';

  execute() {
    const counter: StatsPayload = {
      total: 0,
      text: 0,
      fill: 0,
      stroke: 0,
      effect: 0,
      contexts: 0
    };

    this.container.references.each((node) => {
      const handler = this.container.registry.get(node);
      handler.each((adapter) => {
        if (adapter.hasReference()) {
          counter.total++;
          counter[adapter.type]++;

          if (this.container.contexts.isContextualName(adapter.to?.name as string)) {
            counter.contexts++;
          }
        }
      });
    });

    this.emitter.sendEvent('stats-collected', counter);
  }
}