import type { ReactElement, ReactNode } from 'react';

/**
 * Types for the vendored React Bits component (JellyRadio.jsx). The source is kept
 * byte-for-byte as published so it can be swapped for a newer release without a
 * merge, so its prop surface is declared here instead of annotated in place.
 * Without this, TS infers `items` from the component's own `['Off', …]` default and
 * narrows it to `string[]`, which rejects the icon-bearing objects this app passes.
 */
export type JellyRadioItem = {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

export type JellyRadioProps = {
  /** The chips. A string is both value and label. */
  items?: (string | JellyRadioItem)[];
  /** Controlled value. Outside changes jump. */
  value?: string;
  /** Initial value when uncontrolled. Falls back to the first item. */
  defaultValue?: string;
  /** Called on the commit, before the motion ends. */
  onChange?: (value: string, index: number) => void;
  /** Surface of an unchosen chip. */
  chipColor?: string;
  /** Surface of the chosen chip. */
  activeColor?: string;
  /** Label of an unchosen chip, and the hover tone. */
  textColor?: string;
  /** Label of the chosen chip. */
  activeTextColor?: string;
  /** Chip height 28, 36 or 44 pixels. Large is the touch-first size. */
  size?: 'sm' | 'md' | 'lg';
  /** Rest spacing between chips in pixels. */
  gap?: number;
  /** Corner radius in pixels. 22 is a pill at large. */
  radius?: number;
  /** How much the chosen chip grows; also sets the room neighbours make. */
  swell?: number;
  /** Extra pixels every neighbour is shoved beyond that room. */
  barge?: number;
  /** How much every unchosen chip gives up. */
  shrink?: number;
  /** The wide-before-tall split. */
  jelly?: number;
  /** One minus the damping ratio. */
  bounce?: number;
  /** Milliseconds per row step before a neighbour moves. */
  stagger?: number;
  /** Spring stiffness of the chosen chip. */
  stiffness?: number;
  /** Fades the group and ignores input. */
  disabled?: boolean;
  /** Accessible name of the group. */
  ariaLabel?: string;
  /** Extra classes for the group. */
  className?: string;
};

declare function JellyRadio(props: JellyRadioProps): ReactElement | null;

export default JellyRadio;
