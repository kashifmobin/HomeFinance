import type * as React from 'react';

/** Wrap your app root (or <body>) in class="ml-screen": components adapt to its width at 768px and 1024px. */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = the one main action; secondary = everything else; ghost = low emphasis; danger = destructive. Default primary. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** true: always full width. "mobile": full width below 768px only. */
  block?: boolean | 'mobile';
  /** Renders an <a> instead of a <button>. */
  href?: string;
}
export declare function Button(props: ButtonProps): React.ReactElement;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  /** Helper text under the field. */
  hint?: React.ReactNode;
  /** Error text; replaces the hint and marks the field invalid. */
  error?: React.ReactNode;
}
export declare function Input(props: InputProps): React.ReactElement;

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Small overline above the title. */
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  /** Actions, usually one or two Buttons. */
  footer?: React.ReactNode;
}
export declare function Card(props: CardProps): React.ReactElement;

export interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Columns from 1024px. 1 below 768px, 2 from 768px. Default 3. */
  columns?: 3 | 4;
}
export declare function CardGrid(props: CardGridProps): React.ReactElement;

export interface NavLink { label: React.ReactNode; href?: string; active?: boolean }
export interface NavBarProps {
  brand: React.ReactNode;
  brandHref?: string;
  /** Up to 5 links. Inline from 768px; in the menu panel below. */
  links?: NavLink[];
  /** Right-side action, e.g. a Button. Moves into the menu panel on mobile. */
  action?: React.ReactNode;
  /** Start with the mobile menu open. */
  defaultOpen?: boolean;
  className?: string;
}
export declare function NavBar(props: NavBarProps): React.ReactElement;

export interface DialogProps {
  open: boolean;
  /** Called on Escape, scrim click and the close button. */
  onClose?: () => void;
  title?: React.ReactNode;
  /** Buttons, least important first: [Cancel, Confirm]. Stacked full width on mobile, primary on top. */
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}
export declare function Dialog(props: DialogProps): React.ReactElement | null;

declare global {
  interface Window {
    MinimalLight: { Button: typeof Button; Input: typeof Input; Card: typeof Card; CardGrid: typeof CardGrid; NavBar: typeof NavBar; Dialog: typeof Dialog };
  }
}
