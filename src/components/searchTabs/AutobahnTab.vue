<template>
    <v-form v-model="valid" @submit.prevent="" @submit="search">
        <v-row justify="center">
            <v-col :cols="12" :md="6" class="pb-md-3 pb-1">
                <MultiSelect label="Autobahnen" :items="store.roads" v-model="store.selectedRoads"
                    :loading="store.roadsLoading" :rules="roadRules" show-toggle-all></MultiSelect>
            </v-col>
            <v-col :cols="12" :md="6" class="pt-md-3 pt-1">
                <MultiSelect label="Informationen" :items="store.services.map((s) => s.title)"
                    v-model="store.selectedServices" hide-toggle-all :rules="serviceRules"></MultiSelect>
            </v-col>
        </v-row>

    </v-form>
</template>
<script setup lang="ts">
    import { createApp, getCurrentInstance, ref, type Ref } from "vue";
    import MultiSelect from "../MultiSelect.vue";
    import type { components } from "@/types/autobahn-api";
    import { useLeafletStore } from "@/stores/leafletStore";
    import * as L from "leaflet";
    import { useAutobahnStore } from "@/stores/autobahnStore";
    import RoadItemTooltip from "../tooltips/RoadItemTooltip.vue";

    type RoadItem = components["schemas"]["RoadItem"];

    const store = useAutobahnStore();
    const { appContext } = getCurrentInstance()!;

    const rules = {
        notEmpty: (value: unknown[]) => value.length > 0,
    };
    const roadRules = [rules.notEmpty];
    const serviceRules = [rules.notEmpty];

    const valid: Ref<boolean> = ref(true);
    const loading: Ref<boolean> = ref(false);
    const loadingProgress: Ref<number> = ref(50);

    defineExpose({
        search,
        loading,
        loadingProgress
    });

    async function search(): Promise<void> {
        loading.value = true;

        const requests: Promise<any>[] = [];

        useLeafletStore().clearMarkers();
        const markerGroup = useLeafletStore().getMarkerGroup();

        for (const roadwork of store.selectedRoads) {
            for (const serviceTitle of store.selectedServices) {
                const service = store.getService(serviceTitle);
                if (!service) {
                    console.warn("Service not found", roadwork, serviceTitle);
                    continue;
                }

                const url = store.getServiceUrl(roadwork, service.path);
                requests.push(
                    new Promise<void>(async (resolve) => {
                        const data = await fetch(url);
                        const json = await data.json();
                        const elements: any[] | undefined = json[service.listField];
                        if (!elements) {
                            console.warn("Wrong listfield", service, json);
                            resolve();
                            return;
                        }
                        const markers = elements?.map((e) => createMarker(e)) ?? [];
                        for (const marker of markers) {
                            if (marker) {
                                marker.addTo(markerGroup);
                            }
                        }
                        loadingProgress.value += 100 / requests.length;
                        resolve();
                    }),
                );
            }
        }

        await Promise.all(requests);
        loading.value = false;
        loadingProgress.value = 0;
    }

    // TODO: Create box for extend
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
