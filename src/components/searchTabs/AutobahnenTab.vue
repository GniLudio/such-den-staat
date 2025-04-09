<template>
    <v-form v-model="notValid" @submit.prevent="" @submit="onSubmit">
        <v-row>
            <v-col>
                <MultiSelect
                    label="Autobahnen"
                    :items="roads"
                    v-model="selectedRoads"
                    :loading="loadingRoads"
                    :rules="roadsRules"></MultiSelect>
            </v-col>
            <v-col>
                <MultiSelect
                    label="Informationen"
                    :items="services"
                    v-model="selectedServices"
                    item-title="label"
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
    import { onMounted, onUnmounted, ref, toRaw } from "vue";
    import MultiSelect from "../MultiSelect.vue";
    import type { components } from "@/types/autobahn-api";
    import { useLeafletStore } from "@/stores/leafletStore";
    import * as L from "leaflet";

    type Roadwork = components["schemas"]["Roadwork"];

    const baseUrl = "https://verkehr.autobahn.de/o/autobahn";
    const listUrl = `${baseUrl}/`;
    const serviceUrl = `${baseUrl}/{roadId}/services/{service}`;
    const detailsUrl = `${baseUrl}/details/{service}/{elementId}`;

    const services: {
        url: string;
        label: string;
        listField: string;
        createMarker: (data: any) => L.Marker | undefined;
    }[] = [
        { url: "roadworks", label: "Baustellen", listField: "roadworks", createMarker: createRoadworkMarker },
        //{ url: "webcam", label: "Webcams", listField: "", createMarker: (_) => undefined },
        //{ url: "parking_lorry", label: "Parkplätze", listField: "", createMarker: (_) => undefined },
        //{ url: "warning", label: "Verkehrsmeldungen", listField: "", createMarker: (_) => undefined },
        //{ url: "closure", label: "Sperrungen", listField: "", createMarker: (_) => undefined },
        //{ url: "electric_charging_station", label: "E-Ladestationen", listField: "", createMarker: (_) => undefined },
    ];
    const roads = ref([]);

    const selectedServices = ref(services.slice(0, 1));
    const selectedRoads = ref([] as string[]);

    const loadingRoads = ref(false);

    const rules = {
        notEmpty: (value: unknown[]) => value.length > 0,
    };
    const roadsRules = [rules.notEmpty];
    const serviceRules = [rules.notEmpty];

    const notValid = ref(true);

    const loading = ref(false);
    const loadingProgress = ref(50);

    let markerLayer: L.LayerGroup = L.layerGroup().addTo(toRaw(useLeafletStore().mapRef) as L.Map);

    onMounted(() => {
        fetchRoadworks();
    });
    onUnmounted(() => {
        markerLayer.remove();
    });

    async function fetchRoadworks(): Promise<void> {
        loadingRoads.value = true;
        const response = await fetch(listUrl);
        const data = await response.json();
        roads.value = data.roads;
        selectedRoads.value = roads.value.slice(0, 3);
        loadingRoads.value = false;
    }

    async function onSubmit(): Promise<void> {
        loading.value = true;

        const requests: Promise<any>[] = [];

        markerLayer.clearLayers();

        for (const roadwork of selectedRoads.value) {
            for (const service of selectedServices.value) {
                const url = serviceUrl.replace("{roadId}", roadwork).replace("{service}", service.url);
                requests.push(
                    new Promise<void>(async (resolve) => {
                        const data = await fetch(url);
                        const json = await data.json();
                        const elements: any[] | undefined = json[service.listField];
                        const markers = elements?.map(service.createMarker) ?? [];
                        for (const marker of markers) {
                            if (marker) {
                                marker.addTo(markerLayer);
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

    function createRoadworkMarker(roadwork: Roadwork): L.Marker | undefined {
        if (typeof roadwork.identifier != "string") {
            console.log("ERROR", "identifier", roadwork.identifier);
        }
        if (!roadwork.coordinate?.lat) return;
        if (!roadwork.coordinate?.long) return;
        const lat = roadwork.coordinate?.lat as unknown as number;
        const long = roadwork.coordinate?.long as unknown as number;

        const marker = L.marker([lat, long]);

        marker.bindPopup(roadwork.title ?? "Baustelle");
        return marker;
    }
</script>
