import { defineStore } from "pinia";
import { computed, ref, type ComputedRef, type Ref } from "vue";



export const useNominatimStore = defineStore("nominatim", () => {

    const state = {

    } satisfies Record<string, Ref>;
    const getters = {

    } satisfies Record<string, ComputedRef>;
    const actions = {
        search
    } satisfies Record<string, Function>;


    function search(country?: string, state?: string, county?: string, city?: string, street?: string, amenity?: string): Promise<any> {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        if (state) url.searchParams.append("state", state);
        if (county) url.searchParams.append("county", county);
        if (city) url.searchParams.append("city", city);
        if (street) url.searchParams.append("street", street);
        if (country) url.searchParams.append("country", country);
        if (amenity) url.searchParams.append("amenity", amenity);

        url.searchParams.append("format", "geojson");
        url.searchParams.append("limit", "1");
        url.searchParams.append("countrycodes", "de");
        url.searchParams.append("layer", "address");

        console.log(url.href);

        return fetch(url, {
            referrer: "https://www.suchdenstaat.de"
        });
    }

    return {
        ...state, ...getters, ...actions
    }
})