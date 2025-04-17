<template>
    <v-app>
        <v-main>
            <LeafletMap @on-search="searchDialog = !searchDialog" />
        </v-main>
        <v-dialog v-model="searchDialog" :contained="true" :no-click-animation="true" :persistent="true" :scrim="false"
            content-class="align-self-end">
            <SearchDialog></SearchDialog>
        </v-dialog>
    </v-app>
</template>
<script setup lang="ts">
    import { ref } from "vue";

    const searchDialog = ref(true);
</script>
