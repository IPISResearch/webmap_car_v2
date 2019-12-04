var version = "0.0.1";

var Config = {
	mapId: "CARMINEV1",
	mapName: "CAR MINE V1",
	apiScope: "carmine",
	apiScopeDev: "carmine",
	useMapBoxInspector: false,
	usePass:false,
	templateURL: "_templates/main.html",
	showDisclaimerOnFirstUse: false,
	disclaimerUrl: "_templates/disclaimer.html",
	infoUrl: "_templates/info.html",
	// starting point for map
	mapCoordinates: {
		x: 18,
		y: 5.2,
		zoom: 6,
		bounds: [[14.05, 4.20], [30.38, 15.26]],
		maxZoom: 18,
		minZoom: 5
	},
	defaultBaseLayerIndex: 4,
	// if preLoad is defined, this occurs before the map is shown - used to pre-generate datasets etc.
	__preLoad: function () {
		Data.init();
	},
	// baselayer info
	baselayers: [
		{index: 1, id: "satellite", label: "Satellite (Bing)", url:"https://ecn.t0.tiles.virtualearth.net/tiles/h{quadkey}.jpeg?g=6412", attribution: "© 2018 Microsoft Corporation © 2018 Digital Globe © CNES (2018) Distribution Airbus DS © 2018 HERE"},
		{index: 4, id: "streetscar", label: "Rues (IPIS)", url: "mapbox://styles/ipisresearch/cjix950k084i72rno4tpu5mkm"}, // this is streets CAR
		{index: 2, id: "streets", label: "Rues (OSM)", url: "mapbox://styles/ipisresearch/ciw6jpn5s002r2jtb615o6shz"},
		{index: 3, id: "empty", label: "Vide", url: "mapbox://styles/ipisresearch/cjav3e31blm5w2smunhb32kzm"}
	],
	defaultRefLayer: "ref_layer", // reference layer where to insert all custom layers - should be present in all baselayers
	colorMap:{
		"Diamant": "#78bfcc",
		"Or": "#cca621",
		"Carbone": "#364971",
		"Argent": "#dee5e8",
		"Cassitière" : "#b87acc",
		"default": "#a3b4aa"
	},
	// layer info
	layers: {
		miningsites_new: {
			id: "miningsites_new",
			filterId: 1,
			label: "Site miniers visités<br><small>(IPIS 2019)</small>",
			source: function(layer){
				if (layer.data){
					return layer.data;
				}

				console.log("Fetching data for layer " + layer.id);
				var dataSourceUrl = "https://ipis.annexmap.net/api/data/carmine/miningsites2019";

				FetchService.json(dataSourceUrl,function(data){
					if (data && data.type === "FeatureCollection"){

						var minerals = [];
						var prefectures = [];
						var services = [];
						var actors = [];
						var actortypes = [];
						var conflicts = [];

						data.features.forEach(function(feature){
							feature.properties.mineralList = feature.properties.minerals.split(",");
							feature.properties.workers = parseInt(feature.properties.workers_numb);
							for (var i = 0, max = feature.properties.mineralList.length; i<max; i++){
								feature.properties.mineralList[i] = feature.properties.mineralList[i].trim();
								if (minerals.indexOf(feature.properties.mineralList[i]) < 0) minerals.push(feature.properties.mineralList[i]);
							}

							feature.properties.mineral = feature.properties.mineralList[0];
							feature.properties.chantiers = feature.properties.chantiers_numb;

							// services are represented in one line
							feature.properties.servicesList = [];
							feature.properties.servicesList.push(feature.properties.services1_name, feature.properties.services2_name, feature.properties.services3_name);
							addUnique(services,feature.properties.services1_name);
							addUnique(services,feature.properties.services2_name);
							addUnique(services,feature.properties.services3_name);

							feature.properties.services = feature.properties.servicesList.filter(Boolean).join("<br>");
							feature.properties.servicesDetail = [
								{sname: feature.properties.services1_name, sfrequency: feature.properties.services1_frequency},
								{sname: feature.properties.services2_name, sfrequency: feature.properties.services2_frequency},
								{sname: feature.properties.services3_name, sfrequency: feature.properties.services3_frequency},
							];

							addUnique(prefectures,feature.properties.prefecture);

							feature.properties.workergroup = 0;
							if (feature.properties.workers>0) feature.properties.workergroup = 1;
							if (feature.properties.workers>45) feature.properties.workergroup = 2;
							if (feature.properties.workers>150) feature.properties.workergroup = 3;
							if (feature.properties.workers>500) feature.properties.workergroup = 4;

							feature.properties.womengroup = 0;
							var women = parseInt(feature.properties.workers_women);
							if (!isNaN(women)){
								if (women>0){
									feature.properties.womengroup = 1;
								}else{
									feature.properties.womengroup = 2;
								}
							}

							feature.properties.childrengroup = 0;
							var children = parseInt(feature.properties.childunder15);
							if (!isNaN(children)){
								if (children>0){
									feature.properties.childrengroup = 1;
								}else{
									feature.properties.childrengroup = 2;
								}
							}

							feature.properties.roadblockgroup = 0;
							if (feature.properties.roadblocks_actor) feature.properties.roadblockgroup = 1;


							addUnique(actors,feature.properties.actor1name);
							addUnique(actors,feature.properties.actor2name);
							addUnique(actors,feature.properties.actor3name);

							feature.properties.actorList = [feature.properties.actor1name, feature.properties.actor2name, feature.properties.actor2name];
							feature.properties.actors = actors;

							feature.properties.actorTypeList = feature.properties.actor_type.split(" ");
							feature.properties.actorTypeList.forEach(function(actorType){
								addUnique(actortypes,actorType);
							});


							feature.properties.accidentgroup = 0;
							var dead = parseInt(feature.properties.accident_dead);
							var injured = parseInt(feature.properties.accident_injured);
							if (injured>0)  feature.properties.accidentgroup = 1;
							if (dead>0)  feature.properties.accidentgroup = 2;

							feature.properties.conflictList = feature.properties.conflict_category.split(",");
							for (var i = 0, max = feature.properties.conflictList.length; i<max; i++){
								feature.properties.conflictList[i] = feature.properties.conflictList[i].trim();
								addUnique(conflicts,feature.properties.conflictList[i]);
							}

							//console.error(feature);


						});


						// build filter based on minerals found
						var filterItems = [];
						minerals.forEach(function(mineral){
							filterItems.push({value: mineral, color: Config.colorMap[mineral] || Config.colorMap.default});
						});

						prefectures.sort();
						var prefecturFilter = [];
						prefectures.forEach(function(item){
							prefecturFilter.push({value: item, color: Config.colorMap.default});
						});

						services.sort();
						var serviceFilter = [];
						services.forEach(function(item){
							serviceFilter.push({value: item, color: Config.colorMap.default});
						});

						actors.sort();
						var actorFilter = [];
						actors.forEach(function(item){
							actorFilter.push({value: item, color: Config.colorMap.default});
						});

						actortypes.sort();
						var actortypeFilter = [];
						var actorTypeNames = {
							"0" : "Aucun",
							"etatique" : "Étatique",
							"autodefense" : "Auto défense",
							"groupe_arme" : "Groupe armé",
							"privee" : "Privé",
						};

						actortypes.forEach(function(item){
							actortypeFilter.push({value: item, label: actorTypeNames[item] || item, color: Config.colorMap.default});
						});

						conflicts.sort();
						var conflictFilter = [];
						conflicts.forEach(function(item){
							conflictFilter.push({value: item, color: Config.colorMap.default});
						});

						layer.filters = [
							{
								id: "mineral",
								index: 141,
								label: "Minerais",
								items: filterItems,
								onFilter: MapService.genericMultiFilter,
								filterProperty: "mineralList",
								array: true
							},
							{
								id: "prefectures",
								index: 142,
								label: "Préfectures",
								items: prefecturFilter,
								onFilter: MapService.genericMultiFilter,
								filterProperty: "prefecture"
							},
							{
								id: "workers",
								index: 143,
								label: "Nombre de creuseurs",
								items: [
									{label: "Aucun / pas de données", value:0},
									{label: "1 à 45", value:1},
									{label: "46 à 150", value:2},
									{label: "151 à 500", value:3},
									{label: "Plus que 500", value:4}
								],
								onFilter: MapService.genericMultiFilter,
								filterProperty: "workergroup"
							},
							{
								id: "women",
								index: 144,
								label: "Présence Femmes",
								items: [
									{label: "Oui", value:1},
									{label: "Non", value:2}
								],
								onFilter: MapService.genericMultiFilter,
								filterProperty: "womengroup"
							},
							{
								id: "children",
								index: 145,
								label: "Présence Enfants<br>&ensp;<small>(De moins de 15 ans, participant activement à la production)</small>",

								items: [
									{label: "Oui", value:1},
									{label: "Non", value:2}
								],
								onFilter: MapService.genericMultiFilter,
								filterProperty: "childrengroup"
							},
							{
								id: "services",
								index: 146,
								label: "Présence de services de l'Etat",
								items: serviceFilter,
								onFilter: MapService.genericMultiFilter,
								filterProperty: "servicesList",
								array: true,
								maxVisibleItems:6
							},
							{
								id: "actors",
								index: 147,
								label: "Présence armée",
								items: actorFilter,
								onFilter: MapService.genericMultiFilter,
								filterProperty: "actorList",
								array: true,
								maxVisibleItems:6
							},
							{
								id: "actortypes",
								index: 148,
								label: "Type présence armée",
								items: actortypeFilter,
								onFilter: MapService.genericMultiFilter,
								filterProperty: "actorTypeList",
								array: true,
								maxVisibleItems:6
							},
							{
								id: "accidents",
								index: 149,
								label: "Accidents <br><small>(dans les 12 derniers mois précédant la visite)</small>",
								items: [
									{label: "Aucun", value:0},
									{label: "Blessé", value:1},
									{label: "Mort", value:2}
								],
								onFilter: MapService.genericMultiFilter,
								filterProperty: "accidentgroup",
								maxVisibleItems:6
							},
							{
								id: "roadblocks",
								index: 1491,
								label: "Barrière à l'entrée de la mine",
								items: [
									{label: "Oui", value:1},
									{label: "Non", value:0}
								],
								onFilter: MapService.genericMultiFilter,
								filterProperty: "roadblockgroup"
							},
							{
								id: "conflicts",
								index: 1492,
								label: "Conflit <br><small>(dans les 12 derniers mois précédant la visite)</small>",
								items: conflictFilter,
								onFilter: MapService.genericMultiFilter,
								filterProperty: "conflictList",
								array: true,
								maxVisibleItems:6
							},
						];
						var parent = layer.labelElm.parentElement;
						UI.appendLayerFilters(layer, parent);


						layer.display = {
							type: 'circle',
							visible: true,
							canToggle: true,
							size:{
								property: 'workers',
								interval: [[1, 3.5], [50, 4.5], [500, 6.5], [5000, 8.5]],
								default: 3
							},
							color: {
								property: "mineral",
								data: filterItems
							},
							belowLayer: 'ref_layer_mines'
						}
					}
					layer.data=data;
					MapService.addLayer(layer);
				});
			},
			sourceId: "miningsites_new",
			display: {
				visible: true,
				canToggle: true,
				zIndex: 98
			},
			popupOnhover: "name",
			onClick: function(item){
				//UI.popup(item.properties,"minePopup",item.geometry.coordinates,true);
				UI.showDashboard(Data.getMineDetail(item),"mineDashBoard");
			},
			onLoaded : function(){

				Chart.render(); // render chart

				if (!Config.layers.miningsites_new.data) return;

				map.boxZoom.disable(); // disable default zoom

				var canvas = map.getCanvasContainer(); // target canvas
				var start; // start xy coordinates on mouse move or up
				var curr; // current xy coordinates held
				var box; // draw box
				var hasGhost = false;

				canvas.addEventListener("mousedown", mouseDown, true);

				// add gray mines dots to map
				function addMineGhosts(){
					if (hasGhost) return;
					map.addLayer({
						"id": "miningsites_ghost",
						"type": "circle",
						"source": "miningsites_new",
						"paint": {
							'circle-color': "rgba(190,190,190,0.63)",
							'circle-radius' : {
								'default': 3,
								'property': 'workers',
								'type': 'interval',
								'stops': [[1, 3.5], [50, 4.5], [500, 6.5], [5000, 8.5]]
							}
						}
					});
					hasGhost = true;
				}

				// Get mouse position
				function mousePosition(e) {
					var rect = canvas.getBoundingClientRect();
					//console.log(rect);
					return new mapboxgl.Point(
						e.clientX - rect.left - canvas.clientLeft,
						e.clientY - rect.top - canvas.clientTop
					);
				}

				function mouseDown(e) {

					var doSelect = UI.select || (e.shiftKey && e.button === 0);

					// Continue if shiftkey is pressed
					if (!doSelect) return;

					// remove filter first
					map.setFilter("miningsites_new", undefined);

					// Disable default drag on shiftkey
					map.dragPan.disable();

					// Add mouse events to document
					document.addEventListener("mouseup", onMouseUp);
					document.addEventListener("keydown", onKeyDown);
					document.addEventListener("mousemove", onMouseMove);

					// get first mouse position
					start = mousePosition(e);
					// console.log(start);
				}

				function onMouseMove(e) {
					// Capture mouse position
					curr = mousePosition(e);

					// Append box
					if (!box) {
						box = document.createElement("div");
						box.classList.add("drawbbox");
						canvas.appendChild(box);
					}

					var minX = Math.min(start.x, curr.x),
						minY = Math.min(start.y, curr.y),
						maxX = Math.max(start.x, curr.x),
						maxY = Math.max(start.y, curr.y);

					// Adjust width and xy position box
					var pos = "translate(" + minX + "px," + minY + "px)";

					box.style.transform = pos;
					box.style.WebkitTransform = pos;
					box.style.width = maxX - minX + "px";
					box.style.height = maxY - minY + "px";
				}

				function onMouseUp(e) {
					// store xy coordinates
					finish([start, mousePosition(e)]);
					// console.log(finish);
				}

				function onKeyDown(e) {
					// Check if ESC is pressed
					if (e.keyCode === 27) finish();
				}

				function finish(bbox) {
					// Remove events from DOM on "finish".
					document.removeEventListener("mouseup", onMouseUp);
					document.removeEventListener("keydown", onKeyDown);
					document.removeEventListener("mousemove", onMouseMove);

					if (box) {
						box.parentNode.removeChild(box);
						box = null;
					}

					Config.layers.miningsites_new.bbox = bbox;
					addMineGhosts();

					// If bbox exists, query rendered features
					if (bbox) {

						var isBox = true;
						var dX = Math.abs(bbox[0].x - bbox[1].x);
						var dY = Math.abs(bbox[0].y - bbox[1].y);
						if (dX<10 && dY<10) isBox = false;

						var features = isBox ? map.queryRenderedFeatures(bbox, { layers: ["miningsites_new"] }) : map.querySourceFeatures("miningsites_new");
						Config.layers.miningsites_new.bbox = isBox ? Config.layers.miningsites_new.bbox : undefined;
						//  console.log(features);


						var filter = features.reduce(function(temp, feature) {
							temp.push(feature.properties.id);
							return temp;
						}, ['in', 'id']);

						var inverseFilter = features.reduce(function(temp, feature) {
							temp.push(feature.properties.id);
							return temp;
						}, ['!in', 'id']);

						map.setFilter("miningsites_ghost", inverseFilter);
						map.setFilter("miningsites_new", filter);

					}

					map.dragPan.enable(); // enable drag on pan
					Chart.render();
				}


				map.on("mousemove", function(e) {
					var features = map.queryRenderedFeatures(e.point, { layers: ["miningsites_new"] });
					map.getCanvas().style.cursor = (features.length) ? "pointer" : "";
				});

				Config.onDeselect = function(){
					finish([{x:0,y:0},{x:0,y:0}]);
					setTimeout(function(){
						Chart.render();
					},500)
				}

			},

			onFilter: function(){
				//console.error("onfilter");
				Chart.render();
				setTimeout(function(){
					Chart.render();
				},200);
			}
		},
		miningsites_old: {
			id: "miningsites_old",
			filterId: 14,
			label: "Sites miniers potentiels<br><small>(IPIS 2018)</small>",
			source: function(layer){
				if (layer.data) return layer.data;

				console.log("Fetching data for layer " + layer.id);
				var url_2017 = "https://ipis.annexmap.net/api/data/caf/miningsites";
				var url_2014 = "https://ipis.annexmap.net/api/data/caf/miningsites2014";

				var _data = {};

				FetchService.json(url_2017,function(data){
					_data._2017 = data;
					process();
				});

				FetchService.json(url_2014,function(data){
					_data._2014 = data;
					process();
				});

				function process(){
					if (_data._2017 && _data._2014){

						var minerals = [];
						var mineralMapping = {
							"Gold" : "Or",
							"Diamond" : "Diamant",
							"Gold & Diamond" : "Or",
							"Cassiterite" : "Cassitière"
						};
						var data = _data._2014;

						data.features.forEach(function(feature){
							feature.properties.mineral = mineralMapping[feature.properties.mineral] || "Autre";
							feature.properties.minerals = feature.properties.mineral;
							if (minerals.indexOf(feature.properties.mineral)<0) minerals.push(feature.properties.mineral);
						});

						_data._2017.features.forEach(function(feature){
							feature.properties.id = "_2017" + feature.properties.id;
							feature.properties.mineral = feature.properties.substance_1;
							feature.properties.mineral = mineralMapping[feature.properties.mineral] || "Autre";
							feature.properties.minerals = feature.properties.mineral;
							if (minerals.indexOf(feature.properties.mineral)<0) minerals.push(feature.properties.mineral);
							data.features.push(feature);
							//console.log(feature);
						});

						console.log(minerals);

						var filterItems = [];

						minerals.forEach(function(mineral){
							filterItems.push({value: mineral, color: Config.colorMap[mineral] || Config.colorMap.default});
						});

						layer.filters = [
							{
								id: "mineral",
								index: 141,
								label: "Minerais",
								items: filterItems,
								onFilter: MapService.genericFilter,
								filterProperty: "mineral",
								array: true
							}
						];
						var parent = layer.labelElm.parentElement;
						UI.appendLayerFilters(layer, parent);


						layer.display = {
							type: 'circle',
							visible: true,
							canToggle: true,
							size:{
								property: 'workers',
								interval: [[1, 3.5], [50, 4.5], [500, 6.5], [5000, 8.5]],
								default: 4
							},
							color: "#b0b0b0",
							circleStrokeColor: "transparent",
							circleOpacity: 0.4,
							belowLayer: 'ref_layer_mines'
						};

						layer.data=data;
						MapService.addLayer(layer);

						//console.log(_data._2014);
					}
				}


			},
			sourceId: "miningsites_old",
			display: {
				visible: false,
				canToggle: true,
				zIndex: 97
			},
			onClick: function(item){
				UI.popup(item.properties,"minePopup",item.geometry.coordinates,true);
			},
		},
		miningActivities: {
			id: "miningactivities",
			filterId: 18,
			label: "Activités minières récentes<br><small>(USGS 2013-2017)</small>",
			source: "https://ipis.annexmap.net/api/data/caf/miningactivities",
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
				circleOpacity: 0.6,
				visible: false,
				canToggle: true,
				zIndex: 97
			}
		},
		miningzoneskp: {
			id: "miningzoneskp",
			filterId: 26,
			label: "Zones conformes au Processus de Kimberley<br><small>(2019)</small>",
			source: "https://ipis.annexmap.net/api/data/caf/miningzoneskp",
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
			label: "Concessions minières<br><small>(Source : MMG, 2019)</small>",
			source: "https://ipis.annexmap.net/api/data/carmine/mineralconcessions",
			sourceId: "mineralconcessions",
			display: {
				type: 'fill',
				fillColor: '#78bfcc',
				fillOpacity: 0.5,
				hoverOpacity: 0.8,
				visible: false,
				canToggle: true,
				zIndex: 96
			},
			filters: [
				{
					id: "permType", index: 51, label: "License", items:
						[
							{label: "Permis de Recherche", value: "PR", color: "#43b7ff"},
							{label: "Autorisation de Reconnaissance Minière", value: "ARM", color: "#2396dd"},
							{label: "Permis d'Exploitation", value: "PE", color: "#36ae71"},
							{label: "Permis d'Exploitation Artisanale Semi-Mecanisee", value: "PEASM", color: "#9f2bae"}
						],
					onFilter: MapService.genericFilter, filterProperty: "perm_type_long"
				},
				{
					id: "resources", index: 52, label: "Ressources", items:
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
		destinations: {
			id: "destinations",
			filterId: 6,
			label: "Destination des minerais",
			source: "data/destinations.json",
			sourceId: "destinations",
			display: {
				type: 'line',
				lineColor:{
					property: "mineral",
					data: [
						{value: "Or", color: "#f9ce21"},
						{value: "Diamant", color: "#2396dd"}
					]
				},
				lineWidth: 1,
				hoverOpacity: 0.8,
				visible: false,
				canToggle: true,
				zIndex: 97
			},
			filters: [
				{
					id: "minerais", index: 51, label: "Minéral", items:
						[
							{label: "Or", value: "Or", color: "#f9ce21"},
							{label: "Diamant", value: "Diamant", color: "#2396dd"}
						],
					onFilter: MapService.genericFilter, filterProperty: "mineral"
				}
			],
			popupOnhover: function(item){
				return item.properties.mineral  + " de " + item.properties.from + " à " + item.properties.to;
			},
			onClick: function (item, lngLat) {
				//UI.popup(item.properties, "mineralConcessionsPopup", lngLat, true);
			},
			onFilter: function (item, lngLat) {
				console.log("filter");
			}
		}
	}
};


function addUnique(array,value){
	if (value && array.indexOf(value)<0) array.push(value);
}