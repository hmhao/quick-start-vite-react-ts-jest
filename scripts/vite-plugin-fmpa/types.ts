export type ReplaceParams = Record<
  string,
  string | ((filePath: string) => string)
>;

export type Options = Partial<ResolvedOptions>;

export interface ResolvedOptions {
  /**
   * 开始扫描的目录, 也就是文件系统的根目录，插件会扫描目录中内容配置相关构建和路由中间件
   * 路径是相对于vite.config的root
   * 默认路径: 'src/pages'
   */
  dir: string;
  /**
   * 入口 html 文件名， 如果不配置 publicTemplateSrc 那么根目录和每个子目录都需要一个 html 作为入口
   * 默认文件名: 'index.html'
   */
  templateName: string;
  /**
   * 入口 js 文件名，自动注入到 html 中
   * 在 all-in-one template 模式，若目录下此文件存在, 此目录会被识别为有效的页面, 并生成路由配置
   * 默认文件名: 'main.ts'
   */
  entry: string;
  /**
   * vite 默认的 mpa 构建设置，如果文件系统根目录在/src/pages/， 会打包到 /dist/src/pages/ 目录
   * 如果你想要改变构建后的存放目录，可以修改此项
   */
  publicPath: string;
  /**
   * 如果 publicTemplateSrc !== '', 则启用 all-in-one template 模式
   * 这种情况下所有的目录共用一个 html 文件作为入口
   */
  publicTemplateSrc?: string;
  /**
   * 只在 all-in-one template 模式配置才会生效
   * 传入一个对象, 对象内属性会替换公共 html 模版内相应的用 {{}} 包裹的内容
   */
  replace?: ReplaceParams;
}

export const defaultOptions = {
  dir: 'src/pages',
  templateName: 'index.html',
  entry: 'main.ts',
  publicPath: '/dist/',
};
