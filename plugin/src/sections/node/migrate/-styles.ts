import { hasBoundVariable } from '../../../styles';
import Container from '../container';
import { StyleTypes } from '../styles/types';
import { RefNode } from '../types';

export function isContextual(name: string, prefix: string) {
  return name.includes(prefix);
};

export function getContext(name: string, prefix: string) {
  return name.substring(name.indexOf(prefix) + prefix.length);
}

export function getContextFreeName(name: string, prefix: string) {
  return name.substring(0, name.indexOf(prefix));
}

export function hasContexts(style: PaintStyle, styles: PaintStyle[], contextPrefix: string) {
  return styles.some(lookupStyle => lookupStyle.name.includes(`${style.name}${contextPrefix}`));
}

function isGradient(style: PaintStyle) {
  return style.paints.length > 1;
}

/**
 * Checks if all requirements are met, which are:
 * 
 * - if this style has a reference to another, is that referenced style already
 *   turned into a variable
 * - if this is a contextual style, does the rule above apply for the given contexts
 * 
 * @param style
 */
function requirementsForMigrationAreMet(style: PaintStyle, container: Container, references: Map<string, string>, paintStyles: PaintStyle[]): boolean {
  const contextPrefix = container.settings.get('context.prefix');

  // 1) When this is a contextual style, check if the requirements of the
  //    contexts are met
  if (isContextual(style.name, contextPrefix)) {
    // find contextual styles
    const contextualStyles = paintStyles.filter(paintStyle => paintStyle.name.startsWith(`${style.name}${contextPrefix}`) 
      && paintStyle.name !== style.name);

    // perform the check for each of them
    return contextualStyles.every(contextualStyle => requirementsForMigrationAreMet(contextualStyle, container, references, paintStyles));
  }

  // 2) check if we found a reference and check if that reference has a variable assigned
  if (references.has(style.id)) {
    const referencedStyle = paintStyles.find((paintStyle) => paintStyle.id === references.get(style.id) as string);

    return Boolean(referencedStyle && hasBoundVariable(referencedStyle));
  }

  // 3) Not handled by theemo before, it is good, keep migrating
  return true;
}

export function getMigrationStyles(container: Container) {
  const paintStyles = figma.getLocalPaintStyles();
  const references = compileReferences(container);
  const contextPrefix = container.settings.get('context.prefix');
  const stylesWithNodes = container.references.findPaintStyleReferences();

  // we want to keep styles when ...
  return paintStyles.filter(style => (
    // ... they are not composites of multiple colors
    // cannot migrate gradients to variables
    !isGradient(style) &&

    // ... they still have configurations on nodes
    stylesWithNodes.includes(style) 
      ? true
      : (
        // ... they are not already assigned with a variable
        // then they are considered migrated
        !hasBoundVariable(style) &&
    
        (
          // ... they are not contextual
          !isContextual(style.name, contextPrefix) ||

          // ... but instead their "parent" who has those contexts
          hasContexts(style, paintStyles, contextPrefix)
        )
      )
  ));
}

function compileReferences(container: Container): Map<string, string> {
  const ref = new Map<string, string>();
  const nodes = [...container.references.readNodes()]
    .map(nodeId => figma.getNodeById(nodeId))
    .filter(node => container.registry.has(node as RefNode))
    .map(node => container.registry.get(node as RefNode))
    .filter(node => node.hasReference('fill') || node.hasReference('stroke'));

  for (const handler of nodes) {
    if (handler.hasReference('fill')) {
      const style = handler.styles[StyleTypes.Fill];
      if (style) {
        ref.set(style.to!.id, style.from!.id);
      }
    }

    if (handler.hasReference('stroke')) {
      const style = handler.styles[StyleTypes.Stroke];
      if (style) {
        ref.set(style.to!.id, style.from!.id);
      }
    }
  }

  return ref;
}