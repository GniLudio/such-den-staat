<template>
    <v-form v-model="notValid" @submit.prevent="" @submit="onSubmit">
        <v-row justify="center">
            <v-col :xxl="5" :xl="5" :lg="5" :md="5" :sm="5" :xs="5">
                <MultiSelect
                    label="Autobahnen"
                    :items="store.roads"
                    v-model="store.selectedRoads"
                    :loading="store.loading"
                    :max-displayed="5"
                    :rules="roadsRules"></MultiSelect>
            </v-col>
            <v-col :xxl="5" :xl="5" :lg="5" :md="5" :sm="5" :xs="5">
                <MultiSelect
                    label="Informationen"
                    :items="store.services"
                    v-model="store.selectedServices"
                    hide-toggle-all
                    :rules="serviceRules"></MultiSelect>
            </v-col>
            <v-col cols="auto" class="d-flex">
                <v-btn
                    color="primary"
                    class="align-self-center"
                    type="submit"
                    :disabled="!notValid"
                    :loading="loading"
                    block>
                    <v-icon icon="mdi-magnify"></v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-progress-linear
            v-model="loadingProgress"
            class="mx-1"
            :style="{ opacity: loading ? 1 : 0 }"></v-progress-linear>
    </v-form>
</template>
<script setup lang="ts">
    import { ref } from "vue";
    import MultiSelect from "../MultiSelect.vue";
    import type { components } from "@/types/autobahn-api";
    import { useLeafletStore } from "@/stores/leafletStore";
    import * as L from "leaflet";
    import { useAutobahnStore } from "@/stores/autobahnStore";

    type RoadItem = components["schemas"]["RoadItem"];

    const store = useAutobahnStore();

    const rules = {
        notEmpty: (value: unknown[]) => value.length > 0,
    };
    const roadsRules = [rules.notEmpty];
    const serviceRules = [rules.notEmpty];

    const notValid = ref(true);

    const loading = ref(false);
    const loadingProgress = ref(50);

    async function onSubmit(): Promise<void> {
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

    function createMarker(roadItem: RoadItem): L.Marker | undefined {
        if (!roadItem.coordinate?.lat || !roadItem.coordinate.long) return undefined;
        const lat = roadItem.coordinate.lat as unknown as number;
        const long = roadItem.coordinate.long as unknown as number;
        const marker = L.marker([lat, long]);
        marker.bindPopup(`$${roadItem.title ?? "Fehlender Titel"}`);
        return marker;
    }
</script>
