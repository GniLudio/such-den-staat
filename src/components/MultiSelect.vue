<template>
    <v-select
        :label="label"
        :items="items"
        v-model="model"
        :hint="hint"
        multiple
        persistent-hint
        class="multi-select"
        :menu-props="{ contentClass: 'multi-select' }">
        <template v-slot:prepend-item v-if="!hideToggleAll">
            <v-list-item :title="`Alle ${label}`" @click="toggleAllSelected" class="mb-2">
                <template v-slot:prepend>
                    <v-checkbox-btn :model-value="allSelected" style="pointer-events: none"></v-checkbox-btn>
                </template>
            </v-list-item>
        </template>
        <template v-slot:selection="{ index, item }">
            <v-label v-if="allSelected && index == 0">Alle {{ label }}</v-label>
            <v-chip v-else-if="!allSelected && index < maxDisplayed" label>
                {{ item.title }}
            </v-chip>
        </template>
    </v-select>
</template>
<script lang="ts" setup>
    import { computed, watch } from "vue";

    const props = defineProps({
        label: { type: String, default: "" },
        items: { type: Array<any>, default: new Array(0) },
        modelValue: { type: Array<any>, default: new Array(0) },
        maxDisplayed: { type: Number, default: 3 },
        hideToggleAll: { type: Boolean, default: false },
    });
    const model = defineModel({
        type: Array<any>,
        default: new Array(0),
    });

    const allSelected = computed(() => props.items.length == model.value.length);
    const hint = computed(() => {
        if (model.value.length > props.maxDisplayed && !allSelected.value) {
            return `+ ${model.value.length - props.maxDisplayed} Weitere`;
        }
        return undefined;
    });
    function toggleAllSelected(): void {
        model.value = allSelected.value ? [] : props.items.slice();
    }

    watch(model, (newValue, oldValue) => {
        if (newValue == oldValue) return;
        model.value.sort((a, b) => props.items.indexOf(a) - props.items.indexOf(b));
    });
</script>
