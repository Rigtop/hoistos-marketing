/** @type {import('@ladle/react').UserConfig} */
export default {
  stories: 'src/**/*.stories.{ts,tsx}',
  port: 61000,
  outDir: 'ladle-build',
  defaultStory: '01-primitives--button',
  addons: {
    theme: {
      enabled: true,
      defaultState: 'dark',
    },
    width: {
      enabled: true,
    },
    rtl: {
      enabled: false,
    },
  },
}
