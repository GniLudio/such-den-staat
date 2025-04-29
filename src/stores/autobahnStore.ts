import type { components } from "@/types/autobahn-api";
import { useFetch } from "@vueuse/core";
import L from "leaflet";
import { defineStore } from "pinia";
import { ref, type Ref } from "vue";
import { useLeafletStore } from "./leafletStore";

type RoadItem = components["schemas"]["RoadItem"];
type LineString = components["schemas"]["GeoJSONLineString"];
type RoadID = components["schemas"]["RoadID"];
type ServiceID = components["schemas"]["Service"];

export const useAutobahnStore = defineStore("autobahn", () => {
    const baseUrl = "https://verkehr.autobahn.de/o/autobahn";
    const listUrl = `${baseUrl}/`;
    const serviceUrl = `${baseUrl}/{roadID}/services/{serviceID}`;
    const detailsUrl = `${baseUrl}/details/{serviceID}/{elementID}`;
    const services: Service[] = [
        { id: "roadworks", title: "Baustellen", listField: "roadworks" },
        //{ path: "webcam", title: "Webcams", listField: "webcam" },
        { id: "parking_lorry", title: "Parkplätze", listField: "parking_lorry" },
        { id: "warning", title: "Verkehrsmeldungen", listField: "warning" },
        { id: "closure", title: "Sperrungen", listField: "closure" },
        { id: "electric_charging_station", title: "E-Ladestationen", listField: "electric_charging_station" },
    ];

    const state = {
        roads: useFetch(listUrl).get().json<{ roads: RoadID[] }>(),
        selectedRoads: ref<RoadID[]>([]),
        selectedServices: ref<ServiceID[]>([services[0].id]),
        visual: ref<L.Layer>(),
    };
    const getters = {
        listUrl,
        services,
        getService,
        getServiceUrl,
        getDetailsUrl,
    };
    const actions = {
    };

    state.roads.onFetchResponse(() => {
        state.selectedRoads.value = state.roads.data.value?.roads.slice(0, 1) ?? [];
    });

    function getService(id: ServiceID): Service | undefined {
        return services.find((s) => s.id == id);
    }
    function getServiceUrl(roadID: string, serviceID: ServiceID): string {
        return serviceUrl.replace("{roadID}", roadID).replace("{serviceID}", serviceID);
    }
    function getDetailsUrl(serviceID: string, elementID: string): string {
        return detailsUrl.replace("{serviceID}", serviceID).replace("{elementID}", elementID);
    }

    return { ...state, ...getters, ...actions };
});

interface Service {
    id: ServiceID;
    title: string;
    listField: string;
}
