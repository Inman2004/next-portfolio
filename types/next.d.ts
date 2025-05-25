// Type definitions for Next.js
import 'next';

declare module 'next' {
  export * from 'next/types';
  
  // Add any missing type declarations here
  export function useRouter(): any;
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
}

declare module 'next/link' {
  import { ComponentType, AnchorHTMLAttributes } from 'react';
  
  interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    legacyBehavior?: boolean;
    onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>;
    onTouchStart?: React.TouchEventHandler<HTMLAnchorElement>;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  }
  
  const Link: ComponentType<LinkProps>;
  export default Link;
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    layout?: 'fixed' | 'intrinsic' | 'responsive' | 'fill';
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'eager' | 'lazy';
    lazyBoundary?: string;
    unoptimized?: boolean;
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
  }
  
  const Image: React.FC<ImageProps>;
  export default Image;
  
  export type ImageLoader = (resolverProps: ImageLoaderProps) => string;
  
  export interface ImageLoaderProps {
    src: string;
    width: number;
    quality?: number;
  }
  
  export interface StaticImport {
    src: string;
    height: number;
    width: number;
    blurWidth?: number;
    blurHeight?: number;
    blurDataURL?: string;
  }
}

declare module 'next/dynamic' {
  import { ComponentType, ComponentProps, LazyExoticComponent } from 'react';
  
  type ComponentTypeOrPromise<T> = ComponentType<T> | Promise<{ default: ComponentType<T> }>;
  
  interface DynamicOptions<T> {
    ssr?: boolean;
    loading?: (props: T) => JSX.Element | null;
    loader?: () => Promise<{ default: ComponentType<T> }>;
    loadableGenerated?: {
      webpack?: () => string[];
      modules?: string[];
    };
  }
  
  function dynamic<T = {}>(
    loader: () => Promise<{ default: ComponentType<T> }>,
    options?: DynamicOptions<T>
  ): ComponentType<T>;
  
  export default dynamic;
}
