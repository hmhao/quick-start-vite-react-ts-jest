import ErrnoException = NodeJS.ErrnoException;
import fs, { PathLike, WatchEventType } from 'fs';
import path from 'path';
import { ResolvedConfig, ViteDevServer, normalizePath, send } from 'vite';
import {
  addPrefSlash,
  addSlash,
  deletePrefSlash,
  deleteSlash,
  getScanName,
  rmDir,
  routesMap,
  templateCompile,
} from './utils';
import { ResolvedOptions } from './types';

export const scanDir = (mergedOptions: ResolvedOptions, sourceUrl?: string) => {
  const scanName = getScanName(mergedOptions);
  if (!sourceUrl) {
    sourceUrl = mergedOptions.dir;
  }
  const files = fs.readdirSync(sourceUrl);
  // 解析文件类型，如果是目录则继续向目录内遍历
  // console.log(scanName, files);
  for (const key of files) {
    if (key === scanName) {
      const mapKey = sourceUrl.replace(mergedOptions.dir, '') || '/';
      routesMap.set(mapKey, path.posix.join(sourceUrl, scanName));
      // console.log('mapkey:', mapKey)
      // console.log('mapsource:', routesMap.get(mapKey))
    }
    const stat = fs.statSync(path.resolve(sourceUrl, key));
    if (stat.isDirectory()) {
      scanDir(mergedOptions, path.posix.join(sourceUrl, `${key}`));
    }
  }
};

export function watchDir(mergedOptions: ResolvedOptions) {
  const scanName = getScanName(mergedOptions);
  return fs.watch(
    mergedOptions.dir,
    { recursive: true },
    (e: WatchEventType, filename: string) => {
      if (e === 'rename') {
        filename = filename.replaceAll('\\', '/');
        const filePath = path.posix.join(mergedOptions.dir, filename);
        const mapKey = addPrefSlash(filename.replace(`/${scanName}`, ''));
        if (fs.existsSync(filePath) && filename.endsWith(scanName)) {
          routesMap.set(mapKey, filePath);
        } else {
          routesMap.has(mapKey) && routesMap.delete(mapKey);
        }
        console.log(mapKey, routesMap);
      }
    },
  );
}

export function redirect(
  server: ViteDevServer,
  config: ResolvedConfig,
  mergedOptions: ResolvedOptions,
) {
  server.middlewares.use(async (req, res, next) => {
    if (req.url) {
      const urlWithSlash = addSlash(req.url);
      const urlWithoutSlash = deleteSlash(urlWithSlash);
      const dir = mergedOptions.dir.toString();
      if (
        routesMap.has(req.url) ||
        routesMap.has(urlWithSlash) ||
        routesMap.has(urlWithoutSlash)
      ) {
        if (!mergedOptions.publicTemplateSrc) {
          req.url = addPrefSlash(
            path.posix.join(dir, req.url, mergedOptions.templateName),
          );
        } else {
          const accestPath = path.posix.join(dir, req.url);
          let html = fs
            .readFileSync(mergedOptions.publicTemplateSrc)
            .toString();
          html = templateCompile(html, mergedOptions.replace || {}, accestPath);
          html = await server.transformIndexHtml(
            req.url,
            html,
            req.originalUrl,
          );
          return send(req, res, html, 'html', {
            headers: server.config.server.headers,
          });
        }
      }
    }
    next();
  });
}

export function initBuildOptions(
  itr: IterableIterator<[PathLike, string]>,
  config: ResolvedConfig,
  mergedOptions: ResolvedOptions,
) {
  let next = itr.next();
  while (!next.done) {
    const [key] = next.value;
    const pageName = key === '' || key === '/' ? 'index' : deletePrefSlash(key);
    if (!config.build.rollupOptions) config.build.rollupOptions = {};
    if (!config.build.rollupOptions.input)
      config.build.rollupOptions.input = {};
    const inputOption = config.build.rollupOptions.input;
    inputOption[pageName] = path.posix.join(
      config.root,
      mergedOptions.dir,
      key,
      mergedOptions.templateName,
    );
    next = itr.next();
  }
}

export function transformTemplate(
  id: string,
  config: ResolvedConfig,
  mergedOptions: ResolvedOptions,
) {
  const publicTemplateSrc = mergedOptions.publicTemplateSrc;
  const content = fs.readFileSync(publicTemplateSrc).toString();
  const accestPath = path.posix.relative(config.root, path.dirname(id));
  console.log('id:', accestPath);
  return `${templateCompile(content, mergedOptions.replace || {}, accestPath)}`;
}

export function movePageFiles(
  config: ResolvedConfig,
  mergedOptions: ResolvedOptions,
) {
  fs.cp(
    path.join(
      `${config.root}`,
      `${config.build.outDir}`,
      `${mergedOptions.dir}`,
    ),
    path.join(`${config.root}`, `${mergedOptions.publicPath}`),
    {
      recursive: true,
    },
    (err) => {
      console.log(err);
      if (!err) {
        const removedDir = path.join(
          `${config.root}`,
          `${config.build.outDir}`,
          `${
            deletePrefSlash(normalizePath(mergedOptions.dir.toString())).split(
              '/',
            )[0]
          }`,
        );
        rmDir(removedDir).then((end) => {
          if (end) fs.rmdirSync(removedDir);
        });
      }
    },
  );
}
