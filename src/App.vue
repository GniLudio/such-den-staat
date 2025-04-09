<template>
    <v-app>
        <v-main>
            <LeafletMap @on-search="searchDialog = !searchDialog" @on-settings="settingsDialog = !settingsDialog" />
        </v-main>
        <v-dialog v-model="settingsDialog" max-width="900">
            <SettingsDialog></SettingsDialog>
        </v-dialog>
        <v-dialog
            v-model="searchDialog"
            :contained="true"
            :no-click-animation="true"
            :persistent="true"
            :scrim="false"
            content-class="align-self-end">
            <SearchDialog></SearchDialog>
        </v-dialog>
    </v-app>
</template>
<script setup lang="ts">
    import { ref, watch } from "vue";

    const searchDialog = ref(true);
    const settingsDialog = ref(false);
</script>
