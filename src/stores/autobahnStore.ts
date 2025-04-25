import { useFetch } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAutobahnStore = defineStore("autobahn", () => {
    const baseUrl = "https://verkehr.autobahn.de/o/autobahn";
    const listUrl = `${baseUrl}/`;
    const serviceUrl = `${baseUrl}/{roadID}/services/{serviceID}`;
    const detailsUrl = `${baseUrl}/details/{serviceID}/{elementID}`;
    const services: Service[] = [
        { path: "roadworks", title: "Baustellen", listField: "roadworks" },
        //{ path: "webcam", title: "Webcams", listField: "webcam" },
        { path: "parking_lorry", title: "Parkplätze", listField: "parking_lorry" },
        { path: "warning", title: "Verkehrsmeldungen", listField: "warning" },
        { path: "closure", title: "Sperrungen", listField: "closure" },
        { path: "electric_charging_station", title: "E-Ladestationen", listField: "electric_charging_station" },
    ];

    const state = {
        roads: useFetch(listUrl).get().json<{ roads: any[] }>(),
        selectedRoads: ref<string[]>([]),
        selectedServices: ref<string[]>([services[0].title]),
    };
    const getters = {
        listUrl,
        services,
        getService,
        getServiceUrl,
        getDetailsUrl,
    };
    const actions = {};

    state.roads.onFetchResponse(() => {
        state.selectedRoads.value = state.roads.data.value?.roads.slice(0, 1) ?? [];
    });

    function getService(title: string): Service | undefined {
        return services.find((s) => s.title == title);
    }
    function getServiceUrl(roadID: string, serviceID: ServiceID): string {
        return serviceUrl.replace("{roadID}", roadID).replace("{serviceID}", serviceID);
    }
    function getDetailsUrl(serviceID: string, elementID: string): string {
        return detailsUrl.replace("{serviceID}", serviceID).replace("{elementID}", elementID);
    }

    return { ...state, ...getters, ...actions };
});

type ServiceID = "roadworks" | "webcam" | "parking_lorry" | "warning" | "closure" | "electric_charging_station";

interface Service {
    path: ServiceID;
    title: string;
    listField: string;
}
