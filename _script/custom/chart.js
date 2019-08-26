var Chart = function(){

    var me = {};
    var chart;
    var currentScope = "mines";

    me.render = function(){
        
        var subtitle = document.getElementById("chart_subtitle");
        var legend = document.getElementById("legend");
        if (!subtitle) legend.innerHTML = Template.get("chart");
        
        
        if (chart) chart = chart.destroy();
        
        var sourceData = Config.layers.miningsites_new.data;
        if (sourceData){

            var features = sourceData.features;
            if (Config.layers.miningsites_new.bbox)
                features = map.queryRenderedFeatures(Config.layers.miningsites_new.bbox, { layers: ["miningsites_new"] });
            
            var max =  sourceData.features.length;
            var maxWorkers = 0;
            
            var filterElm = Config.layers.miningsites_new.filters[0];
            var items = filterElm.filterItems;
            
            var mineralMap = {};
            var workerMap = {};
            items.forEach(function(item){
                mineralMap[item.value] = item.checked;
            });

            var totalMines = 0;
            var dataMines = {};
            var totalWorkers = 0;
            var dataWorkers = {};
           
            
            features.forEach(function(feature){
               if (mineralMap[feature.properties.mineral]){
                   totalMines++;
                   totalWorkers += (feature.properties.workers || 0);
                   var mineral = feature.properties.mineral || "Autre";
                   dataMines[mineral] = (dataMines[mineral] || 0) + 1;
                   dataWorkers[mineral] = (dataWorkers[mineral] || 0) + feature.properties.workers;
               }
                maxWorkers += (feature.properties.workers || 0);
            });

            var current = totalMines;
            var data = dataMines;
            var tooltip = " sites miniers";
            if (currentScope === "workers"){
                current = totalWorkers;
                max = maxWorkers;
                data = dataWorkers;
                tooltip = " creuseurs";
            }
            
            subtitle.innerHTML = current + " de " + max + tooltip;
            legend.classList.add("show");
            
            var chartData = {
                columns: [],
                colors: [],
                type : 'donut',
                onclick: function (d, i) { /*console.log("onclick", d, i);*/ },
                onmouseover: function (d, i) { /*console.log("onmouseover", d, i);*/ },
                onmouseout: function (d, i) { /*console.log("onmouseout", d, i);*/ }
            };
            
            for (var key in data){
                if (data.hasOwnProperty(key)){
                    chartData.columns.push([key,data[key]]);
                    chartData.colors[key] = Config.colorMap[key] || "grey";
                }
            }

            chart = c3.generate({
                bindto: '#chart1',
                size:{
                    height: 300,
                    width: 190
                },
                data: chartData,
                donut: {
                    title: current
                },
                legend: {
                    item: {
                        onclick: function (id) {}
                    }
                },
                tooltip: {
                    format: {
                        title: function (d) { return 'Substance&nbsp;minérale&nbsp;principale'},
                        value: function (value, ratio, id) {
                            return value + tooltip.split(" ").join("&nbsp;");
                        }
                        // value: d3.format(',') // apply this format to both y and y2
                    }
                }
            });
        }
    };
    
    me.setScope = function(scope){
        currentScope = scope;
        var other = (scope === "mines") ? "workers" : "mines";
        document.getElementById("tab_" + scope).classList.remove("inactive");
        document.getElementById("tab_" + other).classList.add("inactive");
        me.render();
    };

    EventBus.on(EVENT.filterChanged,me.render);


    return me;

}();