/**
 * LeafletSim handles general initialize of simulation map
 *
 */
L.Sim = L.Playback.extend({
    options: {
        displayObjectCallback: function (icon) {
        }
    },

    initialize: function (map, geoJSON, callback, options) {
        L.Playback.prototype.initialize.call(this, map, geoJSON, callback, options);

    },
    _callbacks: function (cursor) {
        var arry = this._callbacksArry;
        for (var i = 0, len = arry.length; i < len; i++) {
            arry[i](cursor, this); // Pass playback context to callback methods
        }
    }

});

L.Sim.selectedPin = false;

L.Sim.getTypeInfo = function (settings, typeName) {
    var typeInfo;
    
    // Define based on settings
    if (settings && settings.objectTypes) {
        // Type not defined
        if (!settings.objectTypes.hasOwnProperty(typeName)) {
            // console.log('Type not defined: ', typeName);

            if (settings.objectTypes.hasOwnProperty('default')) {
                // Default defined in settings
                typeInfo = settings.objectTypes['default'];
                typeInfo.name = 'default';
                // console.log('Using settings default type ', typeName);
            }

        } else {
            typeInfo = settings.objectTypes[typeName];
            typeInfo.name = typeName;
        }
    }

    if (!typeInfo) {
        // Using global default type
        typeInfo = L.Sim.Theme.defaultTypeInfo;
        // console.log('Using global default type ', typeInfo);
    }

    return typeInfo;
};

L.Sim.displayObjectDetails = function (icon) {

    console.log('display >> ', icon);

    // Properties in icon.agentProperties
    if (L.Sim.selectedPin) {
        L.Sim.selectedPin.off('move'); // Remove event listener if exist
    }

    L.Sim.selectedPin = icon; // Save selected pin

    // Add event handler
    if (icon.hasEventListeners('move')) {
        // console.log('ICON ALREADY SELECTED');
    } else {
        // console.log('EVENT LISTER added');
        icon.on('move', function (context) {
            // console.log('ON MOVE >> ', context);
            L.Sim.displayObjectDetails(context.target);
        });
    }

    // Use callback from theme
    if (L.Sim.Theme.displayObjectDetails) {
        L.Sim.Theme.displayObjectDetails(icon);    
    }
};
/**
 * Overwrites Playback MoveableMarker
 * - provides icon changes on properties change
 */

L.Playback.MoveableMarker.prototype._old_initialize = L.Playback.MoveableMarker.prototype.initialize;

L.Playback.MoveableMarker = L.Playback.MoveableMarker.extend({
    initialize: function (startLatLng, options, feature) {
        // this._old_initialize(startLatLng, options, feature);
        this.location = startLatLng;
        // this.title = 'no title';
        // this.groupIds = [];
        // this.agentProperties = {};

        var marker_options = options.marker || {};

        if (jQuery.isFunction(marker_options)) {
            marker_options = marker_options(feature);
        }

        L.Marker.prototype.initialize.call(this, startLatLng, marker_options);

        this.popupContent = '';
        this.feature = feature;

        if (marker_options.getPopup) {
            this.popupContent = marker_options.getPopup(feature);
        }

        if (options.popups) {
            this.bindPopup(this.getPopupContent() + startLatLng.toString());
        }

        if (options.labels) {
            if (this.bindLabel) {
                this.bindLabel(this.getPopupContent());
            }
            else {
                console.log("Label binding requires leaflet-label (https://github.com/Leaflet/Leaflet.label)");
            }
        }
    },

    setProperties: function (changes) {
        this.agentProperties = this.agentProperties || {};
        // If a properties of an agent changes, all actions are handled by this method.
        if (this.agentProperties == changes || jQuery.isEmptyObject(changes)) {
            return; // No need for change
        }

        var typeInfo = this._data.typeInfo;
        var changedOptions = jQuery.extend({}, typeInfo.options),  // clone to not overwrite changes in original type
            changesNum = 0;

        // Overwrite values with changes
        for (var i in changes) {
            if (changes.hasOwnProperty(i) && changes[i] != this.agentProperties[i]) {
                this.agentProperties[i] = changes[i]; // Set agentProperties for detail view

                // console.log('Changes: ', changes[i]);

                // Overwrite this._data.typeInfo.options with new values
                if (typeInfo && typeInfo.status && typeInfo.status.hasOwnProperty(i)) {
                    var idx = typeInfo.status[i].values.indexOf(changes[i]);

                    // console.log(this.title, ' - Marker change: ', i, ' >>> ', changes[i], ' >> ', typeInfo.status[i].valueOptions[idx]);

                    // Count and store changes
                    for (var k in typeInfo.status[i].valueOptions[idx]) {
                        changedOptions[k] = typeInfo.status[i].valueOptions[idx][k];
                        changesNum++;
                    }

                }
            }
        }

        // If changes happened, apply the via .setIcon()
        if (changesNum > 0) {
            // console.log('Set new ICON: ', changedOptions);
            this.setIcon(L.Sim.icon(changedOptions, typeInfo));
        }
    }
});


