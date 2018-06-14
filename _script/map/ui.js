var UI = function(){
    var me = {};

    var menuContainer;
    var currentPopup;
    var dashBoard;
    var currentDashBoardTab;
    var currentLoader;
    var currentDashBoardItem;
    var listVisible;
    var menuVisible;

    me.init = function(){
		menuContainer = menuContainer || document.getElementById("menu");
		menuContainer.innerHTML = Template.get("menu");
        menuContainer.className = "active";

        me.buildMenu();


        var closeDashboard = document.getElementById("closeDashboard");
        if (closeDashboard){
			closeDashboard.onclick = UI.hideDashboard;
        }
        var closeMenu = document.getElementById("closeMenu");
        if (closeMenu){
            closeMenu.onclick = UI.hideMenu;
        }

        var menubutton = document.getElementById("menubutton");
        if (menubutton){
            menubutton.onclick = UI.showMenu;
        }


        document.body.classList.remove("loading");


    };

    me.showLoader = function(){
		menuContainer = menuContainer || document.getElementById("menu");
		menuContainer.className = "preloader";
		menuContainer.innerHTML = Template.get("loading");
		document.body.classList.add("loading");
    };

    me.showLoaderTimeOut = function(){
        menuContainer = menuContainer || document.getElementById("menu");
        menuContainer.innerHTML = Template.get("timeout");
    };

    me.showLoaderError = function(){
        menuContainer = menuContainer || document.getElementById("menu");
        menuContainer.className = "preloader big";
        menuContainer.innerHTML = Template.get("loadererror");
    };

    me.showDisclaimer = function(firstUse){

        if (firstUse){
            var cookieName = Config.mapId + "_disclaimer";
            var hasReadDisclaimer = readCookie(cookieName);
            if (hasReadDisclaimer) return;
            createCookie(cookieName,true,100);
        }

        var container =  document.getElementById("disclaimer");
        var content =  document.getElementById("disclaimerbody");
        document.body.classList.add("disclaimer");
        FetchService.get(Config.disclaimerUrl,function(html){
            content.innerHTML = html;
            var button = div("button","OK");
            content.appendChild(button);
            button.onclick = me.hideDisclaimer;
            content.onclick = function(e){
                if (!e) {e = window.event;}
                e.cancelBubble = true;
                if (e.stopPropagation) e.stopPropagation();
            };
            container.onclick = me.hideDisclaimer;
        });
    };

    me.hideDisclaimer = function(){
		document.body.classList.remove("disclaimer");
    };

    me.showInfo = function(){

        UI.hideDashboard();
        var container =  document.getElementById("info");
        var content =  document.getElementById("infobody");
        document.body.classList.add("info");
        FetchService.get(Config.infoUrl,function(html){
            content.innerHTML = html;
            var button = div("button","OK");
            content.appendChild(button);
            button.onclick = me.hideInfo;
            content.onclick = function(e){
                if (!e) {e = window.event;}
                e.cancelBubble = true;
                if (e.stopPropagation) e.stopPropagation();
            };
            container.onclick = me.hideInfo;
        });
    };

    me.hideInfo = function(){
		document.body.classList.remove("info");
    };

    me.buildMap = function(){

    };

    me.buildLayer = function(properties){

    };

    me.toggleLayer = function(layer){

        var elm = layer.labelElm;
        var container = layer.containerElm;
        var visible;
        if (elm){
            elm.classList.toggle("inactive");
            visible = !elm.classList.contains("inactive");
        }else{
            if (layer.added) visible = map.getLayoutProperty(layer.id, 'visibility') !== "visible";
        }
        if (container) container.classList.toggle("inactive",!visible);

        if (layer.added){
            map.setLayoutProperty(layer.id, 'visibility', visible ? 'visible' : 'none');

            if (layer.subLayers){
                layer.subLayers.forEach(function(subLayer,index){
                    map.setLayoutProperty(layer.id + index, 'visibility', visible ? 'visible' : 'none');
                });
            }

            if (layer.placeholder){
                map.setLayoutProperty(layer.id.split("_")[0], 'visibility', visible ? 'visible' : 'none');
            }
        }else{
            if (elm){
				if (currentLoader) removeLoader();
                var loader = '<div class="lds-dual-ring"></div>';
                var loaderContainer = elm.querySelector("i");
                if (loaderContainer) loaderContainer.innerHTML = loader;
                elm.classList.add("loading");
                currentLoader = elm;
            }

            MapService.addLayer(layer);
        }

        if (layer.onToggle){
            layer.onToggle(visible);
        }

        EventBus.trigger(EVENT.layerChanged);

    };

    me.updateFilter = function(filter,item){

        var checkedCount = 0;
        filter.filterItems.forEach(function(e){
            if (e.checked) checkedCount++;
        });


        if ((checkedCount === filter.filterItems.length) || filter.singleValue){
            // all items checked -> invert
            filter.filterItems.forEach(function(e){
                e.checked = e.value === item.value;
                if (e.checked){e.elm.classList.remove("inactive")}else{e.elm.classList.add("inactive")}
            });

        }else{
            if (checkedCount === 1 && item.checked){
                // don't allow all select items to be unchecked -> select all
                filter.filterItems.forEach(function(e){
                    e.checked = true;
                    if (e.checked){e.elm.classList.remove("inactive")}else{e.elm.classList.add("inactive")}
                });
            }else{
                item.checked = !item.checked;
                if (item.checked){item.elm.classList.remove("inactive")}else{item.elm.classList.add("inactive")}
            }

        }

        if (filter.onFilter){
            filter.onFilter(filter,item);
        }

    };

    me.buildMenu = function(){
        var container = document.getElementById("layers");
        var basecontainer = document.getElementById("baselayers");

        Config.baselayers.forEach(function(baselayer){
            var layerdiv = div(baselayer.id + (baselayer.active ? " active":""), baselayer.label || baselayer.id);
            layerdiv.dataset.id = baselayer.url;
            baselayer.elm = layerdiv;
            layerdiv.item = baselayer;
            layerdiv.onclick=function(){
                Config.baselayers.forEach(function(item){
                    item.elm.classList.remove("active");
                    item.active = false;
                });
                layerdiv.classList.add("active");
                layerdiv.item.active = true;
                if (currentPopup) currentPopup.remove();
                MapService.setStyle(layerdiv.dataset["id"]);
            };
            basecontainer.appendChild(layerdiv);
        });

        for (var key in Config.layers){
            if (Config.layers.hasOwnProperty(key)){
                var layer = Config.layers[key];
                if (layer.label){
                    var layerContainer = div("layer");
                    var label  = div("label","<i></i>" + layer.label);

                    if (layer.display && layer.display.canToggle){
                        label.className += " toggle";
                        if (layer.display && !layer.display.visible) {
                        	label.className += " inactive";
							layerContainer.className += " inactive";
						}
                        layer.labelElm = label;
                        layer.containerElm = layerContainer;
                        label.layer = layer;

                        label.onclick = function(){
                            UI.toggleLayer(this.layer);
                        }
                    }

                    layerContainer.appendChild(label);
                    me.appendLayerFilters(layer,layerContainer);

                    container.appendChild(layerContainer);
                }
            }
        }
    };

    me.appendLayerFilters = function(layer,layerContainer){
        if (layer.filters) layer.filters.forEach(function(filter){
            var filterContainer = div("filter");
            var filterLabel  = div("filterlabel",filter.label);

            filterContainer.appendChild(filterLabel);
            var itemContainer = div("items");

            var items = filter.items;
            if (typeof items === "function") items = filter.items();
            filter.layer = layer;

            var filterItems = [];
            var max = filter.maxVisibleItems;
            var hasOverflow = false;
            items.forEach(function(item,index){

                var filterItem = item;
                if (typeof item === "string" || typeof item === "number"){
                    filterItem = {label: item}
                }
                filterItem.color = filterItem.color || "silver";
                if (typeof filterItem.value === "undefined") filterItem.value = filterItem.label;

                var icon = '<i style="background-color: '+filterItem.color+'"></i>';
                var elm = div("filteritem",icon +  (filterItem.label || filterItem.value) );

                elm.onclick = function(){me.updateFilter(filter,filterItem)};

                if (max && index>=max){
                    elm.classList.add("overflow");
                    hasOverflow = true;
                }

                itemContainer.appendChild(elm);

                filterItem.elm = elm;
                filterItem.checked = true;
                filterItems.push(filterItem);
            });
            filter.filterItems = filterItems;

            if (hasOverflow){
                var toggleMore = div("moreless","Plus ...");
                toggleMore.onclick = function(){
                    if (itemContainer.classList.contains("expanded")){
                        itemContainer.classList.remove("expanded");
                        toggleMore.innerHTML = "Plus ...";
                        toggleMore.classList.remove("less");
                    }else{
                        itemContainer.classList.add("expanded");
                        toggleMore.innerHTML = "Moins ...";
                        toggleMore.classList.add("less");
                    }
                };
                itemContainer.appendChild(toggleMore);
            }


            filterContainer.appendChild(itemContainer);
            layerContainer.appendChild(filterContainer);
        });
    };

    me.popup = function(data,template,point,flyTo,offset){

        var html = data;
        if (template) html = Template.render(template,data);

        map.flyTo({center: point});

        if (currentPopup) currentPopup.remove();
		currentPopup = new mapboxgl.Popup()
			.setLngLat(point)
			.setHTML(html)
			.addTo(map);

		// delay is needed by Spiderify plugin
		setTimeout(function(){
			currentPopup.addTo(map);
        },50);

    };

    me.hidePopup = function(){
		if (currentPopup) currentPopup.remove();
    };


    me.initSearch = function(){

    };


    me.hideDashboard = function(){
        document.getElementById("datalist").classList.add("hidden");
        document.body.classList.remove("listVisible");
        listVisible = false;
        EventBus.trigger(EVENT.UIResize);
        //if (dashBoard){
        //dashBoard.className = "";
        //document.body.classList.remove("dashboard");
        // }
    };

    me.hideMenu = function(){
        document.getElementById("menu").classList.remove("active");
        document.getElementById("menubutton").classList.add("active");
        document.body.classList.add("menuHidden");
        menuVisible = false;
        EventBus.trigger(EVENT.UIResize);
    };

    me.showMenu = function(){
        document.getElementById("menu").classList.add("active");
        document.getElementById("menubutton").classList.remove("active");
        document.body.classList.remove("menuHidden");
        menuVisible = true;
        EventBus.trigger(EVENT.UIResize);
    };

    me.togglePanel = function(elm){
        if (elm && elm.dataset.target){
            elm.classList.toggle("contracted");
            var container = elm.parentElement;
            var target = container.querySelector(elm.dataset.target);
            if (target){
                target.classList.toggle("contracted",elm.classList.contains("contracted"));
            }
        }
    };

    me.onRender = function(){
       if (currentLoader) removeLoader();
    };

    var removeLoader = function(){
		var loaderContainer = currentLoader.querySelector("i");
		if (loaderContainer) loaderContainer.innerHTML = "";
		currentLoader.classList.remove("loading");
		currentLoader = false;
    };

    var setupYearSlider = function(){
        var start = document.getElementById("sliderstart");
        var end = document.getElementById("sliderend");
        var bar = document.getElementById("sliderprogress");

        start.left = 1;
        start.min = 1;

        end.left = 196;
        end.max = 196;

        bar.left = 0;
        bar.width = 196;
        bar.min=0;
        bar.max = 196;

        var yearContainer = document.getElementById("slideryears");
        var years =  Data.getYears();
        var yearsElements = [];
        var w = ((end.max + 18) / years.length);

        var currentStartYear = years[0];
        var currentEndYear = years[years.length-1];


        years.forEach(function(year,index){
            var d = div("year",year);
            d.id = "sy" + year;
            d.style.left = Math.floor(index*w) + "px";
            d.year = parseInt(year);
            yearContainer.appendChild(d);
            yearsElements.push(d);
        });


        var isDragging;
        var dragElement;
        var updateTimeout;

        setupDrag(start);
        setupDrag(end);

        // check if the yearslider is in the URL filter
        if (Config.initfilterIds && Config.initfilterIds[0] && Config.initfilterIds[0].substr(0,2) == "1."){
            var initYears = Config.initfilterIds[0].substr(2).split(".");
            if (initYears.length == 2){
                currentStartYear = parseInt(initYears[0]) + 2000;
                currentEndYear = parseInt(initYears[1]) + 2000;
                var startYear = years.indexOf(currentStartYear);
                var endYear = years.indexOf(currentEndYear);
                if (startYear>=0 && endYear>=0){
                    start.left = Math.round(startYear*w) + 1;
                    start.style.left = start.left + "px";
                    end.left = Math.round(endYear*w) + 3;
                    end.style.left = end.left + "px";

                    updateBar();
                    updateMinMax();
                    EventBus.on(EVENT.mapStyleLoaded,function(){
                        Data.updateYearFilter(currentStartYear,currentEndYear);
                    });
                }
            }
        }


        document.body.addEventListener("mousemove",function(e){
            if (isDragging){
                e.preventDefault();
                var delta = e.pageX - dragElement.startX;
                var target = dragElement.startLeft + delta;
                if (target < dragElement.min) target=dragElement.min;
                if (target > dragElement.max) target=dragElement.max;
                dragElement.left = target;
                dragElement.style.left = target + "px";
                if (dragElement.id == "sliderprogress"){
                    updateHandles();
                }else{
                    updateBar();
                }
            }
        });

        document.body.addEventListener("mouseup",function(){
            if (isDragging){
                isDragging = false;
                dragElement.classList.remove("active");
                start.classList.remove("baractive");
                end.classList.remove("baractive");
                updateYears();
                updateMinMax();
            }
        });

        function updateBar(){
            bar.width = Math.max((end.left - start.left),2);
            bar.left = start.left-2;

            bar.style.width = bar.width + "px";
            bar.style.left = bar.left + "px";

            // use a timeout to avoid flooding
            clearTimeout(updateTimeout);
            setTimeout(function(){
                var startYear = years[Math.round((start.left-2)/w)];
                var endYear = years[Math.round((end.left-2)/w)];
                yearsElements.forEach(function(elm){
                    var passed = (elm.year>=startYear && elm.year<=endYear);
                    elm.classList.toggle("inactive",!passed);
                })
            },100);
        }

        function updateHandles(){
            start.left = bar.left+2;
            end.left = bar.left+bar.width+1;
            start.style.left = start.left + "px";
            end.style.left = end.left + "px";

            // use a timeout to avoid flooding
            clearTimeout(updateTimeout);
            setTimeout(function(){
                var startYear = years[Math.round((start.left-2)/w)];
                var endYear = years[Math.round((end.left-2)/w)];
                yearsElements.forEach(function(elm){
                    var passed = (elm.year>=startYear && elm.year<=endYear);
                    elm.classList.toggle("inactive",!passed);
                })
            },100);
        }

        function updateMinMax(){
            start.max = end.left-2;
            end.min = start.left+2;
            bar.max = 196 - bar.width;
        }

        function updateYears(){
            var startYear = Math.round((start.left-2)/w);
            start.left = Math.round(startYear*w) + 1;
            start.style.left = start.left + "px";

            var endYear = Math.round((end.left-2)/w);
            end.left = Math.round(endYear*w) + 3;
            end.style.left = end.left + "px";

            updateBar();

            if (years[startYear] !== currentStartYear){
                currentStartYear = years[startYear];
                UI.hideDashboard();
                Data.updateYearFilter(currentStartYear,currentEndYear);
            }
            if (years[endYear] !== currentEndYear){
                currentEndYear = years[endYear];
                UI.hideDashboard();
                Data.updateYearFilter(currentStartYear,currentEndYear);
            }

        }

        function setupDrag(elm){
            updateMinMax();
            elm.onmousedown = function(e){
                dragElement = elm;
                dragElement.classList.add("ontop");
                if (dragElement.classList.contains("start")){
                    end.classList.remove("ontop");
                }else{
                    start.classList.remove("ontop");
                }
                elm.startX = e.pageX;
                elm.startLeft = elm.left;
                elm.classList.add("active");
                isDragging = true;
            };

        }

        bar.onmouseover = function(){
            if (!isDragging){
                start.classList.add("baractive");
                end.classList.add("baractive");
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
                start.classList.remove("baractive");
                end.classList.remove("baractive");
            }

        }

    };


    me.showDashboard = function(item){

		document.getElementById("datalist").classList.remove("hidden");
        document.body.classList.add("listVisible");
		listVisible = true;
        EventBus.trigger(EVENT.UIResize);

        var container = document.getElementById("dataListContainer");
        var hasContent = container.querySelector(".entry");
        if (!hasContent){
            me.listLayer();
        }


        var element = document.getElementById("entry" + item.properties.id);
        if(element) {
            activateDashboardItem(element);
            var scroller = document.getElementById("dataListScroll");
            scrollTo(scroller,element.offsetTop - 200,100);
        }


        EventBus.trigger(EVENT.UIResize);

    };

    var activateDashboardItem = function(item){
        var container = document.getElementById("dataListContainer");
        if (currentDashBoardItem) currentDashBoardItem.classList.remove("focused");
        currentDashBoardItem = item;
        item.classList.add("focused");
        container.classList.add("focused");
    };


    function scrollTo(element, to, duration) {
        var start = element.scrollTop,
            change = to - start,
            currentTime = 0,
            increment = 20;

        var animateScroll = function(){
            currentTime += increment;
            element.scrollTop = Math.easeInOutQuad(currentTime, start, change, duration);
            if(currentTime < duration) {
                setTimeout(animateScroll, increment);
            }
        };
        animateScroll();
    }

    //t = current time
    //b = start value
    //c = change in value
    //d = duration
    Math.easeInOutQuad = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    };


    me.listLayer = function(silent){

        var container = document.getElementById("dataListContainer");
        container.innerHTML = "";
        //var layer = dataset[datasetId];
        var markers = Data.getIncidents(true);
        var table = document.createElement("div");
        for (var i = 0, len = markers.length; i<len; i++){
            var marker = markers[i];
            var co = marker.geometry.coordinates;

            var entry =  createListDataEntry(marker.properties);
            entry.setAttribute("data-co", co[1] + "|" + (parseFloat(co[0]) + 0.1));

            table.appendChild(entry);
        }
        container.appendChild(table);

		if (!silent){
			document.getElementById("datalist").classList.remove("hidden");
			document.body.classList.add("listVisible");
			listVisible = true;
			EventBus.trigger(EVENT.UIResize);
		}
    };

    function createListDataEntry(p){
        var actor = p.actor1;
        if (p.actor1Details) actor += " (" + p.actor1Details.trim() + ")";
        if (p.actor2) actor += "<br>" + p.actor2;
		if (p.actor2Details) actor += " (" + p.actor2Details.trim() + ")";
        if (p.actor3) actor += "<br>" + p.actor3;
		if (p.actor3Details) actor += " (" + p.actor3Details.trim() + ")";
        if (p.actor4) actor += "<br>" + p.actor4;
		if (p.actor4Details) actor += " (" + p.actor4Details.trim() + ")";

        var tr = document.createElement("div");
        tr.className = "entry";
        tr.id = "entry" + p.id;
        var td1 = document.createElement("div");
        td1.className = "date";
        td1.innerHTML = p.formattedDate;
        var td2 = document.createElement("div");
        td2.className = "actor";
        td2.innerHTML = actor;
        var td3 = document.createElement("div");
        td3.className = "description";
        td3.innerHTML = p.description;
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);

        var info = document.createElement("div");
        info.className = "info";
        info.innerHTML = "<b>Location:</b>" + p.location + "<br><b>Source:</b>" + p.source;
        tr.appendChild(info);

        tr.onclick=function(){
            activateDashboardItem(this);
            EventBus.trigger(EVENT.mapNavigate);

            var co = this.dataset["co"];
            var location = co.split('|');
            console.log(location);
            var point = [location[1],location[0]];
            map.flyTo({center: point,zoom:11});
        };

        return tr;

    }


    function div(className,innerHTML){
        var d = document.createElement("div");
        if (className) d.className = className;
        if (innerHTML) d.innerHTML = innerHTML;
        return d;
    }

    EventBus.on(EVENT.filterChanged,function(){
        me.listLayer(!listVisible);
    });

    return me;

}();
