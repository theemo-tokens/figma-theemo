import Container from '../container';
import PersistFeatures from './commands/persist-features';
import { Theme, Features } from '@theemo/core';
import { findThemeStyle } from './utils';

export class Themes {

  private theme?: Theme;

  constructor(private container: Container) {
    this.registerCommands();
    
    // @TODO
    // detect "mode": author vs consumer
    this.initAuthorMode();
  }

  private registerCommands() {
    this.container.commander.registerCommand(new PersistFeatures(this.container.commander, this.container));
  }

  private initAuthorMode() {
    const theme: Theme = {
      name: figma.root.name
    };

    const featuresStorage = findThemeStyle();
    
    if (featuresStorage) {
      const features = JSON.parse(featuresStorage.description) as Features;

      if (features) {
        theme.features = features;
      }
    }

    this.loadTheme(theme);
  }

  private loadTheme(theme: Theme) {
    this.theme = theme;

    // @TODO
    // make quick-actions/commands show up based on features

    this.container.emitter.sendEvent('themes.theme-loaded', this.theme);
  }
}