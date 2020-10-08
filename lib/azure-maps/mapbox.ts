import type * as Atlas from "azure-maps-control";
import type * as Mapbox from "mapbox-gl";

/**
 * Type forcibly removing the hidden private `.map` property from an `Atlas.Map`
 * and intersects with a public `.map` property of type `Mapbox.Map`.
 */
export type MapWithMapbox = Omit<InstanceType<typeof Atlas.Map>, "map"> & {
  map: InstanceType<typeof Mapbox.Map>;
};

/**
 * Exposes the private `.map` `{Mapbox.Map}` instance in the passed in `map` with
 * proper TypeScript typings.
 *
 * Does not modify the passed in map.
 *
 * @param {Atlas.Map} map the map instance to expose the mapbox instance of.
 * @return {Promise<MapWithMapbox>} the passed in `map` instance with an exposed `.map` instance.
 */
export async function exposeMapbox(map: Atlas.Map): Promise<MapWithMapbox> {
  // dynamically check for the map.map exists
  if (typeof (map as any).map === "object" && (map as any).map) {
    return (map as unknown) as MapWithMapbox;
  }

  throw Error(`unable to find .map mapbox instance in azure maps instance`);
}
