<template>
    <v-row>
        <v-col>
            <v-select label="Region" :items="store.regions" v-model="store.region" :loading="false"
                :rules="[rules.notUndefined]" item-value="id" item-title="name" hide-details clearable
                class="select-centered" :menu-props="{ contentClass: 'select-centered' }" />
        </v-col>
        <v-col>
            <v-select label="Ort" :items="store.places.data ?? []" v-model="store.place"
                :loading="store.places.isFetching" :rules="[rules.notUndefined]" item-value="id"
                no-data-text="Keine Orte gefunden" item-title="name" hide-details clearable class="select-centered"
                :menu-props="{ contentClass: 'select-centered' }" />
        </v-col>
        <v-col>
            <v-select label="Straße" :items="store.streets.data ?? []" v-model="store.street"
                :loading="store.streets.isFetching" :rules="[rules.notUndefined]" item-value="id" item-title="name"
                hide-details clearable class="select-centered" :menu-props="{ contentClass: 'select-centered' }" />
        </v-col>
        <v-col>
            <v-select label="Hausnummer" :items="store.streetNumbers.data ?? []" v-model="store.streetNumber"
                :loading="store.streetNumbers.isFetching" item-title="nr" item-value="id" hide-details clearable
                class="select-centered" :menu-props="{ contentClass: 'select-centered' }" />
        </v-col>
    </v-row>
</template>
<script setup lang="ts">
    import { useAbfallNaviStore } from "@/stores/abfallNaviStore";
    import { onMounted } from "vue";
    const store = useAbfallNaviStore();

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