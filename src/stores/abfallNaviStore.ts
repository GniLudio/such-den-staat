import { useFetch, type UseFetchReturn } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, type Ref, ref, type ComputedRef } from "vue";

export const useAbfallNaviStore = defineStore("abfallNavi", () => {
    // Fields
    const region: Ref<RegionID | undefined> = ref();
    const place: Ref<PlaceID | undefined> = ref();
    const street: Ref<StreetID | undefined> = ref();
    const streetNumber: Ref<StreetNumberID | undefined> = ref();

    // API at https://abfallnavi.api.bund.dev/
    // Urls
    const apiUrl: ComputedRef<string | undefined> = computed(
        () => region.value ? `https://${region.value}-abfallapp.regioit.de/abfall-app-${region.value}/rest` : undefined
    );
    // Places (Abholpunkte)
    const placesUrl: ComputedRef<string | undefined> = computed(
        () => apiUrl.value ? `${apiUrl.value}/orte` : undefined
    );
    const placeInfoUrl: ComputedRef<string | undefined> = computed(
        () => apiUrl.value && place.value ? `${apiUrl.value}/orte/${place.value}` : undefined
    );
    const streetsUrl: ComputedRef<string | undefined> = computed(
        () => apiUrl.value && place.value ? `${apiUrl.value}/orte/${place.value}/strassen` : undefined
    );
    const streetNumbersUrl: ComputedRef<string | undefined> = computed(
        () => apiUrl.value && street.value ? `${apiUrl.value}/strassen/${street.value}` : undefined
    )
    // Trash Types 
    const regionTrashTypesUrl: ComputedRef<string | undefined> = computed(
        () => apiUrl.value ? `${apiUrl.value}/fraktionen` : undefined
    );
    const streetTrashTypesUrl: ComputedRef<string | undefined> = computed(
        () => apiUrl.value && street.value ? `${apiUrl.value}/strassen/${street.value}/fraktionen` : undefined
    );
    const streetNumberTrashTypesUrl: ComputedRef<string | undefined> = computed(
        () => apiUrl.value && streetNumber.value ? `${apiUrl.value}/hausnummern/${streetNumber.value}/fraktionen` : undefined
    );

    // Lists
    const regions: Ref<Region[]> = ref([
        { id: "aachen", name: "Aachen" },
        { id: "zew2", name: "AWA Entsorgungs GmbH" },
        { id: "aw-bgl2", name: "Bergisch Gladbach" },
        { id: "bav", name: "Bergischer Abfallwirtschaftverbund" },
        { id: "din", name: "Dinslaken" },
        { id: "dorsten", name: "Dorsten" },
        { id: "gt2", name: "Gütersloh" },
        { id: "hlv", name: "Halver" },
        { id: "coe", name: "Kreis Coesfeld" },
        { id: "krhs", name: "Kreis Heinsberg" },
        { id: "pi", name: "Kreis Pinneberg" },
        { id: "krwaf", name: "Kreis Warendorf" },
        { id: "lindlar", name: "Lindlar" },
        { id: "stl", name: "Lüdenscheid" },
        { id: "nds", name: "Norderstedt" },
        { id: "nuernberg", name: "Nürnberg" },
        { id: "roe", name: "Roetgen" },
        { id: "solingen", name: "Solingen" },
        { id: "wml2", name: "EGW Westmünsterland" },
    ]);
    const places: UseFetchReturn<Place[]> = useFetchHelper(computed(() => placesUrl.value ?? ''), place, 'id');
    const streets: UseFetchReturn<Street[]> = useFetchHelper(computed(() => streetsUrl.value ?? ''), street, 'id');
    const streetNumbers: UseFetchReturn<StreetNumber[]> = useFetch(computed(() => streetNumbersUrl.value ?? ''), {
        initialData: [],
        refetch: true,
        beforeFetch: () => {
            streetNumbers.data.value = [];
            streetNumber.value = undefined;
        },
        afterFetch: (ctx) => {
            const data: StreetNumber[] = 'hausNrList' in ctx.data ? ctx.data.hausNrList : [];
            for (const streetNumber of (streetNumbers.data.value ?? [])) {
                if (!data.find((other) => streetNumber.id == other.id)) {
                    data.push(streetNumber);
                }
            }
            ctx.data = data;
            streetNumber.value = ctx.data[0].id;
            return ctx;
        }
    }).get().json();

    return {
        regions, region,
        places, place,
        streets, street,
        streetNumbers, streetNumber
    };
});

// Utilities
function useFetchHelper<ID, Item>(url: Ref<string>, item: Ref<ID | undefined>, idField: keyof Item | string) {
    const items: UseFetchReturn<Item[]> & PromiseLike<UseFetchReturn<Item[]>> = useFetch(url, {
        initialData: [],
        refetch: true,
        beforeFetch() {
            items.data.value = [];
            item.value = undefined;
        },
        afterFetch(ctx) {
            item.value = ctx.data[0][idField];
            return ctx;
        }
    }).get().json();
    return items;
}

// Types
type RegionID = string;
interface Region { id: RegionID, name: string }
type PlaceID = number;
interface Place { id: PlaceID; name: string; }
type StreetID = number;
interface Street {
    id: StreetID,
    name: string,
    hausNrList: StreetNumber[],
}
type StreetNumberID = number;
interface StreetNumber {
    id: StreetNumberID,
    nr: string,
}