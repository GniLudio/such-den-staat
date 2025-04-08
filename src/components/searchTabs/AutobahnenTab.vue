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
    import { onMounted, ref } from "vue";
    import MultiSelect from "../MultiSelect.vue";
    import type { components } from "@/types/autobahn-api";

    type Roadwork = components["schemas"]["Roadwork"];

    const baseUrl = "https://verkehr.autobahn.de/o/autobahn";
    const listUrl = `${baseUrl}/`;
    const serviceUrl = `${baseUrl}/{roadId}/services/{service}`;
    const detailsUrl = `${baseUrl}/details/{service}/{elementId}`;

    const services: { url: string; label: string; listField: string; createMarkers: (data: any[]) => void }[] = [
        { url: "roadworks", label: "Baustellen", listField: "roadworks", createMarkers: createRoadworkMarkers },
        { url: "webcam", label: "Webcams", listField: "", createMarkers: (_) => {} },
        { url: "parking_lorry", label: "Parkplätze", listField: "", createMarkers: (_) => {} },
        { url: "warning", label: "Verkehrsmeldungen", listField: "", createMarkers: (_) => {} },
        { url: "closure", label: "Sperrungen", listField: "", createMarkers: (_) => {} },
        { url: "electric_charging_station", label: "E-Ladestationen", listField: "", createMarkers: (_) => {} },
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

    onMounted(() => {
        fetchRoadworks();
    });

    async function fetchRoadworks(): Promise<void> {
        loadingRoads.value = true;
        const response = await fetch(listUrl);
        const data = await response.json();
        roads.value = data.roads;
        selectedRoads.value = roads.value.slice();
        loadingRoads.value = false;
    }

    async function onSubmit(): Promise<void> {
        loading.value = true;

        const requests: Promise<any>[] = [];
        let i = 0;
        for (const roadwork of selectedRoads.value) {
            for (const service of selectedServices.value) {
                const url = serviceUrl.replace("{roadId}", roadwork).replace("{service}", service.url);
                requests.push(
                    new Promise<void>(async (resolve) => {
                        const data = await fetch(url);
                        const json = await data.json();
                        const elements = json[service.listField];
                        if (elements.length > 0) {
                            service.createMarkers(elements);
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

    let first = true;

    function createRoadworkMarkers(roadworks: Roadwork[]): void {
        if (first) {
            first = false;
            console.log(roadworks[0]);
        }
    }
</script>
