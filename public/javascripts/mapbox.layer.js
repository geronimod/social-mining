
OpenLayers.Layer.MapBox = OpenLayers.Class(OpenLayers.Layer.XYZ, {
    initialize: function(name, options) {
        if (!options.token) {
          throw "Please provide a token property in options (your API token).";
        }

        if (!options.mapId) {
          throw "Please provide a mapId property in options (Map ID).";
        }

        options = OpenLayers.Util.extend({
            attributionControl: false,
            maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),
            maxResolution: 156543.0339,
            units: "m",
            projection: "EPSG:900913",
            isBaseLayer: true,
            numZoomLevels: 19,
            displayOutsideMaxExtent: true,
            wrapDateLine: true
        }, options);

        var url = "http://a.tiles.mapbox.com/v4/" +
                   options.mapId +
                   "/${z}/${x}/${y}.png?access_token=" +
                   options.token;

        var newArguments = [name, url, options];
        OpenLayers.Layer.XYZ.prototype.initialize.apply(this, newArguments);
    },

    getURL: function (bounds) {
        var res = this.map.getResolution();
        var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
        var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
        var z = this.map.getZoom();
        var limit = Math.pow(2, z);

        x = ((x % limit) + limit) % limit;

        var url = this.url.replace('${z}', z).
                           replace('${x}', x).
                           replace('${y}', y);

        return url;
    },

    CLASS_NAME: "OpenLayers.Layer.MapBox"
});