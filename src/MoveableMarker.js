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

