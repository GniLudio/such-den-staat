<template>
    <v-row>
        <v-col v-for="s in selects">
            <v-select :label="s.label" :items="s.items.value" :item-title="s.itemTitle" :item-value="s.itemValue"
                v-bind:model-value="s.vModel" :lodaing="s.loading" />
        </v-col>
    </v-row>
</template>
<script setup lang="ts">
    import { computed, ref, watch, type ComputedRef, type Ref } from "vue";

    const loading: Ref<boolean> = ref(false);
    const loadingProgress: Ref<number> = ref(0);

    const regions: Ref<Region[]> = ref([
        { url: "aachen", name: "Aachen" },
        { url: "zew2", name: "AWA Entsorgungs GmbH" },
        { url: "aw-gl2", name: "Bergisch Gladbach" },
        { url: "bav", name: "Bergischer Abfallwirtschaftverbund" },
        { url: "din", name: "Dinslaken" },
        { url: "dorsten", name: "Dorsten" },
        { url: "gt2", name: "Gütersloh" },
        { url: "hlv", name: "Halver" },
        { url: "coe", name: "Kreis Coesfeld" },
        { url: "krhs", name: "Kreis Heinsberg" },
        { url: "pi", name: "Kreis Pinneberg" },
        { url: "krwaf", name: "Kreis Warendorf" },
        { url: "lindlar", name: "Lindlar" },
        { url: "stl", name: "Lüdenscheid" },
        { url: "nds", name: "Norderstedt" },
        { url: "nuernberg", name: "Nürnberg" },
        { url: "roe", name: "Roetgen" },
        { url: "solingen", name: "Solingen" },
        { url: "wml2", name: "EGW Westmünsterland" },
    ]);
    const places: Ref<Place[]> = ref([]);

    const region: Ref<RegionID | undefined> = ref("wml2");
    const place: Ref<PlaceID | undefined> = ref();

    const loadingPlaces = ref(false);

    watch(region, () => updatePlaces);

    const selects: ComputedRef<Select[]> = computed(() => [
        { label: "Region", itemTitle: "name", itemValue: "url", items: regions, vModel: region },
        { label: "Ort", itemTitle: "", itemValue: "", items: places, vModel: place, loading: loadingPlaces },
    ]);

    defineExpose({
        loading,
        loadingProgress,
    });

    async function updatePlaces(): Promise<void> {
        console.log("updatePlaces");
        places.value = [];
        if (region.value) {
            loadingPlaces.value = true;
            const url = `https://${region.value}-abfallapp.regioit.de/abfall-app-${region.value}/rest`;
            const data = await (await fetch(url)).json()
            console.log(data);

            await new Promise((r) => setTimeout(r, 3000));
            loadingPlaces.value = false;
        }
    }

    interface Select {
        label: string,
        itemTitle: string,
        itemValue: string,
        items: Ref<any[]>,
        vModel: Ref<any | undefined>,
        loading?: Ref<boolean>,
    }

    type RegionID = string;
    interface Region { url: RegionID, name: string }
    type PlaceID = any;
    type Place = any;

</script>
