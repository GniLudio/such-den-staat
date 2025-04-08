<template>
    <v-card class="justify-content">
        <v-tabs v-model="tab" align-tabs="center">
            <v-tab value="abfallnavi">Abfallnavi</v-tab>
        </v-tabs>
    </v-card>
</template>
<script setup lang="ts">
    import { ref } from "vue";

    const tab = ref("jobsuche");
</script>
