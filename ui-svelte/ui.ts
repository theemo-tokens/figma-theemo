import { writable } from 'svelte/store';
import Messenger from './messenger';

export const section = writable('selection');

export const messenger = writable(new Messenger());