import { RefNode } from '../types';
import { StyleTypes } from '../styles/types';
import { serialize } from '../../../utils';
import { getContext, getContextFreeName, getMigrationStyles, hasContexts, isContextual } from '../migrate/-styles';

import { MigrateStylesPayload } from '@theemo-figma/core/node/commands';
import { filterStyles } from '@theemo-figma/core/migrate';
import NodeCommand from './command';
import { readConfig, storeConfig } from '../../styles/store';
import { Transforms } from '@theemo-figma/core/transforms';
import { findCollection } from '../../../variables';

function getVariableNameFromStyle(style: PaintStyle, prefix: string) {
  return isContextual(style.name, prefix) ? getContextFreeName(style.name, prefix) : style.name;
}

export default class MigrateStylesCommand extends NodeCommand {
  NAME = 'migrate-styles';

  execute(data: MigrateStylesPayload) {
    const styles = this.findStyles(data.searchPhrase);
    const nodes = this.findNodes(styles);
    const [references, transforms] = this.compileReferencesAndTransforms();
    const missingReferences = this.findMissingReferences(styles, references);

    if (missingReferences.length > 0) {
      console.log('missingReferences', missingReferences);
    }

    this.createVariablesFromStyles(data.collection, styles);
    this.referenceVariables(references, transforms);
    this.connectStylesWithVariable(styles);
    this.cleanupNodes(nodes);

    this.emitter.sendEvent('migration-styles-collected', getMigrationStyles(this.container).map(serialize));
  }

  compileReferencesAndTransforms(): [Map<string, string>, Map<string, Transforms>] {
    const transforms = new Map<string, object>();
    const ref = new Map<string, string>();
    const nodes = [...this.container.references.readNodes()]
      .map(nodeId => figma.getNodeById(nodeId))
      .filter(node => this.container.registry.has(node as RefNode))
      .map(node => this.container.registry.get(node as RefNode))
      .filter(node => node.hasReference('fill') || node.hasReference('stroke'));

    for (const handler of nodes) {
      if (handler.hasReference('fill')) {
        const style = handler.styles[StyleTypes.Fill];
        if (style) {
          ref.set(style.to!.id, style.from!.id);
          transforms.set(style.to!.name, style.transforms);
        }
      }

      if (handler.hasReference('stroke')) {
        const style = handler.styles[StyleTypes.Stroke];
        if (style) {
          ref.set(style.to!.id, style.from!.id);
          transforms.set(style.to!.name, style.transforms);
        }
      }
    }

    return [ref, transforms];
  }

  findStyles(searchPhrase: string) {
    return filterStyles(getMigrationStyles(this.container), searchPhrase);
  }

  findNodes(styles: PaintStyle[]): SceneNode[] {
    const nodesWithReferences = this.container.references.readNodes();

    return styles.flatMap(style => {
      return style.consumers.flatMap(consumer => consumer.node)
    }).filter(node => nodesWithReferences.has(node.id));
  }

  findMissingReferences(styles: PaintStyle[], references: Map<string, string>) {
    const allStyles = figma.getLocalPaintStyles();
    const missingReferences = [];
    for (const style of styles) {
      if (references.has(style.id)) {
        // check if references is within the given styles
        const foundRef = allStyles.find(s => s.id === references.get(style.id));

        // if not, check if this is an already present variable
        if (!foundRef) {
          const name = figma.getStyleById(references.get(style.id) as string)?.name as  string;
          const variable = this.findVariableByName(name);

          if (!variable) {
            missingReferences.push(style);
          }
        }
      }
    }

    return missingReferences;
  }

  findVariableByName(name: string) {
    return figma.variables.getLocalVariables().find(variable => variable.name === name);
  }

  createVariablesFromStyles(collectionId: string, styles: PaintStyle[]) {
    const contextPrefix = this.container.settings.get('context.prefix');
    const localStyles = figma.getLocalPaintStyles();

    // first iteration: Create variables from styles
    for (const style of styles) {
      if (!hasContexts(style, localStyles, contextPrefix)) {
        this.createVariable(collectionId, style);
      }
    }
  }

  private getModeId(name: string, collection: VariableCollection, context?: string) {
    const contextPrefix = this.container.settings.get('context.prefix');

    if (!isContextual(name, contextPrefix)) {
      return collection.defaultModeId;
    }

    const foundMode = collection.modes.find(mode => mode.name === context);
    if (foundMode) {
      return foundMode.modeId;
    }

    return collection.addMode(context as string);
  }

