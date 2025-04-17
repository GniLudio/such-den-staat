<template>
    <v-btn color="primary" type="submit" v-bind="props" @click="emit('search')">
        <v-icon icon="mdi-magnify"></v-icon>
    </v-btn>
</template>
<script setup lang="ts">
    const props = defineProps();
    const emit = defineEmits(["search"]);
</script>