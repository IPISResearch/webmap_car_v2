var version = "0.0.1";

var Config = {
    mapId: "CAFV2",
    apiScope: "caf",
    templateURL: "_templates/main.html",
    showDisclaimerOnFirstUse: false,
    disclaimerUrl: "_templates/disclaimer.html",
    infoUrl: "_templates/info.html",
    // starting point for map
    mapCoordinates: {
      x: 22.4,
      y: 5.8,
      zoom: 6,
      bounds: [[14.05,0.20],[30.38,10.26]]
    },
    defaultBaseLayerIndex : 2,
    // if preLoad is defined, this occurs before the map is shown - used to pre-generate datasets etc.
    preLoad : function(){Data.init();},
    // baselayer info
    baselayers:[
        {index: 1, id: "satellite", label: "Satellite", url:"ipisresearch/ciw6jsekm003a2jql0w0a7qca"},
        {index: 2, id: "streets", label: "Rues", url:"ipisresearch/ciw6jpn5s002r2jtb615o6shz"},
        {index: 3, id: "empty", label: "Aucune", url:"ipisresearch/cjav3e31blm5w2smunhb32kzm"}
    ],
	defaultRefLayer: "ref_layer", // reference layer where to insert all custom layers - should be present in all baselayers
    // layer info
    layers:{
        incidents: {
            id: "incidents",
            label: "Incidents",
            source: function(){return Data.getIncidents()},
            sourceId: "incidents",
            popupOnhover: function(feature){
                return "<b>" + feature.properties.formattedDate + "</b><br>" + feature.properties.type
            },
            onClick: function(item){
                //UI.popup(Data.getMineDetail(item),"minePopup",item.geometry.coordinates,true);
                UI.showDashboard(item);
            },
            onFilter: function(){
                console.log("filter");
              //Chart.update();
            },
            onLoaded: function(){
                console.log("loaded");
                CafChart.render();
              //Chart.update();
            },
            onToggle: function(visible){
              //var legend =  document.getElementById("legend");
              //visible ? legend.classList.remove("hidden") : legend.classList.add("hidden");
            },
            filterId: 1,
            filters:[
                //{id: "years", index: 1, label: "Année de dernière visite",items: Data.getYears,onFilter: Data.updateFilter,filterProperty:"year",maxVisibleItems:5},
                {id: "types", index: 2, label: "Incident Type",items: Data.getIncidentTypes,onFilter: Data.updateFilter,filterProperty: "type",maxVisibleItems: 10},
                {id: "actors", index: 3, label: "Actors",items: Data.getActors,onFilter: Data.updateFilter,filterProperty: "actors",array:true,maxVisibleItems: 5},
                {id: "keyIssues", index: 4, label: "Key Issues",items:[
                  {label: "Mining", value:1 , color: "silver"},
                  {label: "Roadblocks", value:2 , color : "silver"},
                  {label: "Pastoralism", value:3, color: "silver"},
                  {label: "Pillage", value:4, color: "silver"},
                  {label: "Abduction", value:5, color: "silver"},
                  {label: "Peul", value:6, color: "silver"},
                  {label: "Humanitarian", value:7, color: "silver"}
                ],onFilter: Data.updateFilter,filterProperty: "keyIssues",array:true}
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
            display:{
                type: 'circle',
                visible: true,
                canToggle: true,
                size:{
                    property: 'fatalities',
                    interval: [[0, 4], [1, 5], [2, 6], [4, 7],[100, 9],[150, 12]]
                },
                color: {
                  property: "type",
                  data: function(){return Data.getIncidentTypes();}
                },
                circleOpacity: 0.5, 
                zIndex:100
            }
        },
        influenceZones:{
            id: "influenceZones",
            filterId: 3,
            filters: [
                {id: "group", index: 41, label: "Group", items:[
                        {label: "Anti-Balaka", value: "Anti-balaka", color : "#9fdad7"},
                        {label: "FPRC", value: "FPRC", color: "#c0e4c3"},
                        {label: "UPC", value: "UPC", color: "#8cbbca"},
                        {label: "RJ", value: "RJ", color: "#e3b258"},
                        {label: "3R", value: "3R", color: "#ece26f"},
                        {label: "LRA", value: "LRA", color: "#ca9487"},
                        {label: "MPC", value: "MPC", color: "#e4cc95"},
                        {label: "RPRC", value: "RPRC", color: "#7ab38e"},
                        {label: "FDPC", value: "FDPC", color: "#e4d785"},
                        {label: "Seleka", value: "Seleka" , color: "#bdddb0"},
                        {label: "none", value: "none", color: "#c3bebf"}
                    ], onFilter: Data.updateInfluenceZonesFilter,filterProperty: "group"},
                {id: "year", index: 42, label: "Year", singleValue: true, items:[
                        {label: "2017", value: "2017" , color: "grey"},
                		{label: "2014", value: "2014" , color: "silver"}
                	], onFilter: Data.updateInfluenceZonesFilter,filterProperty: "year"}
                //{id: "year", index: 42, label: "Year",items: Data.getInfluenceZonesYears,onFilter: Data.updateInfluenceZonesFilter,filterProperty: "year"}
            ],
            label: "Zones of Influence",
            source: function(layer,show){return Data.getInfluenceZones(layer,show)},
            sourceId: "influenceZones",
            display:{
                type: 'fill',
                fillColor: {
                    property: "group",
                    data: [
                        {label: "Anti-Balaka", value: "Anti-balaka", color : "#77c1d3"},
                        {label: "FPRC", value: "FPRC", color: "#83d9b6"},
                        {label: "UPC", value: "UPC", color: "#98b5e2"},
                        {label: "RJ", value: "RJ", color: "#e2a634"},
                        {label: "3R", value: "3R", color: "#f5e14a"},
                        {label: "LRA", value: "LRA", color: "#ae6774"},
                        {label: "MPC", value: "MPC", color: "#e29d4a"},
                        {label: "RPRC", value: "RPRC", color: "#52907f"},
                        {label: "FDPC", value: "FDPC", color: "#e0ba21"},
                        {label: "Seleka", value: "Seleka" , color: "#7cc886"},
                        {label: "none", value: "none", color: "#c3bebf"}
                    ]
                },
                fillOpacity: 0.4,
                visible: false,
                canToggle: true,
				zIndex:99,
                filter: ["==", "year", "2017"]
            },
            //popupOnhover: "group",
            //onClick: function(item,lngLat){
            //UI.hideDashboard();
            //UI.popup(item.properties,"protectedAreaPopup",lngLat,true);
            //},
            onLoaded: function(){
                // set UI state to initial filter;
                var filter = this.filters[1];
                var filterItem = filter.filterItems[0];
                UI.updateFilter(filter,filterItem);
            }
        },
		roadblocks: {
			id: "roadblocks",
			label: "RoadBlocks",
			source: function(layer,show){return Data.getRoadblocks(layer,show)},
			sourceId: "roadblocks",
			popupOnhover: function(feature){
				return "<b>" + feature.properties.formattedDate + "</b><br>" + feature.properties.location
			},
			onClick: function(item,point,fromSpider){
				//UI.hideDashboard();
                var offset;
                if(fromSpider){
					offset = item.properties.spiderOffset;
                }
				UI.popup(Data.getRoadblockDetail(item),"roadblockPopup",item.geometry.coordinates,true,offset);
			},
			display:{
				visible: false,
				canToggle: true,
				type: 'symbol',
				iconImage: {
					property: "operatorFirst",
					data: Data.getRoadblockOperators
				},
				iconSize: {
					stops: [[1, 0.7], [7, 1], [9, 2]]
				},
				iconOpacity: {
					stops: [[1, 0.7], [5, 0.8], [7, 1]]
				},
				zIndex:98
			},
			filterId: 2,
			filters:[
				{id: "op", index: 31, label: "Operator Type",items: Data.getRoadblockOperators,onFilter: Data.updateRoadblockFilter,filterProperty:"operators",array:true},
				{id: "bar", index: 31, label: "Roadblock Type",items: Data.getRoadblockTypes,onFilter: Data.updateRoadblockFilter,filterProperty: "types",array:true}
			]
		},
        miningsites_placeholder:{
            placeholder: true,
            id: "miningsites_placeholder",
            filterId: 14,
            label: "Mining Sites (2018)",
            source: "http://ipis.annexmap.net/api/data/caf_dev/miningsites",
            sourceId: "miningsites_base",
            display:{
                type: 'circle',
                color: 'rgba(0,0,0,0)',
                circleStrokeColor: 'rgba(0,0,0,0)',
                visible: true,
                canToggle: true,
				zIndex:98
            },
            onLoaded: function(){
                var features = map.querySourceFeatures("miningsites_base");
                var collection = {
                    "type": "FeatureCollection",
                    "features": []
                };
                features.forEach(function(item){
                    var substance;
					item.properties.mineral = item.properties.substance_1;
                    switch (item.properties.mineral){
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
                    {value: "Diamond",  color:  "#78bfcc"},
                    {value: "Gold",  color:  "#cca621"},
                    {value: "Iron",  color:  "#c6d4dc"},
                    {value: "Copper",  color:  "#a14f1c"},
                    {value: "Uranium",  color:  "#99d921"},
                    {value: "Cassiterite",  color:  "#3b649f"},
                    {value: "Manganese",  color:  "#a96594"},
                    {value: "Other",  color:  "#a3b4aa"}
                ];

                var parent = this.labelElm.parentElement;

                this.filters = [
                    {id: "substance", index: 141, label: "Substances", items: filterItems, onFilter: MapService.genericFilter,filterProperty: "substance"}
                ];

                UI.appendLayerFilters(this,parent);

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
                            type : "categorical",
                            stops: colorStops
                        },
                        'circle-radius': {
                            'base': 5,
                            'stops': [[4, 5], [8, 6], [14, 80]]
                        },
                        'circle-opacity': 0.9,
                        'circle-stroke-width': 0.5,
                        'circle-stroke-color': "white"
                    },
                    layout: {
                        'visibility': 'visible'
                    }
                };
                map.addLayer(subLayerProperties, "ref_miningsites_placeholder");

            },
            onClick: function(item){
                UI.popup(item.properties,"minePopup",item.geometry.coordinates,true);
            }
        },
		miningsites2014_placeholder:{
			placeholder: true,
			id: "miningsites2014_placeholder",
			filterId: 24,
			label: "Mining Sites (2014)",
			source: "http://ipis.annexmap.net/api/data/caf_dev/miningsites2014",
			sourceId: "miningsites2014_base",
			display:{
				type: 'circle',
				color: 'rgba(0,0,0,0)',
				circleStrokeColor: 'rgba(0,0,0,0)',
				visible: true,
				canToggle: true,
				zIndex:98
			},
			onLoaded: function(){
				var features = map.querySourceFeatures("miningsites2014_base");
				var collection = {
					"type": "FeatureCollection",
					"features": []
				};
				features.forEach(function(item){
					var substance;
					switch (item.properties.mineral){
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
					{value: "Diamond",  color:  "#78bfcc"},
					{value: "Gold",  color:  "#cca621"},
					{value: "Iron",  color:  "#c6d4dc"},
					{value: "Copper",  color:  "#a14f1c"},
					{value: "Uranium",  color:  "#99d921"},
					{value: "Cassiterite",  color:  "#3b649f"},
					{value: "Manganese",  color:  "#a96594"},
					{value: "Other",  color:  "#a3b4aa"}
				];

				var parent = this.labelElm.parentElement;

				this.filters = [
					{id: "substance", index: 241, label: "Substances", items: filterItems, onFilter: MapService.genericFilter,filterProperty: "substance"}
				];

				UI.appendLayerFilters(this,parent);

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
							type : "categorical",
							stops: colorStops
						},
						'circle-radius': {
							'base': 5,
							'stops': [[4, 5], [8, 6], [14, 80]]
						},
						'circle-opacity': 0.9,
						'circle-stroke-width': 0.5,
						'circle-stroke-color': "white"
					},
					layout: {
						'visibility': 'visible'
					}
				};
				map.addLayer(subLayerProperties, "ref_miningsites2014_placeholder");

			},
			onClick: function(item){
				UI.popup(item.properties,"minePopup",item.geometry.coordinates,true);
			}
		},
        miningActivities:{
            id: "miningactivities",
            filterId: 18,
            label: "Recent mining activities <small>(2013-2016)</small>",
            source: "http://ipis.annexmap.net/api/data/caf_dev/miningactivities",
            sourceId: "miningactivities",
            display:{
                type: 'heatmap',
                colors: [
                    {step: 0, color: "#dbdb22" , opacity: 0},
                    {step: 0.2, color: "#dbdb22" , opacity: 0.5},
                    {step: 0.6, color: "#dbdb22" , opacity: 1},
                    {step: 0.9, color: "#dba636" , opacity: 1},
                    {step: 1, color: "#cb193a" , opacity: 1}
                ],
                visible: true,
                canToggle: true,
				zIndex:97
            }
        },
        mineralConcessions:{
            id: "mineralconcessions",
            filterId: 5,
            label: "Mineral Concessions",
            source: "http://ipis.annexmap.net/api/data/caf_dev/mineralconcessions",
            sourceId: "mineralconcessions",
            display:{
                type: 'fill',
                fillColor: {
                    property: "resources",
                    data: [
                        {value: "Gold", color: "#eed13d"},
                        {value: "Diamond", color: "#8addee"},
                        {value: "Gold and Diamond", color: "#79ee95"},
                        {value: "Iron", color: "#c9cec7"},
                        {value: "Limestone", color: "#bf9285"},
                        {value: "Colombo-Tantalite", color: "#4975bf"},
                        {value: "Unknown", color: "#AAAAAA"}
                    ]
                },
                fillOpacity: 0.5,
                hoverOpacity: 0.8,
                visible: false,
                canToggle: true,
				zIndex:96
            },
            subLayers:[
                {
                    type: "line",
                    paint: {
                        'line-color': {
                            property: "resources",
                            type : "categorical",
                            stops: [
                                ["Gold", "#eed13d"],
                                ["Diamond", "#8addee"],
                                ["Gold and Diamond", "#79ee95"],
                                ["Iron", "#c9cec7"],
                                ["Limestone", "#bf9285"],
                                ["Colombo-Tantalite", "#4975bf"],
                                ["Unknown", "#bbbbbb"]
                            ]
                        },
                        'line-opacity':1,
                        'line-width' : 2
                    }
                }
            ],
            filters:[
                {id: "resources", index: 51, label: "Resources", items:
                        [
                            {value: "Gold", color: "#eed13d"},
                            {value: "Diamond", color: "#8addee"},
                            {value: "Gold and Diamond", color: "#79ee95"},
                            {value: "Iron", color: "#c9cec7"},
                            {value: "Limestone", color: "#bf9285"},
                            {value: "Colombo-Tantalite", color: "#4975bf"},
                            {value: "Unknown", color: "#aaaaaa"}
                        ],
                    onFilter: MapService.genericFilter,filterProperty: "resources"}
            ],
            onClick: function(item,lngLat){
                UI.popup(item.properties,"mineralConcessionsPopup",lngLat,true);
            },
            onFilter: function(item,lngLat){
                console.log("filter");
            }
        },
        oilConcessions:{
            id: "oilconcessions",
            filterId: 10,
            label: "Oil Concessions",
            source: "http://ipis.annexmap.net/api/data/caf_dev/oilconcessions",
            sourceId: "oilconcessions",
            display:{
                type: 'fill',
                fillColor: "#333",
                fillOpacity: 0.3,
                hoverOpacity: 0.7,
                visible: true,
                canToggle: true,
				zIndex:95
            },
            onClick: function(item,lngLat){
                UI.popup(item.properties,"oilConcessionsPopup",lngLat,true);
            },
            subLayers:[
                {
                    type: "line",
                    paint: {
                        "line-color": "#333",
                        "line-width": 1
                    }
                }
            ]
        },
        forestryConcessions:{
            id: "forestryconcessions",
            filterId: 6,
            label: "Forestry Concessions",
            source: "http://ipis.annexmap.net/api/data/caf_dev/forestryconcessions",
            sourceId: "forestryconcession",
            display:{
                type: 'fill',
                fillColor: "#77c370",
                fillOpacity: 0.3,
                hoverOpacity: 0.7,
                visible: true,
                canToggle: true,
				zIndex:94
            },
            onClick: function(item,lngLat){
                UI.popup(item.properties,"forestryConcessionsPopup",lngLat,true);
            },
            subLayers:[
                {
                    type: "line",
                    paint: {
                        "line-color": "#77c370",
                        "line-width": 1
                    }
                }
            ]
        },
        huntingZones:{
            id: "huntingzones",
            filterId: 7,
            label: "Hunting Zones",
            source: "http://ipis.annexmap.net/api/data/caf_dev/huntingzones",
            sourceId: "huntingzones",
            display:{
                type: 'fill',
                fillColor: "#58adb0",
                fillOpacity: 0.4,
                hoverOpacity: 0.7,
                visible: true,
                canToggle: true,
				zIndex:93
            },
            onClick: function(item,lngLat){
                UI.popup(item.properties,"huntingZonesPopup",lngLat,true);
            },
            subLayers:[
                {
                    type: "line",
                    paint: {
                        "line-color": "#58adb0",
                        "line-width": 1
                    }
                }
            ]
        },
        protectedareas:{
            id: "protectedareas",
            filterId: 4,
            label: "Protected Areas <small>(2017)</small>",
            source: "http://ipis.annexmap.net/api/data/caf_dev/protectedareas",
            sourceId: "protectedareas",
            display:{
                type: 'fill',
                fillColor: {
                    property: "type_ap",
                    data: [
                        {value: "0", color: "#4a7f57"},
                        {value: "1", color: "#8cd89d"},
                        {value: "4", color: "#87c380"},
                        {value: "5", color: "#a4d577"}
                    ]
                },
                fillOpacity: 0.5,
                hoverOpacity: 0.8,
                visible: false,
                canToggle: true,
				zIndex:92
            },
            //popupOnhover: "type_ap",
            onClick: function(item,lngLat){
                function format(item){
                    return item;
                }
                UI.hideDashboard();
                UI.popup(format(item).properties,"protectedAreaPopup",lngLat,true);
            },
            onLoaded: function(){

            }
        },
        cattletrade_placeholder:{
            id: "cattletrade",
            placeholder: true,
            filterId: 13,
            label: "Cattle transhumance and trade",
            source: "http://ipis.annexmap.net/api/data/caf_dev/cattletrade",
            sourceId: "cattletrade",
            display:{
                type: 'line',
                lineColor: "rgba(0,0,0,0)",
                lineWidth: 11,
                lineOpacity: 0.4,
                visible: true,
                canToggle: true,
				zIndex:91
            },
            onLoaded: function(){
                var filterItems = MapService.getFilterItems("cattletrade","transport");
                var parent = this.labelElm.parentElement;

                this.filters = [
                    {id: "transport", index: 111, label: "Transport", items: filterItems, onFilter: MapService.genericFilter,filterProperty: "transport"}
                ];

                UI.appendLayerFilters(this,parent);

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
                            type : "categorical",
                            stops: colorStops
                        },
                        'line-opacity': 0.7,
                        'line-width' : {
                            stops: [[4, 1],[5, 2],[7, 3],[8, 4],[10, 6]]
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
        cattleConcentration:{
            id: "cattleconcentration",
            filterId: 12,
            label: "Cattle Concentrations",
            source: "http://ipis.annexmap.net/api/data/caf_dev/cattleconcentration",
            sourceId: "cattleconcentration",
            display:{
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
                fillPattern: "dot_green_tiny2",
                fillOpacity: 1,
                visible: false,
                canToggle: true,
				zIndex:90,
                filter: ["==", "cattle_den", "low"]
            },
            subLayers : [,
                {
                    paint:{
                        "fill-opacity": 1,
                        "fill-pattern" : "dot_green_tiny"
                    },
                    filter: ["==", "cattle_den", "medium"]
                },
                {
                    paint:{
                        "fill-opacity": 1,
                        "fill-pattern" : "dot_green_medium"
                    },
                    filter: ["==", "cattle_den", "high"]
                }
            ]
        },
        troopLocation:{
            id: "trooplocation",
            filterId: 15,
            label: "Troop location",
            source: "http://ipis.annexmap.net/api/data/caf_dev/trooplocation",
            sourceId: "trooplocation",
            display:{
                type: 'circle',
                size:{
                    property: 'headquarter',
                    stops: [
                        ["1",12]
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
				zIndex:89,
                filter: ["==", "year", "2017"]
            },
            onClick: function(item,lngLat){
                function format(o){
                    o.properties.isHeadQuarter = (o.properties.headquarter !== null) && (o.properties.headquarter !== "null");
                    return o;
                }
                UI.popup(format(item).properties,"troopLocationPopup",lngLat,true);
            },
            onLoaded: function(){

                var filterItems = MapService.getFilterItems("trooplocation","year").reverse();
                filterItems.forEach(function(item){item.color="silver"});
                var parent = this.labelElm.parentElement;

                console.error(this.filters);
                this.filters = this.filters_pre || [];
                this.filters.push({id: "year", index: 152, label: "Year", singleValue: true, items: filterItems, onFilter: MapService.genericMultiFilter,filterProperty: "year"});

                UI.appendLayerFilters(this,parent);

                var filter = this.filters[1];
                var filterItem = filter.filterItems[1];
                UI.updateFilter(filter,filterItem);

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
                {id: "type", index: 151, label: "Type", items:[
                        {value: "France", color: "#dc493e"},
                        {value: "MINUSCA", color: "#59a6fe"},
                        {value: "MISCA", color: "#324d90"}
                    ], onFilter_old: function(elm){

                        var endYear = "" + Data.getCurrentEndYear();

                        var items = elm.filterItems;
                        var hasFilter = false;
                        var types = [];
                        items.forEach(function(item){
                            if (!item.checked){
                                hasFilter = true;
                            }else{
                                types.push(item.value);
                            }
                        });

                        if (hasFilter){
                            map.setFilter("trooplocation",["all",["==", "year", endYear],["in", "type"].concat(types)])
                        }else{
                            map.setFilter("trooplocation",["==", "year", endYear]);
                        }

                    },
                    onFilter: MapService.genericMultiFilter,
                    filterProperty: "type"}
            ]
        },
		/*poaching:{
			id: "poaching",
			filterId: 8,
			label: "Poaching",
			source: "http://ipis.annexmap.net/api/data/caf_dev/poaching",
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
            source: "http://ipis.annexmap.net/api/data/caf_dev/troopmovement",
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
        armsTrafficking_placeholder:{
            placeholder: true,
            id: "armstrafficking_placeholder",
            filterId: 17,
            label: "Arms Trafficking",
            source: "http://ipis.annexmap.net/api/data/caf_dev/armstraffickin",
            sourceId: "armstrafficking",
            display:{
                type: 'line',
                lineColor: "rgba(0,0,0,0)",
                lineWidth: 11,
                lineOpacity: 0.4,
                visible: true,
                canToggle: true,
				zIndex:88
            },
            onLoaded: function(){
                var filterItems = MapService.getFilterItems("armstrafficking","type");
                var parent = this.labelElm.parentElement;

                this.filters = [
                    {id: "type", index: 171, label: "Type", items: filterItems, onFilter: MapService.genericFilter,filterProperty: "type"}
                ];

                UI.appendLayerFilters(this,parent);

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
                            type : "categorical",
                            stops: colorStops
                        },
						'line-opacity': 0.7,
						'line-width' : {
							stops: [[4, 1],[5, 2],[7, 3],[8, 4],[10, 6]]
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
		airstrips:{
			id: "airstrips",
			filterId: 19,
			label: "Airstrips",
			source: "http://ipis.annexmap.net/api/data/caf_dev/airstrips",
			sourceId: "airstrips",
			display:{
				type: 'circle',
				radius: 12,
				circleOpacity: 0.5,
				color: {
					property: "status",
					data: [
						{value: "open", color: "#53af3e"},
						{value: "closed", color: "#c7431b"},
						{value: "unknown", color: "#477da6"}
					]
				},

				/*type: "symbol",
                iconImage: "airport-11",*/
				visible: false,
				canToggle: true,
				zIndex:87
			},
			filters: [
				{id: "status", index: 191, label: "Status", items:[
						{label: "Open", value: "open", color: "#53af3e"},
						{label: "Closed", value: "closed", color: "#c7431b"},
						{label: "Unknown", value: "unknown", color: "#477da6"}
					], onFilter: MapService.genericFilter,filterProperty: "status"}
			],
			onClick: function(item){
				UI.popup(item.properties,"airstripPopup",item.geometry.coordinates,true);
			}
		}
    }
};
