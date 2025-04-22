import { defineStore } from "pinia";
import * as L from "leaflet";
import { useFetch } from "@vueuse/core";

export const useLeafletStore = defineStore("leaflet", () => {
    const boundary = useFetch(new URL("/bundeslaender_simplify0.geojson", import.meta.url).href)
        .get()
        .json();

    let _map: L.Map = undefined!;
    let _markerGroup: L.LayerGroup = undefined!;

    const state = {
        boundary,
    };
    const getters = {
        getMap: () => _map as L.Map,
        getMarkerGroup: () => _markerGroup as L.LayerGroup,
    };
    const actions = {
        setMap,
        clearMarkers,
    };

    function setMap(map: L.Map): void {
        _map = map;
        _markerGroup = L.layerGroup().addTo(map);
    }
    function clearMarkers(): void {
        _markerGroup.remove();
        _markerGroup = L.layerGroup().addTo(_map);
    }

    return { ...state, ...getters, ...actions };
});
