var Variables = function(page) {
  // this.page = page;
  // this.subLayers = {};
  this.selectedVariable = 'tasmax';
  this.createMap();
  this.wireSearch();
};




/*
* Create map
*
*
*/
Variables.prototype.createMap = function() {
  var view = new ol.View({
    center: ol.proj.transform([-105.21, 37.42], 'EPSG:4326', 'EPSG:3857'),
    zoom: 5
  });

  this.map = new ol.Map({
    target: 'variable-map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.MapQuest({layer: 'osm'})
      })
    ],
    view: view
  });

  this.popup = new ol.Overlay.Popup();
  this.map.addOverlay(this.popup);

  //add layers to map and wire events
  this.addCounties();
  this.addStates();
  this.addStations();
  this.wire();
};



Variables.prototype.wireSearch = function() {
  var self = this;

  $("#formmapper").formmapper({
      details: "form"
  });

  $("#formmapper").bind("geocode:result", function(event, result){
    var lat = result.geometry.access_points[0].location.lat;
    var lon = result.geometry.access_points[0].location.lng;

    var conv = ol.proj.transform([lon, lat], 'EPSG:4326','EPSG:3857');
    var xy = self.map.getPixelFromCoordinate(conv);

    self.map.getView().setZoom(8);
    self.map.getView().setCenter(conv);

    setTimeout(function() {
      var center = self.map.getView().getCenter();
      xy = self.map.getPixelFromCoordinate(center);

      var feature = self.map.forEachFeatureAtPixel(xy, function(feature, layer) {
        var id = layer.get('layer_id');
        if ( id === 'states' ) {
          return null;
        } else {
          return feature;
        }
      });

      var e = {};
      e.mapBrowserEvent = {};
      e.mapBrowserEvent.coordinate = center;
      if (feature) {
        self.selected_collection.clear();
        self.selected_collection.push(feature);
        var props = feature.getProperties();
        if ( !props.station ) {
          self.countySelected(feature, e);
        }
      } else {
        self.popup.hide();
      }
    },200);

  });
};




/*
* Wire map and UI events
*
*
*/
Variables.prototype.wire = function() {
  var self = this;

  // help icon
  $('#vars-menu .help').click(function (e) {
    e.preventDefault();
    var current_legend = $(this).parents('.legend');
    if (current_legend.hasClass('info-on')) {
      $('body').close_layer_info();
    } else {
      current_legend.open_layer_info();
    }
  });


  //layer show / hide handlers
  $('#counties-overlay-toggle').on('click', function() {
    var show = $(this).is(':checked');
    self.map.getLayers().forEach(function(layer) {
      if (layer.get('layer_id') == 'counties') {
        layer.setVisible(show);
      }
    });
  });


  $('#weather-overlay-toggle').on('click', function() {
    var show = $(this).is(':checked');
    self.map.getLayers().forEach(function(layer) {
      if (layer.get('layer_id') == 'stations') {
        layer.setVisible(show);
      }
    });
  });

  //var selector
  $('.fs-dropdown-item').on('click', function(e) {
    self.selectedVariable =  $(this).data().value;
    self.updateChart();
  });

  //map click selector
  var select = new ol.interaction.Select({
    layers: function(layer) {
      if ( layer.get('layer_id') === 'states' ) {
        return false;
      } else {
        return true;
      }
    },
    condition: ol.events.condition.click
  });

  this.map.addInteraction(select);

  this.selected_collection = select.getFeatures();

  select.on('select', function(e) {

    var feature = self.map.forEachFeatureAtPixel(e.mapBrowserEvent.pixel, function(feature, layer) {
      var id = layer.get('layer_id');
      if ( id === 'states' ) {
        return null;
      } else {
        return feature;
      }
    });

    if (feature) {
      var props = feature.getProperties();
      if ( props.station ) {
        self.stationSelected(feature, e);
      } else {
        self.countySelected(feature, e);
      }
    } else {
      self.popup.hide();
    }

  });
};




/*
*
* get counties geojson and add to map
*
*/
Variables.prototype.addCounties = function() {

  var self = this;
  var style = function(feature, resolution) {

    return [new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.4)'
      }),
      stroke: new ol.style.Stroke({
        color: '#2980b9',
        width: 0.5
      })
    })];

  };

  this.vectorLayer = new ol.layer.Vector({
    title: 'added Layer',
    source: new ol.source.Vector({
       url: 'resources/data/counties-20m.json',
       format: new ol.format.GeoJSON()
    }),
    style: style
  });

  this.vectorLayer.set('layer_id', 'counties');
  self.map.addLayer(this.vectorLayer);

};



/*
*
* get states geojson and add to map
*
*/
Variables.prototype.addStates = function() {

  var self = this;

  var style = function(feature, resolution) {

    return [new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(0, 0, 0, 0)'
      }),
      stroke: new ol.style.Stroke({
        color: '#2980b9',
        width: 2
      })
    })];

  };

  this.vectorLayer = new ol.layer.Vector({
    title: 'added Layer',
    source: new ol.source.Vector({
       url: 'resources/data/states.json',
       format: new ol.format.GeoJSON()
    }),
    style: style
  });

  this.vectorLayer.set('layer_id', 'states');
  self.map.addLayer(this.vectorLayer);

};




