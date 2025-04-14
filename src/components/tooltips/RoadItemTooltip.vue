<template>
    <v-card variant="plain">
        <v-card-title class="text-center">{{ roadItem.title }}</v-card-title>
        <v-card-subtitle class="text-center">{{ roadItem.subtitle }}</v-card-subtitle>
        <v-divider class="mt-3"></v-divider>
        <div v-if="!moreInformation">
            <v-card-text>
                {{ hasDescription ? roadItem.description?.join("\n") : "Beschreibung fehlt" }}
            </v-card-text>
            <div v-if="hasFooter">
                <v-divider class="mb-3"></v-divider>
                <v-card-text>
                    {{ props.roadItem.footer?.join("\n") }}
                </v-card-text>
            </div>
        </div>
        <!--
        <v-card-text v-else>
            <v-row v-if="roadItem.identifier">
                <v-col cols="auto">Identifier</v-col>
                <v-col class="text-truncate">{{ roadItem.identifier }}</v-col>
            </v-row>
            <v-row v-if="roadItem.icon">
                <v-col cols="auto">Icon</v-col>
                <v-col class="text-truncate">{{ roadItem.icon }}</v-col>
            </v-row>
            <v-row v-if="roadItem.isBlocked">
                <v-col cols="auto">Blockiert</v-col>
                <v-col class="text-truncate">{{ roadItem.isBlocked ? "Ja" : "Nein" }}</v-col>
            </v-row>
            <v-row v-if="roadItem.display_type">
                <v-col cols="auto">Display-Type</v-col>
                <v-col class="text-truncate">{{ roadItem.display_type }}</v-col>
            </v-row>
            <v-row v-if="roadItem.future">
                <v-col cols="auto">Display-Type</v-col>
                <v-col class="text-truncate">{{ roadItem.future }}</v-col>
            </v-row>
        </v-card-text>
        <v-divider class="mb-3"></v-divider>
        <v-card-actions class="justify-center">
            <v-btn
                variant="outlined"
                :text="'Details ' + (!moreInformation ? 'anzeigen' : 'ausblenden')"
                @click="moreInformation = !moreInformation"></v-btn>
        </v-card-actions>
        -->
    </v-card>
</template>
<script setup lang="ts">
    import type { components } from "@/types/autobahn-api";
    import { computed, ref, type PropType } from "vue";

    type RoadItem = components["schemas"]["RoadItem"];

    const props = defineProps({
        roadItem: {
            type: Object as PropType<RoadItem>,
            required: true,
        },
    });

    const moreInformation = ref(false);
    const hasDescription = computed(() => props.roadItem.description && props.roadItem.description.length > 0);
    const hasFooter = computed(() => props.roadItem.footer && props.roadItem.footer.length > 0);
</script>
<style lang="css" scoped>
    .v-card-text {
        white-space: pre-line;
    }
</style>
