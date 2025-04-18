<template>
    <v-card class="justify-content px-3 pb-1">
        <div class="d-flex">
            <v-tabs v-model="tab" align-tabs="center" class="w-100 mb-2" center-active>
                <v-tab :value="t.id" v-for="t in tabs">{{ t.label }}</v-tab>
            </v-tabs>
            <SearchButton class="my-auto" v-on:search="search" :loading="loading"></SearchButton>
        </div>
        <v-tabs-window v-model="tab" class="mb-1">
            <v-tabs-window-item :value="tabs[0].id">
                <component :is="tabs[0].component" :ref="tabs[0].refName"></component>
            </v-tabs-window-item>
        </v-tabs-window>
        <v-progress-linear :model-value="loadingProgress" :class="{ 'opacity-0': !loading }"></v-progress-linear>
    </v-card>
</template>
<script setup lang="ts">
    import { computed, ref, useTemplateRef, type Component, type ComputedRef, type Ref, type ShallowRef } from "vue";
    import AutobahnTab from "./searchTabs/AutobahnTab.vue";

    const autobahnTab = useTemplateRef<TabComponent>("autobahnTab");
    const tabs: Tab[] = [
        {
            id: "autobahnen",
            label: "Autobahnen",
            component: AutobahnTab,
            ref: autobahnTab,
            refName: "autobahnTab"
        },
    ];
    const tab: Ref<TabID> = ref(tabs[0].id);

    const tabRefs: ComputedRef<(TabComponent | undefined)[]> = computed(() => tabs.map((t) => t.ref.value ?? undefined));
    const tabRef: ComputedRef<TabComponent | undefined> = computed(() => tabs.find((t) => t.id == tab.value)?.ref.value ?? undefined);

    const search: ComputedRef<Function | undefined> = computed(() => tabRef.value?.search);
    const loading: ComputedRef<boolean> = computed(() => tabs.map((t) => t.ref.value?.loading).some((l) => l));
    const loadingProgress: ComputedRef<number> = computed(() => {
        return Math.max(...tabRefs.value.map((ref) => ref?.loading ? ref.loadingProgress : 0));
    });

    // Types
    interface Tab {
        id: TabID,
        label: string,
        component: Component<TabComponent>,
        ref: Readonly<Ref<TabComponent | null>>,
        refName: any,
    }
    interface TabComponent {
        search: () => void | Promise<void>,
        loading: boolean,
        loadingProgress: number,
    }
    type TabID = "autobahnen";
</script>
