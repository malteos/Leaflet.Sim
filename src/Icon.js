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