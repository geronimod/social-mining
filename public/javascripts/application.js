var App = {
  zoom: 13,

  centerLat: -37.3213732,
  centerLon: -59.1334196,

  minLat: -37.331376800537,
  maxLat: -37.31137298584,
  minLon: -59.143422851562,
  maxLon: -59.123419036865,

  defaultIconUrl: 'https://www.openlayers.org/dev/img/marker.png',
  defaultIcon: new OpenLayers.Icon('https://www.openlayers.org/dev/img/marker.png',
                new OpenLayers.Size(21,25)),
  checkIcon: new OpenLayers.Icon('images/check-icon.png', new OpenLayers.Size(20,34)),

  projection: new OpenLayers.Projection("EPSG:900913"),
  displayProjection: new OpenLayers.Projection("EPSG:4326"),

  subjectSyle: new OpenLayers.StyleMap({
    'default': {
      fillColor: "${color}",
      strokeColor: "#000000",
      strokeWidth: 0.5,
      pointRadius: 2,
      pointerEvents: "visiblePainted",
      fillOpacity: 0.4,
      label: "${id}",
      fontColor: "${color}",
      fontSize: "${fontSize}",
      fontFamily: "Courier New, monospace",
      fontWeight: "bold",
      labelXOffset: "0",
      labelYOffset: "${yOff}"
    },

    'hover': {
      strokeWidth: 1,
      pointRadius: 6,
    },

    'select': {
      fillColor: "#0000ff",
      strokeColor: "#0000ff",
      strokeWidth: 2,
      pointRadius: 2,
    }
  }),

  subjects: [],
  routes: [],

  routesTimeout: 3000,
  subjectsCount: 5,
  subjectsTimeout: 1,

  run: function(dom_id) {
    this.initMap(dom_id);
    this.initSimulation();
  },

  initMap: function(dom_id) {
    map = new OpenLayers.Map(dom_id, {
                controls:[
                  new OpenLayers.Control.Navigation(),
                  new OpenLayers.Control.PanZoomBar(),
                  new OpenLayers.Control.LayerSwitcher(),
                  // new OpenLayers.Control.Attribution()
                ],
                maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),
                maxResolution: 156543.0399,
                numZoomLevels: 19,
                units: 'm',
                projection: this.projection,
                displayProjection: this.displayProjection
              });


    OSMLayer       = new OpenLayers.Layer.OSM("Default");
    cloudMadeLayer = new OpenLayers.Layer.CloudMade('CloudMade', {
                        key: '1db40c58e84d483d89a9951da9589d4e',
                        styleId: '9329'//52535'
                     });

    surfaceLayer   = new Canvas.Layer("Traces");
    subjectsLayer  = new OpenLayers.Layer.Vector("Subjects", {
                           styleMap: this.subjectSyle
                         });

    map.addLayers([OSMLayer, cloudMadeLayer, subjectsLayer]);
    map.setBaseLayer(OSMLayer);

    this.initLayers();

    var lonLat = new OpenLayers.LonLat(this.centerLon, this.centerLat).
                     transform(this.displayProjection, this.projection);

    map.setCenter(lonLat, this.zoom);
  },

  initLayers: function() {
    OSMLayer.id = 'OSM';
  },

  initSimulation: function() {
    this.runTests();
    // this.drawSubjects();
    // this.getRoutes();
  },

  __subjectsCount: function() {
    // let url = new URL(window.location.href);
    // let params = new URLSearchParams(url.search);
    // return params.get('subjects') || this.subjectsCount;
    return this.subjectsCount;
  },

  runTests: function() {
    for(let i = 0; i < this.__subjectsCount(); i++){
      this.routingTest();
    }
    // this.canvasTest();
    // this.pointTest();
  },

  drawSubjects: function() {
    var self = this;

    $(this.subjects).each(function(ix, subject){
      subject.update();
    });

    setTimeout(function(){ self.drawSubjects(); }, self.subjectsTimeout);
  },

  addSubject: function(data) {
    var subject = new Subject({
      color: this._randomColor(),
      attributes: data
    });

    subject.setWayPoints(data.route);
    // subject.onmove = this.drawTrace;
    subjectsLayer.addFeatures([subject.f]);
    this.subjects.push(subject);
  },

  drawTrace: function(subject, origin, destiny) {
    pixel1 = surfaceLayer.geoToPixel(origin.y, origin.x);
    pixel  = surfaceLayer.geoToPixel(destiny.y, destiny.x);

    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = "#2103b5";
    ctx.lineWidth = 0.5 * (1 + (map.zoom - 8));
    ctx.beginPath();
    ctx.moveTo(pixel1[0], pixel1[1]);
    ctx.lineTo(pixel[0], pixel[1]);
    ctx.stroke();
  },

  getRoutes: function() {
    var self = this;

    $.ajax("/routes", {
      data: { limit: 1 },
      dataType: 'json'

    }).done(function(routes){
      $(routes).each(function(ix, data){
        var route = [];
        $(data.route).each(function(ix, latLon){
          var lonLat = self._toLonLat(latLon);
          route.push([lonLat.lat, lonLat.lon]);
        });

        data.route = route;
        if (data.route.length > 0)
          self.addSubject(data);
      });

    }).fail(function(resp){
      console.log("Routes fails", resp);
    });

    setTimeout(function(){ self.getRoutes(); }, self.routesTimeout);
  },

  _toLonLat: function(latLon) {
    return new OpenLayers.LonLat(latLon[1], latLon[0]).transform(
                                  this.displayProjection, this.projection
                                );
  },

  _randomColor: function() {
    var hex   = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += hex[Math.round(Math.random() * 15)];
    }
    return color;
  },

