<template>
    <v-card class="justify-content px-3 pb-2">
        <div class="d-flex">
            <v-tabs v-model="tab" align-tabs="center" class="w-100 mb-2" center-active>
                <v-tab value="autobahnen">Autobahnen</v-tab>
            </v-tabs>
            <SearchButton class="my-auto" v-on:search="search"></SearchButton>
        </div>
        <v-tabs-window v-model="tab">
            <v-tabs-window-item value="autobahnen">
                <AutobahnTab ref="autobahnTab"></AutobahnTab>
            </v-tabs-window-item>
        </v-tabs-window>
    </v-card>
</template>
<script setup lang="ts">
    import { ref, type Ref } from "vue";
    import AutobahnTab from "./searchTabs/AutobahnTab.vue";

    const tab = ref("ausbildungssuche");
    const autobahnTab = ref();
    const tabs: Record<string, Ref<{ search: Function }>> = {
        "autobahnen": autobahnTab,
    }

    function search(): void {
        const tabInstance = tabs[tab.value];
        tabInstance?.value.search();
    }
</script>
