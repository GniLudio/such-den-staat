<template>
    <v-select :label="label" :items="items" v-model="model" multiple chips hide-details class="multi-select"
        :suffix="suffix" ref="vselect" :menu-props="{ contentClass: 'multi-select' }">
        <template v-slot:prepend-item v-if="showToggleAll">
            <v-list-item :title="`Alle ${label}`" @click="toggleAllSelected" class="mb-2">
                <template v-slot:prepend>
                    <v-checkbox-btn :model-value="allSelected" style="pointer-events: none"></v-checkbox-btn>
                </template>
            </v-list-item>
        </template>
    </v-select>
</template>
<script lang="ts" setup generic="T">
    import { computed, onMounted, ref, watch } from 'vue';
    import { VSelect } from 'vuetify/components';

    const props = defineProps({
        label: {
            type: String,
            required: false,
        },
        items: {
            type: Array<T>,
            default: new Array(0),
        },
        showToggleAll: {
            type: Boolean,
            default: false,
        },
        sortSelected: {
            type: Boolean,
            default: false,
        }
    });
    const model = defineModel<T[]>({
        type: Array<T>,
        default: new Array(0),
    });

    const hiddenCount = ref<number>(0);
    const vselect = ref<VSelect>();
    const allSelected = computed<boolean>(() => props.items.length == model.value.length);
    const suffix = computed<string | undefined>(() => (hiddenCount.value > 0) ? `+${hiddenCount.value}` : undefined);

    watch(model, (newValue, oldValue) => {
        if (newValue == oldValue) return;
        if (!props.sortSelected) return;
        model.value.sort((a, b) => props.items.indexOf(a) - props.items.indexOf(b));
    });
    watch(model, () => requestAnimationFrame(updateVisibility));
    onMounted(() => new ResizeObserver(updateVisibility).observe(vselect.value?.$el));

    function toggleAllSelected(): void {
        model.value = allSelected.value ? [] : props.items.slice();
    }

    function updateVisibility(): void {
        if (!vselect.value) return;

        const element: HTMLElement = vselect.value.$el;
        const children: HTMLElement[] = Array.from(element.querySelectorAll<HTMLElement>(".v-select__selection"));

        children.forEach((child) => child.style.display = "unset");
        hiddenCount.value = children.length;

        const tops = children.map((child) => child.getBoundingClientRect().top);
        const top = Math.min(...tops);

        for (let i = 0; i < children.length; i++) {
            if (tops[i] > top) {
                children[i].style.display = "none";
            } else {
                hiddenCount.value--;
            }
        }
    }
</script>
<style lang="css">
    .multi-select .v-field__field {
        justify-content: center;
        text-align: center;
    }

    .multi-select .v-field__input {
        justify-content: center;
    }

    .multi-select .v-list-item {
        text-align: center;
    }

    .multi-select .v-input__details {
        text-align: center;
    }

    .multi-select .v-text-field__suffix {
        padding: 0;
    }
</style>
