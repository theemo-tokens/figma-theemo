import Container from '../container';

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

function hasBoundVariable(style: PaintStyle) {
  return style.boundVariables.paints !== undefined 
    ? style.boundVariables.paints?.length === 0 
    : true
}

function isGradient(style: PaintStyle) {
  return style.paints.length > 1;
}

export function getMigrationStyles(container: Container) {
  const keepStyles = container.references.findPaintStyleReferences();
  const contextPrefix = container.settings.get('context.prefix');
  const paintStyles = figma.getLocalPaintStyles();

  return paintStyles.filter(style => (
    // keep styles as wished
    (keepStyles.includes(style) ||
    // or is a contextual one
    hasContexts(style, paintStyles, contextPrefix)) &&
    // or it already has a variable assigned, then it is considered migrated
    (!hasBoundVariable(style) ||
    // cannot migrate gradients to variables
    !isGradient(style))
  ));
}