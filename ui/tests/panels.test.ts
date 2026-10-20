import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import { tick } from 'svelte';
import Styles from '../src/sections/Styles.svelte';
import PluginUI from '../src/PluginUI.svelte';
import { EventName } from '@theemo-figma/core/styles/events';
import { CommandName } from '@theemo-figma/core/styles/commands';
import {
  emit,
  resetBus,
  solidColor,
  textColor,
  aliasedColor,
  colorVariable,
  aliasVariable,
  brandCollection,
  VARIABLE_ID,
  ALIAS_TARGET_ID,
  MODE_LIGHT
} from './fixtures';

interface Sent {
  command: string;
  data?: unknown;
}

function captureCommands(): Sent[] {
  const sent: Sent[] = [];

  vi.spyOn(window.parent, 'postMessage').mockImplementation(((message: { pluginMessage: Sent }) => {
    sent.push(message.pluginMessage);
  }) as unknown as typeof window.parent.postMessage);

  return sent;
}

function last(sent: Sent[], command: string): Sent | undefined {
  return [...sent].reverse().find((msg) => msg.command === command);
}

function seedAliasScenario() {
  emit('variables-collected', [colorVariable(), aliasVariable()]);
  emit('collections-collected', [brandCollection()]);
  // a variable reference in the config is what opens the transform inputs
  emit(EventName.ConfigArrived, {
    styles: [],
    variables: [
      {
        variableId: VARIABLE_ID,
        modeId: MODE_LIGHT,
        referenceId: ALIAS_TARGET_ID,
        transforms: {}
      }
    ]
  });
}

beforeEach(() => {
  resetBus();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Styles panel', () => {
  test('requests initial data from the plugin on mount', () => {
    const sent = captureCommands();

    render(Styles);

    expect(sent.map((msg) => msg.command)).toEqual(
      expect.arrayContaining(['collect-collections', 'collect-variables', CommandName.ReadConfig])
    );
  });

  test('lists paint styles with their swatches', () => {
    resetBus([solidColor('1:1', 'Red'), solidColor('1:2', 'Blue', { r: 0, g: 0, b: 1 })]);
    captureCommands();

    const { container } = render(Styles);

    expect(screen.getAllByText('Red').length).toBeGreaterThanOrEqual(1);
    const swatches = container.querySelectorAll('.color-swatch');
    expect(swatches[0].getAttribute('style')).toContain('rgb(255, 0, 0');
  });

  test('shows a hint until a token is selected', async () => {
    resetBus([solidColor('1:1', 'Red')]);
    captureCommands();
    render(Styles);

    expect(screen.getByText('Please select a token')).toBeDefined();
  });

  test('style updates on the bus re-render the open panel', async () => {
    resetBus([solidColor('1:1', 'Red')]);
    captureCommands();
    render(Styles);

    await fireEvent.click(screen.getByRole('option', { name: 'Red' }));
    expect(screen.getByText(/When you want to use transforms/)).toBeDefined();

    emit(EventName.StyleUpdated, solidColor('1:1', 'Crimson', { r: 0.5, g: 0, b: 0 }));
    await tick();

    // list entry and open detail both re-render
    expect(screen.getAllByText('Crimson').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/When you want to use transforms/)).toBeDefined();
  });

  test('style deletions on the bus clear the selection view', async () => {
    resetBus([solidColor('1:1', 'Red'), solidColor('1:2', 'Blue')]);
    captureCommands();
    render(Styles);

    await fireEvent.click(screen.getByRole('option', { name: 'Red' }));
    expect(screen.getAllByText('Red').length).toBeGreaterThanOrEqual(1);

    emit(EventName.StyleDeleted, '1:1');
    await tick();

    expect(screen.getByText('Please select a token')).toBeDefined();
    expect(screen.queryByRole('option', { name: 'Red' })).toBeNull();
  });
});

