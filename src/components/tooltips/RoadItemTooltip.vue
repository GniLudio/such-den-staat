<template>
    <v-card variant="plain">
        <v-card-title class="text-center">{{ roadItem.title }}</v-card-title>
        <v-card-subtitle class="text-center">{{ roadItem.subtitle }}</v-card-subtitle>
        <p style="white-space: pre-line">{{ description }}</p>
    </v-card>
</template>
<script setup lang="ts">
    import type { components } from "@/types/autobahn-api";
    import { computed, type PropType } from "vue";

    type Roadwork = components["schemas"]["Roadwork"];

    const props = defineProps({
        roadItem: {
            type: Object as PropType<Roadwork>,
            required: true,
        },
    });

    const description = computed(() => props.roadItem.description?.join("\n"));
</script>
