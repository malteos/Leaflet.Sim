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