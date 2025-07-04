<template>
    <v-row dense justify="space-evenly">
        <v-col :cols="6" :md="6" lg="">
            <v-select label="Region" no-data-text="Keine Region gefunden" :items="store.regions" v-model="store.region"
                :loading="false" :rules="[rules.notUndefined]" item-value="id" item-title="name" hide-details clearable
                class="select-centered" :menu-props="{ contentClass: 'select-centered' }" />
        </v-col>
        <v-col :cols="6" :md="6" lg="">
            <v-select label="Ort" no-data-text="Keine Orte gefunden" :items="store.places.data ?? []"
                v-model="store.place" :loading="store.places.isFetching" :rules="[rules.notUndefined]" item-value="id"
                item-title="name" hide-details clearable class="select-centered"
                :menu-props="{ contentClass: 'select-centered' }" />
        </v-col>
        <v-col :cols="6" :md="4" lg="">
            <v-select label="Straße" no-data-text="Keine Straßen gefunden" :items="store.streets.data ?? []"
                v-model="store.street" :loading="store.streets.isFetching" :rules="[rules.notUndefined]" item-value="id"
                item-title="name" hide-details clearable class="select-centered"
                :menu-props="{ contentClass: 'select-centered' }" />
        </v-col>
        <v-col :cols="6" :md="4" lg="">
            <v-select label="Hausnummer" no-data-text="Keine Hausnummern gefunden"
                :items="store.houseNumbers.data ?? []" v-model="store.houseNumber"
                :loading="store.houseNumbers.isFetching" item-title="nr" item-value="id" hide-details clearable
                class="select-centered" :menu-props="{ contentClass: 'select-centered' }" />
        </v-col>
        <v-col :cols="12" :md="4" lg="">
            <MultiSelect :label="trashTypesLabel" no-data-text="Keine Müllarten gefunden"
                all-selected-text="Alle Müllarten" :items="store.trashTypes.data" v-model="store.selectedTrashTypes"
                :loading="store.trashTypes.isFetching" :rules="[rules.notEmpty]" item-value="id" item-title="name"
                hide-details clearable class="select-centered" :menu-props="{ contentClass: 'select-centered' }" />
        </v-col>
    </v-row>
</template>
<script setup lang="ts">
    import { useAbfallNaviStore } from '@/stores/abfallNaviStore';
    import MultiSelect from '../MultiSelect.vue';
    import { computed } from 'vue';
    import { useNominatimStore } from '@/stores/nominatimStore';
    import { useLeafletStore } from '@/stores/leafletStore';
    import L from 'leaflet';

    const store = useAbfallNaviStore();

    const trashTypesLabel = computed(() => {
        switch (store.trashTypes.level) {
            case 'HouseNumber': return "Müllarten (Haus)";
            case 'Street': return "Müllarten (Straße)"
            case 'Region': return "Müllarten (Region)"
            case undefined:
            default: return "Müllarten"
        }
    });

    const rules = {
        notUndefined: (a?: any) => a != undefined,
        notEmpty: (a: any[]) => a.length > 0,
    }

    defineExpose({
        search,
    });

    function search(): Promise<void>[] {
        const country = "Deutschland";
        const state = undefined;
        const county = undefined;
        const city = store.places.data?.find((place) => place.id == store.place)?.name;
        const street = store.streets.data?.find((street) => street.id == store.street)?.name;
        const houseNumber = store.houseNumbers.data?.find((houseNumber) => houseNumber.id == store.houseNumber)?.nr;
        const amenity = undefined;

        const streetAndNumber = houseNumber ? `${street} ${houseNumber}` : street ? street : undefined;

        const markerGroup = useLeafletStore().getMarkerGroup();

        return [
            useNominatimStore().search(country, state, county, city, street, amenity)
                .then((data) => data.json())
                .then((json) => {
                    console.log(json);
                    L.geoJSON(json).addTo(markerGroup).bindPopup("Kommt bald...");
                })
        ];
        /*
        if (store.appointmentsUrl) {
            return [
                fetch(store.appointmentsUrl)
                    .then(async (data) => data.json())
                    .then((json) => {

                    })
            ]
        }
        */
    }
</script>