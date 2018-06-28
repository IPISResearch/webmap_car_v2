var map;
var MapService = (function () {

  var me = {};

  var mapSources = {};
  var mapLoaded;
  var initStyleLoaded;
  var updateHashTimeout;
  var popupHover;
  var spiderifier;

  me.init = function () {
    mapboxgl.accessToken = 'pk.eyJ1IjoiaXBpc3Jlc2VhcmNoIiwiYSI6IklBazVQTWcifQ.K13FKWN_xlKPJFj9XjkmbQ';

    var hash = document.location.hash.substr(1);
    decodeHash(hash);

    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/' + Config.initStyle || 'ipisresearch/ciw6jpn5s002r2jtb615o6shz',
      center: [Config.mapCoordinates.x, Config.mapCoordinates.y],
      zoom: Config.mapCoordinates.zoom
    });

    map.on("zoomend", function () {
      updateHash("zoom ended");
    });

    map.on("moveend", function () {
      updateHash("move ended");
    });

    map.on("click", function (e) {
      var target = (e.originalEvent ? e.originalEvent.target : undefined);
      if (target && target.className.indexOf("spider") < 0) {
        spiderifier.unspiderfy();
      }
    });


    // spiderify
    spiderifier = new MapboxglSpiderifier(map, {
      animate: true,
      animationSpeed: 200,
      customPin: true,
      initializeLeg: function (spiderLeg) {
        var icon = document.createElement("div");

        icon.style.backgroundColor = Data.getColorForType(spiderLeg.feature.properties.type);
        var f = spiderLeg.feature.properties.fatalities;
        var fClass = "";
        if (f < 3) fClass = " small";
        if (f > 7) fClass = " medium";
        if (f > 10) fClass = " large";
        if (f > 50) fClass = " huge";
        icon.className = "spiderifyIcon" + fClass;

        spiderLeg.elements.pin.appendChild(icon);
        spiderLeg.feature.properties.spiderOffset = MapboxglSpiderifier.popupOffsetForSpiderLeg(spiderLeg);


        var layerId = spiderLeg.feature.layer.id;
        if (layerId){
          var layer = Config.layers[layerId];
          if (layer && layer.popupOnhover) {

            icon.onmouseover = function(){

              UI.hidePopup();
              var latLong = spiderLeg.mapboxMarker.getLngLat();
              popupHover.options.offset = spiderLeg.feature.properties.spiderOffset;

              if (typeof layer.popupOnhover === "function"){
                var HTML = layer.popupOnhover(spiderLeg.feature);
              }else{
                HTML = spiderLeg.feature.properties[layer.popupOnhover];
              }

              popupHover.setLngLat(latLong)
              .setHTML(HTML)
              .addTo(map);
            };

            icon.onmouseleave = function(){
              popupHover.remove();
            };
          }
        }
      },
      onClick: function (e, marker) {
        var layer = marker.feature.layer;
        if (layer && layer.id && Config.layers[layer.id] && Config.layers[layer.id].onClick) {
          Config.layers[layer.id].onClick(marker.feature, e.lngLat,true);
        }else{
          if (layer && layer.id && Config.subLayers && Config.subLayers[layer.id] && Config.subLayers[layer.id].onClick) {
            Config.subLayers[layer.id].onClick(marker.feature, e.lngLat,true);
          }
        }
      }
    });

    EventBus.on(EVENT.mapNavigate, function () {
      spiderifier.unspiderfy();
    });


    // Create a hover popup, but don't add it to the map yet.
    popupHover = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    map.on('style.load', function (e) {

      // first build all ref_layers, sorted on z-index
      var ref_layers =[];
      for (var key in Config.layers) {
        if (Config.layers.hasOwnProperty(key)) {
          var layer = Config.layers[key];
          if (!layer.referenceLayer){
            var zIndex = (layer.display && layer.display.zIndex) ? layer.display.zIndex : 1;
            ref_layers.push({zIndex: zIndex, id: "ref_" + layer.id});
            layer.refLayer = "ref_" + layer.id;
          }else{
            layer.refLayer = layer.referenceLayer;
          }
        }
      }
      ref_layers.sort(function(a,b){
        return a.zIndex-b.zIndex;
      });


      ref_layers.forEach(function(ref){
        map.addLayer({
          'id': ref.id,
          "type": "symbol",
          "source": {
            "type": "geojson",
            "data": {
              "type": "FeatureCollection",
              "features": [{
                "type": "Feature",
                "geometry": {
                  "type": "Point",
                  "coordinates": [0, 0]
                }
              }]
            }
          },
          'layout': {
            'visibility': 'none'
          }
        }, Config.defaultRefLayer);
      });


      for (key in Config.layers) {
        if (Config.layers.hasOwnProperty(key)) {
          layer = Config.layers[key];
          layer.onLoadedTriggered = false;
          layer.display = layer.display || {visible: true};
          if (typeof layer.display.visible === "undefined") layer.display.visible = true;

          if (layer.filterId && Config.initLayerIds.length) {
            layer.display.visible = Config.initLayerIds.indexOf("" + layer.filterId) >= 0;
          }

          if (layer.display.visible) {

            me.addLayer(Config.layers[key]);
            if (layer.containerElm) layer.containerElm.classList.remove("inactive");
            if (layer.labelElm) layer.labelElm.classList.remove("inactive");

            // check initial filter
            if (Config.initfilterIds.length && layer.filters) {
              layer.filters.forEach(function (filter) {
                var state = getFilterState(filter.index);
                if (state && filter.filterItems && filter.filterItems.length) {
                  for (var i = 0, max = filter.filterItems.length; i < max; i++) {
                    // note: filter state contains a leading "1" to handle leading zeros
                    var item = filter.filterItems[i];
                    item.checked = state[i + 1] == "1";
                    if (item.elm) item.elm.classList.toggle("inactive", !item.checked);
                  }
                  if (filter.onFilter) filter.onFilter(filter);
                }
              });

            }

          } else {
            if (layer.containerElm) layer.containerElm.classList.add("inactive");
            if (layer.labelElm) layer.labelElm.classList.add("inactive");
            layer.added = false;
          }
        }
      }

      if (Config.subLayers){
        for (key in Config.layers) {

        }
      }


      if (!initStyleLoaded) {
        map.addControl(new mapboxgl.NavigationControl(), 'top-left');
        if(Config.useMapBoxInspector && Config.apiScope.indexOf("_dev")>0 && MapboxInspect) {
          map.addControl(new MapboxInspect(), 'top-left');
          map.addControl(new MapboxInspect(), 'top-left'); // Must be loaded twice for some reason
        }
        map.addControl(new mapboxgl.ScaleControl({}));
        document.getElementsByClassName("mapboxgl-ctrl-scale")[0].style.cssText = "margin: 0px 0px -22px 105px;border-color: rgba(0,0,0,0.15); border-bottom-left-radius: 3px; border-bottom-right-radius: 3px;"
        initStyleLoaded = true;
      } else {
        updateHash("style loaded");
      }

      EventBus.trigger(EVENT.mapStyleLoaded);

    });

  };

  me.addLayer = function (layer) {
    var sourceOrigin = layer.source;

    if (typeof sourceOrigin === "function") {
      sourceOrigin = layer.source(layer, true);
    }

    if (!sourceOrigin) {
      console.log(layer.id + ": layer data not ready, deferring.");
      return;
    }

    var sourceId = layer.sourceId || sourceOrigin.replace(/\W/g, '');

    var source = mapSources[sourceId];
    if (!source) {
      if((typeof sourceOrigin === "string") ? sourceOrigin.indexOf("mapbox://") == 0 : 0) {
        map.addSource(sourceId, {
          type: 'vector',
          url: sourceOrigin
        });
      } else {
        map.addSource(sourceId, {
          type: 'geojson',
          data: sourceOrigin,
          buffer: 0,
          maxzoom: 14,
          cluster: false,
          clusterMaxZoom: 14, // Max zoom to cluster points on
          clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });
      }
    }

    var circleColor = "blue";
    var fillColor;
    var lineColor;

    var colorStops = [];
    var iconImageStops = [];

    var paint = {};
    var layout = {
      'visibility': 'visible'
    };


    var displayType = "circle";
    if (layer.display.type) displayType = layer.display.type;

    if (layer.display.type === "circle") {

      if (layer.display.color) {
        circleColor = layer.display.color;

        if (layer.display.color.data){
          var items = layer.display.color.data;
          if (typeof layer.display.color.data === "function") items = layer.display.color.data();
          items.forEach(function (item) {
            colorStops.push([item.value, item.color]);
          });

          circleColor = {
            property: layer.display.color.property,
            type: 'categorical',
            stops: colorStops
          }
        }
      }

      var circleRadius = layer.display.radius || 3;
      if (layer.display.size) {
        circleRadius = {
          'default': 3,
          'property': layer.display.size.property,
          'type': 'interval',
          'stops': layer.display.size.interval
        }
      }

      if (layer.display.size && layer.display.size.stops) {
        circleRadius = {
          'default': 5,
          'property': layer.display.size.property,
          'type': "categorical",
          'stops': layer.display.size.stops
        }
      }

      paint = {
        'circle-color': circleColor || '808080',
        'circle-radius': circleRadius || 1,
        'circle-opacity': layer.display.circleOpacity || 1,
        'circle-blur': layer.display.circleBlur || 0,
        'circle-stroke-width': layer.display.circleStrokeWidth || 0.5,
        'circle-stroke-color': layer.display.circleStrokeColor || 'white'
      };
    }

    if (displayType === "fill") {
      if (layer.display.fillColor) {
        fillColor = layer.display.fillColor;

        if (layer.display.fillColor.data) {
          var items = layer.display.fillColor.data;
          if (typeof layer.display.fillColor.data === "function") items = layer.display.fillColor.data();
          items.forEach(function (item) {
            colorStops.push([item.value, item.color]);
          });

          fillColor = {
            property: layer.display.fillColor.property,
            type: 'categorical',
            stops: colorStops
          }
        }
      }

      paint = {
        'fill-color': fillColor || '#808080',
        'fill-opacity': layer.display.fillOpacity || 0.7,
        //'fill-opacity': 1,
        //'fill-pattern' : "dot_green_tiny2"
      };


      if (layer.display.fillPattern) {
        paint["fill-pattern"] = layer.display.fillPattern;

        if (layer.display.fillPattern.data) {
          var stops = [];
          var items = layer.display.fillPattern.data;
          if (typeof items === "function") items = items();
          items.forEach(function (item) {
            stops.push([item.value, item.pattern]);
          });

          paint["fill-pattern"] = {
            property: layer.display.fillPattern.property,
            type: 'categorical',
            stops: stops
          }
        }

      }

      if (layer.display.hoverOpacity){
        var hoverPaint = Object.assign({}, paint);
        hoverPaint["fill-opacity"] = layer.display.hoverOpacity;
        layer.subLayers = layer.subLayers || [];
        layer.subLayers.push({
          isHover: true,
          paint: hoverPaint,
          filter: ["==", "id", ""]
        });
        var hoverLayerId = layer.id + (layer.subLayers.length-1);

        map.on("mousemove", layer.id, function(e) {
          map.setFilter(hoverLayerId, ["==", "id", e.features[0].properties.id]);
        });

        map.on('mouseleave', layer.id, function (e) {
          map.setFilter(hoverLayerId, ["==", "id", ""]);
        });
      }
    }

    if (displayType === "line") {
      if (layer.display.lineColor) {
        lineColor = layer.display.lineColor;

        if (layer.display.lineColor.data) {
          items = layer.display.lineColor.data;
          if (typeof layer.display.lineColor.data === "function") items = layer.display.lineColor.data();
          items.forEach(function (item) {
            colorStops.push([item.value, item.color]);
          });

          lineColor = {
            property: layer.display.lineColor.property,
            type: 'categorical',
            stops: colorStops
          }
        }

      }

      paint = {
        'line-color': lineColor || '#808080',
        'line-opacity': layer.display.lineOpacity || 0.7,
        'line-width': layer.display.lineWidth || 1
      };

      layout = {
        'line-join': 'round',
        'line-cap': 'round'
      }
    }

    if (displayType === "symbol") {
      // list of standard icons: https://github.com/mapbox/mapbox-gl-styles/tree/master/sprites/basic-v9/_svg
      if (layer.display.iconImage.data) {
        var items = layer.display.iconImage.data;
        if (typeof layer.display.iconImage.data === "function") items = layer.display.iconImage.data();
        items.forEach(function (item) {
          iconImageStops.push([item.value, item.iconImage]);
        });

        iconImage = {
          property: layer.display.iconImage.property,
          type: 'categorical',
          stops: iconImageStops
        }
      } else {
        if (layer.display.iconImage) {
          iconImage = layer.display.iconImage
        }
      }

      layout = {
        'icon-image': iconImage || "marker-11",
        'icon-allow-overlap': true,
        'icon-size': layer.display.iconSize || 1
      };

      paint = {
        'icon-opacity': layer.display.iconOpacity || 1
      };
    }


    if (displayType === "heatmap") {


      paint = {

        // Increase the heatmap color weight weight by zoom level
        // heatmap-intensity is a multiplier on top of heatmap-weight
        "heatmap-intensity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          2, 0.0005,
          7, 0.07,
          9, 0.2,
          10, 0.3,
          11, 1
        ],
        // Adjust the heatmap radius by zoom level
        "heatmap-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0, 1,
          13, 50
        ],
        // Transition from heatmap to circle layer by zoom level
        "heatmap-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          8, 0.8,
          15, 0.2
        ]
      };

      if (layer.display.colors){

        var colorMap = [
          "interpolate",
          ["linear"],
          ["heatmap-density"]
        ];

        layer.display.colors.forEach(function(step){
          colorMap.push(step.step);
          colorMap.push(hexToRGB(step.color,step.opacity));
        });

        paint["heatmap-color"] = colorMap;

      }


    }

    var layerProperties = {
      id: layer.id,
      type: displayType,
      source: sourceId,
      paint: paint,
      layout: layout
    };

    if(layer.sourceLayer) {layerProperties['source-layer'] = layer.sourceLayer}

    if (layer.display && layer.display.filter) layerProperties.filter = layer.display.filter;

    map.addLayer(layerProperties, layer.refLayer);



    if (layer.subLayers){
      layer.subLayers.forEach(function(subLayer,index){
        var subLayerProperties = {
          id: layer.id + index,
          type: subLayer.type || displayType,
          source: sourceId,
          paint: subLayer.paint,
          layout: {
            'visibility': 'visible'
          }
        };
        if (subLayer.filter) subLayerProperties.filter = subLayer.filter;
        map.addLayer(subLayerProperties, layer.refLayer);
      });
    }

    layer.added = true;

    if (layer.onClick) me.attachClickEvents(layer);


    map.on("render", function () {
      if (map.loaded()) {
        if (layer.onLoaded && !layer.onLoadedTriggered) {
          layer.onLoadedTriggered = true;
          layer.onLoaded();
          updateHash("render");
        }

        if (UI.onRender) UI.onRender();
      }
    });


  };

  me.addSubLayer = function(subLayer){
    Config.subLayers = Config.subLayers || {};
    Config.subLayers[subLayer.id] = subLayer;
    if (subLayer.onClick) me.attachClickEvents(subLayer);
  };

  me.attachClickEvents = function(layer){
    var onmouseEnter = function (e) {
      map.getCanvas().style.cursor = 'pointer';

      if (layer.popupOnhover) {

        var geo = e.features[0] ? e.features[0].geometry : undefined;
        var co = e.lngLat;

        if (geo) {
          if (geo.coordinates) co = geo.coordinates;
          if (geo.type === "Polygon") co = MapBoxExtra.polylabel(co);
          if (geo.type === "MultiPolygon") co = MapBoxExtra.polylabel(co[0]);
        }


        if (typeof layer.popupOnhover === "function"){
          var HTML = layer.popupOnhover(e.features[0]);
        }else{
          HTML = e.features[0].properties[layer.popupOnhover];
        }

        popupHover.options.offset = undefined;
        popupHover.setLngLat(co)
        .setHTML(HTML)
        .addTo(map);
      }

    };

    var onmouseLeave = function (e) {
      map.getCanvas().style.cursor = '';
      popupHover.remove();
    };

    var onClick = function (e) {
      popupHover.remove();
      if (e.features.length > 1) {
        // TODO: Spiderify ?
        spiderifier.spiderfy(e.features[0].geometry.coordinates, e.features);
      } else {
        layer.onClick(e.features[0], e.lngLat);
      }

    };

    map.on('mouseenter', layer.id, onmouseEnter);
    map.on('mouseleave', layer.id, onmouseLeave);
    map.on('click', layer.id, onClick);


    if (layer.subLayers){
      layer.subLayers.forEach(function(subLayer,index){

        var id = layer.id + index;
        map.on('mouseenter', id, onmouseEnter);
        map.on('mouseleave', id, onmouseLeave);
        map.on('click', id, onClick);


      });
    }

  }

  me.setStyle = function (styleId) {
    map.setStyle('mapbox://styles/' + styleId);
  };


  // updates the url Hash so links can reproduce the current map state
  function updateHash(reason) {
    console.log("update hash " + reason);
    clearTimeout(updateHashTimeout);

    updateHashTimeout = setTimeout(function () {
      var zoom = map.getZoom();
      var center = map.getCenter();
      var bounds = map.getBounds();

      var latitude = center.lat;
      var longitude = center.lng;

      var baseLayer = 0;

      var layerIds = [];
      var filterIds = [];

      Config.baselayers.forEach(function (layer) {
        if (layer.active) baseLayer = layer.index;
      });

      //var yearClamp = Data.getYearClamp();
      //if (yearClamp.start){
      //  filterIds.push("1." + (yearClamp.start-2000) + "." + (yearClamp.end-2000));
      //}


      for (var key in Config.layers) {
        if (Config.layers.hasOwnProperty(key)) {
          var layer = Config.layers[key];
          if (layer.id && layer.filterId) {
            if (map.getLayer(layer.id)) {
              if (map.getLayoutProperty(layer.id, 'visibility') !== "none") {
                layerIds.push(layer.filterId);

                if (layer.filters && layer.filters.length) {
                  layer.filters.forEach(function (filter) {
                    if (filter.index) {
                      var index = filter.index;
                      if (filter.filterItems && filter.filterItems.length) {
                        var max = filter.filterItems.length;
                        var count = 0;
                        var a = [1];
                        filter.filterItems.forEach(function (e) {
                          if (e.checked) {
                            a.push(1);
                            count++;
                          } else {
                            a.push(0);
                          }
                        });
                        if (count < max) {
                          // this filter has a state - decode binary state as base36
                          index += "." + parseInt(a.join(""), 2).toString(36);
                          filterIds.push(index);
                        }
                      }
                    }
                  });
                }
              }
            }
          }
        }
      }

      var hash = latitude + "/" + longitude + "/" + zoom + "/" + baseLayer + "/" + layerIds.join(",") + "/" + filterIds.join(",");
      decodeHash(hash);
      window.location.hash = hash;
    }, 50);

  }

  function decodeHash(hash) {

    Config.initLayerIds = ["1"];
    Config.initfilterIds = [];
    Config.initBaselayer = Config.defaultBaseLayerIndex;

    if (hash.indexOf("/") > 0) {
      var urlparams = hash.split("/");
      if (urlparams.length > 2) {
        Config.mapCoordinates.y = urlparams[0];
        Config.mapCoordinates.x = urlparams[1];
        Config.mapCoordinates.zoom = urlparams[2];
        Config.initBaselayer = urlparams[3] || 2;
        if (urlparams[4]) Config.initLayerIds = (urlparams[4]).split(",");
        if (urlparams[5]) Config.initfilterIds = (urlparams[5]).split(",");
      }
    }

    Config.baselayers.forEach(function (baseLayer) {
      if (Config.initBaselayer == baseLayer.index) {
        Config.initStyle = baseLayer.url;
        baseLayer.active = true;
      }
    });

  }

  function getFilterState(index) {
    var sIndex = index + ".";
    var sLen = sIndex.length;
    for (var i = 0, max = Config.initfilterIds.length; i < max; i++) {
      if (Config.initfilterIds[i].substr(0, sLen) == sIndex) {
        var stateString = Config.initfilterIds[i].substr(sLen);
        if (stateString) {
          return parseInt(stateString, 36).toString(2).split("");
        }
      }
    }
  }

  EventBus.on(EVENT.filterChanged, function () {
    spiderifier.unspiderfy();
    updateHash("filter Changed");
  });

  EventBus.on(EVENT.layerChanged, function () {
    spiderifier.unspiderfy();
    updateHash("layer Changed");
  });


  // utility to get unique properties in source
  me.distinct = function(source,property){
    var list = map.querySourceFeatures(source);
    var result = [];
    var lookup = {};
    list.forEach(function(item){
      var value = item.properties[property];
      if (value && !lookup[value]){
        result.push(value);
        lookup[value] = true;
      }
    });

    result.sort();
    return result;
  };

  me.getFilterItems = function(source,property,mapping){
    var filterList = me.distinct(source,property);
    filterList.sort();
    var keyMapping = !!mapping;
    if (!keyMapping) mapping = palette('tol-rainbow', filterList.length);

    var filterItems = [];
    filterList.forEach(function(item, index){
      var label = item;
      var color = "grey";
      if (keyMapping){
        if (mapping[item]){
          color =  mapping[item].color || mapping[item];
          label = mapping[item].label || label
        }
      }else{
        color = "#" + (mapping[index] || "CCCCCC");
      }
      filterItems.push({label: label, value: item,  color:  color});
    });

    return filterItems;
  };

  // filters on 1 property - supports sublayers
  me.genericFilter = function(elm){
    var items = elm.filterItems;
    var hasFilter = false;
    var values = [];
    items.forEach(function(item){
      if (!item.checked){
        hasFilter = true;
      }else{
        values.push(item.value);
      }
    });

    var layerId = elm.layer.id;

    if (hasFilter){
      map.setFilter(layerId,["in",(elm.filterProperty || elm.id)].concat(values));

      if (elm.layer.subLayers){
        elm.layer.subLayers.forEach(function(sublayer,index){
          if (!sublayer.isHover){
            map.setFilter(layerId + index,["in",(elm.filterProperty || elm.id)].concat(values));
          }
        });
      }
    }else{
      map.setFilter(layerId);
      if (elm.layer.subLayers){
        elm.layer.subLayers.forEach(function(sublayer,index){
          if (!sublayer.isHover){
            map.setFilter(layerId + index);
          }
        });
      }
    }

    if (elm.layer.placeholder){
      layerId = elm.layer.id.split("_")[0];
      if (hasFilter){
        map.setFilter(layerId,["in",(elm.filterProperty || elm.id)].concat(values));
      }else{
        map.setFilter(layerId);
      }
    }
  };


  me.genericMultiFilter = function (elm) {


    elm.layer.filterFunctionLookup = elm.layer.filterFunctionLookup || {};

    var values = [];
    elm.filterItems.forEach(function (item) {
      if (item.checked) values.push(item.value);
    });

    if (values.length === elm.filterItems.length) {
      // all items checked - ignore filter
      elm.layer.filterFunctionLookup[elm.id] = undefined;
    } else {
      if (elm.array) {
        elm.layer.filterFunctionLookup[elm.id] = function (item) {
          var value = item.properties[elm.filterProperty];
          if (value && value.length) {
            return value.some(function (v) {
              return values.includes(v);
            });
          }
          return false;
        };
      } else {
        elm.layer.filterFunctionLookup[elm.id] = function (item) {
          return values.includes(item.properties[elm.filterProperty]);
        };
      }
    }


    me.filterLayerGenericMulti(elm);

  };

  me.filterLayerGenericMulti = function (elm) {
    var filteredIds = [];
    var filtered = [];
    var filterFunctions = [];
    elm.layer.filterFunctionLookup = elm.layer.filterFunctionLookup || {};

    for (var key in elm.layer.filterFunctionLookup) {
      if (elm.layer.filterFunctionLookup.hasOwnProperty(key) && elm.layer.filterFunctionLookup[key]) {
        filterFunctions.push(elm.layer.filterFunctionLookup[key]);
      }
    }

    map.querySourceFeatures(elm.layer.id).forEach(function (feature) {
      var passed = true;
      var filterCount = 0;
      var filterMax = filterFunctions.length;
      while (passed && filterCount < filterMax) {
        passed = filterFunctions[filterCount](feature);
        filterCount++;
      }


      if (passed) {
        filtered.push(feature);
        filteredIds.push(feature.properties.id);
      }
    });

    map.setFilter(elm.layer.id, ['in', 'id'].concat(filteredIds));
  };

  return me;

}());
