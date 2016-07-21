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
