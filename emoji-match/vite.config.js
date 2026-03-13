// vite.config.js
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { EsLinter, linterPlugin } from 'vite-plugin-linter';

export default defineConfig((configEnv) => ({
  /**
   * По умолчанию Vite собирает проект с базовым путём / (относительно корня домена).
   * При локальном открытии файла корнем становится файловая система,
   * и браузер пытается загрузить ресурсы из несуществующей папки C:/assets.
   *
   * Расскоментируй, если нужен относительный путь ./
   */
  // base: './',

  /**
   * viteSingleFile собирает все в один index.html
   */
  plugins: [
    viteSingleFile(),
    linterPlugin({
      include: ['./js/**/*.js'],
      linters: [new EsLinter({ configEnv })]
    })
  ],

  /**
   * Убираем комментарии о лицензии
   */
  esbuild: {
    legalComments: 'none'
  },
}));

