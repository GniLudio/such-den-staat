<template>
    <v-bottom-sheet :model-value="true" persistent :scrim="false" no-click-animation location-strategy="connected">
        <v-card class="pa-8 pt-10 rounded rounded-t-lg">
            <v-row>
                <v-col cols="12" sm="12" lg="4" xl="3" xxl="2" class="align-content-center pa-0">
                    <v-select
                        label="Suche"
                        :items="searchAPIs"
                        v-model="selectedSearchAPI"
                        class="select-api"
                        :menu-props="{ contentClass: 'select-api' }">
                        <template v-slot:append icon="mdi-open-in-new">
                            <v-btn icon="mdi-open-in-new" variant="flat" href="https://autobahn.api.bund.dev/"></v-btn>
                        </template>
                    </v-select>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="12" sm="12" lg="8" xl="9" xxl="10" class="pa-0">
                    <AutobahnSearch v-if="selectedSearchAPI == 'Autobahnen'"></AutobahnSearch>
                </v-col>
            </v-row>
        </v-card>
    </v-bottom-sheet>
</template>
<script setup lang="ts">
    import { ref } from "vue";
    import AutobahnSearch from "./search/AutobahnSearch.vue";

    const searchAPIs = ["Autobahnen"];
    const selectedSearchAPI = ref(searchAPIs[0]);
</script>
<style lang="css" scoped>
    .v-bottom-sheet__content {
        box-shadow: unset !important;
    }
</style>
