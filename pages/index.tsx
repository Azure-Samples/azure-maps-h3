import * as fs from "fs/promises";
import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import React from "react";
import { NextMap } from "../components/Map";
import { geoToH3, compact } from "h3-js";
import { HexagonData } from "../lib/types";

interface HomeProps {
  h3: HexagonData[];
}

const Home: NextPage<HomeProps> = (props) => {
  return (
    <>
      <Head>
        <title>Map</title>
      </Head>

      <NextMap
        azureMapsSubscriptionKey={
          process.env.NEXT_PUBLIC_AZURE_MAP_SUBSCRIPTION_KEY ?? ""
        }
        h3={props.h3}
      />
    </>
  );
};

/**
 * Gets H3 JSON data from the public folder after compacting it
 */
const getH3Data = async (): Promise<HexagonData[]> => {
  // First, we need to convert our lat long json file to H3!
  const jsonLatLongFile = await fs
    .readFile(
      `${process.cwd()}/public/geojson/us-zip-code-latitude-and-longitude.json`,
      "utf-8"
    )
    .then(JSON.parse);

  const h3: HexagonData[] = [];
  for (const hex of jsonLatLongFile) {
    const h3Index = geoToH3(hex.fields.latitude, hex.fields.longitude, 5);
    h3.push({
      // Generate a random number between 1 and 10, for our purposes
      // Round to two decimal place
      mean: Math.round((Math.random() * (10 - 1) + 1) * 100) / 100,
      hexIds: [h3Index],
    });
  }

  // We can compact the data to make it more efficient
  const meanToH3Ids: { [id: number]: HexagonData[] } = {};
  for (const hex of h3) {
    if (!(hex.mean in meanToH3Ids)) {
      meanToH3Ids[hex.mean] = [];
    }
    meanToH3Ids[hex.mean].push(hex);
  }
  const compactedData: HexagonData[] = [];

  // Now, we loop over the array for each mean value
  for (const mean in meanToH3Ids) {
    const uniqueArray = new Set(
      meanToH3Ids[mean].map((entry) => entry.hexIds?.[0])
    );
    const compacted = compact(Array.from(uniqueArray));
    compactedData.push({
      mean: Number(mean as string),
      hexIds: compacted,
    });
  }

  // Write the converted H3 data to public/ folder
  await fs.writeFile(
    `${process.cwd()}/public/geojson/us-zip-code.json`,
    JSON.stringify({ value: compactedData }, null, 4),
    "utf-8"
  );

  // Read from that file
  // You could skip the above steps and just read from this file in production, but the code is
  // included here as a sample
  const h3Data = await fs
    .readFile(`${process.cwd()}/public/geojson/us-zip-code.json`, "utf-8")
    .then((data) => {
      return JSON.parse(data).value;
    });

  return h3Data;
};

/**
 * Use this function to allow for generating of props to pass to the <Home>
 * component at build time -- you are able to use Node.js modules in this
 * function.
 *
 * @param context
 */
export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  return {
    props: {
      h3: await getH3Data(),
    },
  };
};

export default Home;
