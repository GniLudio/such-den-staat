import { defineStore } from "pinia";
import { ref } from "vue";

export const useLeafletStore = defineStore("leaflet", () => {
    const state = {
        map: ref<L.Map>(undefined!),
    };
    const getters = {};
    const actions = {
        setMap,
    };

    function setMap(map: L.Map): void {
        state.map.value = map;
    }

    return { ...state, ...getters, ...actions };
});
