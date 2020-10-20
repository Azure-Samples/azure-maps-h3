/**
 * Map
 *
 * This is a React wrapper to instantiate and atlas.Map instance.
 * It expects the Azure Maps`atlas` object to have already been loaded into
 * window.atlas via a <script> tag.
 *
 * @see https://docs.microsoft.com/en-us/azure/azure-maps/how-to-use-map-control
 */
////////////////////////////////////////////////////////////////////////////////
import type * as atlasTypes from "azure-maps-control";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { exposeMapbox, MapWithMapbox } from "../lib/azure-maps/mapbox";
import styles from "./Map.module.scss";
import type * as Mapbox from "mapbox-gl";
import { HexagonData } from "../lib/types";
import { MapboxLayer } from "@deck.gl/mapbox";
import { H3ClusterLayer } from "deck.gl";

export interface MapProps {
  atlas: typeof atlasTypes;
  azureMapsSubscriptionKey: string;
  h3: HexagonData[];
}

//------------------------------------------------------------------------------
// Helpers

/**
 * Applies custom styling to default fonts on Azure Map
 * @param map Mapbox.map instance
 */
const customMapStyles = (map?: InstanceType<typeof Mapbox.Map>) => {
  const layers = map?.getStyle()?.layers;
  if (!layers) {
    return;
  }
  for (let i = 0; i < layers?.length; i++) {
    //Don't modify text color with any layer that has "icon" in the ID.
    if (
      layers[i].type === "symbol" &&
      layers[i].id.indexOf("icon") === -1 &&
      layers[i].source === "vectorTiles"
    ) {
      // Customize default Azure Maps font style
      // Make the text color dark grey and remove white outline (set it to transparent).
      map?.setPaintProperty(layers[i].id, "text-color", "#444444");
      map?.setPaintProperty(layers[i].id, "text-halo-color", "transparent");
    }
  }
};

/**
 * Generate a heatmap color based on the provided `value`.
 *
 * Based on the value corresponding to the `min` and `max`, the function will
 * generate a color ranging from light teal [214,227,230] to dark teal [50,120,133].
 *
 * @throws {Error} when the value is smaller than `min` or larger than `max`
 *
 * @param value to generate the RGBA from
 */
export const generateColors = (
  value: number
): [number, number, number, number] => {
  // Datasets are fixed to be in range [1, 10], throw error if not.
  const min = 1;
  const max = 10;
  if (value < min || value > max) {
    throw Error(
      `provided value is not within provided min/max range; value of ${value} is either smaller than min ${min} or larger than max ${max}`
    );
  }
  const denominator = max - min;
  const quotient = (value - min) / denominator;
  const alpha = 150;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (quotient >= 0 && quotient <= 1) {
    const darkColor = { red: 50, green: 120, blue: 133 };
    const lightColor = { red: 214, green: 227, blue: 230 };

    red = (darkColor.red - lightColor.red) * quotient + lightColor.red;
    green = (darkColor.green - lightColor.green) * quotient + lightColor.green;
    blue = (darkColor.blue - lightColor.blue) * quotient + lightColor.blue;
  } else {
    throw Error(
      `unexpected error ocurred calculated color value for values ${JSON.stringify(
        { value, min, max }
      )}`
    );
  }
  return [red, green, blue, alpha];
};

//------------------------------------------------------------------------------
// Components

const Map: FunctionComponent<MapProps> = ({
  atlas,
  azureMapsSubscriptionKey,
  h3,
}) => {
  // Azure maps must be initialized imperatively after didMount, so you must
  // store the instance in state.
  const [map, setMap] = useState<MapWithMapbox>();
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Initialize the map
    if (!map) {
      const newMap = new atlas.Map(mapRef.current as HTMLElement, {
        view: "Auto",
        style: "grayscale_light",
        minZoom: 4,
        // Add your Azure Maps key to the map SDK. Get an Azure Maps key at
        // https://azure.com/maps. NOTE: The primary key should be used as the
        // key.
        authOptions: {
          authType: "subscriptionKey",
          subscriptionKey: azureMapsSubscriptionKey,
        } as atlasTypes.AuthenticationOptions,
      });
      // Raise the type of the azure maps instance to include the hidden mapbox
      // instance with the `exposeMapbox` helper.
      exposeMapbox(newMap).then((mapWithMapbox) => {
        setMap(mapWithMapbox);
      });
    }
  }, [map, azureMapsSubscriptionKey, atlas.Map]);

  // Track the users geolocation
  const [userPosition, setUserLocation] = useState<Position>();
  useEffect(() => {
    // Load the user position
    if (!userPosition) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(position);
        },
        (err) => {
          console.error(err);
        }
      );
    }
    // create a marker and set the position of the camera to the location of the
    // user
    else if (userPosition) {
      const { latitude, longitude } = userPosition.coords;
      const longLat = [longitude, latitude];
      map?.setCamera({
        center: longLat,
        zoom: 8,
      });
      const marker = new atlas.HtmlMarker({ position: longLat });
      map?.markers.add(marker);
    }
  });

  const [dataSource, setDataSource] = useState<atlasTypes.source.DataSource>();
  useEffect(() => {
    const applyStyles = () => {
      customMapStyles(map?.map);
    };

    const loadData = () => {
      if (h3) {
        const h3Layer = new MapboxLayer({
          id: "h3-cluster-layer",
          type: H3ClusterLayer,
          data: h3,
          pickable: true,
          stroked: false,
          filled: true,
          extruded: false,
          getHexagons: (d: HexagonData) => {
            return d.hexIds;
          },
          getFillColor: (d: HexagonData) => {
            return generateColors(d.mean);
          },
          getLineColor: [255, 255, 255, 100],
          lineWidthMinPixels: 2,
        });

        const mapLayer = map?.map?.getLayer("h3-cluster-layer");
        if (typeof mapLayer !== "undefined") {
          // Remove map layer
          map?.map?.removeLayer("h3-cluster-layer");
        }

        map?.map?.addLayer(h3Layer, "Town water body");
      }
    };

    // reset the datasource every time
    if (dataSource) {
      map?.sources.remove(dataSource);
      setDataSource(undefined);
    }
    // Apply the style when the map is ready.
    applyStyles();

    // When the map style changes, apply the customized style.
    map?.events.add("styledata", applyStyles);

    map?.events.remove("ready", loadData);

    // Re-add the ready event
    map?.events.add("ready", loadData);
  }, [dataSource, map, atlas, h3]);

  return <div ref={mapRef} className={styles.map} />;
};

/**
 * A Next.js wrapper Map that automatically injects the Azure Maps
 * `atlas` JS into the <head> of the page.
 *
 * atlas CSS is loaded in the _App.tsx file as it is a global style
 *
 * @param props
 */
export const NextMap: FunctionComponent<Omit<MapProps, "atlas">> = (props) => {
  const [atlas, setAtlas] = useState<typeof atlasTypes>();
  // only attempt to load atlas in the browser -- it references `self`
  if (typeof window !== "undefined") {
    import("azure-maps-control").then((a) => {
      setAtlas(a);
    });
  }

  return (
    <>
      {atlas ? (
        <Map {...props} atlas={atlas} />
      ) : (
        <pre>Fetching Azure Maps atlas library...</pre>
      )}
    </>
  );
};

export default NextMap;