// Test methods

  routingTest: function() {
    var self  = this,
        start = [448193281, -37.320608, -59.1255112],
        end   = [448193312, -37.3223495, -59.1262886];


    this.drawPoint(start[1], start[2]);
    this.drawPoint(end[1], end[2]);

    $.ajax("/route/" + start[0] + "/" + end[0] + "/by/cycle", {
      dataType: 'json'
    }).done(function(route){
      var data = {};

      route = $.map(route, function(latLon, ix){
        var lonLat = self._toLonLat(latLon);
        return [[lonLat.lat, lonLat.lon]];
      });

      if (route.length > 0) {
        data.route = route;
        self.addSubject(data);
      }
    }).fail(function(resp){
      console.log("Routes fails", resp);
    });

    this.drawSubjects();
  },

  canvasTest: function() {
    // canvas test
    ctx = surfaceLayer.canvas.getContext('2d');
    ctx.lineCap = "square";

    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.lineWidth = 100; //0.5 * (1 + (map.zoom - 8));
    ctx.beginPath();
    ctx.moveTo(10, 10);

    ctx.lineTo(50, 50);
    ctx.stroke();
  },

  drawPoint: function(lat, lon) {
    var point = new OpenLayers.Feature.Vector(
      new OpenLayers.Geometry.Point(lon, lat).
                     transform(this.displayProjection, this.projection),
      { id: '', color: 'red', pointRadius: "100" }
    );

    subjectsLayer.addFeatures([point]);
  },

