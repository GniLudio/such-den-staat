import { useFetch, type UseFetchReturn } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, type Ref, ref, type ComputedRef, reactive, type Reactive, watch } from "vue";

export const useAbfallNaviStore = defineStore("abfallNavi", () => {
    // Fields
    const region: Ref<RegionID | undefined> = ref();
    const place: Ref<PlaceID | undefined> = ref();
    const street: Ref<StreetID | undefined> = ref();
    const houseNumber: Ref<StreetNumberID | undefined> = ref();
    const selectedTrashTypes: Ref<TrashTypeID[]> = ref<TrashTypeID[]>([]);

    // API at https://abfallnavi.api.bund.dev/
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
    const trashTypesRegionUrl: ComputedRef<string | undefined> = computed(
        () => apiUrl.value ? `${apiUrl.value}/fraktionen` : undefined
    );
    const trashTypesStreetUrl: ComputedRef<string | undefined> = computed(
        () => apiUrl.value && street.value ? `${apiUrl.value}/strassen/${street.value}/fraktionen` : undefined
    );
    const trashTypesHouseNumberUrl: ComputedRef<string | undefined> = computed(
        () => apiUrl.value && houseNumber.value ? `${apiUrl.value}/hausnummern/${houseNumber.value}/fraktionen` : undefined
    );
    const trashTypesQuery: ComputedRef<string> = computed(() => selectedTrashTypes.value.map((t) => `fraktion=${t}`).join("&"));
    const appointmentsStreetUrl: ComputedRef<string | undefined> = computed(
        () => apiUrl.value && street.value ? `${apiUrl.value}/strassen/${street.value}/termine?${trashTypesQuery.value}` : undefined
    );
    const appointment: ComputedRef<string | undefined> = computed(
        () => apiUrl.value && houseNumber.value ? `${apiUrl.value}/hausnummern/${houseNumber.value}/termine?${trashTypesQuery.value}` : undefined
    );
    const appointmentsUrl: ComputedRef<string | undefined> = computed(
        () => appointment.value ?? appointmentsStreetUrl.value ?? undefined
    )

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
    const houseNumbers: UseFetchReturn<HouseNumber[]> = useFetch(computed(() => streetNumbersUrl.value ?? ''), {
        initialData: [],
        refetch: true,
        beforeFetch: () => {
            houseNumbers.data.value = [];
            houseNumber.value = undefined;
        },
        afterFetch: (ctx) => {
            const data: HouseNumber[] = 'hausNrList' in ctx.data ? ctx.data.hausNrList : [];
            for (const houseNumber of (houseNumbers.data.value ?? [])) {
                if (!data.find((other) => houseNumber.id == other.id)) {
                    data.push(houseNumber);
                }
            }
            ctx.data = data;
            houseNumber.value = ctx.data[0].id;
            return ctx;
        }
    }).get().json();
    const trashTypesRegion: UseFetchReturn<TrashType[]> = useFetchHelper(computed(() => trashTypesRegionUrl.value ?? ''), undefined, undefined);
    const trashTypesStreet: UseFetchReturn<TrashType[]> = useFetchHelper(computed(() => trashTypesStreetUrl.value ?? ''), undefined, undefined);
    const trashTypesHouseNumber: UseFetchReturn<TrashType[]> = useFetchHelper(computed(() => trashTypesHouseNumberUrl.value ?? ''), undefined, undefined);
    const trashTypes: Reactive<{ isFetching: Ref<boolean>, data: Ref<TrashType[]>, level: Ref<TrashTypeLevel | undefined> }> = reactive({
        isFetching: computed<boolean>(() => trashTypesRegion.isFetching.value || trashTypesStreet.isFetching.value || trashTypesHouseNumber.isFetching.value),
        data: computed<TrashType[]>(() => {
            let data = [];
            switch (trashTypes.level) {
                case "HouseNumber": data = trashTypesHouseNumber.data.value ?? []; break;
                case "Street": data = trashTypesStreet.data.value ?? []; break;
                case "Region": data = trashTypesRegion.data.value ?? []; break;
            }
            selectedTrashTypes.value = data.map((t) => t.id);
            return data;
        }),
        level: computed<TrashTypeLevel | undefined>(() => {
            if (houseNumber.value) return "HouseNumber";
            else if (street.value) return "Street";
            else if (region.value) return "Region";
            else return undefined;
        })
    });

    return {
        regions, region,
        places, place,
        streets, street,
        houseNumbers, houseNumber,
        trashTypes, selectedTrashTypes,
        appointmentsUrl
    };
});

// Utilities
function useFetchHelper<ID, Item>(url: Ref<string>, item?: Ref<ID | undefined>, idField?: keyof Item | string) {
    const items: UseFetchReturn<Item[]> & PromiseLike<UseFetchReturn<Item[]>> = useFetch(url, {
        initialData: [],
        refetch: true,
        beforeFetch() {
            items.data.value = [];
            if (item) {
                item.value = undefined;
            }
        },
        afterFetch(ctx) {
            if (item && idField) {
                item.value = ctx.data[0][idField];
            }
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
    hausNrList: HouseNumber[],
}
type StreetNumberID = number;
interface HouseNumber {
    id: StreetNumberID,
    nr: string,
}
type TrashTypeID = number;
type TrashTypeLevel = "Region" | "Street" | "HouseNumber"
interface TrashType {
    id: TrashTypeID;
    name: string;
}
type AppointmentID = number;

interface Appointment {
    id: AppointmentID;
    datum: string;
    jahr: number;
    info: null;
    bezirk: {
        id: number;
        fraktionId: TrashTypeID;
        name: string;
        gueltigAb: string;
    }
}