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
