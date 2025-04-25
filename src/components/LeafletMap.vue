<template>
    <div id="map"></div>
</template>
<script setup lang="ts">
    import { useLeafletStore } from '@/stores/leafletStore';
    import { LocateControl, type LocateOptions } from 'leaflet.locatecontrol';
    import { onMounted } from 'vue';

    import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";
    import "leaflet/dist/leaflet.css";
    import "leaflet-boundary-canvas";
    import * as L from "leaflet";
    import markerIconUrl from "leaflet/dist/images/marker-icon.png";
    import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
    import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

    L.Icon.Default.prototype.options.iconUrl = markerIconUrl;
    L.Icon.Default.prototype.options.iconRetinaUrl = markerIconRetinaUrl;
    L.Icon.Default.prototype.options.shadowUrl = markerShadowUrl;
    L.Icon.Default.imagePath = "";

    // Options
    const mapOptions: L.MapOptions = {
        zoomControl: false,
        zoom: 7,
        center: [51.25, 10],
        attributionControl: true, // to reuse the default leaflet attribution
    };
    const locateOptions: LocateOptions = {
        position: "topright",
        flyTo: true,
        showPopup: false,
        setView: "once",
        drawCircle: true,
    };

    const emit = defineEmits(["on-search"]);
    onMounted(async () => {
        const map: L.Map = L.map("map", mapOptions);
        useLeafletStore().setMap(map);
        initializeTileLayer(map);
        initializeAttributions(map);
        initializeControls(map);
        preloadMarker(map);
    });

    async function initializeTileLayer(map: L.Map): Promise<void> {
        if (true) {
            // TODO: Simplify geojson for borders
            // TODO: Include islands
            // TODO: Add toggle to settings
            new L.TileLayer.BoundaryCanvas("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                boundary: (await useLeafletStore().boundary).data.value
            }).addTo(map);
        } else {
            L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
        }
    }

    function initializeAttributions(map: L.Map): void {
        const leafletAttribution: string = (map.attributionControl.options.prefix ?? "") as string;
        const osmAttribution: string = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
        const bundDevAttribution: string = '<a href="https://bund.dev/">bund.dev</a>'; // TODO: Add icon
        const githubAttribution: string = '<a href="https://github.com/GniLudio/such-den-staat">GitHub</a>'; // TODO: Add icon

        const leftAttribution: string = bundDevAttribution + " | " + githubAttribution;
        const rightAttribution: string = leafletAttribution + " | " + osmAttribution;

        map.attributionControl.remove(); // remove default leaflet attribution
        L.control.attribution({ position: "bottomleft", prefix: leftAttribution }).addTo(map);
        L.control.attribution({ position: "bottomright", prefix: rightAttribution }).addTo(map);
    }

    function initializeControls(map: L.Map): void {
        L.control.zoom({ position: "topright" }).addTo(map);
        new LocateControl(locateOptions).addTo(map);

        new (L.Control.extend({
            onAdd: function (map: L.Map): HTMLElement {
                const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");

                const button = L.DomUtil.create("a", undefined, div);
                const icon = L.DomUtil.create("span", "mdi mdi-magnify", button);
                icon.style.fontSize = "2em";

                L.DomEvent.on(
                    button,
                    "click",
                    function (ev) {
                        L.DomEvent.stopPropagation(ev);
                        L.DomEvent.preventDefault(ev);
                        emit("on-search");
                        icon.classList.toggle("mdi-magnify");
                        icon.classList.toggle("mdi-magnify-remove-outline");
                    },
                    this,
                ).on(button, "dblclick", L.DomEvent.stopPropagation);

                return div;
            },
        }))().addTo(map);
    }

    function preloadMarker(map: L.Map): void {
        L.marker([50, 9], { opacity: 0.01 }).addTo(map);
    }
</script>
<style lang="css" scoped>
    #map {
        width: 100%;
        height: 100%;
    }
</style>
