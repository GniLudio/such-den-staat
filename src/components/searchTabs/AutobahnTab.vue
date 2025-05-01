<template>
    <v-row dense>
        <v-col :cols="12" :md="6">
            <MultiSelect label=" Autobahnen" :items="store.roads.data?.roads" v-model="store.selectedRoads"
                :loading="store.roads.isFetching" :rules="[rules.notEmpty]" show-toggle-all></MultiSelect>
        </v-col>
        <v-col :cols="12" :md="6">
            <MultiSelect label="Informationen" :items="store.services" v-model="store.selectedServices" hide-toggle-all
                :rules="[rules.notEmpty]" item-title="title" item-value="id"></MultiSelect>
        </v-col>
    </v-row>
</template>
<script setup lang="ts">
    import { useAutobahnStore } from '@/stores/autobahnStore';
    import { useLeafletStore } from '@/stores/leafletStore';
    import type { components } from '@/types/autobahn-api';
    import L from 'leaflet';
    import { createApp, getCurrentInstance } from 'vue';
    import RoadItemTooltip from '../tooltips/RoadItemTooltip.vue';


    type RoadItem = components["schemas"]["RoadItem"];
    type LineString = components["schemas"]["GeoJSONLineString"];

    const store = useAutobahnStore();
    const { appContext } = getCurrentInstance()!;

    const rules = {
        notEmpty: (value: any[]) => value.length > 0,
    };

    defineExpose({
        search,
    });

    function search(signal: AbortSignal): Promise<void>[] {
        const promises: Promise<void>[] = [];
        const markerGroup = useLeafletStore().getMarkerGroup();

        for (const roadwork of store.selectedRoads) {
            for (const serviceID of store.selectedServices) {
                const service = store.getService(serviceID);
                if (!service) {
                    console.warn("Service not found", roadwork, serviceID);
                    continue;
                }

                const url = store.getServiceUrl(roadwork, service.id);
                promises.push(
                    fetch(url, { signal }).then((data) => data.json()).then((json) => {
                        const roadItems: RoadItem[] | undefined = json[service.listField];
                        if (!roadItems) {
                            console.warn("Wrong listfield", service, json);
                            return;
                        } else {
                            const markers = roadItems.map((e) => createMarker(e)) ?? [];
                            markers.forEach((m) => m?.addTo(markerGroup));
                        }
                    })
                );
            }
        }
        return promises;
    }

    function createMarker(roadItem: RoadItem & { geometry?: LineString }): L.Marker | undefined {
        const lat = roadItem.coordinate.lat;
        const long = roadItem.coordinate.long;
        const marker = L.marker([lat, long]);

        const div = document.createElement("div");
        const content = createApp(RoadItemTooltip, { roadItem });
        Object.assign(content._context, appContext);
        content.mount(div);

        const popup = marker.bindPopup(div);

        const visual = createVisual(roadItem);
        let isPopupOpen: boolean = false;
        let isHovering: boolean = false;
        popup.on("mouseover", () => {
            isHovering = true;
            updateVisualVisibility(visual, isPopupOpen || isHovering)
        });
        popup.on("popupopen", () => {
            isPopupOpen = true;
            updateVisualVisibility(visual, isPopupOpen || isHovering)
        })
        popup.on("mouseout", () => {
            isHovering = false;
            updateVisualVisibility(visual, isPopupOpen || isHovering)
        });
        popup.on("popupclose", () => {
            isPopupOpen = false;
            updateVisualVisibility(visual, isPopupOpen || isHovering)
        });

        return marker;
    }

    function updateVisualVisibility(visual: L.Layer, visible: boolean): void {
        if (visible) {
            visual.addTo(useLeafletStore().getMap());
        } else {
            visual.remove();
        }
    }

    function createVisual(roadItem: RoadItem & { geometry?: LineString }): L.Layer {
        let visual: L.Layer;

        const [lat1, long1, lat2, long2] = roadItem.extent.split(",").map(Number.parseFloat);
        const extent = L.polygon([
            [lat1, long1],
            [lat1, long2],
            [lat2, long2],
            [lat2, long1],
        ]);


        if (roadItem.geometry) {
            const geometry = L.geoJSON(roadItem.geometry);
            const bounds = geometry.getBounds();
            if (bounds.getNorth() != bounds.getSouth() || bounds.getWest() != bounds.getEast()) {
                visual = geometry;
            } else {
                visual = extent;
            }

        } else {
            visual = extent;
        }

        return visual;
    }
</script>
<style lang="css">
    .leaflet-popup-content {
        width: fit-content !important;
    }
</style>
