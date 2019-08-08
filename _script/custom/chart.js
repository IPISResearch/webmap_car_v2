var Chart = function(){

    var me = {};
    var chart;

    me.render = function(){
        
        if (chart) chart = chart.destroy();
        
        var sourceData = Config.layers.miningsites_new.data;
        if (sourceData){

            var max = sourceData.features.length;
            
            var filterElm = Config.layers.miningsites_new.filters[0];
            var items = filterElm.filterItems;
            
            var mineralMap = {};
            items.forEach(function(item){
                mineralMap[item.value] = item.checked;
            });

            var total = 0;
            var data = {};
            
            
            sourceData.features.forEach(function(feature){
               if (mineralMap[feature.properties.mineral]){
                   total++;
                   var mineral = feature.properties.mineral || "Autre";
                   data[mineral] = (data[mineral] || 0) + 1;
               } 
            });

            var current = total;


            document.getElementById("chart_current").innerHTML = current;
            document.getElementById("chart_total").innerHTML = max;
            document.getElementById("legend").classList.add("show");

            
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
                            return value + "&nbsp;site&nbsp;miniers";
                        }
                        // value: d3.format(',') // apply this format to both y and y2
                    }
                }
            });
            
        }
        
        
        

        


    };

    EventBus.on(EVENT.filterChanged,me.render);


    return me;

}();