<template>
    <v-card variant="plain" :style="{ maxWidth: `${0.9 * width}px` }">
        <v-card-item class="justify-center">
            <v-card-title>{{ roadItem.title ?? "Fehlender Titel" }}</v-card-title>
            <v-card-subtitle>{{ roadItem.subtitle ?? "Fehlender Untertitel" }}</v-card-subtitle>
        </v-card-item>
        <v-divider :thickness="3"></v-divider>
        <v-card-text v-if="description.length > 0" style="width: max-content; max-width: 100%;">
            <template v-for="line in description">
                {{ line }}
                <br />
            </template>
        </v-card-text>
    </v-card>
</template>
<script setup lang="ts">
    import type { components } from '@/types/autobahn-api';
    import { type PropType, computed } from 'vue';
    import { useDisplay } from 'vuetify';

    type RoadItem = components["schemas"]["RoadItem"];

    const { width } = useDisplay();

    const props = defineProps({
        roadItem: {
            type: Object as PropType<RoadItem>,
            required: true,
        },
    });

    const description = computed(() => props.roadItem.description ?? []);
</script>
<style lang="css" scoped>
    .v-card {
        text-align: center;
    }

    .v-card-item {
        white-space: pre-line;
    }

    :deep(.v-card-title),
    :deep(.v-card-subtitle) {
        text-wrap: wrap;
    }
</style>
