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
		miningsites2019: {
			id: "miningsites2019",
			filterId: 1,
			label: "Mining Sites <small>(2019)</small>",
			source: "http://ipis.annexmap.net/api/data/caf/miningsites2019",
			sourceId: "miningsites2019",
			display: {
				type: 'circle',
				color: 'rgba(0,0,0,1)',
				circleStrokeColor: 'rgba(0,0,0,1)',
				visible: true,
				canToggle: true,
				zIndex: 98
			},
			__onLoaded: function () {
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
				//map.addLayer(subLayerProperties, "ref_miningsites_placeholder");
				map.addLayer(subLayerProperties);
				//MapService.addSubLayer(subLayerProperties);

			}
			//onClick: function(item){
			//  UI.popup(item.properties,"minePopup",item.geometry.coordinates,true);
			//}
		},
		miningsites_base2017: {
			id: "miningsites_base2017",
			filterId: 14,
			label: "Mining Sites <small>(2017)</small>",
			source: "http://ipis.annexmap.net/api/data/caf/miningsites",
			sourceId: "miningsites_base",
			display: {
				type: 'circle',
				color: 'rgba(0,0,0,1)',
				circleStrokeColor: 'rgba(0,0,0,1)',
				visible: false,
				canToggle: true,
				zIndex: 98
			},
			__onLoaded: function () {
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
				//map.addLayer(subLayerProperties, "ref_miningsites_placeholder");
				map.addLayer(subLayerProperties);
				//MapService.addSubLayer(subLayerProperties);

			}
			//onClick: function(item){
			//  UI.popup(item.properties,"minePopup",item.geometry.coordinates,true);
			//}
		},
		miningsites2014_placeholder: {
			id: "miningsites2014",
			filterId: 24,
			label: "Mining Sites <small>(2014)</small>",
			source: "http://ipis.annexmap.net/api/data/caf/miningsites2014",
			sourceId: "miningsites2014_base",
			display: {
				type: 'circle',
				color: 'rgba(0,0,0,1)',
				circleStrokeColor: 'rgba(0,0,0,1)',
				visible: false,
				canToggle: true,
				zIndex: 98
			},
			__onLoaded: function () {
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
				map.addLayer(subLayerProperties);
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
			visible: false,
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
				visible: false,
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
		}
	}
};
