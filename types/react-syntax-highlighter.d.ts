import 'react-syntax-highlighter';

declare module 'react-syntax-highlighter' {
  import { CSSProperties, FC, ReactNode } from 'react';

  export interface SyntaxHighlighterProps {
    language: string;
    style?: Record<string, CSSProperties>;
    className?: string;
    customStyle?: CSSProperties;
    children: string;
    showLineNumbers?: boolean;
    wrapLines?: boolean;
    wrapLongLines?: boolean;
    lineNumberStyle?: CSSProperties;
    lineProps?: any;
    codeTagProps?: any;
    useInlineStyles?: boolean;
    showInlineLineNumbers?: boolean;
    startingLineNumber?: number;
    lineNumberContainerStyle?: CSSProperties;
    [key: string]: any;
  }

  export const Prism: FC<SyntaxHighlighterProps>;
  export const Light: FC<SyntaxHighlighterProps>;
  export const Dark: FC<SyntaxHighlighterProps>;
  export const PrismLight: FC<SyntaxHighlighterProps>;
  export const PrismAsync: FC<SyntaxHighlighterProps>;
  export const PrismAsyncLight: FC<SyntaxHighlighterProps>;
  export const PrismAsyncDark: FC<SyntaxHighlighterProps>;
  
  export function createElement(
    type: string | React.ComponentType<any>,
    props?: any,
    ...children: any[]
  ): any;
  
  export function registerLanguage(
    name: string,
    language: any
  ): void;
  
  export function setLanguage(language: string): void;
  
  export const defaultStyle: Record<string, CSSProperties>;
  export const dark: Record<string, CSSProperties>;
  export const light: Record<string, CSSProperties>;
  
  export const vscDarkPlus: Record<string, CSSProperties>;
  export const vscLightPlus: Record<string, CSSProperties>;
  
  export const docco: Record<string, CSSProperties>;
  export const darcula: Record<string, CSSProperties>;
  export const atomDark: Record<string, CSSProperties>;
  export const atomLight: Record<string, CSSProperties>;
  export const github: Record<string, CSSProperties>;
  export const monokai: Record<string, CSSProperties>;
  export const nord: Record<string, CSSProperties>;
  export const solarizedDark: Record<string, CSSProperties>;
  export const solarizedLight: Record<string, CSSProperties>;
  export const tomorrow: Record<string, CSSProperties>;
  export const tomorrowNight: Record<string, CSSProperties>;
  export const tomorrowNightBlue: Record<string, CSSProperties>;
  export const tomorrowNightBright: Record<string, CSSProperties>;
  export const tomorrowNightEighties: Record<string, CSSProperties>;
  export const twilight: Record<string, CSSProperties>;
  export const vs: Record<string, CSSProperties>;
  export const vs2015: Record<string, CSSProperties>;
  export const xcode: Record<string, CSSProperties>;
  export const xonokai: Record<string, CSSProperties>;
  
  export default {
    Prism,
    Light,
    Dark,
    PrismLight,
    PrismAsync,
    PrismAsyncLight,
    PrismAsyncDark,
    createElement,
    registerLanguage,
    setLanguage,
    defaultStyle,
    dark,
    light,
    vscDarkPlus,
    vscLightPlus,
    docco,
    darcula,
    atomDark,
    atomLight,
    github,
    monokai,
    nord,
    solarizedDark,
    solarizedLight,
    tomorrow,
    tomorrowNight,
    tomorrowNightBlue,
    tomorrowNightBright,
    tomorrowNightEighties,
    twilight,
    vs,
    vs2015,
    xcode,
    xonokai,
  };
}
