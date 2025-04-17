<template>
    <v-card class="justify-content px-3 pb-1">
        <div class="d-flex">
            <v-tabs v-model="tab" align-tabs="center" class="w-100 mb-2" center-active>
                <v-tab value="autobahnen">Autobahnen</v-tab>
            </v-tabs>
            <SearchButton class="my-auto" v-on:search="search" :loading="loading"></SearchButton>
        </div>
        <v-tabs-window v-model="tab" class="mb-1">
            <v-tabs-window-item value="autobahnen">
                <AutobahnTab ref="autobahnTab"></AutobahnTab>
            </v-tabs-window-item>
        </v-tabs-window>
        <v-progress-linear :model-value="loadingProgress" :class="{ 'opacity-0': !loading }"></v-progress-linear>
    </v-card>
</template>
<script setup lang="ts">
    import { computed, ref, watch, type Ref } from "vue";

    const tab = ref("ausbildungssuche");
    const autobahnTab: Ref<TabComponent | undefined> = ref<TabComponent>();
    const tabs: Record<string, Ref<TabComponent | undefined>> = {
        "autobahnen": autobahnTab,
    }
    const tabInstance: Ref<Ref<TabComponent | undefined> | undefined> = ref();

    const search = computed(() => tabInstance.value?.value?.search);
    const loading = computed(() => Object.values(tabs).map((t) => t.value?.loading).some((l) => l));
    const loadingProgress = computed(() => Math.max(...Object.values(tabs).map((t) => t.value?.loading ? t.value.loadingProgress : 0)));

    watch(tab, (newValue) => {
        tabInstance.value = tabs[newValue];
    });

    interface TabComponent {
        search: () => void | Promise<void>,
        loading: boolean,
        loadingProgress: number,
    }
</script>
