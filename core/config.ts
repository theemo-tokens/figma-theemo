export interface Settings {
  context: string;
  contexts: string[];

  'tools.auto-update-references': boolean,
  'tools.jsonbin.key': string,
  'tools.jsonbin.id': string,
  'context.prefix': string;
}

export const DEFAULT_CONFIG = Object.freeze({
  // default values
  'context': 'light',
  'contexts': ['light', 'dark'],

  // settings
  'tools.auto-update-references': true,
  'tools.jsonbin.key': '',
  'tools.jsonbin.id': '',
  'context.prefix': '.$'
});