/**
 * Adds simulation methods to Playback Track class
 */

L.Playback.Track.prototype._old_initialize = L.Playback.Track.prototype.initialize;
L.Playback.Track.prototype._old_moveMarker = L.Playback.Track.prototype.moveMarker;

L.Playback.Track = L.Playback.Track.extend({
    initialize: function (geoJSON, options) {
        this._old_initialize(geoJSON, options);

        // Initialize property ticks
        this.propertyTicks = {};

        var changes = this._geoJSON.properties.changes;

        if (changes.length > 0 && changes.length != this._geoJSON.properties.time.length) {
            console.error('Time samples have different length than property changes!');
        } else {
            for (var i = 0; i < changes.length; i++) {
                this.propertyTicks[this._geoJSON.properties.time[i]] = changes[i];
            }
        }

        // console.log('TICKS = ', this.propertyTicks);
    },

    moveMarker: function (latLng, transitionTime, timestamp) {
        if (this._marker) {
            this._marker.setProperties(this.getPropertyChange(timestamp));
            this._old_moveMarker(latLng, transitionTime, timestamp);
        }
    },

    getPropertyChange: function (timestamp) {
        // Checks if properties are changes in this timestamp
        if (this.propertyTicks.hasOwnProperty(timestamp)) {
            return this.propertyTicks[timestamp];
        } else {
            return {};
        }
    }
});
/**
 * Overwrites Playback TrackController
 * - handles marker actions
 * - handles clustering
 */
L.Playback.TrackController.prototype._old_initialize = L.Playback.TrackController.prototype.initialize;

L.Playback.TrackController = L.Playback.TrackController.extend({
    initialize: function (map, tracks, options) {
        this._old_initialize(map, tracks, options);

    },


    _prepareClusters: function () {
        if (this._markersClusters)
            return;

        // Cluster object types separately
        this._markersClusters = {};
        for (var objectType in this.options.objectTypes) {
            // console.log(objectType);
            this._markersClusters[objectType] = L.Sim.markerClusterGroup({
                typeInfo: this.getTypeInfo(objectType)
            });

            this._map.addLayer(this._markersClusters[objectType]);
        }
    },

    addTrack: function (track, timestamp) {
        // return if nothing is set
        if (!track) {
            return;
        }


        // initialize marker
        var marker = track.setMarker(timestamp, this.options);
        marker = this.getMarkerIcon(marker, track);

        if (marker) {
            // Clusters
            if (this.options.enableClusters) {
                this._prepareClusters();

                // console.log('Adding marker with type = ', marker.type, ' to clusters: ', this._markersClusters);
                this._markersClusters[marker.type].addLayer(marker);

                markerCluster = this._markersClusters;
            } else {
                // No clusters
                marker.addTo(this._map);
            }

            // markers.addLayer(marker);
            // this._map.addLayer(this._markersClusters);

            this._tracks.push(track);
        }
    },

    getTypeInfo: function (typeName) {
        return L.Sim.getTypeInfo(this.options, typeName);
    },

    getMarkerIcon: function (marker, track) { // Returns marker icon depending on settings
        
        if (!track) {
            return;
        }

        var data = { // Get data from geoJSON file
            title: track._geoJSON.title,
            groupIds: track._geoJSON.groupIds,
            type: track._geoJSON.visualType
        };

        marker.title = data.title;
        marker.groupIds = data.groupIds;
        marker.type = data.type;

        // Set classes for group toggle
        // var extraClasses = 'map-icon ' + data.title + ' ' + richArrayImplode(data.groupIds, ' ', 'group-');

        // console.log('Object Types: ', this.options.objectTypes);
        // Defining type info
        var typeInfo = this.getTypeInfo(data.type);

        data['typeInfo'] = typeInfo;
        marker.typeInfo = typeInfo;
        marker.type = typeInfo.name;

        marker.options.icon = L.Sim.icon(typeInfo.options, typeInfo);
        marker._data = data;

        marker.on('click', function () {
            L.Sim.displayObjectDetails(this);
        });

        return marker;
    },

    handleEvents: function (timestamp) { // Triggers events depending on timestamp
        
        // console.log('Handle events at ', timestamp, ': ', this.options.events);
        // Default values
        this.options.events = this.options.events || {};
        this._eventMarkers = this._eventMarkers || [];

        var timestamp = timestamp / 1000; // Work around to support rounds instead of timestamps

        if (timestamp % 1 != 0) // Ignore intermediate steps
            return;

        var events = this.options.events[timestamp] || [];

        // Hide all other events
        for (var j = 0; j < this._eventMarkers.length; j++) {
            this._map.removeLayer(this._eventMarkers[j]);
        }
        this._eventMarkers = [];

        // Show new events
        for (var i = 0; i < events.length; i++) {
            var mapEvent = new L.Sim.Event(this, events[i]);

            mapEvent.addToLog(); // Add to log, log events auto-fade out

            if (mapEvent.hasLocation()) { // If was added to map, add to removal list
                this._eventMarkers.push(mapEvent.addToMap());
            }

        }

    },

    tock: function (timestamp, transitionTime) { // Computes changes of each round
        
        // console.log('TOCK = ', timestamp, ', transitionTime = ', transitionTime, '; track.length = ', this._tracks.length);

        // Clustering: remove before moving, add afterwards
        // this._markersClusters.onPlayback();
        var beforeClusters = {};
        this._markersCluster = this._markersCluster || {};

        for (var t in this._markersClusters) {
            beforeClusters[t] = this._markersClusters[t].getLayers();
            this._markersClusters[t].clearLayers();
        }

        // Events
        this.handleEvents(timestamp);

        // Move markers
        for (var i = 0, len = this._tracks.length; i < len; i++) {
            var lngLat = this._tracks[i].tick(timestamp);
            var latLng = new L.LatLng(lngLat[1], lngLat[0]);
            this._tracks[i].moveMarker(latLng, transitionTime, timestamp);

            // console.log('Change TO ...', this._propertyChanges[i]);
        }

        for (var t in this._markersClusters) {
            // Clustering: Add after moving
            // for (var i = 0; i < beforeClusters[t].length; i++) {
            //     this._markersClusters[t].addLayer(beforeClusters[t][i]);
            // }
            // Use bulk adding (better performance)
            this._markersClusters[t].addLayers(beforeClusters[t]);
        }

    }
});
/**
 * Representation of marker icons
 *
 * Supported types:
 * - circle
 * - rectangle
 * - awesome
 * - image
 *
 * If cluster is set, number of members is shown in label.
 *
 */

