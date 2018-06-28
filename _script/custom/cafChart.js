var CafChart = function(){

    var me = {};

    var chart;
    var chartSelect;
    var dotStart;
    var dotEnd;
    var bar;
    var yearAxis;

    var monthWidth;
    var monthOffsetLeft;
    var selectWidth;

    var currentStartMonth;
    var currentStartMonthIndex;
    var currentEndMonthIndex;
    var currentEndMonth;
    var isDragging;
    var isVisible;

    var months;

    var zones = {
		west: {zone: "West", label: "West", data: []},
		centre: {zone: "Centre", label: "Centre", data: []},
		east: {zone: "East", label: "East", data: []},
		bangui: {zone: "Bangui", label: "Bangui", data: []}
    };

    var getData = function(){

        for (var key in zones){
            if (zones.hasOwnProperty(key)){
                var zone = zones[key];
                zone.fatalities = Data.getFatalitiesCount(zone.zone);
				zone.data = [zone.label];
            }
        }

        months = [];

        for (var fkey in zones.east.fatalities){
            if (zones.east.fatalities.hasOwnProperty(fkey)){
                months.push(fkey.replace("/","-") + "-01");

				for (key in zones){
					if (zones.hasOwnProperty(key)){
						zones[key].data.push(zones[key].fatalities[fkey] || 0);
					}
				}
            }
        }

        months.unshift('x');
    };

    me.render = function(){

    	if (document.getElementById("chartContainer")) return;

        getData();

        var container = document.createElement("div");
        container.id = "chartContainer";
        container.innerHTML = Template.get("chart");
        document.body.appendChild(container);

        var chartbutton = document.createElement("div");
        chartbutton.id = "chartbutton";
        chartbutton.onclick = function(){
            container.classList.remove("hidden");
            chartbutton.classList.remove("active");
            isVisible = true;
            me.update();
            resizeChart();
        };
        document.body.appendChild(chartbutton);

        chartSelect = document.getElementById("chartselect");
        dotStart = document.getElementById("dotstart");
        dotEnd = document.getElementById("dotend");
        bar = document.getElementById("selectbar");
        yearAxis = document.getElementById("yearaxis");
        var closeButton = document.getElementById("closeChart");
        closeButton.onclick = function(){
            container.classList.add("hidden");
            chartbutton.classList.add("active");
            isVisible = false;
        };
        var w = container.offsetWidth-10;
        isVisible = true;

        chart = c3.generate({
            size: {
                height: 150,
                width: w
            },
			color: {
				pattern: ['#0074A7', '#D97713', '#85A308', '#DA0E00']
			},
            data: {
                x: 'x',
                columns: [
                    months,
					zones.west.data,
                    zones.centre.data,
					zones.east.data,
                    zones.bangui.data
                ],
                types: {
					"West": 'area-spline',
                    "Centre": 'area-spline',
					"East": 'area-spline',
                    "Bangui": 'area-spline'
                }
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: '%b %Y'
                    }
                }
            },
            legend: {
                show: true,
                position: 'inset',
                inset: {
                    anchor: 'top-right',
                    x: 78,
                    y: 0,
                    step: 2
                }
            },
            onrendered: function(){
                if (isDragging) return;
                var axis = container.querySelector(".c3-axis-x");
                var rect = axis.getBoundingClientRect();

                var offsetLeft = 0;
                var offsetRight = 0;

                var ticks = axis.querySelectorAll(".tick");
                if (ticks.length){
                    offsetLeft = getTickTranslation(ticks[0]);
                    offsetRight = getTickTranslation(ticks[ticks.length-1]);
                }
                monthOffsetLeft = offsetLeft;

                selectWidth = offsetRight ? offsetRight-offsetLeft : rect.width-(offsetLeft*2);

                chartSelect.style.left = (rect.x + offsetLeft) + "px";
                chartSelect.style.width = selectWidth + "px";


                me.buildYears();

                dotStart.left = (currentStartMonthIndex || 0) * monthWidth;
                dotStart.min = 0;

                dotEnd.left = currentEndMonthIndex ? currentEndMonthIndex*monthWidth:selectWidth;
                dotEnd.max = selectWidth;

                bar.min = 0;

                dotEnd.style.left = dotEnd.left + "px";
                dotStart.style.left = dotStart.left + "px";

                bar.style.width = (dotEnd.left - dotStart.left) + "px";
                bar.style.left = dotStart.left + "px";

            }
        });

        setupDotDrag();


        function resizeChart(){
            if (!chart) return;
            if (!isVisible) return;
            var w = container.offsetWidth - 10;
            chart.resize({width:w})
        }

        function getTickTranslation(tick){
            var result = 0;
            var transform = tick.getAttribute("transform");
            // note: Edge doesn't display 0 values, so the transform would only contain the X value
            if (transform){
                transform = parseInt(transform.split(",")[0].replace(/\D/g,''),10);
                if (!isNaN(transform)) result=transform;
            }
            return result;
        }

        EventBus.on(EVENT.UIResize,function(){
            resizeChart();
        });

    };

    me.update = function(){
        if (!chart) return;
        if (!isVisible) return;
        getData();
        chart.load(
            {
                columns: [
                    months,
					zones.west.data,
                    zones.centre.data,
					zones.east.data,
                    zones.bangui.data
                ]
            }
        );
    };

    me.buildYears = function(){
        var monthCount = months.length-2;
        monthWidth = selectWidth/monthCount;

        var startMonth = 4;
        var yearCount = Math.floor((monthCount-startMonth)/12);
        var endMonth = monthCount-(yearCount*12)-startMonth;

        var startYear = parseInt(months[1].split("-")[0]);

        yearAxis.innerHTML = "";

        var even = 1;
        function yearblock(year){
            var div = document.createElement("div");
            div.className = "yearblock " + "block" + even;
            div.innerHTML = "<i>" + year + "</i>";
            even = 1-even;
            return div;
        }

        for (var i = 0; i<yearCount+2;i++){
            var block = yearblock(startYear+i);
            block.style.width =  Math.round(12*monthWidth) + "px";
            if (i==0) block.style.width = Math.round(startMonth*monthWidth) + "px";
            if (i==yearCount+1) block.style.width =  Math.round(endMonth*monthWidth) + "px";
            yearAxis.appendChild(block);
        }


    };

    function setupDotDrag(){
        var dragElement;


        setupDrag(dotStart);
        setupDrag(dotEnd);

        document.body.addEventListener("mousemove",function(e){
            if (isDragging){
                e.preventDefault();
                var delta = e.pageX - dragElement.startX;
                var target = dragElement.startLeft + delta;
                if (target < dragElement.min) target=dragElement.min;
                if (target > dragElement.max) target=dragElement.max;
                dragElement.left = target;
                dragElement.style.left = target + "px";
                if (dragElement.id == "selectbar"){
                    updateHandles();
                }else{
                    updateBar();
                    //updateYears();
                }
            }
        });

        document.body.addEventListener("mouseup",function(){
            if (isDragging){
                isDragging = false;
                dragElement.classList.remove("active");
                dotStart.classList.remove("baractive");
                dotEnd.classList.remove("baractive");
                updateYears();
                updateMinMax();
            }
        });

        function setupDrag(elm){
            //updateMinMax();
            elm.onmousedown = function(e){
                dragElement = elm;
                dragElement.classList.add("ontop");
                if (dragElement.classList.contains("start")){
                    dotEnd.classList.remove("ontop");
                }else{
                    dotStart.classList.remove("ontop");
                }
                elm.startX = e.pageX;
                elm.startLeft = elm.left;
                elm.classList.add("active");
                isDragging = true;
            };

        }

        function updateMinMax(){
            dotStart.max = dotEnd.left-2;
            dotEnd.min = dotStart.left+2;
            bar.max = selectWidth - bar.width;
        }

        function updateBar(){
            bar.width = Math.max((dotEnd.left - dotStart.left),2);
            bar.left = dotStart.left-2;

            bar.style.width = bar.width + "px";
            bar.style.left = bar.left + "px";

        }

        function updateHandles(){
            dotStart.left = bar.left+2;
            dotEnd.left = bar.left+bar.width+1;
            dotStart.style.left = dotStart.left + "px";
            dotEnd.style.left = dotEnd.left + "px";
        }

        function updateYears(){
            var startMonth = Math.round(dotStart.left/monthWidth);
            var endMonth = Math.round(dotEnd.left/monthWidth);

            if (!isDragging){
                dotStart.left = Math.round(startMonth*monthWidth);
                dotStart.style.left = dotStart.left + "px";


                dotEnd.left = Math.round(endMonth*monthWidth);
                dotEnd.style.left = dotEnd.left + "px";

                updateBar();
            }


            if (months[startMonth+1] !== currentStartMonth){
                currentStartMonth = months[startMonth+1];
                currentStartMonthIndex = startMonth;
                //UI.hideDashboard();
                Data.updateTimeFilter(currentStartMonth,currentEndMonth);
            }
            if (months[endMonth+1] !== currentEndMonth){
                currentEndMonth = months[endMonth+1];
                currentEndMonthIndex = endMonth;
                //UI.hideDashboard();
                Data.updateTimeFilter(currentStartMonth,currentEndMonth);
            }


        }

        bar.onmouseover = function(){
            if (!isDragging){
                dotStart.classList.add("baractive");
                dotEnd.classList.add("baractive");
            }

        };

        bar.onmousedown = function(e){
            dragElement = bar;
            bar.startX = e.pageX;
            bar.startLeft = bar.left;
            bar.classList.add("active");
            isDragging = true;
        };

        bar.onmouseout = function(){
            if (!isDragging){
                dotStart.classList.remove("baractive");
                dotEnd.classList.remove("baractive");
            }

        }
    }

    EventBus.on(EVENT.filterChanged,me.update);

    return me;


}();