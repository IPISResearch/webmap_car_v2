var Data = function () {

  // preload and transform datasets
  var me = {};

  var timeOutCount = 0;
  var maxTimeOutRetry = 3;
  var filterFunctionsLookup = {};

  var incidents = {};
  var roadblocks = {};
  var influenceZones = {};

  var currentStartMonth;
  var currentEndMonth;

  me.init = function () {

    var checkpoint = new Date().getTime();
    var now;

    var dataDone = function () {
      if (incidents.loaded && roadblocks.loaded) {
        now = new Date().getTime();
        console.log("datasets generated in " + (now - checkpoint) + "ms");

        EventBus.trigger(EVENT.preloadDone);
        //EventBus.trigger(EVENT.filterChanged);
        //CodChart.render();
      }
    };

    function loadIncidents() {
      var url = "http://ipis.annexmap.net/api/data/"+Config.apiScope+"/incidents?key=ipis";

      FetchService.json(url, function (data,xhr) {
        if (!data){
          console.error("Failed loading incidents");
          if (xhr.hasTimeOut){
            timeOutCount++;
            if (timeOutCount<maxTimeOutRetry){
              UI.showLoaderTimeOut();
              loadIncidents();
            }else{
              UI.showLoaderError();
            }
          }else{
            UI.showLoaderError();
          }
        }else{
          now = new Date().getTime();
          console.log("incident data loaded in " + (now - checkpoint) + "ms");
          checkpoint = now;

          incidents.list = featureCollection();
          incidents.actors = [];
          incidents.actorLookup = {};
          incidents.types = [];
          incidents.typeLookup = {};

          incidents.fatalities = {
            east: {},
            centre: {},
            west: {},
            bangui: {}
          };
          incidents.count = {};
          incidents.months = [];
          incidents.monthLookup = [];

          function addActor(a,item){
            if (!a) return;
            item.properties.actors.push(a);
            if (!incidents.actorLookup[a]){
              incidents.actorLookup[a] = true;
              incidents.actors.push(a);
            }
          }

          data.result.forEach(function(d){
            var item = featurePoint(d.lt, d.ln);

            item.properties.id = parseInt(d.i,10);
            item.properties.actor1 = d.a1;
            item.properties.actor2 = d.a2;
            item.properties.actor3 = d.a3;
            item.properties.actor4 = d.a4;
            item.properties.actor1Details = d.a1d;
            item.properties.actor2Details = d.a2d;
            item.properties.actor3Details = d.a3d;
            item.properties.actor4Details = d.a4d;
            item.properties.type = d.t || "Unknown";
            item.properties.date = normalizeDate(d.d);
            item.properties.fatalities = parseInt(d.f) || 0;
            if (isNaN(item.properties.fatalities)) item.properties.fatalities = 0;
            item.properties.description = d.ds;
            item.properties.location = d.lo;
            item.properties.zone = d.z || "";

            item.properties.formattedDate = formatDate(item.properties.date);
            item.properties.month = monthDate(item.properties.date);

            item.properties.actors = [];
            addActor(d.a1,item);
            addActor(d.a2,item);
            addActor(d.a3,item);
            addActor(d.a4,item);

            item.properties.keyIssues = [];
            if (d.km) item.properties.keyIssues.push(1);
            if (d.kr) item.properties.keyIssues.push(2);
            if (d.kp) item.properties.keyIssues.push(3);
            if (d.kt) item.properties.keyIssues.push(4);
            if (d.ka) item.properties.keyIssues.push(5);
            if (d.kf) item.properties.keyIssues.push(6);
            if (d.kh) item.properties.keyIssues.push(7);

            var zone = item.properties.zone.toLowerCase();
            var fatalitiesZone = incidents.fatalities[zone];
            if (fatalitiesZone){
              var c = fatalitiesZone[item.properties.month] || 0;
              fatalitiesZone[item.properties.month] = c + item.properties.fatalities;
            }

            c = incidents.count[item.properties.month] || 0;
            incidents.count[item.properties.month] = ++c;

            if (!incidents.typeLookup[item.properties.type]){
              incidents.typeLookup[item.properties.type] = true;
              incidents.types.push(item.properties.type);
            }
            if (!incidents.monthLookup[item.properties.month]){
              incidents.monthLookup[item.properties.month] = true;
              incidents.months.push(item.properties.month);
            }

            incidents.list.features.push(item);
          });

          //incidents.list.features.sort(function(a, b) {
          //	return a.properties.date - b.properties.date;
          //});
          incidents.actors.sort();
          incidents.types.sort();
          incidents.months.sort();
          incidents.loaded = true;
          dataDone();
        }
      });
    }


    loadIncidents();
    loadRoadblocks(dataDone);

  };

  me.getIncidents = function(filtered){
    if (filtered && incidents.filtered){
      return incidents.filtered.list;
    }
    else{
      if (filtered){
        return incidents.list.features;
      }else{
        return incidents.list;
      }
    }
  };


  me.getActors = function(){
    var result = [];

    var order = ["Seleka", "Anti-balaka", "Civilians", "Pastoralists","LRA"].reverse();
    //incidents.pallette = incidents.pallette || palette('tol-rainbow', incidents.actors.length);
    //incidents.colorsForActor = {};

    incidents.actors.forEach(function (actor,index) {
      result.push({
        label: actor,
        value: actor,
        color: "silver",
        index: order.indexOf(actor)
      });
      //incidents.colorsForActor[actor] = "#" + incidents.pallette[index];
    });

    return result.sort(function (a, b) {
      return a.index < b.index ? 1 : -1;
    });

  };

  me.getIncidentTypes = function(){
    var result = [];

    //var order = ["Seleka", "Anti-balaka", "Civilians", "Pastoralists","LRA"].reverse();
    incidents.palletteType = incidents.palletteType || palette('tol', incidents.types.length);
    incidents.colorsForType = {};

    incidents.types.forEach(function (type,index) {
      result.push({
        label: type,
        value: type,
        color: "#" + incidents.palletteType[index],
        index: 1 //order.indexOf(type)
      });
      incidents.colorsForType[type] = "#" + incidents.palletteType[index];
    });

    return result;

    //return result.sort(function (a, b) {
    //	return a.index < b.index ? 1 : -1;
    //});

  };

  me.getIncidentCount = function(){
    return incidents.count;
  };
  me.getFatalitiesCount = function(zone){
    console.log("getting " + zone);
    console.log(incidents.fatalities[zone.toLowerCase()]);
    return incidents.fatalities[zone.toLowerCase()];
  };

  me.getColorForActor = function(actor){
    if (!incidents.colorsForActor || !actor) return "grey";
    return incidents.colorsForActor[actor] || "grey";
  };

  me.getColorForType = function(type){
    if (!incidents.colorsForType || !type) return "grey";
    return incidents.colorsForType[type] || "grey";
  };


  me.filterIncidents = function () {

    incidents.filtered = {};
    incidents.filtered.list = [];
    incidents.filtered.ids = [];

    incidents.fatalities = {
      east: {},
      centre: {},
      west: {},
      bangui: {}

    };
    incidents.count = {};

    incidents.months.forEach(function(month){
      incidents.fatalities.east[month] = 0;
      incidents.fatalities.centre[month] = 0;
      incidents.fatalities.west[month] = 0;
      incidents.fatalities.bangui[month] = 0;
      incidents.count[month] = 0;
    });

    var filterFunctions = [];

    for (var key in  filterFunctionsLookup) {
      if (filterFunctionsLookup.hasOwnProperty(key) && filterFunctionsLookup[key]) {
        filterFunctions.push(filterFunctionsLookup[key]);
      }
    }

    incidents.list.features.forEach(function (item) {
      var passed = true;
      var filterCount = 0;
      var filterMax = filterFunctions.length;
      while (passed && filterCount < filterMax) {
        passed = filterFunctions[filterCount](item);
        filterCount++;
      }

      if (passed && currentStartMonth){
        if (item.properties.month<currentStartMonth) passed = false;
        if (item.properties.month>currentEndMonth) passed = false;
      }

      if (passed) {
        incidents.filtered.list.push(item);
        incidents.filtered.ids.push(item.properties.id);

        var zone = item.properties.zone || "";
        var fatalitiesZone = incidents.fatalities[zone.toLowerCase()];
        if (fatalitiesZone){
          var c = fatalitiesZone[item.properties.month] || 0;
          fatalitiesZone[item.properties.month] = c + item.properties.fatalities;
        }

        c = incidents.count[item.properties.month] || 0;
        incidents.count[item.properties.month] = ++c;
      }
    });

    // filter specs
    // see https://www.mapbox.com/mapbox-gl-js/style-spec/#types-filter
    // performance tests indicate that the fastest way to combine multiple filters is to
    // generate an array with all the matching id's and have only 1 filter of type "id in array"
    map.setFilter("incidents", ['in', 'id'].concat(incidents.filtered.ids));


    EventBus.trigger(EVENT.filterChanged);
  };


  me.updateFilter = function (filter, item) {

    var values = [];
    filter.filterItems.forEach(function (item) {
      if (item.checked) values.push(item.value);
    });

    if (values.length === filter.filterItems.length) {
      // all items checked - ignore filter
      filterFunctionsLookup[filter.id] = undefined;
    } else {
      if (filter.array) {
        filterFunctionsLookup[filter.id] = function (item) {
          var value = item.properties[filter.filterProperty];
          if (value && value.length) {
            return value.some(function (v) {
              return values.includes(v);
            });
          }
          return false;
        };
      } else {
        filterFunctionsLookup[filter.id] = function (item) {
          return values.includes(item.properties[filter.filterProperty]);
        };
      }
    }

    me.filterIncidents();
  };



  /* roadblocks */



  function loadRoadblocks(next) {
    var url = "http://ipis.annexmap.net/api/data/"+Config.apiScope+"/roadblocks?key=ipis";


    var checkpoint = new Date().getTime();
    var now;

    FetchService.json(url, function (data,xhr) {

      if (!data){
        console.error("Failed loading roadblocks");
        if (xhr.hasTimeOut){
          timeOutCount++;
          if (timeOutCount<maxTimeOutRetry){
            UI.showLoaderTimeOut();
            loadRoadblocks();
          }else{
            UI.showLoaderError();
          }
        }else{
          UI.showLoaderError();
        }
      }else{
        now = new Date().getTime();
        console.log("roadblock data loaded in " + (now - checkpoint) + "ms");
        checkpoint = now;

        roadblocks.list = featureCollection();
        roadblocks.types = [];
        roadblocks.typeLookup = {};
        roadblocks.operators = [];
        roadblocks.operatorLookup = {};

        if (data && data.result) data.result.forEach(function(d){
          var item = featurePoint(d.lt, d.ln);

          var t = d.t2 || "";
          t = t.split(",");
          item.properties.types = [];

          t.forEach(function(tp){
            tp = tp.trim();

            if (tp){
              if (!item.properties.typeFirst) item.properties.typeFirst = tp;
              item.properties.types.push(tp);
              if (!roadblocks.typeLookup[tp]){
                roadblocks.typeLookup[tp] = true;
                roadblocks.types.push(tp);
              }
            }
          });


          t = d.os || "";
          t = t.split(",");
          item.properties.operators = [];

          t.forEach(function(tp){
            tp = tp.trim();

            if (tp){
              if (tp === "Forces Étatiques") tp="State Forces";
              if (!item.properties.operatorFirst) item.properties.operatorFirst = tp;
              item.properties.operators.push(tp);
              if (!roadblocks.operatorLookup[tp]){
                roadblocks.operatorLookup[tp] = true;
                roadblocks.operators.push(tp);
              }
            }
          });

          item.properties.id = parseInt(d.i,10);
          item.properties.type = d.t2 || "Unknown";
          item.properties.date = d.d;
          item.properties.description = d.ds || undefined;
          item.properties.source = d.s;
          item.properties.location = d.lo;
          item.properties.operator = d.o;
          item.properties.operatortype = d.ot;
          item.properties.formattedDate = formatDate(d.d);

          roadblocks.list.features.push(item);
        });

        roadblocks.types.sort();
        roadblocks.operators.sort();
        roadblocks.loaded = true;
        if (next) next();
      }
    });
  }

  me.getRoadblockTypes = function(){
    var result = [];


    var mapping = {
      "acces au marche" : {label: "Access to commercial market", icon: "roadblock-7-other", color: "silver"},
      "circulation fluviale" : {label: "River circulation", icon: "roadblock-7-other", color: "silver"},
      "circulation routiere" : {label: "Road circulation", icon: "roadblock-7-other", color: "silver"},
      "frontiere" : {label: "International border", icon: "roadblock-7-other", color: "silver"},
      "limite administrative" : {label: "Administrative border", icon: "roadblock-7-other", color: "silver"},
      "marche" : {label: "Market-based", icon: "roadblock-7-other", color: "silver"},
      "passage fluviale" : {label: "River passage", icon: "roadblock-7-other", color: "silver"},
      "ressources naturelles" : {label: "Natural resources", icon: "roadblock-7-other", color: "silver"},
      "strategique" : {label: "Strategic", icon: "roadblock-7-other", color: "silver"}
    };

    roadblocks.types.forEach(function (type,index) {

      var item = mapping[type] || {label: type, icon: "roadblock-7-other", color: "silver"};
      //var item = {label: type, icon: "roadblock-7-other", color: "silver"};

      result.push({
        label: item.label,
        value: type,
        color: item.color,
        iconImage: item.icon,
        index: 1 //order.indexOf(type)
      });
    });

    return result;

  };

  me.getRoadblockOperators = function(){
    var result = [];

    var mapping = {
      "Anti-Balaka" : {icon: "roadblock-7-acteurs_etatiques", color: "#D16931"},
      "FPRC" : {icon: "roadblock-7-elements_independants", color: "#B5938F"},
      "State Forces" : {label: "State forces", icon: "roadblock-7-groupes_armes", color: "#e20500"},
      "MPC" : {icon: "roadblock-7-groupes_armes", color: "#561410"},
      "RJ" : {icon: "roadblock-7-groupes_armes", color: "#911d18"},
      "UPC" : {icon: "roadblock-7-acteurs_civils", color: "#EA6B97"},
      "Autres" : {label: "Others", icon: "roadblock-7-other", color: "#B4948D"}
    };

    var order = ["Autres"];

    roadblocks.operators.forEach(function (type,index) {

      var item = mapping[type] || {label: type, icon: "roadblock-7-other", color: "silver"};

      result.push({
        label: item.label || type,
        value: type,
        color: item.color,
        iconImage: item.icon,
        index: 1-order.indexOf(type)
      });
    });


    return result.sort(function (a, b) {
      return a.index < b.index ? 1 : -1;
    });
  };

  me.getRoadblocks = function (layer, show) {

    if (roadblocks.loaded) {
      return roadblocks.list;
    } else {
      loadRoadblocks(function () {
        if (show && layer.labelElm && !(layer.labelElm.classList.contains("inactive"))) MapService.addLayer(layer);
      });
    }
  };

  me.getRoadblockDetail = function (roadblock) {
    return roadblock.properties;
  };


  me.updateRoadblockFilter = function (filter, item) {

    roadblocks.filterFuntionLookup = roadblocks.filterFuntionLookup || {};

    var values = [];
    filter.filterItems.forEach(function (item) {
      if (item.checked) values.push(item.value);
    });

    if (values.length === filter.filterItems.length) {
      // all items checked - ignore filter
      roadblocks.filterFuntionLookup[filter.id] = undefined;
    } else {
      if (filter.array) {
        roadblocks.filterFuntionLookup[filter.id] = function (item) {
          var value = item.properties[filter.filterProperty];
          if (value && value.length) {
            return value.some(function (v) {
              return values.includes(v);
            });
          }
          return false;
        };
      } else {
        roadblocks.filterFuntionLookup[filter.id] = function (item) {
          return values.includes(item.properties[filter.filterProperty]);
        };
      }
    }


    me.filterRoadBlocks();
  };

  me.filterRoadBlocks = function () {
    var filteredIds = [];
    var filtered = [];
    var filterFunctions = [];
    roadblocks.filterFuntionLookup = roadblocks.filterFuntionLookup || {};

    for (var key in roadblocks.filterFuntionLookup) {
      if (roadblocks.filterFuntionLookup.hasOwnProperty(key) && roadblocks.filterFuntionLookup[key]) {
        filterFunctions.push(roadblocks.filterFuntionLookup[key]);
      }
    }

    roadblocks.list.features.forEach(function (roadblock) {
      var passed = true;
      var filterCount = 0;
      var filterMax = filterFunctions.length;
      while (passed && filterCount < filterMax) {
        passed = filterFunctions[filterCount](roadblock);
        filterCount++;
      }


      if (passed) {
        filtered.push(roadblock);
        filteredIds.push(roadblock.properties.id);
      }
    });


    map.setFilter("roadblocks", ['in', 'id'].concat(filteredIds));

    EventBus.trigger(EVENT.filterChanged);
  };




  // end roadblocks


  /* Influence zones */


  function loadInfluenceZones(next) {
    var url = "http://ipis.annexmap.net/api/data/caf_dev/influencezones?key=ipis";
    var checkpoint = new Date().getTime();

    influenceZones.years=[];

    FetchService.json(url, function (data) {
      var now = new Date().getTime();
      console.log("influenceZones data loaded in " + (now - checkpoint) + "ms");

      data.features.forEach(function(item){
        item.properties.year = item.properties.date.split("-")[0];
        if (influenceZones.years.indexOf(item.properties.year)<0) influenceZones.years.push(item.properties.year);
      });
      influenceZones.list = data;
      influenceZones.years.sort();
      influenceZones.loaded = true;


      me.updateInfluenceZonesYear();


      if (next) next();
    });
  }


  me.getInfluenceZones = function (layer, show) {
    if (influenceZones.loaded) {
      return influenceZones.list;
    } else {
      loadInfluenceZones(function () {
        if (show && layer.labelElm && !(layer.labelElm.classList.contains("inactive"))) MapService.addLayer(layer);
      });
    }
  };

  me.getInfluenceZonesYears = function(){
    var result = [];

    influenceZones.years.forEach(function(item){
      result.push({
        label: item,
        value: item,
        color: "grey",
        index: item //order.indexOf(type)
      });
    });


    return result.sort(function (a, b) {
      return a.index < b.index ? 1 : -1;
    });


  };


  me.updateInfluenceZonesFilter = function (filter, item) {

    if (!influenceZones.loaded) return;
    influenceZones.filterFunctionsLookup = influenceZones.filterFunctionsLookup || {};

    var values = [];
    filter.filterItems.forEach(function (item) {
      if (item.checked) values.push(item.value);
    });

    if (values.length === filter.filterItems.length) {
      // all items checked - ignore filter
      influenceZones.filterFunctionsLookup[filter.id] = undefined;
    } else {
      if (filter.array) {
        influenceZones.filterFunctionsLookup[filter.id] = function (item) {
          var value = item.properties[filter.filterProperty];
          if (value && value.length) {
            return value.some(function (v) {
              return values.includes(v);
            });
          }
          return false;
        };
      } else {
        influenceZones.filterFunctionsLookup[filter.id] = function (item) {
          return values.includes(item.properties[filter.filterProperty]);
        };
      }
    }

    me.filterInfluenceZones();
  };

  me.filterInfluenceZones = function () {
    var filteredIds = [];
    var filtered = [];
    var filterFunctions = [];

    for (var key in  influenceZones.filterFunctionsLookup) {
      if (influenceZones.filterFunctionsLookup.hasOwnProperty(key) && influenceZones.filterFunctionsLookup[key]) {
        filterFunctions.push(influenceZones.filterFunctionsLookup[key]);
      }
    }

    influenceZones.list.features.forEach(function (item) {
      var passed = true;
      var filterCount = 0;
      var filterMax = filterFunctions.length;
      while (passed && filterCount < filterMax) {
        passed = filterFunctions[filterCount](item);
        filterCount++;
      }

      //if (passed && influenceZones.currentYear){
      //	if (item.properties.year !== influenceZones.currentYear) passed=false;
      //}

      if (passed) {
        filtered.push(item);
        filteredIds.push(item.properties.id);
      }
    });


    map.setFilter("influenceZones", ['in', 'id'].concat(filteredIds));

    EventBus.trigger(EVENT.filterChanged);
  };

  me.updateInfluenceZonesYear = function(){
    /*if (influenceZones.years){
    influenceZones.currentYear = influenceZones.years[influenceZones.years.length-1];
    if (currentEndMonth){
    influenceZones.currentYear = influenceZones.years[0];
    influenceZones.years.forEach(function(year){
    if (year<currentEndMonth) influenceZones.currentYear = year;
  });
}
console.error(influenceZones.currentYear);
}*/
};


me.updateTimeFilter = function(startMonth,endMonth){
  if (startMonth && endMonth){
    currentStartMonth = startMonth.split("-").join("/");
    currentEndMonth = endMonth.split("-").join("/");

    console.log("setting timefilter to " + currentStartMonth + " " + currentEndMonth);

    me.filterIncidents();

    /*if (influenceZones.loaded){
    me.updateInfluenceZonesYear();
    me.filterInfluenceZones();
  }*/

  EventBus.trigger(EVENT.yearFilterChanged);
}


};

me.getCurrentEndMonth = function(){
  return currentEndMonth;
};

me.getCurrentEndYear = function(){
  var result = 2018;
  if (currentEndMonth && currentEndMonth.indexOf("2017/12")<0){
    result = parseInt(currentEndMonth.substr(0,4));
  }
  return  result;
};




function featureCollection() {
  return {
    "type": "FeatureCollection",
    "features": []
  }
}

function featurePoint(lat, lon) {
  return {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "Point",
      "coordinates": [lon, lat]
    }
  }
}

