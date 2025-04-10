<template>
    <v-form v-model="notValid" @submit.prevent="" @submit="onSubmit">
        <v-row justify="center">
            <v-col :xxl="5" :xl="5" :lg="5" :md="5" :sm="5" :xs="5">
                <MultiSelect
                    label="Autobahnen"
                    :items="roads"
                    v-model="selectedRoads"
                    :loading="loadingRoads"
                    :max-displayed="5"
                    :rules="roadsRules"></MultiSelect>
            </v-col>
            <v-col :xxl="5" :xl="5" :lg="5" :md="5" :sm="5" :xs="5">
                <MultiSelect
                    label="Informationen"
                    :items="services"
                    v-model="selectedServices"
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
    import { onMounted, ref } from "vue";
    import MultiSelect from "../MultiSelect.vue";
    import type { components } from "@/types/autobahn-api";
    import { useLeafletStore } from "@/stores/leafletStore";
    import * as L from "leaflet";

    type RoadItem = components["schemas"]["RoadItem"];

    const baseUrl = "https://verkehr.autobahn.de/o/autobahn";
    const listUrl = `${baseUrl}/`;
    const serviceUrl = `${baseUrl}/{roadId}/services/{service}`;
    const detailsUrl = `${baseUrl}/details/{service}/{elementId}`;

    const services: Service[] = [
        { url: "roadworks", title: "Baustellen", listField: "roadworks", createMarker },
        //{ url: "webcam", title: "Webcams", listField: "webcam", createMarker },
        { url: "parking_lorry", title: "Parkplätze", listField: "parking_lorry", createMarker },
        { url: "warning", title: "Verkehrsmeldungen", listField: "warning", createMarker },
        { url: "closure", title: "Sperrungen", listField: "closure", createMarker },
        {
            url: "electric_charging_station",
            title: "E-Ladestationen",
            listField: "electric_charging_station",
            createMarker,
        },
    ];
    const roads = ref([]);

    const selectedServices = ref(services.slice(0, 1).map((s) => s.title));
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

    onMounted(() => {
        fetchRoadworks();
    });

    async function fetchRoadworks(): Promise<void> {
        loadingRoads.value = true;
        const response = await fetch(listUrl);
        const data = await response.json();
        roads.value = data.roads;
        selectedRoads.value = roads.value.slice(0, 1);
        loadingRoads.value = false;
    }

    async function onSubmit(): Promise<void> {
        loading.value = true;

        const requests: Promise<any>[] = [];

        useLeafletStore().clearMarkers();
        const markerGroup = useLeafletStore().getMarkerGroup();

        for (const roadwork of selectedRoads.value) {
            for (const serviceTitle of selectedServices.value) {
                const service = getService(serviceTitle);
                if (!service) {
                    console.warn("Service not found", roadwork, serviceTitle);
                    continue;
                }

                const url = serviceUrl.replace("{roadId}", roadwork).replace("{service}", service.url);
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
                        const markers = elements?.map((e) => service.createMarker(e, service)) ?? [];
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

    function createMarker(roadItem: RoadItem, service: Service): L.Marker | undefined {
        if (!roadItem.coordinate?.lat || !roadItem.coordinate.long) return undefined;
        const lat = roadItem.coordinate.lat as unknown as number;
        const long = roadItem.coordinate.long as unknown as number;
        const marker = L.marker([lat, long]);
        marker.bindPopup(`$${roadItem.title ?? "Fehlender Titel"} (${service.title})`);
        return marker;
    }

    function getService(title: string): Service | undefined {
        return services.find((s) => s.title == title);
    }

    interface Service {
        url: string;
        title: string;
        listField: string;
        createMarker: (data: any, service: Service) => L.Marker | undefined;
    }
</script>
