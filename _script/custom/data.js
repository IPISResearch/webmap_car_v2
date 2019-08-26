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
      
      p.infoTab = Template.render("mineDetail",p);
      p.armyTab = Template.render("armyDetail",p);
      p.servicesTab = p.services || "Pas de présence des services constatée";
      p.womanChildrenTab = Template.render("womanChildrenDetail",p);
      p.substancesTab = p.minerals; 
      p.hasDetail = true;
    }

    return p;
  };
  
  me.getYearClamp = function(){
    return false
  };
  

return me;


}();
