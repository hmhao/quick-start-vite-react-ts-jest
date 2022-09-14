import {
  HtmlTagDescriptor,
  IndexHtmlTransformContext,
  PluginOption,
  ResolvedConfig,
  UserConfig,
  ViteDevServer,
} from 'vite';
import fs, { FSWatcher } from 'fs';
import path from 'path';
import {
  initBuildOptions,
  movePageFiles,
  redirect,
  scanDir,
  transformTemplate,
  watchDir,
} from './service';
import { defaultOptions, Options } from './types';
import { getFirstPage, routesMap } from './utils';

export default function VitePluginFileSystemMultiPagesApp(
  options?: Options,
): PluginOption {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };
  let watcher: FSWatcher;
  let config: ResolvedConfig;

  return {
    name: 'vite-plugin-fmpa',
    config(config: UserConfig) {
      scanDir(mergedOptions);

      config.server = config.server || {};
      config.server.open =
        mergedOptions.open === true
          ? getFirstPage(
              [...routesMap.entries()].reduce(
                (
                  obj: Record<string, string>,
                  [key, value]: [string, string],
                ) => ((obj[key] = value), obj),
                {},
              ),
            )
          : mergedOptions.open;
    },
    configResolved(resolvedConfig: ResolvedConfig) {
      config = resolvedConfig;
      const itr = routesMap.entries();
      initBuildOptions(itr, config, mergedOptions);
    },
    configureServer(server: ViteDevServer) {
      redirect(server, config, mergedOptions);
    },
    buildStart: () => {
      watcher = watchDir(mergedOptions);
    },
    transformIndexHtml: {
      enforce: 'pre',
      transform(html: string, ctx: IndexHtmlTransformContext) {
        // 注入 entry
        if (config.mode === 'development') {
          const entry = mergedOptions.entry;
          const dir = routesMap.get(ctx.originalUrl) || '/';
          const src = path.posix.join(path.dirname(dir), entry);
          const srcPath = path.posix.join(config.root, src);
          if (fs.existsSync(srcPath)) {
            return {
              html,
              tags: [
                {
                  attrs: { type: 'module', src },
                  injectTo: 'body',
                  tag: 'script',
                } as HtmlTagDescriptor,
              ],
            };
          }
        } else if (config.mode === 'production') {
          const entry = mergedOptions.entry;
          const src = path.posix.join(path.dirname(ctx.path), entry);
          return {
            html,
            tags: [
              {
                attrs: { type: 'module', src },
                injectTo: 'body',
                tag: 'script',
              } as HtmlTagDescriptor,
            ],
          };
        }
        return html;
      },
    },
    resolveId(id: string) {
      return null;
    },
    load(id: string) {
      if (mergedOptions.publicTemplateSrc && id.endsWith('.html')) {
        return transformTemplate(id, config, mergedOptions);
      }
      return null;
    },
    transform(code: string, id: string) {
      return {
        code,
        map: null,
      };
    },
    buildEnd() {
      watcher.close();
    },
    closeBundle() {
      if (mergedOptions.publicPath) {
        movePageFiles(config, mergedOptions);
      }
    },
  };
}