  createVariable(collectionId: string, style: PaintStyle) {
    const contextPrefix = this.container.settings.get('context.prefix');

    // get started creating the variables
    const collection = figma.variables.getLocalVariableCollections().find(coll => coll.id === collectionId) as VariableCollection;;
    const modeId = this.getModeId(style.name, collection, getContext(style.name, contextPrefix));
    const name = getVariableNameFromStyle(style, contextPrefix);

    let variable = this.findVariableByName(name);

    if (!variable) {
      variable = figma.variables.createVariable(name, collectionId, 'COLOR');

      if (name.startsWith('.')) {
        variable.hiddenFromPublishing = true;
      }
    }

    variable.setValueForMode(modeId, (style.paints[0] as SolidPaint).color);
  }

  referenceVariables(references: Map<string, string>, transforms: Map<string, object>) {
    for (const [from, to] of references.entries()) {
      this.referenceVariable(from, to, transforms);
    }
  }

  /**
   * Reference variable
   * 
   * `from` is linked to `to`
   * 
   * @param from style id
   * @param to style id
   */
  referenceVariable(from: string, to: string, transforms: Map<string, Transforms>) {
    const fromStyle = figma.getStyleById(from) as PaintStyle;
    const toStyle = figma.getStyleById(to) as PaintStyle;

    const fromVariable = this.findVariableByName(fromStyle.name);
    const toVariable = this.findVariableByName(toStyle.name);

    if (fromVariable && toVariable) {
      // with a transform present, we will store it in our config
      if (transforms.has(toStyle.name)) {
        const contextPrefix = this.container.settings.get('context.prefix');
        const collection = findCollection(toVariable) as VariableCollection;
        const modeId = this.getModeId(toStyle.name, collection, getContext(toStyle.name, contextPrefix));
        const config = readConfig();

        config.variables.push({
          variableId: toVariable.id,
          modeId,
          referenceId: fromVariable.id,
          transforms: transforms.get(toStyle.name) as Transforms
        });

        storeConfig(config);
      } 
      
      // without, we can use figma's variable alias
      else {
        const collection = findCollection(fromVariable) as VariableCollection;
        const alias = figma.variables.createVariableAlias(toVariable);
        fromVariable.setValueForMode(collection.modes[0].modeId, alias);
      }
    }
  }

  connectStylesWithVariable(styles: PaintStyle[]) {
    const contextPrefix = this.container.settings.get('context.prefix');

    for (const style of styles) {
      const name = getVariableNameFromStyle(style, contextPrefix);
      const variable = this.findVariableByName(name) as Variable;

      // remove contextual styles
      if (isContextual(style.name, contextPrefix)) {
        style.remove();
      }

      // connect styles with their variable
      else {
        let paints: SolidPaint[] = JSON.parse(JSON.stringify(style.paints)) as SolidPaint[];
        paints[0] = figma.variables.setBoundVariableForPaint(paints[0], 'color', variable);
        style.paints = paints;
      }
    }
  }

  migrateTransforms(nodes: SceneNode[]) {
    const references = new Map(Object.entries(JSON.parse(figma.root.getPluginData('references') || '{}')));
    const refHandlers = nodes.filter(node => this.container.registry.has(node as RefNode))
      .map(node => this.container.registry.get(node as RefNode))
      .filter(node => node.hasReference('fill') || node.hasReference('stroke'))

    for (const handler of refHandlers) {
      if (handler.hasReference('fill')) {
        const data = handler.styles[StyleTypes.Fill];

        if (data && data.transforms) {
          references.set(data.to!.id, { tramsforms: data.transforms });
        }
      }

      if (handler.hasReference('stroke')) {
        const data = handler.styles[StyleTypes.Stroke];

        if (data && data.transforms) {
          references.set(data.to!.id, { tramsforms: data.transforms });
        }
      }
    }

    figma.root.setPluginData('references', JSON.stringify(Object.fromEntries(references)));
  }

  cleanupNodes(nodes: SceneNode[]) {
    for (const node of nodes) {
      if (this.container.registry.has(node as RefNode)) {
        const handler = this.container.registry.get(node as RefNode);
        handler.delete();
      }

      this.container.registry.removeById(node.id);
      this.container.references.deleteNode(node);
    }
  }
}