<template>
    <v-form v-model="notValid" @submit.prevent="" @submit="onSubmit">
        <v-row justify="center" class="mx-2 mx-md-0">
            <v-spacer></v-spacer>
            <v-col :cols="12" :md="5">
                <MultiSelect
                    label="Autobahnen"
                    :items="store.roads"
                    v-model="store.selectedRoads"
                    :loading="store.loading"
                    :max-displayed="maxDisplayedRoads"
                    :rules="roadsRules"></MultiSelect>
            </v-col>
            <v-spacer></v-spacer>
            <v-col :cols="9" :sm="10" :md="5">
                <MultiSelect
                    label="Informationen"
                    :items="store.services"
                    v-model="store.selectedServices"
                    hide-toggle-all
                    :max-displayed="maxDisplayedServices"
                    :rules="serviceRules"></MultiSelect>
            </v-col>
            <v-spacer></v-spacer>
            <v-col :cols="3" :sm="2" md="auto">
                <v-btn color="primary" class="align-self-center" type="submit" :disabled="!notValid" :loading="loading">
                    <v-icon icon="mdi-magnify"></v-icon>
                </v-btn>
            </v-col>
            <v-spacer></v-spacer>
        </v-row>
        <v-progress-linear
            v-model="loadingProgress"
            class="mx-1"
            :style="{ opacity: loading ? 1 : 0 }"></v-progress-linear>
    </v-form>
</template>
<script setup lang="ts">
    import { computed, createApp, getCurrentInstance, ref } from "vue";
    import MultiSelect from "../MultiSelect.vue";
    import type { components } from "@/types/autobahn-api";
    import { useLeafletStore } from "@/stores/leafletStore";
    import * as L from "leaflet";
    import { useAutobahnStore } from "@/stores/autobahnStore";
    import RoadItemTooltip from "../tooltips/RoadItemTooltip.vue";
    import { useDisplay } from "vuetify";

    type RoadItem = components["schemas"]["RoadItem"];

    const store = useAutobahnStore();
    const { appContext } = getCurrentInstance()!;
    const display = useDisplay();

    const rules = {
        notEmpty: (value: unknown[]) => value.length > 0,
    };
    const roadsRules = [rules.notEmpty];
    const serviceRules = [rules.notEmpty];

    const notValid = ref(true);
    const loading = ref(false);
    const loadingProgress = ref(50);
    const maxDisplayedRoads = computed(() => {
        switch (display.name.value) {
            case "xs":
                return 4;
            case "sm":
                return 7;
            case "md":
                return 4;
            case "lg":
                return 6;
            case "xl":
                return 11;
            case "xxl":
                return 15;
        }
    });
    const maxDisplayedServices = computed(() => {
        switch (display.name.value) {
            case "xs":
                return 1;
            case "sm":
                return 2;
            case "md":
                return 2;
            case "lg":
                return 3;
            case "xl":
                return 5;
            case "xxl":
                return 5;
        }
    });

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