// unused methods

  _drawPath: function(layer, data, latLons) {
    var self = this;
    var startAt = latLons.shift();
    var marker  = new OpenLayers.Marker(startAt, this.checkIcon);
    layer.addMarker(marker);

    $(latLons).each(function(ix, latLon) {
      setTimeout(function(){
        // marker.moveTo(map.getLayerPxFromLonLat(latLon));

        var vectorLayer = new OpenLayers.Layer.Vector();
        var feature = new OpenLayers.Feature.Vector(
          new OpenLayers.Geometry.Point(latLon.lon, latLon.lat).transform(self.displayProjection, self.projection),
          {externalGraphic: self.defaultIconUrl, graphicHeight: 25, graphicWidth: 20
        });

        vectorLayer.addFeatures([feature]);
        map.addLayer(vectorLayer);

      }, 1000);
    });


    // var vectorLayer = new OpenLayers.Layer.Vector(data.name);
    // var feature = new OpenLayers.Feature.Vector(
    //   new OpenLayers.Geometry.Point(lon, lat).transform(self.displayProjection, self.projection),
    //   {vcid: lon+lat },
    //   {externalGraphic: self.defaultIconUrl, graphicHeight: 25, graphicWidth: 20});

    // vectorLayer.addFeatures([feature]);
    // map.addLayer(vectorLayer);

    // $(points).each(function(ix, point){

    // });

    // var vectorLayer = new OpenLayers.Layer.Vector(data.name);
    // var feature = new OpenLayers.Feature.Vector(
    //   new OpenLayers.Geometry.Point(lon, lat).transform(self.displayProjection, self.projection),
    //   {vcid: lon+lat },
    //   {externalGraphic: self.defaultIconUrl, graphicHeight: 25, graphicWidth: 20});

    // vectorLayer.addFeatures([feature]);
    // map.addLayer(vectorLayer);

  },

  __drawPath: function(data, points) {
    var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
    renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

    var vector = new OpenLayers.Layer.Vector(data.name, {
      styleMap: new OpenLayers.StyleMap({'default': {
        strokeColor: "${strokeColor}",
        strokeOpacity: 1,
        strokeWidth: 2,
        fillColor: "#FF5500",
        fillOpacity: 0.5,
        pointRadius: 6,
        pointerEvents: "visiblePainted",
        // label with \n linebreaks
        // label : "name: ${name}\n\nage: ${age}",
        fontColor: "${fontColor}",
        fontSize: "10px",
        fontFamily: "Courier New, monospace",
        fontWeight: "normal",
        labelAlign: "${align}",
        labelXOffset: "${xOffset}",
        labelYOffset: "${yOffset}",
        labelOutlineColor: "white",
        labelOutlineWidth: 3
      }}),

      renderers: renderer
    });

    var pathFeature = new OpenLayers.Feature.Vector(
      new OpenLayers.Geometry.LineString(points)
    );

    pathFeature.attributes = {
      name: '',//data.name,
      age: '',//data.age,
      strokeColor: this._randomColor(),
      fontColor: 'black', //this.randomColor(),
      align: "cm"
    };

    vector.addFeatures([pathFeature]);

    try {
      map.addLayer(vector);
      console.log(data.name + ' added');
    } catch(e) {
      console.log(e);
    }
  },

  drawRandomMarkers: function() {
    var latLons = [];

    for (var i = 0; i < 50; i++) {
      var ran1 = Math.random();
      var ran2 = Math.random();

      var lat = ran1 * this.maxLat + (1 - ran1) * this.minLat;
      var lon = ran2 * this.maxLon + (1 - ran2) * this.minLon;

      latLons.push([lat,lon]);
    }

    function draw(self, ix_key) {
      if (ix_key < 0) return;

      var lat = latLons[ix_key][0];
      var lon = latLons[ix_key][1];

      // var lonLat = new OpenLayers.LonLat(lon, lat).transform(
      //                                     self.displayProjection, self.projection
      //                                   );

      var vectorLayer = new OpenLayers.Layer.Vector("Marker " + ix_key);
      var feature = new OpenLayers.Feature.Vector(
                    new OpenLayers.Geometry.Point(lon, lat).transform(self.displayProjection, self.projection),
                        {vcid: lon+lat },
                        {externalGraphic: self.defaultIconUrl, graphicHeight: 25, graphicWidth: 20});

      vectorLayer.addFeatures([feature]);
      map.addLayer(vectorLayer);

      setTimeout((function(self, ix_key) {
        return function() { draw(self, --ix_key) }
      })(self, ix_key, 0));

    };

    draw(this, latLons.length-1);

  }


};