function monthName(i){
  var result = i;
  switch(i){
    case "01": result =  "Januari"; break;
    case "02": result =  "Februari"; break;
    case "03": result =  "March"; break;
    case "04": result =  "April"; break;
    case "05": result =  "May"; break;
    case "06": result =  "June"; break;
    case "07": result =  "July"; break;
    case "08": result =  "August"; break;
    case "09": result =  "September"; break;
    case "10": result =  "October"; break;
    case "11": result =  "November"; break;
    case "12": result =  "December"; break;
  }
  return result;
}

function normalizeDate(d){
  if (d){
    var p = d.split("-");
    if (parseInt(p[0])<1000){
      return p[2] + "/" + p[1] + "/" + p[0];
    }
  }
  return d;
}

function formatDate(d){
  if (d){

    var p;
    if (d.indexOf("-")>0)p = d.split("-");
    if (d.indexOf("/")>0) p = d.split("/");

    if (p && p.length===3){
      if (parseInt(p[0])>1000){
        return p[2] + " " + monthName(p[1]) + " " + p[0];
      }else{
        return p[0] + " " + monthName(p[1]) + " " + p[2];
      }
    }

  }
  return d;
}

function monthDate(d){
  if (d){
    var p = d.split("-");
    return p[0] + "/" + p[1];
  }
  return "";
}


return me;


}();
