# Seed Dawn Base

Shopify Dawn Base theme with custom Drawers, Modals and Ajaxcart. Also Custom npm scripts to improve dev flow.

## Requirements

- Node v14
- Shopify CLI

## Getting started

1. Setup:
  - yarn install 

2. Start Development Mode(*see below):
  - yarn run dev

3. Deploy:
  - yarn run deploy

## Development Mode
Running 'yarn run dev' does this:
  1. Logs you into shopify cli for current project
  2. Runs 'shopify theme serve'
  3. Starts watching global.js and base.css for changes and copies
  them to global.min.js and base.min.css, respectevely. With this there's no need to worry about changing asset urls on theme.liquid when the assets get compressed.

## Synchronizing theme settings
  1. yarn run sync
  2. Choose theme to sync
  3. Manually check changes using git (and discard if necessary)
  4. Commit changes
