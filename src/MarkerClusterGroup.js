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