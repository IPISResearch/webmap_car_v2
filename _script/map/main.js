var Main = function(){

    var me = {};

    me.init = function(){
        Template.load(Config.templateURL+'?v' + version, function(templates) {
            if (Config.showDisclaimerOnFirstUse) UI.showDisclaimer(true);

            if (Config.preLoad){
                UI.showLoader();
                Config.preLoad();
            }else{
                EventBus.trigger(EVENT.preloadDone);
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function() {
        me.init();
    });

    window.addEventListener('resize', function() {
        EventBus.trigger(EVENT.UIResize);
    });


    EventBus.on(EVENT.preloadDone,function(){
		MapService.init();
		UI.init();
		SearchService.init();
    });

    return me;


}();