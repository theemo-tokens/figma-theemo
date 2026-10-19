import App from './PluginUI.svelte';
import { mount } from 'svelte';

import './styles/ui.css';
import './styles/common.css';
import './styles/layout.css';
import './infrastructure/update-variables';

const app = mount(App, {
  target: document.body,
});

export default app;
