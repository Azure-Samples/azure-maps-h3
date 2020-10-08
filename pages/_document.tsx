////////////////////////////////////////////////////////////////////////////////
/**
 * Custom Root Document
 * Edit this modify the global <html> and <body> of your application.
 *
 * @see https://nextjs.org/docs/advanced-features/custom-document
 */
////////////////////////////////////////////////////////////////////////////////
import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";
import React from "react";

class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render(): JSX.Element {
    return (
      <Html>
        <Head></Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
