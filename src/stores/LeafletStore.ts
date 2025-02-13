import { computed, onMounted, reactive, ref, type Ref } from "vue";

import "leaflet/dist/leaflet.css";
import * as L from "leaflet";

let map: L.Map = undefined!;
let layerGroup: L.LayerGroup = undefined!;

export const leafletStore = reactive({
    setup(): void {
        this.dispose();
        map = L.map("map");
        layerGroup = L.layerGroup().addTo(map);

        // preloading marker image
        L.marker([50, 9], { opacity: 0 }).addTo(map);
    },
    getMap(): L.Map {
        return map;
    },
    getLayerGroup(): L.LayerGroup {
        return layerGroup;
    },
    dispose(): void {
        if (layerGroup) {
            layerGroup.clearLayers();
            layerGroup.off();
            layerGroup.remove();
            layerGroup = undefined!;
        }
        if (map) {
            map.off();
            map.remove();
            map = undefined!;
        }
    },
});
