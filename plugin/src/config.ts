type Version = '1' | '2';
type Dimension = { width: number; height: number; };

const savedVersion = figma.root.getPluginData('version');
const version = (savedVersion === '' ? '1' : savedVersion) as Version;

const DIMENSIONS: Record<Version, Dimension> = {
  '1': {
    width: 575,
    height: 490
  },
  '2': {
    width: 525,
    height: 380
  }
}

export const NAMESPACE = 'stylereferences';
export const UI_DIMENSIONS = DIMENSIONS[version];