/*
*
* get counties geojson and add to map
*
*/
Variables.prototype.addStations = function() {

  var self = this;

  var styles = {
    'Point': new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({color: '#2980b9'}),
        stroke: new ol.style.Stroke({color: '#FFF', width: 2})
      })
    })
  };

  var styleFunction = function(feature) {
    return styles[feature.getGeometry().getType()];
  };


  $.getJSON('resources/data/wx_stations.json', function(data) {

    var featureCollection = {
      'type': 'FeatureCollection',
      'features': []
    };

    var obj;
    $.each(data, function(i, d) {
      if ( d.weight < 2 ) {
        obj = {
          'type': 'Feature',
          'properties': {
            'station': d.id,
            'name': d.name
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [d.lon, d.lat]
          }
        };
        featureCollection.features.push(obj);
      }
    });

    var features = new ol.format.GeoJSON().readFeatures(featureCollection, {
      featureProjection: 'EPSG:3857'
    });
    var vectorSource = new ol.source.Vector({
      features: features
    });
    var vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: styleFunction
    });

    vectorLayer.set('layer_id', 'stations');
    vectorLayer.setVisible(false);
    self.map.addLayer(vectorLayer);

  });

};





/*
* Highlight county feature
*
*/
Variables.prototype.countySelected = function(feature, event) {
  var self = this;

  if (feature) {
    var props = feature.getProperties();
    var fips = props.STATE + props.COUNTY;
    var html = '<span>'+props.NAME+' County</span>' +
        '<div class="data-accordion-actions">' +
          '<a href="#" class="how-to-read"><span class="icon icon-help"></span>How to read this</a>' +
          '<a href="#" class="download-image"><span class="icon icon-download-image"></span>Image</a>' +
          '<a href="#" class="download-data"><span class="icon icon-download-chart"></span>Data</a>' +
        '</div>' +
      '</header>' +
      '<div id="climate-chart" style="width:800px; height:420px"></div>'+
      '<div class="chart-legend">'+
        '<div id="rcp45-range" class="legend-item legend-item-range">'+
          '<div class="legend-item-block" id="rcp45-block"></div>'+
          'Low Emissions (RCP 4.5) Range'+
        '</div>'+
        '<div id="rcp85-range" class="legend-item legend-item-range selected">'+
          '<div class="legend-item-block selected" id="rcp85-block"></div>'+
          'High Emissions (RCP 8.5) Range'+
        '</div>'+
        '<div id="rcp45-mean" class="legend-item legend-item-range">'+
          '<div class="legend-item-line" id="rcp85-line"></div>'+
          'High Emissions Median'+
          '<div class="legend-item-line" id="rcp45-line"></div>'+
          'Low Emissions Median'+
        '</div>'+
        '<div id="historical-range" class="legend-item legend-item-range">'+
          '<div class="legend-item-block" id="historical-block"></div>'+
          'Historical (Modelled)'+
        '</div>'+
        '<div id="under-baseline-range" class="legend-item legend-item-range">'+
          '<div class="legend-item-block" id="under-baseline-block"></div>'+
          'Observed under baseline'+
        '</div>'+
        '<div id="over-baseline-range" class="legend-item legend-item-range">'+
          '<div class="legend-item-block" id="over-baseline-block"></div>'+
          'Observed over baseline'+
        '</div>'+
      '</div>';
    this.popup.show(event.mapBrowserEvent.coordinate, html);

    this.cwg = climate_widget.graph({
      div        : "div#climate-chart",
      dataprefix : "http://climateexplorer.habitatseven.work/data",
      font       : "Roboto",
      frequency  : "annual",
      fips       : fips,
      variable   : this.selectedVariable,
      scenario   : "rcp85"
    });

    $('.legend-item-range').on('click', function() {
      $(this).toggleClass('selected');
      $(this).children('.legend-item-block, .legend-item-line').toggleClass('selected');
      var scenario = null;
      switch(true) {
        case $('#rcp85-block').hasClass('selected') && $('#rcp45-block').hasClass('selected'):
          scenario = 'both';
          break;
        case $('#rcp45-block').hasClass('selected'):
          scenario = 'rcp45';
          break;
        case $('#rcp85-block').hasClass('selected'):
          scenario = 'rcp85';
          break;
        default:
          scenario = '';
      }

      var median = null;
      switch(true) {
        case $('#rcp85-line').hasClass('selected') && $('#rcp45-line').hasClass('selected'):
          median = 'true';
          break;
        case $('#rcp45-line').hasClass('selected'):
          median = 'true';
          break;
        case $('#rcp85-line').hasClass('selected'):
          median = 'true';
          break;
        default:
          median = 'false';
      }

      console.log('update me!', median);
      self.cwg.update({
        pmedian: median,
        scenario: scenario
      });

    });

  } else {
    this.cwg = null;
    this.popup.hide();
  }
};




Variables.prototype.stationSelected = function(feature, event) {
  var self = this;

  if (feature) {
    var props = feature.getProperties();
    var html = '<div>Station: '+props.name+'<br /></div>' +
      '<div id="multi-chart" style="width:500px; height:300px"></div>';
    this.popup.show(event.mapBrowserEvent.coordinate, html);

    this.chart = new ChartBuilder(props);
  } else {
    this.popup.hide();
  }

};



/*
* Update the chart!
*
*/
Variables.prototype.updateChart = function() {

  if ( this.cwg ) {
    this.cwg.update({
      variable : this.selectedVariable
    });
  }

};