describe('Color detail: variable-bound styles', () => {
  async function openAliasedStyle() {
    resetBus([aliasedColor('1:1', 'Brand Red')]);
    seedAliasScenario();
    captureCommands();
    render(Styles);
    await fireEvent.click(screen.getByRole('option', { name: 'Brand Red' }));
  }

  test('shows modes and transform inputs for an aliased style', async () => {
    await openAliasedStyle();

    expect(screen.getByText('Uses Variable')).toBeDefined();
    expect(screen.getByText('brand/red')).toBeDefined();
    expect(screen.getByText('Light')).toBeDefined();
    expect(screen.getByText('Dark')).toBeDefined();
    expect(screen.getByPlaceholderText('Hue')).toBeDefined();
  });

  test('editing a transform input saves it through the bus', async () => {
    const sent = captureCommands();
    resetBus([aliasedColor('1:1', 'Brand Red')]);
    seedAliasScenario();

    render(Styles);
    await fireEvent.click(screen.getByRole('option', { name: 'Brand Red' }));

    await fireEvent.change(screen.getByPlaceholderText('Hue'), {
      target: { value: '45' }
    });

    expect(last(sent, CommandName.SaveTransforms)).toEqual({
      command: CommandName.SaveTransforms,
      data: {
        variableId: VARIABLE_ID,
        modeId: MODE_LIGHT,
        transforms: { hue: 45 }
      }
    });
  });

  test('clearing the only transform deletes it', async () => {
    resetBus([aliasedColor('1:1', 'Brand Red')]);
    emit('variables-collected', [colorVariable(), aliasVariable()]);
    emit('collections-collected', [brandCollection()]);
    emit(EventName.ConfigArrived, {
      styles: [],
      variables: [
        {
          variableId: VARIABLE_ID,
          modeId: MODE_LIGHT,
          referenceId: ALIAS_TARGET_ID,
          transforms: { hue: 10 }
        }
      ]
    });
    const sent = captureCommands();

    render(Styles);
    await fireEvent.click(screen.getByRole('option', { name: 'Brand Red' }));

    const hue = screen.getByPlaceholderText('Hue');
    expect((hue as HTMLInputElement).value).toBe('10');

    await fireEvent.change(hue, { target: { value: '' } });

    expect(last(sent, CommandName.DeleteTransforms)).toEqual({
      command: CommandName.DeleteTransforms,
      data: { variableId: VARIABLE_ID, modeId: MODE_LIGHT }
    });
  });
});

describe('EffectAndText detail: references', () => {
  async function openTextStyle(name = 'Body') {
    const sent = captureCommands();
    render(Styles);
    await fireEvent.click(screen.getByText('Text'));
    await fireEvent.click(screen.getByRole('option', { name }));
    return sent;
  }

  function seedTextStyleScenario() {
    resetBus([textColor('2:1', 'Headline'), textColor('2:2', 'Body'), textColor('2:3', 'Caption')]);
  }

  test('offers other local styles as references', async () => {
    seedTextStyleScenario();
    await openTextStyle();

    await fireEvent.click(screen.getByRole('button', { name: 'Pick a Local Style' }));

    // the selected style itself must not be offered
    expect(await screen.findByRole('menuitemradio', { name: 'Headline' })).toBeDefined();
    expect(screen.getByRole('menuitemradio', { name: 'Caption' })).toBeDefined();
    expect(screen.queryByRole('menuitemradio', { name: 'Body' })).toBeNull();
  });

  test('picking a reference sends LinkReference with the pair', async () => {
    seedTextStyleScenario();
    const sent = await openTextStyle();

    await fireEvent.click(screen.getByRole('button', { name: 'Pick a Local Style' }));
    await fireEvent.click(await screen.findByRole('menuitemradio', { name: 'Headline' }));

    expect(last(sent, CommandName.LinkReference)).toEqual({
      command: CommandName.LinkReference,
      data: { styleId: '2:2', referenceId: '2:1' }
    });
  });

  async function openLinkedStyle() {
    resetBus([textColor('2:1', 'Headline'), textColor('2:2', 'Body')]);
    emit(EventName.ConfigArrived, {
      styles: [{ styleId: '2:2', referenceId: '2:1' }],
      variables: []
    });
    const sent = captureCommands();
    render(Styles);
    await fireEvent.click(screen.getByText('Text'));
    await fireEvent.click(screen.getByRole('option', { name: 'Body' }));
    return sent;
  }

  test('a linked style shows the unlink action and sends UnlinkReference', async () => {
    const sent = await openLinkedStyle();

    await fireEvent.click(screen.getByRole('button', { name: 'Unlink reference' }));

    expect(last(sent, CommandName.UnlinkReference)).toEqual({
      command: CommandName.UnlinkReference,
      data: { styleId: '2:2' }
    });
  });

  test('the link state arrives with the config, not from a previous run', async () => {
    await openLinkedStyle();

    expect(screen.getByRole('button', { name: 'Unlink reference' })).toBeDefined();
  });
});

describe('PluginUI window & tabs', () => {
  test('window control toggles minimize and maximize', async () => {
    resetBus([solidColor('1:1', 'Red')]);
    const sent = captureCommands();

    const { container } = render(PluginUI);

    const control = container.querySelector('.window-control') as HTMLElement;

    await fireEvent.click(control);
    await fireEvent.click(control);

    expect(sent.map((msg) => msg.command)).toContain('minimize');
    expect(sent.map((msg) => msg.command)).toContain('maximize');
  });

  test('the About tab renders the plugin info', async () => {
    resetBus([solidColor('1:1', 'Red')]);
    captureCommands();

    const { container } = render(PluginUI);

    const tabs = container.querySelectorAll('.tab');
    await fireEvent.click(tabs[1]);

    expect(screen.getByText('Theemo - Design Tokens')).toBeDefined();
  });
});
