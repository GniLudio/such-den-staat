<template>
    <v-form v-on:submit="search" v-on:submit.prevent>
        <v-row align="center">
            <v-col cols="6" md="5" class="pb-0">
                <MultiSelect
                    label="Autobahnen"
                    :items="motorways"
                    v-model="selectedMotorways"
                    :maxDisplayed="maxDisplayedMotorways"
                    :loading="motorwaysLoading"
                    :validate-on="motorwaysValidateOn"
                    :rules="motorwaysRules"></MultiSelect>
            </v-col>
            <v-col cols="6" md="5" class="pb-0">
                <MultiSelect
                    label="Informationen"
                    :items="services"
                    v-model="selectedServices"
                    :max-displayed="maxDisplayedServices"
                    :validate-on="servicesValidateOn"
                    hide-toggle-all
                    :rules="servicesRules"></MultiSelect>
            </v-col>
            <v-col cols="12" md="2" class="pt-md-1">
                <SearchButton
                    :loading="loading"
                    :disabled="selectedMotorways.length == 0 || selectedServices.length == 0"></SearchButton>
            </v-col>
        </v-row>
        <v-progress-linear v-if="loading" :model-value="loadingProgress" absolute></v-progress-linear>
    </v-form>
</template>
<script lang="ts" setup>
    import { computed, getCurrentInstance, onMounted, ref, type AppContext } from "vue";
    import { useDisplay } from "vuetify";
    import MultiSelect from "../MultiSelect.vue";
    import { leafletStore } from "@/stores/LeafletStore";
    import * as L from "leaflet";
    import type { components } from "./AutobahnSearch";

    const { appContext } = getCurrentInstance()!;

    type Roadwork = components["schemas"]["Roadwork"];

    leafletStore.getLayerGroup()?.clearLayers();

    // general
    const baseUrl = "https://verkehr.autobahn.de/o/autobahn";
    const listUrl = `${baseUrl}/`;
    const display = useDisplay();
    const loading = ref(false);
    const loadingProgress = ref(0);

    // motorways
    const motorways = ref<string[]>([]);
    const selectedMotorways = ref<string[]>([]);
    const maxDisplayedMotorways = computed(() => {
        switch (display.name.value) {
            case "xxl":
                return 13;
            case "xl":
                return 8;
            case "lg":
                return 4;
            case "md":
                return 5;
            case "sm":
                return 3;
            case "xs":
                return 2;
            default:
                return 1;
        }
    });
    const motorwaysLoading = ref(true);
    const motorwaysRules = [() => selectedMotorways.value.length > 0];
    const motorwaysValidateOn = computed(() => (selectedMotorways.value.length == 0 ? "submit" : "blur"));

    // services
    const services = ["Baustellen"]; // , "Webcams", "Parkplätze", "Verkehrsmeldungen", "Sperrungen", "E-Ladestationen"
    const serviceUrlPaths = ["roadworks"]; // , "webcam", "parking_lorry", "warning", "closure", "electric_charging_station"
    const serviceDataHandlers: (((data: any, app: AppContext) => void) | undefined)[] = [handleRoadworks];
    const selectedServices = ref(["Baustellen"]);
    const maxDisplayedServices = computed(() => {
        switch (display.name.value) {
            case "xxl":
                return 1;
            case "xl":
                return 1;
            case "lg":
                return 1;
            case "md":
                return 1;
            case "sm":
                return 1;
            case "xs":
                return 1;
            default:
                return 1;
        }
    });
    const servicesRules = [() => selectedServices.value.length > 0];
    const servicesValidateOn = computed(() => (selectedServices.value.length == 0 ? "submit" : "blur"));

    onMounted(async () => {
        motorways.value = (await (await fetch(listUrl)).json())["roads"];
        motorways.value.sort((a, b) => Number.parseInt(a.replace(/\D/, "")) - Number.parseInt(b.replace(/\D/, "")));
        selectedMotorways.value = motorways.value.slice();
        motorwaysLoading.value = false;
    });

    // Search
    async function search(): Promise<void> {
        loading.value = true;
        loadingProgress.value = 0;
        leafletStore.getLayerGroup()?.clearLayers();

        const promises: Promise<any>[] = [];
        for (const motorway of selectedMotorways.value) {
            for (const service of selectedServices.value) {
                const dataHandler = serviceDataHandlers[services.indexOf(service)];
                if (dataHandler == undefined) continue;
                const url = getServiceUrl(motorway, service);
                promises.push(
                    // TODO: Abort when submitting another search
                    fetch(url).then((response) => {
                        if (response.ok) {
                            response.json().then((json) => {
                                dataHandler(json, appContext);
                            });
                        }
                    }),
                );
            }
        }

        await Promise.allSettled(
            promises.map((p) => p.finally(() => (loadingProgress.value += 100 / promises.length))),
        );
        loading.value = false;
    }

    // Data Handlers
    function handleRoadworks(data: any, appContext: AppContext): void {
        const roadworks: Roadwork[] = data["roadworks"];
        if (!roadworks) return;
        if (roadworks.length == 0) return;

        const layerGroup = leafletStore.getLayerGroup();

        for (const roadwork of roadworks) {
            if (!roadwork.coordinate) continue;
            if (!roadwork.coordinate.lat) continue;
            if (!roadwork.coordinate.long) continue;
            const marker = L.marker([roadwork.coordinate.lat, roadwork.coordinate.long]);

            const popup = document.createElement("div");
            const title = popup.appendChild(document.createElement("div"));
            title.classList.add("text-h6", "text-center");
            title.textContent = roadwork.title ?? "Fehlender Titel";
            const subtitle = popup.appendChild(document.createElement("div"));
            subtitle.classList.add("text-subtitle-2", "text-center");
            subtitle.textContent = roadwork.subtitle ?? "Fehlender Untertitel";
            popup.appendChild(document.createElement("hr")).classList.add("mt-3");
            const description = popup.appendChild(document.createElement("p"));
            description.innerText = roadwork.description?.join("\n") ?? "Fehlende Beschreibung";

            marker.bindPopup(popup);
            marker.addTo(layerGroup);

            /* 
            // Detailed Information doesn't have more information
            // It only contains the additional keys "startTimestamp", "delayTimeValue", "abnormalTrafficType" and "averageSpeed"
            // But the values of all this keys are 'null'

            popup.appendChild(document.createElement("hr")).classList.add("mb-3");
            const moreInfosButton = document.createElement("div", { is: "v-btn" });
            popup.appendChild(moreInfosButton);

            const buttonContainer = popup.appendChild(document.createElement("div"));
            const button = createApp(VBtn, {
                text: "Mehr Informationen",
                onclick: () => openMoreInformationen(),
            });
            Object.assign(button._context, appContext);
            button.mount(buttonContainer);
            const buttonEl = buttonContainer.firstElementChild as HTMLElement;
            buttonEl?.classList.add("d-block", "display-print-block", "mx-auto");
            async function openMoreInformationen(): Promise<void> {
                if (!roadwork.identifier) return;
                const url = getDetailUrl("Baustellen", roadwork.identifier);
                const data = await (await fetch(url)).json();
                for (const key of Object.keys(data).filter((k) => !Object.keys(roadwork).includes(k))) {
                    console.log(key, data[key]);
                }
            }
            */
        }
    }

    // Utilities
    function getServiceUrl(motorway: string, service: string) {
        const servicePath = serviceUrlPaths[services.indexOf(service)];
        return `${baseUrl}/${motorway}/services/${servicePath}`;
    }
    function getDetailUrl(service: string, id: string) {
        const servicePath = serviceUrlPaths[services.indexOf(service)];
        return `${baseUrl}/details/${servicePath}/${id}`;
    }
</script>
<style lang="css" scoped>
    :deep(.v-field__input) {
        column-gap: unset;
    }
</style>
