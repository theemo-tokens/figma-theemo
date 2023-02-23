import Command from '../../commands/command';
import { findThemeStyle } from '../utils';
import { Features } from '@theemo/core';

export default class PersistFeatures extends Command {
  NAME = 'themes.persist-features';

  execute(features: Features) {
    let featuresStorage = findThemeStyle();

    if (!featuresStorage) {
      featuresStorage = this.createFeaturesStorage();
    }

    featuresStorage.description = JSON.stringify(features);
  }

  private createFeaturesStorage() {
    const storage = figma.createGridStyle();
    storage.name = 'theemo/features';
    return storage;
  }
}