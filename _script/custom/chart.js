var Chart = function(){

	var me = {};
	var canvas,ctx;
	var startYear = 2012;
	var startMonth = 9;
	var end = "2017-05";

	function createChart(){
		canvas = document.createElement("canvas");
		canvas.width = 250;
		canvas.height = 120;
		ctx = canvas.getContext("2d");

		document.getElementById("chart").appendChild(canvas);
	}

	me.init = function(){
		createChart();

		// init with precalculated data as initial visual;
		FetchService.json("data/chart.json",function(result){
			if (result) me.update(result);
		})
	};

	me.update = function(totals){

		if (!totals){
			totals = {};
			var data = map.queryRenderedFeatures({layers:['incidents1']});
			data.forEach(function(item){
				var month = item.properties.month || item.properties.date.substr(0,7);
				totals[month] = (totals[month] || 0)+1;
			});

			//console.error(JSON.stringify(totals));
		}

		var max = 0;

		for (var key in totals){
			if (totals.hasOwnProperty(key)) max = Math.max(max,totals[key]);
		}

		var year = startYear;
		var month = startMonth;
		var m = formatMonth(year,month);

		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = "green";

		var x = 0;
		var yearWidth = 0;
		var yearX = 0;

		while (m<end){
			var h = 0;
			if (max) h = 100 * (totals[m] || 0)/max;
			ctx.fillRect(x,100-h,3,h);
			x+=4;
			yearWidth+=4;

			month++;
			if (month>12){
				renderYear(year,yearX,yearWidth);
				month = 1;
				year++;
				yearX += yearWidth;
				yearWidth = 0;
			}
			m = formatMonth(year,month);
		}
		renderYear(year,yearX,yearWidth);
	};

	function renderYear(year,x,w){
		ctx.strokeStyle = "silver";
		ctx.fillStyle = "#e5efce";
		ctx.font = "11px sans-serif";
		ctx.textAlign = "center";

		ctx.fillRect(x,104,w-2,16);
		ctx.strokeRect(x,104,w-2,16);

		if (w<20) year = year % 1000;

		ctx.fillStyle = "green";
		ctx.fillText(year,x + w/2 - 1,114);
	}

	function formatMonth(year,month){
		var m = month;
		if (month<10) m = "0" + m;
		return year + "-" + m;
	}



	return me;

}();