<template>
    <v-card class="justify-content">
        <v-tabs v-model="tab" align-tabs="center">
            <v-tab value="autobahnen">Autobahnen</v-tab>
        </v-tabs>

        <v-container>
            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="autobahnen">
                    <AutobahnenTab></AutobahnenTab>
                </v-tabs-window-item>
            </v-tabs-window>
        </v-container>
    </v-card>
</template>
<script setup lang="ts">
    import { ref } from "vue";

    const tab = ref("ausbildungssuche");
</script>
