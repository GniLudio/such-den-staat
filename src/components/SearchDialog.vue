<template>
    <v-card class="justify-content">
        <v-tabs v-model="tab" align-tabs="center">
            <v-tab value="autobahnen">Autobahnen</v-tab>
        </v-tabs>

        <v-tabs-window v-model="tab" class="ma-2">
            <v-tabs-window-item value="autobahnen">
                <AutobahnTab></AutobahnTab>
            </v-tabs-window-item>
        </v-tabs-window>
    </v-card>
</template>
<script setup lang="ts">
    import { ref } from "vue";

    const tab = ref("ausbildungssuche");
</script>
