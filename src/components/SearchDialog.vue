<template>
    <v-card class="justify-content px-3 pb-1">
        <div class="d-flex">
            <v-tabs v-model="tab" align-tabs="center" class="w-100 mb-2" center-active>
                <v-tab :value="t.id" v-for="t in tabs">{{ t.label }}</v-tab>
            </v-tabs>
            <SearchButton class="my-auto" @search="search" :loading="loading" />
        </div>
        <v-tabs-window v-model="tab" class="mb-1">
            <v-tabs-window-item :value="t.id" v-for="t in tabs">
                <component :is="t.component" :ref="(ref: TabComponent) => refs[t.id] = ref"></component>
            </v-tabs-window-item>
        </v-tabs-window>
        <v-progress-linear :model-value="loadingProgress" :class="{ 'opacity-0': !loading }"></v-progress-linear>
    </v-card>
</template>
<script setup lang="ts">
    import { computed, ref, type Component, type Ref } from "vue";
    import AutobahnTab from "./searchTabs/AutobahnTab.vue";
    import AbfallNaviTab from "./searchTabs/AbfallNaviTab.vue";

    const tabs: Tab[] = [
        {
            id: "autobahnen",
            label: "Autobahnen",
            component: AutobahnTab,
        },
        //{
        //    id: "abfallNavi",
        //    label: "AbfallNavi",
        //    component: AbfallNaviTab,
        //},
    ];
    const refs: Partial<Record<TabID, TabComponent>> = {};

    const tab: Ref<TabID> = ref(tabs[0].id);

    const search = computed(() => () => {
        const search = refs[tab.value]?.search;
        if (search) search();
    });
    const loading = computed(() => Object.values(refs).map((r) => r.loading).some((l) => l));
    const loadingProgress = computed(() => Math.max(...Object.values(refs).map((r) => r.loading ? r.loadingProgress : 0)));

    interface Tab {
        id: TabID;
        label: string;
        component: Component<TabComponent>;
    }
    interface TabComponent {
        search?: () => void | Promise<void>;
        loading: boolean;
        loadingProgress: number;
    }
    type TabID = "autobahnen" | "abfallNavi";
</script>
