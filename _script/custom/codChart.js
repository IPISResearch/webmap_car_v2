var CodChart = function(){

    var me = {};
    var chart;

    me.render = function(){


        if (chart) chart = chart.destroy();

        var mines = Data.getFilteredMines();

        var max = Data.getMinesTotal();
        var current = mines.length;

        document.getElementById("chart_current").innerHTML = current;
        document.getElementById("chart_total").innerHTML = max;
        document.getElementById("legend").classList.add("show");

        var data = {};
        var chartData = {
            columns: [],
            colors: [],
            type : 'donut',
            onclick: function (d, i) { /*console.log("onclick", d, i);*/ },
            onmouseover: function (d, i) { /*console.log("onmouseover", d, i);*/ },
            onmouseout: function (d, i) { /*console.log("onmouseout", d, i);*/ }
        };

        // TODO: include in base data filter ?
        mines.forEach(function(mine){
            var mineral = mine.properties.mineral || "Autre";
            data[mineral] = (data[mineral] || 0) + 1;
        });

        for (var key in data){
            if (data.hasOwnProperty(key)){
                chartData.columns.push([key,data[key]]);
                chartData.colors[key] = Data.getColorForMineral(key);
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


    };

    EventBus.on(EVENT.filterChanged,me.render);


    return me;

}();