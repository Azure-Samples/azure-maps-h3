////////////////////////////////////////////////////////////////////////////////
/**
 * Custom App Document
 * Edit this modify:
 * - Global state
 * - Custom error handling
 * - Global CSS
 *
 * @see https://nextjs.org/docs/advanced-features/custom-app
 */
////////////////////////////////////////////////////////////////////////////////
import { AppProps } from "next/app";
import React from "react";
import Head from "next/head";
import styles from "./_app.module.scss";
import { Header } from "../components/Header";
import "./styles.scss";
import "azure-maps-control/dist/atlas.css";

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        {/* Favicon */}
        <link
          rel="shortcut icon"
          type="image/png"
          href="/favicon-16x16.png"
          sizes="16x16"
        />
        <link
          rel="shortcut icon"
          type="image/png"
          href="/favicon-32x32.png"
          sizes="32x32"
        />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
      </Head>

      <div className={styles.layout}>
        <div className={styles.header}>
          <Header pages={[{ title: "Map", href: "/" }]} />
        </div>

        <div className={styles.main}>
          <Component {...pageProps} />
        </div>
      </div>
    </>
  );
};

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default MyApp;
