# Azure Maps H3 sample

This sample for Azure Maps creates layers using the underlying Mapbox layer in Azure Maps. The default styling of Azure Maps fonts is also customized in this sample.

## Getting started

Define the variable `NEXT_PUBLIC_AZURE_MAP_SUBSCRIPTION_KEY` using one of the methods below:

- Run `export NEXT_PUBLIC_AZURE_MAP_SUBSCRIPTION_KEY="<your-key>"` in your shell
- Add a file named `.env.local` with the contents:
  ```
  NEXT_PUBLIC_AZURE_MAP_SUBSCRIPTION_KEY="<your-key>"
  ```

To run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
result.

You can start editing the page by modifying `pages/index.tsx`. The page
auto-updates as you edit the file.

## Static Export

This site supports SSR (excluding the actual map will still be rendered but only
at browser time). To generate a static build run:

```bash
yarn export # this will generate a static build under `./out`
```

You can then use your favorite local server to serve the `./out` directory:

```sh
# Using https://github.com/vercel/serve
yarn global add serve
serve out
# The static build will be served from http://localhost:5000 by default
```
