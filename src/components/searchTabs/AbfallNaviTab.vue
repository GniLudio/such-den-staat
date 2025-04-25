<template>
    <v-row>
        <v-col>
            <v-select label="Region" :items="regions" v-model="region" :loading="false" :rules="[rules.notUndefined]"
                item-value="id" item-title="name" hide-details />
        </v-col>
        <v-col>
            <v-select label="Ort" :items="places.data.value ?? []" v-model="place" :loading="places.isFetching.value"
                :rules="[rules.notUndefined]" item-value="id" item-title="name" hide-details />
        </v-col>
        <v-col>
            <v-select label="Straße" :items="streets.data.value ?? []" v-model="street"
                :loading="streets.isFetching.value" :rules="[rules.notUndefined]" item-value="id" item-title="name"
                hide-details />
        </v-col>
        <v-col>
            <v-select label="Hausnummer" :items="streetNumbers.data.value ?? []" v-model="streetNumber"
                :loading="streetNumbers.isFetching.value" :rules="[rules.notUndefined]" item-title="nr" item-value="id"
                hide-details />
        </v-col>
    </v-row>
</template>
<script setup lang="ts">
    import { useFetch, type UseFetchReturn } from "@vueuse/core";
    import { computed, ref, watch, type ComputedRef, type Ref, type ShallowRef } from "vue";

    const baseUrl: ComputedRef<string | undefined> = computed(
        () => region.value ? `https://${region.value}-abfallapp.regioit.de/abfall-app-${region.value}/rest` : undefined
    )

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
    const region: Ref<RegionID | undefined> = ref();

    const placesUrl: ComputedRef<string> = computed(() => baseUrl.value ? `${baseUrl.value}/orte` : '');
    const place: Ref<PlaceID | undefined> = ref();
    const places: UseFetchReturn<Place[]> = useFetchHelper(placesUrl, place, 'id');

    const streetsUrl: ComputedRef<string> = computed(() => baseUrl.value && place.value ? `${baseUrl.value}/orte/${place.value}/strassen` : '');
    const street: Ref<StreetID | undefined> = ref();
    const streets: UseFetchReturn<Street[]> = useFetchHelper(streetsUrl, street, 'id');

    const streetNumbersUrl: ComputedRef<string> = computed(
        () => baseUrl.value && street.value ? `${baseUrl.value}/strassen/${street.value}` : ''
    );
    const streetNumber: Ref<StreetID | undefined> = ref();
    const streetNumbers: UseFetchReturn<Street[]> = useFetch(streetNumbersUrl, {
        initialData: [],
        refetch: true,
        beforeFetch: (ctx) => {
            streetNumbers.data.value = [];
            streetNumber.value = undefined;

            const streetInstance: Street | undefined = streets.data.value?.find((s) => s.id == street.value);
            if (ctx.url == '') ctx.cancel();
            else if (streetInstance?.hausNrList && streetInstance.hausNrList.length > 0) {
                streetNumbers.data.value = streetInstance.hausNrList;
                streetNumber.value = streetNumbers.data.value[0].id;
                ctx.cancel();
            }
        },
        afterFetch: (ctx) => {
            ctx.data = (ctx.data as Street).hausNrList ?? []
            if (ctx.data.length > 0) {
                streetNumber.value ??= ctx.data[0].id;
            }
            return ctx;
        }
    }).get().json();

    const rules = {
        notUndefined: (a?: any) => a != undefined,
    }

    defineExpose({
        search: undefined,
    });

    function search(): Promise<void>[] {
        return [];
    }

    type RegionID = string;
    interface Region { id: RegionID, name: string }
    type PlaceID = number;
    interface Place { id: PlaceID; name: string; }
    type StreetID = number;
    interface Street {
        id: StreetID,
        name: string,
        staticId: string,
        hausNrList?: Street[],
        plz: null,
        gueltigBis: null,
        ortsteilName: string,
        ort: Place
    }
    type StreetNumberID = number;
    interface StreetNumber {
        id: StreetNumberID,
        nr: string,
        plz: string,
        staticId: string,
        gueltigBis: null
    }


    function useFetchHelper<ID, Item>(url: Ref<string>, item: Ref<ID | undefined>, idField: keyof Item | string) {
        const items: UseFetchReturn<Item[]> & PromiseLike<UseFetchReturn<Item[]>> = useFetch(url, {
            initialData: [],
            refetch: true,
            beforeFetch: (ctx) => {
                items.data.value = [];
                item.value = undefined;
                if (ctx.url == '') ctx.cancel();
            },
            afterFetch: (ctx) => {
                if (ctx.data.length > 0) {
                    item.value = ctx.data[0][idField] as ID;
                }
                return ctx;
            }
        }).get().json();
        return items;
    }

</script>
<script lang="ts">
    namespace Temp {
        type OrtID = number;
        interface Ort {
            id: OrtID;
            name: string;
        }

        type StreetID = number;
        interface Street {
            id: StreetID;
            name: string;
            staticId: string;
            hausNrList: HausNummer[];
            plz: string;
            gueltigBis: null;
            ort: Ort;
            ortsteilName: string;
        }
        type HausNummerID = any;
        interface HausNummer {
            id: number,
            nr: string,
            plz: string,
            staticId: string,
            gueltigBis: null
        }

    }
</script>