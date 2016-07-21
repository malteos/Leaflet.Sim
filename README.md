# Leaflet.Sim

Leaflet.Sim is a framework for location-based simulations with Leaflet maps that can visualize moving markers, which can change their style, and events over time on a map.

This framework is based on [Leaflet Playback](https://github.com/hallahan/LeafletPlayback), [Awesome Markers](https://github.com/lvoogdt/Leaflet.awesome-markers) and [Marker Clustering](https://github.com/Leaflet/Leaflet.markercluster). Leaflet.Sim was developed during the [Application System Project](https://www.aot.tu-berlin.de/index.php?id=2874) (UAVs in Smart Cities) of [DAI-Labor](http://www.dai-labor.de/) at [TU Berlin](https://www.tu-berlin.de/).

## Usage
```javascript

var map = new L.Map('map-container', {
    center: [30.0, 3.0],
    zoom: 2
});

var sim = new L.Sim(map, data, null, simOptions);

// Initialize custom control
var control = new L.Playback.Control(playback);
control.addTo(map);

```

## Options & data format

See example JSON files:
- [examples/data.json](examples/data.json)
- [examples/options.json](examples/options.json)

#### Marker Options

Event and object markers can be displayed with four different types. To use a type the respective name (in bold) must be the *type* parameter in the object type settings.
For each type the following options are required and/or available (use *option* parameter).

- HTML-based icons (for each type all [DOM style properties](http://www.w3schools.com/jsref/dom_obj_style.asp) are available)
    - **circle**:
        - *radius* (int)
    - **rectangle**:
        - *width* (int)
        - *height* (int)
    - **image**:
        - *iconUrl* URL to image file
        - *width* (int)
        - *height* (int)
- **awesome**: See Awesome Markers [GitHub page](https://github.com/lvoogdt/Leaflet.awesome-markers).


## Theme options

To adjust LeafletSim depending on your needs, you must overwrite the options of L.Sim.Themes:

```javascript
// Toggle marker details in #objectDetailsPanel container (via angular scope)

L.Sim.Theme.displayObjectDetails = function (icon) {

    // Add icon to detail view
    var scope = angular.element($("#objectDetailsPanel")).scope();
    scope.$apply(function () {
        scope.selectedPin = {
            leafletId: icon._leaflet_id,
            data: icon._data,
            loc: icon._latlng.lat + ' / ' + icon._latlng.lng,
            properties: icon.agentProperties
        };
    });
    $('#objectDetailsPanel').show();
};

// Adds and fade outs event to #event container
L.Sim.Theme.addEventToLog = function (typeInfo, location) {
    var fadeOutDuration = 3000;
    var logContainer = $('#events');

    var div = document.createElement('div');

    if (typeInfo) {
        $(div).html('<strong>' + typeInfo.title + ':</strong> ' + typeInfo.description);
        $(div).addClass(typeInfo.class);
    } else {
        $(div).text('Unknown Event');
        $(div).addClass('alert alert-info');
    }

    logContainer.append(div);

    $(div).fadeOut(fadeOutDuration);
};

```

## License

MIT