L.Sim.Icon = L.DivIcon.extend({
    initialize: function (options, typeInfo) {
        options = L.Util.setOptions(this, options);
        this.typeInfo = typeInfo;

    },
    setCluster: function (cluster) {
        this.cluster = cluster;
    },
    getClusterLabel: function () {
        var label = document.createElement('div');
        var childCount = this.cluster.getChildCount();

        // Choose label color depending on cluster size
        var c = ' sim-marker-label-';
        if (childCount < 10) {
            c += 'green';
        } else if (childCount < 100) {
            c += 'orange';
        } else {
            c += 'red';
        }

        label.innerHTML = '<div><span>' + childCount + '</span></div>';
        label.className = 'sim-marker-label ' + c;

        return label;
    },

    // Creates the final icon object that is added to a marker
    createIcon: function (oldIcon) {
        var div,
            typeInfo = this.typeInfo,
            options = this.options;

        if (typeInfo.type == 'rectangle') {
            div = this.createRectangleIcon(options);
        } else if (typeInfo.type == 'circle') {
            div = this.createCircleIcon(options);
        } else if (typeInfo.type == 'image') {
            div = this.createImageIcon(options);
        } else { // if(typeInfo.type == 'awesome') {
            div = this.createAwesomeIcon(options);
        }

        if (options.bgPos) {
            var bgPos = L.point(options.bgPos);
            div.style.backgroundPosition = (-bgPos.x) + 'px ' + (-bgPos.y) + 'px';
        }
        this._setIconStyles(div, 'icon');

        if (this.cluster) {
            div.appendChild(this.getClusterLabel());
        }

        // console.log(div);

        return div;
    },

    _setDivIconStyles: function (div) {
        for (var k in this.options) {
            div.style[k] = this.options[k];
        }
    },
    createAwesomeIcon: function (options) {
        var iconOptions = $.extend({}, options);

        iconOptions.iconSize = [35, 45];
        iconOptions.className = 'awesome-marker';
        iconOptions.prefix = 'fa';

        var icon = L.AwesomeMarkers.icon(iconOptions);
        options.iconSize = [35, 45]; // Fixed icon size for AwesomeMarker

        options.className = 'awesome-marker';
        options.className += ' awesome-marker-icon-' + (iconOptions.markerColor || 'blue');

        return icon.createIcon();
    },
    createCircleIcon: function (options) {
        var div = document.createElement('div');

        div.className = 'sim-marker sim-marker-circle';
        options.className = 'sim-marker sim-marker-circle';

        // Set radius last
        var r = parseInt(options.radius || 10);
        div.style.width = ( 2 * r ) + 'px';
        div.style.height = ( 2 * r ) + 'px';
        options.iconSize = [2 * r, 2 * r];

        return div;
    },
    createImageIcon: function (options) {
        var div = document.createElement('div'),
            options = this.options;
        var w = parseInt(options.width || 20),
            h = parseInt(options.height || 20);
        div.className = 'sim-marker sim-marker-image';
        options.className = 'sim-marker sim-marker-image';

        div.innerHTML = '<img src="' + (options.iconUrl || L.Sim.Theme.defaultIconUrl) + '" alt="">';

        options.iconSize = [w, h];

        return div;
    },
    createRectangleIcon: function (options) {
        var div = document.createElement('div');

        div.className = 'sim-marker sim-marker-rectangle';
        options.className = 'sim-marker sim-marker-rectangle';
        // this._setDivIconStyles(div);

        // Set width and height last
        var w = parseInt(options.width || 20),
            h = parseInt(options.height || 20);

        div.style.width = w + 'px';
        div.style.height = h + 'px';

        options.iconSize = [w, h];

        return div;
    }
});

