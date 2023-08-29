/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    alias: {
      'epic-jsx': './index',
    },
  },
})
