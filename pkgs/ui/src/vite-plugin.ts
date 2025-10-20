import type { Plugin } from 'vite';

/**
 * Options for the Sonr UI Vite plugin
 */
export interface SonrUIPluginOptions {
  /**
   * Path to the CSS file to inject (default: '@/styles/globals.css')
   */
  cssPath?: string;
  /**
   * Whether to inject the CSS automatically (default: true)
   */
  injectCSS?: boolean;
}

/**
 * Vite plugin for @sonr.io/ui that sets up Tailwind CSS and component aliases
 */
export function sonrUI(options: SonrUIPluginOptions = {}): Plugin {
  const { cssPath = '@/styles/globals.css', injectCSS = true } = options;

  return {
    name: 'vite-plugin-sonr-ui',
    config: () => ({
      css: injectCSS
        ? {
            preprocessorOptions: {
              css: {
                charset: false,
              },
            },
          }
        : undefined,
    }),
    transformIndexHtml: {
      order: 'pre',
      handler(html: string) {
        if (injectCSS) {
          return html.replace('<head>', `<head>\n    <link rel="stylesheet" href="${cssPath}" />`);
        }
        return html;
      },
    },
  };
}
