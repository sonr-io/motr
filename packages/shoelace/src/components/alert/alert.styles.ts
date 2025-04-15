import { css } from 'lit';

export default css`
  :host {
    display: contents;
    margin: 0;
  }

  .alert {
    position: relative;
    width: 100%;
    display: flex;
    align-items: stretch;
    background-color: var(--sl-color-neutral-0);
    border: solid var(--sl-panel-border-width) var(--sl-color-neutral-200);
    border-radius: var(--sl-border-radius-medium);
    font-family: var(--sl-font-sans);
    font-size: var(--sl-font-size-sm);
    line-height: 1.6;
    color: var(--sl-color-neutral-900);
    margin: inherit;
    padding: var(--sl-spacing-medium) var(--sl-spacing-large);
  }

  .alert__icon {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    font-size: var(--sl-font-size-lg);
    padding-inline-end: var(--sl-spacing-medium);
  }

  .alert__message {
    flex: 1 1 auto;
    display: block;
    overflow: hidden;
    padding-inline-start: var(--sl-spacing-small);
  }

  .alert__close-button {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    font-size: var(--sl-font-size-medium);
    padding-inline-start: var(--sl-spacing-medium);
  }

  /* Variants */
  .alert--default {
    background-color: var(--sl-color-neutral-0);
    border-color: var(--sl-color-neutral-200);
    color: var(--sl-color-neutral-900);
  }

  .alert--danger {
    border-color: var(--sl-color-danger-300);
    color: var(--sl-color-danger-600);
  }

  .alert--danger .alert__icon {
    color: var(--sl-color-danger-600);
  }

  /* Title styles */
  ::slotted([slot='title']) {
    margin-bottom: var(--sl-spacing-3x-small);
    font-size: var(--sl-font-size-sm);
    font-weight: var(--sl-font-weight-semibold);
    line-height: 1;
    letter-spacing: var(--sl-letter-spacing-tight);
  }

  /* Description styles */
  ::slotted(:not([slot='title'])) {
    font-size: var(--sl-font-size-sm);
    line-height: 1.6;
  }

  /* Icon positioning */
  .alert--has-icon {
    padding-inline-start: var(--sl-spacing-large);
  }

  .alert--has-icon .alert__icon {
    position: absolute;
    left: var(--sl-spacing-large);
    top: var(--sl-spacing-large);
  }

  .alert--has-icon .alert__message {
    padding-inline-start: var(--sl-spacing-2x-large);
  }

  /* Remove icon and close button when not needed */
  .alert:not(.alert--has-icon) .alert__icon,
  .alert:not(.alert--closable) .alert__close-button {
    display: none;
  }
`;
