import { RefNode } from '../types';
import { StyleTypes } from '../styles/types';
import { serialize } from '../../../utils';
import { getContext, getContextFreeName, getContexts, getMigrationStyles, hasContexts, isContextual } from '../migrate/-styles';

import { MigrateStylesPayload } from '@theemo-figma/core/node/commands';
import { filterStyles } from '@theemo-figma/core/migrate';
import NodeCommand from './command';
import { readConfig, storeConfig } from '../../styles/store';
import { Transforms } from '@theemo-figma/core/transforms';
import { findCollection } from '../../../variables';
import { figureAndSaveVersion } from '../../system/version';

function getVariableNameFromStyle(style: PaintStyle, prefix: string) {
  return getVariableName(isContextual(style.name, prefix) ? getContextFreeName(style.name, prefix) : style.name);
}

function getVariableName(name: string) {
  if (name.startsWith('.')) {
    name = name.substring(1);
  }

  return name.replace(/\./g, '-');
}

export default class MigrateStylesCommand extends NodeCommand {
  NAME = 'migrate-styles';

  execute(data: MigrateStylesPayload) {
    const styles = this.findStyles(data.searchPhrase);
    const [references, transforms] = this.compileReferencesAndTransforms();

    this.createVariablesFromStyles(data.collection, styles);
    this.referenceVariables(references, transforms);
    this.cleanupNodes(styles);
    this.connectStylesWithVariable(styles);

    const version = this.bumpVersion();

    if (version === '1') {
      this.commander.run('collect-migration-styles');
    } else {
      this.removeObsoleteStyles();
    }
  }

