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