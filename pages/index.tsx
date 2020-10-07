import Head from "next/head";
import { NextMap } from "../components/Map";
import React, { FunctionComponent } from "react";
import type GeoJSON from "geojson";
import { GetStaticProps } from "next";
import * as fs from "fs/promises";

interface HomeProps {
  geoJSON: GeoJSON.GeoJSON[];
}

const Home: FunctionComponent<HomeProps> = (props) => {
  return (
    <>
      <Head>
        <title>Map</title>
      </Head>

      <NextMap
        azureMapsSubscriptionKey={
          process.env.NEXT_PUBLIC_AZURE_MAP_SUBSCRIPTION_KEY ?? ""
        }
        geoJSON={props.geoJSON}
      />
    </>
  );
};

/**
 * Use this function to allow for generating of props to pass to the <Home>
 * component at build time -- you are able to use Node.js modules in this
 * function.
 *
 * @param context
 */
export const getStaticProps: GetStaticProps<HomeProps> = async (context) => {
  const readJSONFileFromDisk = async (filepath: string): Promise<any> => {
    return await fs.readFile(filepath, "utf-8").then(JSON.parse);
  };

  const geoJSONFilenames = ["california.json"];
  const geoJSONFilePromises = geoJSONFilenames
    .map((filename) => `${process.cwd()}/public/geojson/${filename}`)
    .map(readJSONFileFromDisk);
  const geoJSONFiles: GeoJSON.GeoJSON[] = await Promise.all(
    geoJSONFilePromises
  );

  return {
    props: {
      geoJSON: geoJSONFiles,
    },
  };
};

export default Home;
