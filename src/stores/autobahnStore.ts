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
        roads: ref<string[]>([]),
        loading: ref<boolean>(false),
        selectedRoads: ref<string[]>([]),
        selectedServices: ref<string[]>(["Baustellen"]),
    };
    const getters = {
        listUrl,
        services,
        getService,
        getServiceUrl,
        getDetailsUrl,
    };
    const actions = {
        fetchRoadworks,
    };

    fetchRoadworks();

    function getService(title: string): Service | undefined {
        return services.find((s) => s.title == title);
    }
    function getServiceUrl(roadID: string, serviceID: ServiceID): string {
        return serviceUrl.replace("{roadID}", roadID).replace("{serviceID}", serviceID);
    }
    function getDetailsUrl(serviceID: string, elementID: string): string {
        return detailsUrl.replace("{serviceID}", serviceID).replace("{elementID}", elementID);
    }

    async function fetchRoadworks(): Promise<void> {
        state.loading.value = true;
        const response = await fetch(listUrl);
        const data = await response.json();
        state.roads.value = data.roads;
        state.selectedRoads.value = data.roads.slice(0, 1);
        state.loading.value = false;
    }

    return { ...state, ...getters, ...actions };
});

type ServiceID = "roadworks" | "webcam" | "parking_lorry" | "warning" | "closure" | "electric_charging_station";

interface Service {
    path: ServiceID;
    title: string;
    listField: string;
}