L.Sim.icon = function (options, typeInfo) {
    return new L.Sim.Icon(options, typeInfo);
};
/**
 * Using custom icons for clustering (see L.MarkerClusterGroup for details)
 */

L.Sim.MarkerClusterGroup = L.MarkerClusterGroup.extend({
    _defaultIconCreateFunction: function (cluster) {
        var iconOptions = this.typeInfo.options || {};
        // console.log('_DEAFULT', this);

        var icon = L.Sim.icon(iconOptions, this.typeInfo);
        icon.setCluster(cluster);

        return icon;
    }
});

L.Sim.markerClusterGroup = function (options) {
    return new L.Sim.MarkerClusterGroup(options);
};
/**
 * Representation for location-based events
 *
 * Overwrite L.Sim.Theme.addEventToLog to display events in document.
 */

L.Sim.Event = L.Class.extend({
    initialize: function (context, data) {
        this.context = context;
        this.type = data.type;
        this.location = data.location;

    },

    getTypeInfo: function () { // Get type info from settings
        if (this.context.options.eventTypes.hasOwnProperty(this.type)) {
            return this.context.options.eventTypes[this.type];
        } else {
            console.log('EventType ', this.type, ' does not exist in ', this.context.options.eventTypes);
            return {};
        }
    },

    addToLog: function () {
        // Use callback from theme
        if (L.Sim.Theme.addEventToLog) {
            L.Sim.Theme.addEventToLog(this.getTypeInfo(), this.location);
        }
    },

    hasLocation: function () { // If location is valid
        return this.location && this.location.length == 2;
    },

    addToMap: function () {
        // Adds location marker to map
        
        var typeInfo = this.getTypeInfo();
        console.log('Adding Event to map with typeInfo: ', typeInfo);

        var marker = new L.marker(this.location, {
            icon: L.Sim.icon(typeInfo.options, typeInfo)
        });

        marker.addTo(this.context._map);
        return marker;
    }
});

/**
 * Default theme settings - this class should be overwrite or extend for implementation.
 */
L.Sim.Theme = {
    /**
     * This icon type is used if an icon as an invalid type and if no default type is provided by settings.
     * All icon types and their options are supported (L.Sim.Icon).
     */
    defaultTypeInfo: {
        type: "circle",
        name: "default", // Needs to be default
        radius: 10,
        options: {
            fillColor: "#ff0000"
        }
    },

    /**
     * Default URL for image icons.
     */
    defaultIconUrl: '/static/assets/images/drone.png',

    /**
     * This method is called on click on a moving object. You can use this method to display the object properties
     * in a separate view, e.g. sidebar.
     *
     * @param icon Instance of L.Icon.Sim
     */
    displayObjectDetails: function (icon) {
        console.log('L.Sim.Theme: displayObjectDetails is not set.');
    },

    /**
     * This method is called when an event is triggered on playback. You can use this method to display the event
     * in a separate view, e.g. sidebar.
     *
     * @param typeInfo
     * @param location Location as String
     */
    addEventToLog: function (typeInfo, location) {
        console.log('L.Sim.Theme: addEventToLog is not set.');
    }
};
