<template>
    <v-row justify="center">
        <v-col :cols="12" :md="6" class="pb-md-3 pb-1">
            <MultiSelect label="Autobahnen" :items="store.roads.data?.roads" v-model="store.selectedRoads"
                :loading="store.roads.isFetching" :rules="[rules.notEmpty]" show-toggle-all></MultiSelect>
        </v-col>
        <v-col :cols="12" :md="6" class="pt-md-3 pt-1">
            <MultiSelect label="Informationen" :items="store.services.map((s) => s.title)"
                v-model="store.selectedServices" hide-toggle-all :rules="[rules.notEmpty]"></MultiSelect>
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

    const store = useAutobahnStore();
    const { appContext } = getCurrentInstance()!;

    const rules = {
        notEmpty: (value: unknown[]) => value.length > 0,
    };

    defineExpose({
        search,
    });

    function search(signal: AbortSignal): Promise<void>[] {
        const promises: Promise<void>[] = [];
        const markerGroup = useLeafletStore().getMarkerGroup();

        for (const roadwork of store.selectedRoads) {
            for (const serviceTitle of store.selectedServices) {
                const service = store.getService(serviceTitle);
                if (!service) {
                    console.warn("Service not found", roadwork, serviceTitle);
                    continue;
                }

                const url = store.getServiceUrl(roadwork, service.path);
                promises.push(
                    fetch(url, { signal }).then((data) => data.json()).then((json) => {
                        const elements: any[] | undefined = json[service.listField];
                        if (!elements) {
                            console.warn("Wrong listfield", service, json);
                            return;
                        } else {
                            const markers = elements?.map((e) => createMarker(e)) ?? [];
                            markers.forEach((m) => m?.addTo(markerGroup));
                        }
                    })
                );
            }
        }
        return promises;
    }

    function createMarker(roadItem: RoadItem): L.Marker | undefined {
        if (!roadItem.coordinate?.lat || !roadItem.coordinate.long) return undefined;
        const lat = roadItem.coordinate.lat as unknown as number;
        const long = roadItem.coordinate.long as unknown as number;
        const marker = L.marker([lat, long]);

        const tooltip = document.createElement("div");

        const content = createApp(RoadItemTooltip, { roadItem });
        Object.assign(content._context, appContext);
        content.mount(tooltip);

        marker.bindPopup(tooltip);
        return marker;
    }
</script>
<style lang="css">
    .leaflet-popup-content {
        width: fit-content !important;
    }
</style>
