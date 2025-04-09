import { defineStore } from "pinia";
import { ref, toRaw } from "vue";

export const useLeafletStore = defineStore("leaflet", () => {
    const state = {
        mapRef: ref<L.Map>(null!),
    };
    const getters = {};
    const actions = {
        setMap,
    };

    function setMap(map: L.Map): void {
        state.mapRef.value = map;
    }

    return { ...state, ...getters, ...actions };
});