  bumpVersion() {
    const version = figureAndSaveVersion();

    this.emitter.sendEvent('version-changed', version);

    return version;
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

          if (style.transforms && Object.keys(style.transforms).length > 0) {
            transforms.set(style.to!.name, style.transforms);
          }
        }
      }

      if (handler.hasReference('stroke')) {
        const style = handler.styles[StyleTypes.Stroke];
        if (style) {
          ref.set(style.to!.id, style.from!.id);

          if (style.transforms && Object.keys(style.transforms).length > 0) {
            transforms.set(style.to!.name, style.transforms);
          }
        }
      }
    }

    return [ref, transforms];
  }

  findStyles(searchPhrase: string) {
    return filterStyles(getMigrationStyles(this.container), searchPhrase);
  }

  findVariableByName(name: string) {
    return figma.variables.getLocalVariables().find(variable => variable.name === name);
  }

  createVariablesFromStyles(collectionId: string, styles: PaintStyle[]) {
    const contextPrefix = this.container.settings.get('context.prefix');
    const localStyles = figma.getLocalPaintStyles();

    // first iteration: Create variables from styles
    for (const style of styles) {
      if (hasContexts(style, localStyles, contextPrefix)) {
        this.createMultiModeVariable(collectionId, style);
      } else {
        this.createVariable(collectionId, style);
      }
    }
  }

  private getModeId(name: string, collection: VariableCollection) {
    const contextPrefix = this.container.settings.get('context.prefix');

    if (!isContextual(name, contextPrefix)) {
      return collection.defaultModeId;
    }

    const context = getContext(name, contextPrefix);
    const foundMode = collection.modes.find(mode => mode.name === context);
    if (foundMode) {
      return foundMode.modeId;
    }

    // check if collection is empty, then we can turn 
    return collection.addMode(context as string);
  }

  createVariable(collectionId: string, style: PaintStyle) {
    const contextPrefix = this.container.settings.get('context.prefix');

    // get started creating the variables
    const collection = figma.variables.getLocalVariableCollections().find(coll => coll.id === collectionId) as VariableCollection;
    const modeId = this.getModeId(style.name, collection);
    const name = getVariableNameFromStyle(style, contextPrefix);

    let variable = this.findVariableByName(name);

    if (!variable) {
      variable = figma.variables.createVariable(name, collectionId, 'COLOR');

      if (style.name.startsWith('.')) {
        variable.hiddenFromPublishing = true;
      }
    }

    variable.setValueForMode(modeId, (style.paints[0] as SolidPaint).color);
  }

  createMultiModeVariable(collectionId: string, style: PaintStyle) {
    const contextPrefix = this.container.settings.get('context.prefix');
    const contexts = this.container.settings.get('contexts');

    // get started creating the variables
    const collection = figma.variables.getLocalVariableCollections().find(coll => coll.id === collectionId) as VariableCollection;

    // collection is empty, apply modes and set default mode
    if (collection.variableIds.length === 0 && contexts.length > 0) {
      for (const context of contexts) {
        // ... anyway add as remaining modes
        collection.addMode(context);
      }

      // remove old default mode
      collection.removeMode(collection.defaultModeId);
    }

    const contextualStyles = getContexts(style, figma.getLocalPaintStyles(), contextPrefix);
    for (const contextualStyle of contextualStyles) {
      this.createVariable(collectionId, contextualStyle);
    }
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
    const contextPrefix = this.container.settings.get('context.prefix');

    const fromStyle = figma.getStyleById(from) as PaintStyle;
    const toStyle = figma.getStyleById(to) as PaintStyle;

    const fromVariable = this.findVariableByName(getVariableName(getContextFreeName(fromStyle.name, contextPrefix)));
    const toVariable = this.findVariableByName(getVariableName(getContextFreeName(toStyle.name, contextPrefix)));

    if (fromVariable && toVariable) {
      // with a transform present, we will store it in our config
      if (transforms.has(fromStyle.name)) {
        const collection = findCollection(toVariable) as VariableCollection;
        const modeId = this.getModeId(fromStyle.name, collection);
        const config = readConfig();

        config.variables.push({
          variableId: fromVariable.id,
          modeId,
          referenceId: toVariable.id,
          transforms: transforms.get(fromStyle.name) as Transforms
        });

        storeConfig(config);
      }
      
      // without, we can use figma's variable alias
      else {
        const collection = findCollection(fromVariable) as VariableCollection;
        const alias = figma.variables.createVariableAlias(toVariable);
        const modeId = this.getModeId(fromStyle.name, collection);
        fromVariable.setValueForMode(modeId, alias);
      }
    }
  }

  cleanupNodes(styles: PaintStyle[]) {
    const contextPrefix = this.container.settings.get('context.prefix');
    const paintStyles = figma.getLocalPaintStyles();
    const stylesWithContexts = styles.reduce<PaintStyle[]>((collectedStyles, style) => {
      const contexts = getContexts(style, paintStyles, contextPrefix);

      if (contexts.length > 0) {
        collectedStyles.push(...contexts);
      } else {
        collectedStyles.push(style);
      }

      return collectedStyles;
    }, []);

    const nodesWithReferences = this.container.references.readNodes();
    const nodes = stylesWithContexts.flatMap(style => {
      return style.consumers.flatMap(consumer => consumer.node)
    }).filter(node => nodesWithReferences.has(node.id));


    for (const node of nodes) {
      if (this.container.registry.has(node as RefNode)) {
        const handler = this.container.registry.get(node as RefNode);
        handler.delete();
      }

      this.container.registry.removeById(node.id);
      this.container.references.deleteNode(node);
    }
  }

  connectStylesWithVariable(styles: PaintStyle[]) {
    const contextPrefix = this.container.settings.get('context.prefix');
    const paintStyles = figma.getLocalPaintStyles();

    for (const style of styles) {
      const name = getVariableNameFromStyle(style, contextPrefix);
      const variable = this.findVariableByName(name) as Variable;

      // connect styles with their variable
      let paints: SolidPaint[] = JSON.parse(JSON.stringify(style.paints)) as SolidPaint[];
      paints[0] = figma.variables.setBoundVariableForPaint(paints[0], 'color', variable);
      style.paints = paints;
    }
  }

  removeObsoleteStyles() {
    const contextPrefix = this.container.settings.get('context.prefix');
    const styles = figma.getLocalPaintStyles();
    const markedForRemoval = [];

    // at first collect styles for removal. While collecting, they might serve
    // as reference...
    for (const style of styles) {
      const contexts = getContexts(style, styles, contextPrefix);

      // remove contextual styles
      if (contexts.length > 0) {
        for (const context of contexts) {
          markedForRemoval.push(context);
        }
      }
    }

    // ... so they will be removed in a second effort
    markedForRemoval.forEach(style => style.remove());
  }
}