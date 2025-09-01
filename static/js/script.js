let initMap = () => {
    let map = L.map('map', { attributionControl: false, doubleClickZoom: false }).setView([44.80, 20.45], 13);

    L.tileLayer('https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i349018013!3m9!2sen-US!3sUS!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!4e0',
        { maxZoom: 19 }).addTo(map);

    let markers = [];
    let polylines = [];
    let allObjects = [];

    let createMarker = (popLocation) => {
        let marker = L.circleMarker(popLocation, { color: 'red', fillColor: 'red', fillOpacity: 1.0, radius: 3 });
        markers.push(marker);
        allObjects.push(marker);
        return marker;
    }

    let createPolyline = () => {
        let path = [
            markers[markers.length - 2].getLatLng(),
            markers[markers.length - 1].getLatLng()
        ];
        let polyline = L.polyline(path, { color: 'red' }).addTo(map);
        polylines.push(polyline);
        allObjects.push(polyline);
        return polyline;
    }

    let createTooltip = () => {
        let tooltip = L.tooltip({ offset: L.point(5, 0), permanent: true });
        allObjects.push(tooltip);
        return tooltip;
    }

    let clearAll = () => {
        allObjects.forEach(o => o.remove());
        allObjects = [];
        markers = [];
        polylines = [];
    }

    let calcDistance = (markers) => {
        if (markers.length < 2) return "";
        let totalDistance = 0;
        for (let i = 0; i < markers.length - 1; i++) {
            totalDistance += markers[i].getLatLng().distanceTo(markers[i + 1].getLatLng());
        }
        return (totalDistance / 1000).toFixed(1) + " km";
    }

    let updateLastDistance = () => {
        document.getElementById("total-distance").innerHTML = calcDistance(markers);
    }

    let removeLastPoint = () => {
        if (markers.length > 0) markers.pop().remove();
        if (polylines.length > 0) polylines.pop().remove();
        updateLastDistance();
    }

    let finishPath = () => {
        if (markers.length > 1) {
            let lastLocation = markers[markers.length - 1].getLatLng();
            createTooltip().setLatLng(lastLocation)
                           .setContent(`<div class="maptooltip">${calcDistance(markers)}</div>`)
                           .addTo(map);
        }
        markers = [];
        polylines = [];
        updateLastDistance();
    }

    // Desktop dblclick
    map.on('dblclick', e => {
        finishPath();
    });

    // Simulacija double-tap na mobilnim uređajima
    let lastTap = 0;
    map.on('touchend', e => {
        let currentTime = new Date().getTime();
        let tapLength = currentTime - lastTap;
        if (tapLength < 500 && tapLength > 0) { // dvoklik ako su dodiri < 500ms
            finishPath();
        }
        lastTap = currentTime;
    });

    map.on('click', e => {
        let popLocation = e.latlng;
        let marker = createMarker(popLocation);
        if (markers.length === 1) marker.addTo(map);
        if (markers.length >= 2) {
            createPolyline();
            updateLastDistance();
        }
    });

    map.on('contextmenu', e => removeLastPoint());

    document.getElementById('clear').addEventListener('click', function () {
        clearAll();
        updateLastDistance();
    });
};
