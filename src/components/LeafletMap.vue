<template>
    <div id="map"></div>
</template>
<script setup lang="ts">
    import "leaflet/dist/leaflet.css";
    import * as L from "leaflet";
    import markerIconUrl from "leaflet/dist/images/marker-icon.png";
    import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
    import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

    import { onMounted, onUnmounted } from "vue";
    import { leafletStore } from "@/stores/LeafletStore";

    L.Icon.Default.prototype.options.iconUrl = markerIconUrl;
    L.Icon.Default.prototype.options.iconRetinaUrl = markerIconRetinaUrl;
    L.Icon.Default.prototype.options.shadowUrl = markerShadowUrl;
    L.Icon.Default.imagePath = "";

    onMounted(() => {
        leafletStore.setup();
        const map = leafletStore.getMap();

        map.setView([50.505, 10], 7);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);
        map.attributionControl.setPosition("topright");
    });
    onUnmounted(() => {
        leafletStore.dispose();
    });
</script>
<style lang="css" scoped>
    #map {
        width: 100%;
        height: 100%;
    }
</style>
