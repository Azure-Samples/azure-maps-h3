const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  assetPrefix: isProduction ? "/azure-maps-h3" : "",
  publicRuntimeConfig: {
    // used in '/components/Link.js/', for more details go to the component itself
    linkPrefix: isProduction ? "/azure-maps-h3" : "",
  },
};
