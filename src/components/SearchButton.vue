<template>
    <v-btn color="primary" type="submit" @click="emit('search')">
        <v-icon icon="mdi-magnify"></v-icon>
    </v-btn>
</template>
<script setup lang="ts">
    const emit = defineEmits(["search"]);
</script>