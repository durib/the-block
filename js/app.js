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
var listBasemapUrl = 'https://services.thelist.tas.gov.au/arcgis/rest/services/Basemaps/{id}/ImageServer/tile/{z}/{y}/{x}'; 
var listWMSUrl = 'http://services.thelist.tas.gov.au/arcgis/services/Public/{id}/MapServer/WMSServer?';
var cc = 'Map data <img class="cc" src="https://mirrors.creativecommons.org/presskit/buttons/80x15/png/by-nc-nd.png" alt="CC BY-NC-ND"> the LIST &copy; State of Tasmania';

var topo = L.tileLayer(listBasemapUrl, {
    id: 'Topographic',
    attribution: cc,
    maxNativeZoom:18,
    maxZoom:20
});

var ortho = L.tileLayer(listBasemapUrl, {
    id: 'Orthophoto',
    attribution: cc,
    maxNativeZoom:18,
    maxZoom:20
});

var baseMaps = {
    "Topographic": topo,
    "Orthophoto": ortho
};

// WMS LAYERS
var cadParcels = L.tileLayer.wms(listWMSUrl, {
    id: 'CadastreParcels',
    layers: '0',
    format: 'image/png',
    transparent: true,
    attribution: cc
});

var contour = L.tileLayer.wms(listWMSUrl, {
    id: 'TopographyAndRelief',
    layers: '38',
    format: 'image/png',
    transparent: true,
    attribution: cc
});

var landTeunre = L.tileLayer.wms(listWMSUrl, {
    id: 'CadastreAndAdministrative',
    layers: '32',
    format: 'image/png',
    transparent: true,
    attribution: cc,
    opacity: 0.6
});

// VECTOR STYLES
var parcelStyle = {
    "color": "#ff7800",
    "weight": 1.5,
    "fillOpacity": 0.25
};

var ourParcelStyle = {
    "color": "#ff7800",
    "weight": 1.5,
    "fillColor": "#73b7d8",
    "fillOpacity": 0.2
};

var casementStyle = {
    "color": "#ff7800",
    "weight": 1.5,
    "fillColor": "#797979",
    "fillOpacity": 0.4
};

var roadStyle = {
    "color": "#ff0000",
    "weight": 3
};

/*var contourStyle = {
    "color": "#ff00ff",
    "weight": 1
};*/

// VECTOR LAYERS
var ourParcels = L.geoJSON(null,{
    attribution: cc,
    style: function(feature, layer) {
        if (feature.properties.PID == 3516619){
            return ourParcelStyle
        } else if (feature.properties.CAD_TYPE1 == 'Casement') {
            return casementStyle
        } else {
            return parcelStyle
        }
    }
});

var roads = L.geoJSON(null,{
    style: roadStyle,
    onEachFeature: function(feature, layer) {
        var label = L.marker([feature.properties.labelY, feature.properties.labelX], {
            icon: L.divIcon({
                className: 'label',
                html: '<div style="padding-bottom:5px;transform:rotate('+feature.properties.bearing+'deg)">'+feature.properties.Length+'m</div>'
            })
        }).addTo(map);
      }
});

/*var contour = L.geoJSON(null,{
    style: contourStyle
});*/

var overlays = {
    "The Block": ourParcels,
    "Roads": roads,
    "5m contour": contour,
    "Parcels": cadParcels,
    "Land Tenure" : landTeunre
};

// load vecor data
$.getJSON('./data/parcels.geojson').done(function( data ) {
    ourParcels.addData(data.features);
});

$.getJSON('./data/roads.geojson').done(function( data ) {
    roads.addData(data.features);
});

/*$.getJSON('./data/5mcontour.geojson').done(function( data ) {
    contour.addData(data.features);
});*/

// MAP & CONTROLS
var map = L.map('mapid',{
    center: [-42.3308, 147.9555],
    zoom:17,
    layers: [ortho,ourParcels,roads]
});

L.control.layers(baseMaps, overlays).addTo(map);
L.control.locate().addTo(map);
//wmsLayer.addTo(map);

// LEGEND
//landTenureLegendUrl = listServicesUrl + 'Public/CadastreAndAdministrative/MapServer/WmsServer?';
//landTenureLegendUrl += 'request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=32';
//L.wmsLegend(landTenureLegendUrl);

// LOCATOR
//map.locate({setView: true, maxZoom: 16});
//map.on('locationfound', onLocationFound);
//map.on('locationerror', onError);