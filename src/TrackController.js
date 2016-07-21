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