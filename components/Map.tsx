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
import type * as GeoJSON from "geojson";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { exposeMapbox, MapWithMapbox } from "../lib/azure-maps/mapbox";
import styles from "./Map.module.scss";

export interface MapProps {
  atlas: typeof atlasTypes;
  azureMapsSubscriptionKey: string;
  geoJSON?: GeoJSON.GeoJSON[];
}

//------------------------------------------------------------------------------
// Helpers

/**
 * Renders the given data source onto the map.
 * Adds the layers:
 * - [Line](https://docs.microsoft.com/en-us/azure/azure-maps/map-add-line-layer)
 * - [Polygon](https://docs.microsoft.com/en-us/azure/azure-maps/map-add-shape)
 * - [Symbol](https://docs.microsoft.com/en-us/azure/azure-maps/map-add-pin)
 *
 * @param atlas used to generate the needed layers
 * @param map to render the layers onto
 * @param dataSource containing the data to render
 */
function renderDataSource(
  atlas: typeof atlasTypes,
  map: atlasTypes.Map | MapWithMapbox,
  dataSource: atlasTypes.source.DataSource
): void {
  //Add a layer for rendering the polygons.
  const polygonLayer = new atlas.layer.PolygonLayer(dataSource, undefined, {
    fillColor: "#1e90ff",
    filter: [
      "any",
      ["==", ["geometry-type"], "Polygon"],
      ["==", ["geometry-type"], "MultiPolygon"],
    ], //Only render Polygon or MultiPolygon in this layer.
  });

  //Add a layer for rendering line data.
  const lineLayer = new atlas.layer.LineLayer(dataSource, undefined, {
    strokeColor: "#1e90ff",
    strokeWidth: 4,
    filter: [
      "any",
      ["==", ["geometry-type"], "LineString"],
      ["==", ["geometry-type"], "MultiLineString"],
    ], //Only render LineString or MultiLineString in this layer.
  });

  //Add a layer for rendering point data.
  const pointLayer = new atlas.layer.SymbolLayer(dataSource, undefined, {
    iconOptions: {
      allowOverlap: true,
      ignorePlacement: true,
    },
    filter: [
      "any",
      ["==", ["geometry-type"], "Point"],
      ["==", ["geometry-type"], "MultiPoint"],
    ], //Only render Point or MultiPoints in this layer.
  });

  map.layers.add(
    [
      polygonLayer,

      //Add a layer for rendering the outline of polygons.
      new atlas.layer.LineLayer(dataSource, undefined, {
        strokeColor: "black",
        filter: [
          "any",
          ["==", ["geometry-type"], "Polygon"],
          ["==", ["geometry-type"], "MultiPolygon"],
        ], //Only render Polygon or MultiPolygon in this layer.
      }),

      lineLayer,
      pointLayer,
    ],
    "labels"
  );

  map.layers.add(pointLayer);
}

//------------------------------------------------------------------------------
// Components

const Map: FunctionComponent<MapProps> = ({
  atlas,
  azureMapsSubscriptionKey,
  geoJSON,
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
        style: "grayscale_dark",
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
        zoom: 12,
      });
      const marker = new atlas.HtmlMarker({ position: longLat });
      map?.markers.add(marker);
    }
  });

  const [dataSource, setDataSource] = useState<atlasTypes.source.DataSource>();
  useEffect(() => {
    const loadData = () => {
      const ds = new atlas.source.DataSource();
      map?.sources.add(ds);
      if (geoJSON) {
        for (const file of geoJSON) {
          // Dangerous! Azure Maps built in geojson types conflict with @types/geojson
          ds.add(file as any);
        }
        if (map) {
          renderDataSource(atlas, map, ds);
        }
      }
    };

    // reset the datasource every time
    if (dataSource) {
      map?.sources.remove(dataSource);
      setDataSource(undefined);
    }
    map?.events.remove("ready", loadData);

    // Re-add the ready event
    map?.events.add("ready", loadData);
  }, [dataSource, map, atlas, geoJSON]);
  // map?.layers.add(new atlas.layer.)

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
