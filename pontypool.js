function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}

function onError(e) {
    alert(e.message);
}

// BASEMAPS
var listUrl = 'https://services.thelist.tas.gov.au/arcgis/rest/services/Basemaps/{id}/ImageServer/tile/{z}/{y}/{x}'
var cc = 'Map data <img class="cc" src="https://mirrors.creativecommons.org/presskit/buttons/80x15/png/by-nc-nd.png" alt="CC BY-NC-ND"> the LIST &copy; State of Tasmania';

var topo = L.tileLayer(listUrl, {
    id: 'Topographic',
    attribution: cc,
    maxNativeZoom:18,
    maxZoom:20
});

var ortho = L.tileLayer(listUrl, {
    id: 'Orthophoto',
    attribution: cc,
    maxNativeZoom:18,
    maxZoom:20
});

var baseMaps = {
    "Topographic": topo,
    "Orthophoto": ortho
};

// VECTOR STYLES
var parcelStyle = {
    "color": "#ff7800",
    "weight": 1.5,
    "fillOpacity": 0
};

var roadStyle = {
    "color": "#ff0000",
    "weight": 3
};

var contourStyle = {
    "color": "#ff00ff",
    "weight": 1
};

// VECTOR LAYERS
var parcels = L.geoJSON(null,{
    attribution: cc,
    style: parcelStyle
});

var roads = L.geoJSON(null,{
    style: roadStyle
});

var contour = L.geoJSON(null,{
    style: contourStyle
});

var overlays = {
    "Parcels": parcels,
    "Roads": roads,
    "5m contour": contour
};

// load vecor data
$.getJSON('./parcels.geojson').done(function( data ) {
    parcels.addData(data.features);
});

$.getJSON('./roads.geojson').done(function( data ) {
    roads.addData(data.features);
});

$.getJSON('./5mcontour.geojson').done(function( data ) {
    contour.addData(data.features);
});

// MAP & CONTROLS
var map = L.map('mapid',{
    center: [-42.3308, 147.9555],
    zoom:17,
    layers: [ortho,parcels,roads]
});

L.control.layers(baseMaps, overlays).addTo(map);
L.control.locate().addTo(map);

// LOCATOR
//map.locate({setView: true, maxZoom: 16});
//map.on('locationfound', onLocationFound);
//map.on('locationerror', onError);