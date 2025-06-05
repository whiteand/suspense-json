import { defineConfig } from 'vitest/config'


export default defineConfig({
  test: {
    // other test options
  },
  esbuild: {
    target: 'es2024'
  }
})