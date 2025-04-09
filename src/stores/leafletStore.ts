import { defineStore } from "pinia";
import { ref, toRaw } from "vue";
import * as L from "leaflet";

export const useLeafletStore = defineStore("leaflet", () => {
    let _map: L.Map = undefined!;
    let _markerGroup: L.LayerGroup = undefined!;
    const state = {};
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
