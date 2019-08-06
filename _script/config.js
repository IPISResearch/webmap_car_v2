var version = "0.0.1";

var Config = {
	mapId: "CAFV2",
	apiScope: "caf",
	apiScopeDev: "caf",
	useMapBoxInspector: false,
	templateURL: "_templates/main.html",
	showDisclaimerOnFirstUse: false,
	disclaimerUrl: "_templates/disclaimer.html",
	infoUrl: "_templates/info.html",
	// starting point for map
	mapCoordinates: {
		x: 22,
		y: 5.5,
		zoom: 5.5,
		bounds: [[14.05, 0.20], [30.38, 10.26]],
		maxZoom: 18,
		minZoom: 5
	},
	defaultBaseLayerIndex: 4,
	// if preLoad is defined, this occurs before the map is shown - used to pre-generate datasets etc.
	preLoad: function () {
		Data.init();
	},
	// baselayer info
	baselayers: [
		{index: 1, id: "satellite", label: "Satellite", url: "mapbox://styles/ipisresearch/ciw6jsekm003a2jql0w0a7qca"},
		{index: 4, id: "streetscar", label: "Streets (IPIS)", url: "mapbox://styles/ipisresearch/cjix950k084i72rno4tpu5mkm"}, // this is streets CAR
		{index: 2, id: "streets", label: "Streets (OSM)", url: "mapbox://styles/ipisresearch/ciw6jpn5s002r2jtb615o6shz"},
		{index: 3, id: "empty", label: "Empty", url: "mapbox://styles/ipisresearch/cjav3e31blm5w2smunhb32kzm"}
	],
	defaultRefLayer: "ref_layer", // reference layer where to insert all custom layers - should be present in all baselayers
	// layer info
	layers: {
		incidents: {
			id: "incidents",
			label: "Incidents",
			source: function () {
				return Data.getIncidents()
			},
			sourceId: "incidents",
			popupOnhover: function (feature) {
				return "<b>" + feature.properties.formattedDate + "</b><br>" + feature.properties.type
			},
			onClick: function (item) {
				//UI.popup(Data.getMineDetail(item),"minePopup",item.geometry.coordinates,true);
				UI.showDashboard(item);
			},
			onFilter: function () {
				console.log("filter");
				//Chart.update();
			},
			onLoaded: function () {
				console.log("loaded");
				//CafChart.render();
				//Chart.update();
			},
			onToggle: function (visible) {
				/*var chartbutton = document.getElementById("chartbutton");
				var closeChart = document.getElementById("closeChart");
				visible ? chartbutton.click() : closeChart.click();*/
			},
			filterId: 1,
			filters: [
				//{id: "years", index: 1, label: "Année de dernière visite",items: Data.getYears,onFilter: Data.updateFilter,filterProperty:"year",maxVisibleItems:5},
				{
					id: "types",
					index: 2,
					label: "Incident Type",
					items: Data.getIncidentTypes,
					onFilter: Data.updateFilter,
					filterProperty: "type",
					maxVisibleItems: 10
				},
				{
					id: "actors",
					index: 3,
					label: "Actors",
					items: Data.getActors,
					onFilter: Data.updateFilter,
					filterProperty: "actors",
					array: true,
					maxVisibleItems: 5
				},
				{
					id: "keyIssues", index: 4, label: "Key Issues", items: [
						{label: "Mining", value: 1, color: "silver"},
						{label: "Roadblocks", value: 2, color: "silver"},
						{label: "Pastoralism", value: 3, color: "silver"},
						{label: "Pillage", value: 4, color: "silver"},
						{label: "Abduction", value: 5, color: "silver"},
						{label: "Fulani targeted", value: 6, color: "silver"},
						{label: "Humanitarian targeted", value: 7, color: "silver"}
					], onFilter: Data.updateFilter, filterProperty: "keyIssues", array: true
				}
				//{id: "workers", index: 7, label: "Nombre de creuseurs",items:[
				//  {label: "Aucun", value:0},
				//  {label: "1 à 50", value:1},
				//  {label: "50 à 500", value:2},
				//  {label: "Plus que 500", value:3}
				//],onFilter: Data.updateFilter,filterProperty: "workergroup"},
				//{id: "mercury", index: 3, label: "Traitement de l’or au mercure<br>&ensp;<small>(enregistré à partir de 2015)</small>",
				//items: [
				//  {label: "Traitement au mercure", value:2},
				//  {label: "Pas de traitement au mercure", value:1},
				//  {label: "Pas de données", value:0}
				//],onFilter: Data.updateFilter,filterProperty: "mercury"}//,
				//{id: "projects", index: 8, label: "Projets",items: Data.getProjects,onFilter: Data.updateFilter,filterProperty:"project",maxVisibleItems:5}
			],
			display: {
				type: 'circle',
				visible: true,
				canToggle: true,
				size: {
					property: 'fatalities',
					interval: [[0, 4], [1, 5], [2, 6], [4, 7], [100, 9], [150, 12]]
				},
				color: {
					property: "type",
					data: function () {
						return Data.getIncidentTypes();
					}
				},
				circleOpacity: 0.5,
				zIndex: 100
			}
		},
		influenceZones: {
			id: "influenceZones",
			filterId: 3,
			filters: [
				{
					id: "group", index: 41, label: "Group", items: [
						{label: "3R", value: "3R", color: "#ece26f"},
						{label: "Anti-Balaka", value: "Anti-balaka", color: "#9fdad7"},
						{label: "FDPC", value: "FDPC", color: "#e4d785"},
						{label: "FPRC", value: "FPRC", color: "#c0e4c3"},
						{label: "LRA", value: "LRA", color: "#ca9487"},
						{label: "MPC", value: "MPC", color: "#e4cc95"},
						{label: "RJ", value: "RJ", color: "#e3b258"},
						{label: "RPRC", value: "RPRC", color: "#7ab38e"},
						{label: "Seleka", value: "Seleka", color: "#bdddb0"},
						{label: "UPC", value: "UPC", color: "#8cbbca"},
						{label: "none", value: "none", color: "#c3bebf"}
					], onFilter: Data.updateInfluenceZonesFilter, filterProperty: "group"
				},
				{
					id: "year", index: 42, label: "Year", singleValue: true, items: [
						{label: "2017", value: "2017", color: "silver"},
						{label: "2014", value: "2014", color: "silver"}
					], onFilter: Data.updateInfluenceZonesFilter, filterProperty: "year"
				}
				//{id: "year", index: 42, label: "Year",items: Data.getInfluenceZonesYears,onFilter: Data.updateInfluenceZonesFilter,filterProperty: "year"}
			],
			label: "Zones of Influence",
			source: function (layer, show) {
				return Data.getInfluenceZones(layer, show)
			},
			sourceId: "influenceZones",
			display: {
				type: 'fill',
				fillColor: {
					property: "group",
					data: [
						{label: "Anti-Balaka", value: "Anti-balaka", color: "#77c1d3"},
						{label: "FPRC", value: "FPRC", color: "#83d9b6"},
						{label: "UPC", value: "UPC", color: "#98b5e2"},
						{label: "RJ", value: "RJ", color: "#e2a634"},
						{label: "3R", value: "3R", color: "#f5e14a"},
						{label: "LRA", value: "LRA", color: "#ae6774"},
						{label: "MPC", value: "MPC", color: "#e29d4a"},
						{label: "RPRC", value: "RPRC", color: "#52907f"},
						{label: "FDPC", value: "FDPC", color: "#e0ba21"},
						{label: "Seleka", value: "Seleka", color: "#7cc886"},
						{label: "none", value: "none", color: "#c3bebf"}
					]
				},
				fillOpacity: 0.4,
				visible: false,
				canToggle: true,
				zIndex: 99,
				filter: ["==", "year", "2017"]
			},
			//popupOnhover: "group",
			//onClick: function(item,lngLat){
			//UI.hideDashboard();
			//UI.popup(item.properties,"protectedAreaPopup",lngLat,true);
			//},
			onLoaded: function () {
				// set UI state to initial filter;
				var filter = this.filters[1];
				var filterItem = filter.filterItems[0];
				UI.updateFilter(filter, filterItem);
			}
		},
		roadblocks: {
			id: "roadblocks",
			label: "Roadblocks",
			source: function (layer, show) {
				return Data.getRoadblocks(layer, show)
			},
			sourceId: "roadblocks",
			popupOnhover: function (feature) {
				return "<b>" + feature.properties.formattedDate + "</b><br>" + feature.properties.location
			},
			onClick: function (item, point, fromSpider) {
				//UI.hideDashboard();
				var offset;
				if (fromSpider) {
					offset = item.properties.spiderOffset;
				}
				UI.popup(Data.getRoadblockDetail(item), "roadblockPopup", item.geometry.coordinates, true, offset);
			},
			display: {
				visible: false,
				canToggle: true,
				type: 'symbol',
				iconImage: {
					property: "operatorFirst",
					data: Data.getRoadblockOperators
				},
				iconSize: 1,
				iconOpacity: {
					stops: [[1, 0.7], [5, 0.8], [7, 1]]
				},
				zIndex: 98
			},
			filterId: 2,
			filters: [
				{
					id: "op",
					index: 31,
					label: "Operator Type",
					items: Data.getRoadblockOperators,
					onFilter: Data.updateRoadblockFilter,
					filterProperty: "operators",
					array: true
				},
				{
					id: "bar",
					index: 31,
					label: "Roadblock Type",
					items: Data.getRoadblockTypes,
					onFilter: Data.updateRoadblockFilter,
					filterProperty: "types",
					array: true
				}
			]
		},
		miningsites_placeholder: {
			placeholder: true,
			id: "miningsites_placeholder",
			filterId: 14,
			label: "Mining Sites <small>(2017)</small>",
			source: "http://ipis.annexmap.net/api/data/caf/miningsites",
			sourceId: "miningsites_base",
			display: {
				type: 'circle',
				color: 'rgba(0,0,0,0)',
				circleStrokeColor: 'rgba(0,0,0,0)',
				visible: true,
				canToggle: true,
				zIndex: 98
			},
			onLoaded: function () {
				var features = map.querySourceFeatures("miningsites_base");
				var collection = {
					"type": "FeatureCollection",
					"features": []
				};
				features.forEach(function (item) {
					var substance;
					item.properties.mineral = item.properties.substance_1;
					switch (item.properties.mineral) {
						case "Diamond":
						case "Gold":
						case "Iron":
						case "Copper":
						case "Uranium":
						case "Cassiterite":
						case "Manganese":
							substance = item.properties.mineral;
							break;
						default:
							substance = "Other";
					}

					item.properties.substance = substance;
					collection.features.push(item);
				});

				console.log(collection);

				var filterItems = [
					{value: "Diamond", color: "#78bfcc"},
					{value: "Gold", color: "#cca621"},
					{value: "Iron", color: "#c6d4dc"},
					{value: "Copper", color: "#a14f1c"},
					{value: "Uranium", color: "#99d921"},
					{value: "Cassiterite", color: "#3b649f"},
					{value: "Manganese", color: "#a96594"},
					{value: "Other", color: "#a3b4aa"}
				];

				var parent = this.labelElm.parentElement;

				this.filters = [
					{
						id: "substance",
						index: 141,
						label: "Substances",
						items: filterItems,
						onFilter: MapService.genericFilter,
						filterProperty: "substance"
					}
				];

				UI.appendLayerFilters(this, parent);

				var colorStops = [];
				filterItems.forEach(function (item) {
					colorStops.push([item.value, item.color]);
				});

				map.addSource("miningsites", {
					type: 'geojson',
					data: collection,
					buffer: 0,
					maxzoom: 17
				});

				var subLayerProperties = {
					id: "miningsites",
					type: 'circle',
					source: "miningsites",
					sourceId: "miningsites",
					paint: {
						'circle-color': {
							property: "substance",
							type: "categorical",
							stops: colorStops
						},
						'circle-radius': {
							'base': 5,
							'stops': [[4, 5], [8, 7], [12, 10], [16, 40], [18, 80]]
						},
						'circle-opacity': 0.9,
						'circle-stroke-width': 0.5,
						'circle-stroke-color': "white"
					},
					layout: {
						'visibility': 'visible'
					}
					//onClick: function(item){
					//  UI.popup(item.properties,"minePopup",item.geometry.coordinates,true);
					//}
				};
				map.addLayer(subLayerProperties, "ref_miningsites_placeholder");
				MapService.addSubLayer(subLayerProperties);

			}
			//onClick: function(item){
			//  UI.popup(item.properties,"minePopup",item.geometry.coordinates,true);
			//}
		},
		miningsites2014_placeholder: {
			placeholder: true,
			id: "miningsites2014_placeholder",
			filterId: 24,
			label: "Mining Sites <small>(2014)</small>",
			source: "http://ipis.annexmap.net/api/data/caf/miningsites2014",
			sourceId: "miningsites2014_base",
			display: {
				type: 'circle',
				color: 'rgba(0,0,0,0)',
				circleStrokeColor: 'rgba(0,0,0,0)',
				visible: true,
				canToggle: true,
				zIndex: 98
			},
			onLoaded: function () {
				var features = map.querySourceFeatures("miningsites2014_base");
				var collection = {
					"type": "FeatureCollection",
					"features": []
				};
				features.forEach(function (item) {
					var substance;
					switch (item.properties.mineral) {
						case "Diamond":
						case "Gold":
						case "Gold & Diamond":
							substance = item.properties.mineral;
							break;
						default:
							substance = "Other";
					}

					item.properties.substance = substance;
					collection.features.push(item);
				});

				console.log(collection);

				var filterItems = [
					{value: "Diamond", color: "#78bfcc"},
					{value: "Gold", color: "#cca621"},
					{value: "Gold & Diamond", color: "#7dd921"},
					{value: "Other", color: "#a3b4aa"}
				];

				var parent = this.labelElm.parentElement;

				this.filters = [
					{
						id: "substance",
						index: 241,
						label: "Substances",
						items: filterItems,
						onFilter: MapService.genericFilter,
						filterProperty: "substance"
					}
				];

				UI.appendLayerFilters(this, parent);

				var colorStops = [];
				filterItems.forEach(function (item) {
					colorStops.push([item.value, item.color]);
				});

				map.addSource("miningsites2014", {
					type: 'geojson',
					data: collection,
					buffer: 0,
					maxzoom: 17
				});

				var subLayerProperties = {
					id: "miningsites2014",
					type: 'circle',
					source: "miningsites2014",
					sourceId: "miningsites2014",
					paint: {
						'circle-color': {
							property: "substance",
							type: "categorical",
							stops: colorStops
						},
						'circle-radius': {
							'base': 5,
							'stops': [[4, 5], [8, 7], [12, 10], [16, 40], [18, 80]]
						},
						'circle-opacity': 0.7,
						'circle-stroke-width': 0.5,
						'circle-stroke-color': "white"
					},
					layout: {
						'visibility': 'visible'
					}
					//onClick: function(item){
					//  UI.popup(item.properties,"minePopup",item.geometry.coordinates,true);
					//}
				};
				map.addLayer(subLayerProperties, "ref_miningsites2014_placeholder");
				MapService.addSubLayer(subLayerProperties);

			}
			//onClick: function(item){
			//  UI.popup(item.properties,"minePopup",item.geometry.coordinates,true);
			//}
		},
		miningActivities: {
			id: "miningactivities",
			filterId: 18,
			label: "Recent mining activities <small>(2013-2017)</small>",
			source: "http://ipis.annexmap.net/api/data/caf/miningactivities",
			sourceId: "miningactivities",
			display: {
				type: 'circle',
				radius: [
					"interpolate",
					["exponential", 2],
					["zoom"],
					0, 0,
					18, 6000
				],
				color: "rgb(204, 155, 120)",
				circleBlur: 0.7,
				circleStrokeWidth: 0,
				circleStrokeColor: "transparent",
				visible: true,
				canToggle: true,
				zIndex: 97
			}
		},
		miningzoneskp: {
			id: "miningzoneskp",
			filterId: 26,
			label: "KP Compliance Zones <small>(2017)</small>",
			source: "http://ipis.annexmap.net/api/data/caf/miningzoneskp",
			sourceId: "miningzoneskp",
			display: {
				type: 'fill',
				fillColor: '#78bfcc',
				fillOpacity: 0.5,
				hoverOpacity: 0.8,
				visible: false,
				canToggle: true,
				zIndex: 92
			},
			onClick: function (item, lngLat) {
				UI.popup(item.properties, "miningzoneskpPopup", lngLat, true);
			}
		},
		mineralConcessions: {
			id: "mineralconcessions",
			filterId: 5,
			label: "Mineral Concessions",
			source: "http://ipis.annexmap.net/api/data/caf/mineralconcessions",
			sourceId: "mineralconcessions",
			display: {
				type: 'fill',
				fillColor: {
					property: "perm_type_long",
					data: [
						{value: "Permis de Recherche", color: "#43b7ff"},
						{value: "Autorisation de Reconnaissance Minière", color: "#2396dd"},
						{value: "Permis d'Exploitation", color: "#36ae71"},
						{value: "Permis d'Exploitation Artisanale Semi-Mecanisee", color: "#9f2bae"}
					]
				},
				fillOpacity: 0.5,
				hoverOpacity: 0.8,
				visible: false,
				canToggle: true,
				zIndex: 96
			},
			subLayers: [
				{
					type: "line",
					paint: {
						'line-color': {
							property: "perm_type_long",
							type: "categorical",
							stops: [
								["Permis de Recherche", "#43b7ff"],
								["Autorisation de Reconnaissance Minière", "#2396dd"],
								["Permis d'Exploitation", "#36ae71"],
								["Permis d'Exploitation Artisanale Semi-Mecanisee", "#9f2bae"]
							]
						},
						'line-opacity': 1,
						'line-width': 1
					}
				}
			],
			filters: [
				{
					id: "permType", index: 51, label: "Type", items:
						[
							{value: "Permis de Recherche", color: "#43b7ff"},
							{value: "Autorisation de Reconnaissance Minière", color: "#2396dd"},
							{value: "Permis d'Exploitation", color: "#36ae71"},
							{value: "Permis d'Exploitation Artisanale Semi-Mecanisee", color: "#9f2bae"}
						],
					onFilter: MapService.genericFilter, filterProperty: "perm_type_long"
				},
				{
					id: "resources", index: 52, label: "Resources", items:
						[
							{value: "Gold", color: "#aaaaaa"},
							{value: "Diamond", color: "#aaaaaa"},
							{value: "Gold and Diamond", color: "#aaaaaa"},
							{value: "Iron", color: "#aaaaaa"},
							{value: "Limestone", color: "#aaaaaa"},
							{value: "Colombo-Tantalite", color: "#aaaaaa"},
							{value: "Unknown", color: "#aaaaaa"}
						],
					onFilter: MapService.genericFilter, filterProperty: "resources"
				}
			],
			onClick: function (item, lngLat) {
				UI.popup(item.properties, "mineralConcessionsPopup", lngLat, true);
			},
			onFilter: function (item, lngLat) {
				console.log("filter");
			}
		},
		oilConcessions: {
			id: "oilconcessions",
			filterId: 10,
			label: "Oil Concessions",
			source: "http://ipis.annexmap.net/api/data/caf/oilconcessions",
			sourceId: "oilconcessions",
			display: {
				type: 'fill',
				fillColor: "#333",
				fillOpacity: 0.3,
				hoverOpacity: 0.7,
				visible: true,
				canToggle: true,
				zIndex: 95
			},
			onClick: function (item, lngLat) {
				UI.popup(item.properties, "oilConcessionsPopup", lngLat, true);
			}
		},
		forestryConcessions: {
			id: "forestryconcessions",
			filterId: 6,
			label: "Forestry Concessions",
			source: "http://ipis.annexmap.net/api/data/caf/forestryconcessions",
			sourceId: "forestryconcession",
			display: {
				type: 'fill',
				fillColor: "#1d321b",
				fillOpacity: 0.3,
				hoverOpacity: 0.7,
				visible: true,
				canToggle: true,
				zIndex: 94
			},
			onClick: function (item, lngLat) {
				UI.popup(item.properties, "forestryConcessionsPopup", lngLat, true);
			}
		},
		huntingZones: {
			id: "huntingzones",
			filterId: 7,
			label: "Hunting Zones",
			source: "http://ipis.annexmap.net/api/data/caf/huntingzones",
			sourceId: "huntingzones",
			display: {
				type: 'fill',
				fillColor: "#80736a",
				fillOpacity: 0.4,
				hoverOpacity: 0.7,
				visible: true,
				canToggle: true,
				zIndex: 93
			},
			onClick: function (item, lngLat) {
				UI.popup(item.properties, "huntingZonesPopup", lngLat, true);
			}
		},
		protectedareas: {
			id: "protectedareas",
			filterId: 4,
			label: "Protected Areas <small>(2017)</small>",
			source: "http://ipis.annexmap.net/api/data/caf/protectedareas",
			sourceId: "protectedareas",
			display: {
				type: 'fill',
				fillColor: {
					property: "type_eng",
					data: [
						{value: "National Park", color: "#3ba151"},
						{value: "Wildlife Reserve", color: "#6cc680"},
						{value: "Biosphere Reserve", color: "#9bcd95"},
						{value: "Integral Natural Reserve", color: "#72af7f"},
						{value: "Nature Reserve", color: "#649f72"}
					]
				},
				fillOpacity: 0.5,
				hoverOpacity: 0.8,
				visible: false,
				canToggle: true,
				zIndex: 92
			},
			//filters:[
			//  {id: "type_eng", index: 55, label: "Type", items:
			//  [
			//    {value: "National Park", color: "#3ba151"},
			//    {value: "Wildlife Reserve", color: "#6cc680"},
			//    {value: "Biosphere Reserve", color: "#9bcd95"},
			//    {value: "Integral Natural Reserve", color: "#72af7f"},
			//    {value: "Nature Reserve", color: "#649f72"}
			//  ],
			//  onFilter: MapService.genericFilter,filterProperty: "type_eng"}],
			//popupOnhover: "type_ap",
			onClick: function (item, lngLat) {
				function format(item) {
					return item;
				}

				UI.hideDashboard();
				UI.popup(format(item).properties, "protectedAreaPopup", lngLat, true);
			}
		},
		rivers: {
			id: "rivers",
			filterId: 25,
			label: "Rivers",
			source: "mapbox://ipisresearch.87b9ryrr",
			sourceLayer: "caf_rivers_2018_l_ipis-08yal4", // You cand find what this is after uploading a tileset and inserting it in a mapbox studio style. See also https://www.mapbox.com/mapbox-gl-js/style-spec/#layer-source-layer
			sourceId: "rivers",
			display: {
				type: 'line',
				lineColor: "#69cae8",
				lineWidth: {
					stops: [[4, 0.2], [6, 0.6], [8, 1]]
				},
				lineOpacity: 1,
				visible: true,
				canToggle: true,
				zIndex: 91
			}
		},
		/*
		cattletradepoints:{
		  id: "cattletradepoints",
		  filterId: 23,
		  label: "Cattle transhumance and trade points",
		  source: "http://ipis.annexmap.net/api/data/caf/cattletradepoints",
		  sourceId: "cattletradepoints",
		  display:{
			type: 'circle',
			radius: 7,
			circleOpacity: 1,
			color: {
			  property: "type",
			  data: [
				{value: "Supply Centers", color: "#ffb86e"},
				{value: "Key Collection Markets", color: "#6e370a"},
				{value: "Collection Markets", color: "#967559"},
				{value: "Terminal Market", color: "#000000"}
			  ]
			  // data: [
			  // 	{value: "Supply Centers", color: "#46e2aa"},
			  // 	{value: "Key Collection Markets", color: "#324d90"},
			  // 	{value: "Collection Markets", color: "#59a6fe"},
			  // 	{value: "Terminal Market", color: "#d35d2d"}
			  // ]
			},
			visible: false,
			canToggle: true,
			zIndex:91
		  },
		  filters: [
			{id: "cattletradepointtype", index: 231, label: "Type", items:[
			  {label: "Supply Centers", value: "Supply Centers", color: "#ffb86e"},
			  {label: "Key Collection Markets", value: "Key Collection Markets", color: "#6e370a"},
			  {label: "Collection Markets", value: "Collection Markets", color: "#967559"},
			  {label: "Terminal Market", value: "Terminal Market", color: "#000000"}
			], onFilter: MapService.genericFilter,filterProperty: "type"}
		  ],
		  popupOnhover: function(feature){
			return "<b>" + feature.properties.name + "</b><br>" + feature.properties.type
		  },
		  onClick: function(){

		  }

		},
		*/
		cattletrade_placeholder: {
			id: "cattletrade",
			placeholder: true,
			filterId: 13,
			label: "Cattle transhumance and trade routes",
			source: "http://ipis.annexmap.net/api/data/caf/cattletrade",
			sourceId: "cattletrade",
			display: {
				type: 'line',
				lineColor: "rgba(0,0,0,0)",
				lineWidth: 11,
				lineOpacity: 0.4,
				visible: true,
				canToggle: true,
				zIndex: 91
			},
			onLoaded: function () {
				var mapping = {
					"Cattle trade (by boat)": {color: "#c92103"},
					"Cattle trade (by vehicle)": {color: "#d4650a"},
					"Cattle transhumance": {color: "#6a380c"},
					"Local transhumance": {color: "#dba87f"}
				}
				var filterItems = MapService.getFilterItems("cattletrade", "transport", mapping);
				var parent = this.labelElm.parentElement;

				this.filters = [
					{
						id: "transport",
						index: 111,
						label: "Transport",
						items: filterItems,
						onFilter: MapService.genericFilter,
						filterProperty: "transport"
					}
				];

				UI.appendLayerFilters(this, parent);

				var colorStops = [];
				filterItems.forEach(function (item) {
					colorStops.push([item.value, item.color]);
				});

				var subLayerProperties = {
					id: "cattletrade",
					type: 'line',
					source: "cattletrade",
					paint: {
						'line-color': {
							property: "transport",
							type: "categorical",
							stops: colorStops
						},
						'line-opacity': 0.7,
						'line-width': {
							stops: [[4, 1], [5, 2], [7, 3], [8, 4], [10, 6]]
						},
						'line-dasharray': [1.5, 1]
					},
					layout: {
						'visibility': 'visible'
					}
				};
				map.addLayer(subLayerProperties, "ref_cattletrade");
			}
		},
		cattleConcentration: {
			id: "cattleconcentration",
			filterId: 12,
			label: "Cattle Concentrations",
			source: "http://ipis.annexmap.net/api/data/caf/cattleconcentration",
			sourceId: "cattleconcentration",
			display: {
				type: 'fill',
				// data driven patterns not supported yet: https://github.com/mapbox/mapbox-gl-js/issues/4434
				//fillPattern: {
				//property: "cattle_den",
				//data: [
				//    {value: "low", pattern: "dot_green_tiny2"},
				//    {value: "med", pattern: "dot_green_tiny"},
				//    {value: "hight", pattern: "dot_green_small2"}
				//]
				//},
				fillColor: "#834521",
				fillOpacity: [
					"case",
					["==", ["get", "cattle_den"], "low"],
					0.1,
					["==", ["get", "cattle_den"], "medium"],
					0.2,
					["==", ["get", "cattle_den"], "high"],
					0.3,
					0.2
				],
				visible: true,
				canToggle: true,
				zIndex: 90
			},
			filters: [
				{
					id: "cattle_den", index: 54, label: "Concentration level", items:
						[
							{value: "low", color: "#e3c8b8"},
							{value: "medium", color: "#dbb39b"},
							{value: "high", color: "#c99a7e"}
						],
					onFilter: MapService.genericFilter, filterProperty: "cattle_den"
				}]
		},
		troopLocation: {
			id: "troopLocation",
			filterId: 15,
			label: "Troop location",
			source: "http://ipis.annexmap.net/api/data/caf/trooplocation",
			sourceId: "troopLocation",
			display: {
				type: 'circle',
				size: {
					property: 'headquarter',
					stops: [
						["1", 12]
					]
				},
				circleOpacity: 0.7,
				color: {
					property: "type",
					data: [
						{value: "France", color: "#dc493e"},
						{value: "MINUSCA", color: "#59a6fe"},
						{value: "MISCA", color: "#324d90"}
					]
				},
				visible: false,
				canToggle: true,
				zIndex: 89,
				filter: ["==", "year", "2017"]
			},
			onClick: function (item, point, fromSpider) {
				var offset = fromSpider ? item.properties.spiderOffset : undefined;
				function format(o) {
					o.properties.isHeadQuarter = (o.properties.headquarter !== null) && (o.properties.headquarter !== "null");
					return o;
				}
				UI.popup(format(item).properties, "troopLocationPopup", item.geometry.coordinates, true, offset);
			},
			onLoaded: function () {

				var filterItems = MapService.getFilterItems("troopLocation", "year").reverse();
				filterItems.forEach(function (item) {
					item.color = "silver"
				});
				var parent = this.labelElm.parentElement;

				this.filters = this.filters_pre || [];
				this.filters.push({
					id: "year",
					index: 152,
					label: "Year",
					singleValue: true,
					items: filterItems,
					onFilter: MapService.genericMultiFilter,
					filterProperty: "year"
				});

				UI.appendLayerFilters(this, parent);

				var filter = this.filters[1];
				var filterItem = filter.filterItems[1];
				UI.updateFilter(filter, filterItem);

				/*console.log("Adding troopLocation filter");
				EventBus.on(EVENT.yearFilterChanged,function(){
				var filter = map.getFilter("trooplocation");
				if (filter){
				if (filter[0] === "all"){
				filter[1][2] = "" + Data.getCurrentEndYear();
			  	}else{
			  	filter[2] = "" + Data.getCurrentEndYear();
				}
				console.log("updating troopLocation filter",filter);
				map.setFilter("trooplocation",filter);
		  		}
				})*/
				// set UI state to initial filter;
				//var filter = this.filters[1];
				//var filterItem = filter.filterItems[0];
				//UI.updateFilter(filter,filterItem);
			},
			filters_pre: [
				{
					id: "type", index: 151, label: "Type", items: [
						{value: "France", color: "#dc493e"},
						{value: "MINUSCA", color: "#59a6fe"},
						{value: "MISCA", color: "#324d90"}
					], onFilter_old: function (elm) {

						var endYear = "" + Data.getCurrentEndYear();

						var items = elm.filterItems;
						var hasFilter = false;
						var types = [];
						items.forEach(function (item) {
							if (!item.checked) {
								hasFilter = true;
							} else {
								types.push(item.value);
							}
						});

						if (hasFilter) {
							map.setFilter("trooplocation", ["all", ["==", "year", endYear], ["in", "type"].concat(types)])
						} else {
							map.setFilter("trooplocation", ["==", "year", endYear]);
						}

					},
					onFilter: MapService.genericMultiFilter,
					filterProperty: "type"
				}
			]
		},
		/*poaching:{
		id: "poaching",
		filterId: 8,
		label: "Poaching",
		source: "http://ipis.annexmap.net/api/data/caf/poaching",
		sourceId: "poaching",
		display:{
		type: 'fill',
		visible: false,
		fillColor: "#d23d5f",
		fillOpacity: 0.4,
		canToggle: true,
		belowLayer: 'ref_layer_protectedAreas'
		}
		},*/
		/*troopmovement_placeholder:{
		placeholder: true,
		id: "troopmovement_placeholder",
		filterId: 16,
		label: "Troop movement",
		source: "http://ipis.annexmap.net/api/data/caf/troopmovement",
		sourceId: "troopmovement",
		display:{
		type: 'line',
		lineColor: "rgba(0,0,0,0)",
		lineWidth: 11,
		lineOpacity: 0.4,
		visible: true,
		canToggle: true,
		belowLayer: 'ref_layer_mines'
		},
		onLoaded: function(){
		var filterItems = MapService.getFilterItems("troopmovement","type");
		var parent = this.labelElm.parentElement;

		this.filters = [
		{id: "type", index: 161, label: "Type", items: filterItems, onFilter: MapService.genericFilter,filterProperty: "type"}
		];

		UI.appendLayerFilters(this,parent);

		var colorStops = [];
		filterItems.forEach(function (item) {
		colorStops.push([item.value, item.color]);
		});

		var subLayerProperties = {
		id: "troopmovement",
		type: 'line',
		source: "troopmovement",
		paint: {
		'line-color': {
		property: "type",
		type : "categorical",
		stops: colorStops
		},
		'line-opacity': 0.7,
		'line-width' : 11
		},
		layout: {
		'visibility': 'visible'
		}
		};
		map.addLayer(subLayerProperties, "ref_layer_mines");
		}
		},*/
		armsTrafficking_placeholder: {
			placeholder: true,
			id: "armstrafficking_placeholder",
			filterId: 17,
			label: "Arms Trafficking",
			source: "http://ipis.annexmap.net/api/data/caf/armstraffickin",
			sourceId: "armstrafficking",
			display: {
				type: 'line',
				lineColor: "rgba(0,0,0,0)",
				lineWidth: 11,
				lineOpacity: 0.4,
				visible: true,
				canToggle: true,
				zIndex: 88
			},
			onLoaded: function () {
				var filterItems = MapService.getFilterItems("armstrafficking", "type");
				var parent = this.labelElm.parentElement;

				this.filters = [
					{
						id: "type",
						index: 171,
						label: "Type",
						items: filterItems,
						onFilter: MapService.genericFilter,
						filterProperty: "type"
					}
				];

				UI.appendLayerFilters(this, parent);

				var colorStops = [];
				filterItems.forEach(function (item) {
					colorStops.push([item.value, item.color]);
				});

				var subLayerProperties = {
					id: "armstrafficking",
					type: 'line',
					source: "armstrafficking",
					paint: {
						'line-color': {
							property: "type",
							type: "categorical",
							stops: colorStops
						},
						'line-opacity': 0.7,
						'line-width': {
							stops: [[4, 1], [5, 2], [7, 3], [8, 4], [10, 6]]
						},
						'line-dasharray': [1.5, 1]
					},
					layout: {
						'visibility': 'visible'
					}
				};
				map.addLayer(subLayerProperties, "ref_armstrafficking_placeholder");
			}
		},
		airstrips: {
			id: "airstrips",
			filterId: 19,
			label: "Airstrips",
			source: "http://ipis.annexmap.net/api/data/caf/airstrips",
			sourceId: "airstrips",
			display: {
				//type: 'circle',
				//radius: 6,
				//circleOpacity: 0.5,
				//color: {
				//  property: "status",
				//  data: [
				//    {value: "open", color: "#53af3e"},
				//    {value: "closed", color: "#c7431b"},
				//    {value: "unknown", color: "#477da6"}
				//  ]
				//},

				type: "symbol",
				iconImage: [
					"case",
					["==", ["get", "status"], "open"],
					"airfield-11-green",
					["==", ["get", "status"], "closed"],
					"airfield-11-red",
					["==", ["get", "status"], "unknown"],
					"airfield-11-grey",
					"airfield-11-grey"
				],

				visible: false,
				canToggle: true,
				zIndex: 87
			},
			filters: [
				{
					id: "status", index: 191, label: "Status", items: [
						{label: "Open", value: "open", color: "#3b8129"},
						{label: "Closed", value: "closed", color: "#ad3331"},
						{label: "Unknown", value: "unknown", color: "#6b6b6b"}
					], onFilter: MapService.genericFilter, filterProperty: "status"
				}
			],
			onClick: function (item) {
				UI.popup(item.properties, "airstripPopup", item.geometry.coordinates, true);
			}
		}
	}
};
