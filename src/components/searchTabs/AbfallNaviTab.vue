<template>
    <v-row>
        <v-col :cols="6" :md="3" class="pb-md-3 pb-0">
            <v-select label="Region" no-data-text="Keine Region gefunden" :items="store.regions" v-model="store.region"
                :loading="false" :rules="[rules.notUndefined]" item-value="id" item-title="name" hide-details clearable
                class="select-centered" :menu-props="{ contentClass: 'select-centered' }" />
        </v-col>
        <v-col :cols="6" :md="3" class="pb-md-3 pb-0">
            <v-select label="Ort" no-data-text="Keine Orte gefunden" :items="store.places.data ?? []"
                v-model="store.place" :loading="store.places.isFetching" :rules="[rules.notUndefined]" item-value="id"
                item-title="name" hide-details clearable class="select-centered"
                :menu-props="{ contentClass: 'select-centered' }" />
        </v-col>
        <v-col :cols="6" :md="3" class="pb-md-3 pt-2">
            <v-select label="Straße" no-data-text="Keine Straßen gefunden" :items="store.streets.data ?? []"
                v-model="store.street" :loading="store.streets.isFetching" :rules="[rules.notUndefined]" item-value="id"
                item-title="name" hide-details clearable class="select-centered"
                :menu-props="{ contentClass: 'select-centered' }" />
        </v-col>
        <v-col :cols="6" :md="3" class="pb-md-3 pt-2">
            <v-select label="Hausnummer" no-data-text="Keine Hausnummern gefunden"
                :items="store.houseNumbers.data ?? []" v-model="store.houseNumber"
                :loading="store.houseNumbers.isFetching" item-title="nr" item-value="id" hide-details clearable
                class="select-centered" :menu-props="{ contentClass: 'select-centered' }" />
        </v-col>
        <v-col>
            <MultiSelect :label="trashTypesLabel" no-data-text="Keine Müllart gefunden" :items="store.trashTypes.data"
                item-value="id" item-title="name" />
        </v-col>
    </v-row>
</template>
<script setup lang="ts">
    import { useAbfallNaviStore } from '@/stores/abfallNaviStore';
    import { computed, onMounted } from 'vue';
    import MultiSelect from '../MultiSelect.vue';

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
    }

    defineExpose({
        search,
    });

    onMounted(() => {
        store.region ??= store.regions[0].id;
    })

    function search(): Promise<void>[] {
        return [];
    }
</script>