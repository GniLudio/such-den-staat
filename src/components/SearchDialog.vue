<template>
    <v-card class="justify-content px-3 pb-1">
        <div class="d-flex">
            <v-tabs v-model="tab" align-tabs="center" class="w-100 mb-2" center-active>
                <v-tab :value="t.id" v-for="t in tabs">{{ t.label }}</v-tab>
            </v-tabs>
            <SearchButton class="my-auto" @search="search" :disabled="searchDisabled" :loading="loading" />
        </div>
        <v-tabs-window v-model="tab" class="mb-1">
            <v-tabs-window-item :value="t.id" v-for="t in tabs">
                <component :is="t.component" :ref="(ref: TabComponent) => refs[t.id] = ref" />
            </v-tabs-window-item>
        </v-tabs-window>
        <v-progress-linear :model-value="loadingProgress" :class="{ 'opacity-0': !loading }"></v-progress-linear>
    </v-card>
</template>
<script setup lang="ts">
    import { computed, ref, watch, type Component, type ComputedRef, type Ref } from "vue";
    import AutobahnTab from "./searchTabs/AutobahnTab.vue";
    import AbfallNaviTab from "./searchTabs/AbfallNaviTab.vue";
    import { useLeafletStore } from "@/stores/leafletStore";

    const tabs: Tab[] = [
        {
            id: "autobahnenTab",
            label: "Autobahnen",
            component: AutobahnTab,
        },
        //{
        //    id: "abfallNavi",
        //    label: "AbfallNavi",
        //    component: AbfallNaviTab,
        //},
    ];
    const refs: Ref<Partial<Record<TabID, TabComponent>>> = ref({});
    const currentTab: ComputedRef<TabComponent | undefined> = computed(() => refs.value[tab.value]);

    const tab: Ref<TabID> = ref(tabs[0].id);
    const searchDisabled: ComputedRef<boolean> = computed(() => currentTab.value?.search == undefined || currentTab.value.valid == false)

    const abortController: Ref<AbortController | undefined> = ref();
    const loading: ComputedRef<boolean> = computed(() => abortController.value != undefined);
    const loadingProgress: Ref<number> = ref(0);

    watch(tab, abort);

    async function search(): Promise<void> {
        console.log("search");
        if (!currentTab.value?.search) return;

        useLeafletStore().clearMarkers();
        abort();
        abortController.value = new AbortController();

        const promises: Promise<void>[] = (currentTab.value.search(abortController.value.signal)).map((p) =>
            p.catch(() => { }).finally(() => loadingProgress.value += 100 / promises.length)
        );

        await Promise.all(promises);

        abortController.value = undefined;
        loadingProgress.value = 0;
    }

    function abort(): void {
        abortController?.value?.abort();
        loadingProgress.value = 0;
    }


    interface Tab {
        id: TabID;
        label: string;
        component: Component<TabComponent>;
    }
    interface TabComponent {
        search?(signal: AbortSignal): Promise<void>[];
        valid?: boolean,
    }
    type TabID = "autobahnenTab" | "abfallNaviTab";
</script>
