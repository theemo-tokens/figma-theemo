<script lang="ts">
  import { theme } from '../themes';
  import Section from '../components/Section.svelte';
  import { Type, Checkbox, Radio } from 'figma-plugin-ds-svelte';
  import {
    Behavior,
    ColorScheme,
    type ColorContrastFeature,
    type ColorSchemeFeature,
    type Theme,
  } from '@theemo/core';
  import { getContext } from 'svelte';
  import type Messenger from '../messenger';

  const messenger = getContext('messenger') as Messenger;
  let defaultColorScheme = $theme.features?.colorScheme?.default;

  function persistTheme() {
    messenger.send('themes.persist-features', $theme.features);
    theme.set($theme);
  }

  function ensureFeatures() {
    $theme.features = {
      ...$theme.features,
    };
  }

  function updateColorScheme(options: Partial<ColorSchemeFeature>) {
    ensureFeatures();
    if (!$theme.features.colorScheme) {
      $theme.features.colorScheme = {
        enabled: false,
        behavior: [Behavior.Adaptive, Behavior.Mode],
        default: ColorScheme.Light,
      };
    }

    $theme.features.colorScheme = {
      ...$theme.features.colorScheme,
      ...options,
    };
  }

  function updateColorContrast(options: Partial<ColorContrastFeature>) {
    ensureFeatures();
    if (!$theme.features.colorContrast) {
      $theme.features.colorContrast = {
        enabled: false,
        behavior: [Behavior.Adaptive, Behavior.Mode],
      };
    }

    $theme.features.colorContrast = {
      ...$theme.features.colorContrast,
      ...options,
    };
  }

  function toggleColorScheme(e) {
    updateColorScheme({ enabled: e.target.checked });
    persistTheme();
  }

  function toggleColorContrast(e) {
    updateColorContrast({ enabled: e.target.checked });
    persistTheme();
  }

  function toggleBehavior(behaviors: Behavior[]) {
    return function (e) {
      if (e.target.checked) {
        behaviors.push(e.target.value);
      } else {
        behaviors.splice(behaviors.indexOf(e.target.value), 1);
      }

      persistTheme();
    };
  }

  function changeColorSchemeDefault(e) {
    updateColorScheme({ default: e.target.value });
    persistTheme();
  }
</script>

<Section>
  <Type size="xlarge">Theme: {$theme.name}</Type>

  <Type size="large">Features</Type>

  <Checkbox
    checked={$theme.features?.colorScheme?.enabled}
    on:change={toggleColorScheme}>Color Schemes (light/dark)</Checkbox
  >

  {#if $theme.features?.colorScheme?.enabled}
    <div class="subfeatures">
      <div>
        <Type weight="medium">Behavior</Type>

        <Checkbox
          checked={$theme.features?.colorScheme?.behavior.includes(
            Behavior.Adaptive
          )}
          value={Behavior.Adaptive}
          on:change={toggleBehavior($theme.features?.colorScheme?.behavior)}
          >Adaptive</Checkbox
        >
        <Checkbox
          checked={$theme.features?.colorScheme?.behavior.includes(
            Behavior.Mode
          )}
          value={Behavior.Mode}
          on:change={toggleBehavior($theme.features?.colorScheme?.behavior)}
          >Mode</Checkbox
        >
      </div>
      <div>
        <Type weight="medium">Default</Type>

        <Radio
          bind:group={defaultColorScheme}
          value={ColorScheme.Light}
          on:change={changeColorSchemeDefault}>{ColorScheme.Light}</Radio
        >
        <Radio
          bind:group={defaultColorScheme}
          value={ColorScheme.Dark}
          on:change={changeColorSchemeDefault}>{ColorScheme.Dark}</Radio
        >
      </div>
    </div>
  {/if}

  <Checkbox
    checked={$theme.features?.colorContrast?.enabled}
    on:change={toggleColorContrast}>Color Contrast (more/less)</Checkbox
  >

  {#if $theme.features?.colorContrast?.enabled}
    <div class="subfeatures">
      <div>
        <Type weight="medium">Behavior</Type>

        <Checkbox
          checked={$theme.features?.colorContrast?.behavior.includes(
            Behavior.Adaptive
          )}
          value={Behavior.Adaptive}
          on:change={toggleBehavior($theme.features?.colorContrast?.behavior)}
          >Adaptive</Checkbox
        >
        <Checkbox
          checked={$theme.features?.colorContrast?.behavior.includes(
            Behavior.Mode
          )}
          value={Behavior.Mode}
          on:change={toggleBehavior($theme.features?.colorContrast?.behavior)}
          >Mode</Checkbox
        >
      </div>
    </div>
  {/if}
</Section>

<style>
  .subfeatures {
    margin-left: 32px;
    display: flex;
    gap: 8px;
  }
</style>
