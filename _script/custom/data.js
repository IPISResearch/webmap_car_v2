var Data = function () {

  // preload and transform datasets
  var me = {};
  var mineDetails = {};


  me.init = function () {

  };


  me.getMineDetail = function (mine) {

    // don't use mine.properties directly as this is a shallow copy in Mapbox

    console.log(mine.properties);
    var p = mineDetails[mine.properties.id] || Object.assign({}, mine.properties);

    if (!p.hasDetail) {
      p.fLongitude = decimalToDegrees(mine.geometry.coordinates[0], "lon");
      p.fLatitude = decimalToDegrees(mine.geometry.coordinates[1], "lat");

      var accidents = parseInt(p.accident_injured);
      var accidents2 = parseInt(p.accident_dead);
      if (isNaN(accidents)) accidents = 0;
      if (isNaN(accidents2)) accidents2 = 0;
      p.accidents = accidents+accidents2;

      p.hasArmedPresence = !!(p.actor1name || p.actor2name || p.actor3name);
      p.hasServices = !!(p.services1_name || p.services2_name || p.services3_name);

      console.error(p.hasServices);

      if (typeof p.servicesDetail === "string") p.servicesDetail = JSON.parse(p.servicesDetail);
      //p.services || "Pas de présence des services constatée";

      p.infoTab = Template.render("mineDetail",p);

      p.actor1Table = buildArmyDetails(p,1);
      p.actor2Table = buildArmyDetails(p,2);
      p.actor3Table = buildArmyDetails(p,3);


      p.armyTab = Template.render("armyDetail",p);
      p.servicesTab = Template.render("servicesDetail",p);
      p.womanChildrenTab = Template.render("womanChildrenDetail",p);
      p.substancesTab = Template.render("mineralDetail",p);
      p.hasDetail = true;
    }

    return p;
  };


  function buildArmyDetails(data,index){
     var result = "";
     var root = "actor" + index + "name";

     if (data[root]){
       result += buildTableRow("Nom",data[root]);
       result += buildTableRow("Fréquence",data[root + "_frequency"]);
       result += buildTableRow("Tax",data[root + "_tax"],true);
       result += buildTableRow("Pillage",data[root + "_pillage"],true);
       result += buildTableRow("Travail forcé",data[root + "_forcedlabour"],true);
       result += buildTableRow("Acheter des minéraux",data[root + "_buyminerals"],true);
       result += buildTableRow("Creuser eux-mêmes",data[root + "_digging"],true);
       result += buildTableRow("Monopoly",data[root + "_monopoly"],true);

       result += '<tr><td colspan="2">&nbsp;</td></tr>';
     }
     return result;
  }

  function buildTableRow(key,value,withCheckbox){
    if (withCheckbox){
      if (value === "") return "";
      if (value === "0") value=false;
      value = value ? '<b class="cb yes">Oui</b>' : '<b class="cb no">Non</b>'
    }

    if (value){
      return '<tr><td class="line col1" nowrap="""nowrap">'+key+': </td><td class="line">'+value+'</td></tr>';
    }

    return "";
  }

  me.getYearClamp = function(){
    return false
  };

  me.featureCollection = function() {
    return {
      "type": "FeatureCollection",
      "crs": {
        "type": "name",
        "properties": {
          "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
        }
      },
      "features": []
    }
  };

  me.featurePoint = function(lat, lon) {
    return {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        "coordinates": [lon, lat]
      }
    }
  };

  me.featureLine = function(lat1,lon1,lat2,lon2){
    return {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": [[lon1,lat1],[lon2,lat2]]
      }
    }
  };


  return me;


}();