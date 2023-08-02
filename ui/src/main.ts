import App from './PluginUI.svelte';

import { GlobalCSS } from 'figma-plugin-ds-svelte';
import './styles/ui.css';
import './styles/common.css';
import './styles/layout.css';
import './settings';
import './infrastructure/update-thread';

const app = new App({
	target: document.body,
});

export default app;