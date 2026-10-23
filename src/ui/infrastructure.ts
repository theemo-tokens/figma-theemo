import { writable, get } from 'svelte/store';
import Messenger from './infrastructure/messenger';

const _messenger = writable(new Messenger());
export const messenger = get(_messenger);
