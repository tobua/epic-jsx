import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

export const rsbuild = defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './index.tsx',
    },
  },
  html: {
    title: 'epic-jsx Demo',
    favicon: '../logo.png',
  },
  output: {
    // Only applied in production, GitHub pages in this case.
    assetPrefix: '/epic-jsx/',
  },
})

export const gitignore = 'bundle'
export const vscode = 'biome'
export const biome = {
  extends: 'epic',
  root: false
}

export const typescript = {
  extends: 'web',
  files: ['index.tsx'],
}
