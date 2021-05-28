
/*:
@plugindesc [v1.0] Add an option enable auto play mode.
@author gnoul_

@param optionText
@text Option Menu Text
@desc Text to show in the options menu.
@type text
@default Auto Play

@help

This adds an option to enable auto play mode.

*/

Utils.paramGetter = function(plugin, param, def) {
	return {
		get: function() {
			var params = PluginManager.parameters(plugin);
			if(params[param] === undefined) return def;
			return params[param];
		},
		configurable: true,
	};
};

(function() {
	Object.defineProperty(TextManager, 'optionAutoPlay', Utils.paramGetter('AutoPlay', 'optionText', 'Auto Play'));
	
	//Add option to OPTIONS MENU
	const old_addOptions = Window_Options.prototype.addGeneralOptions;
	Window_Options.prototype.addGeneralOptions = function() {
		old_addOptions.call(this);
		this.addCommand(TextManager.optionAutoPlay, 'autoPlay');
	};
	
	const old_cfgLoad = ConfigManager.applyData;
	ConfigManager.applyData = function(cfg) {
		old_cfgLoad.call(this, cfg);
		if(cfg.autoPlay === undefined) this.autoPlay = false;
		else this.autoPlay = cfg.autoPlay;
	};
	
	const old_cfgSave = ConfigManager.makeData;
	ConfigManager.makeData = function() {
		var cfg = old_cfgSave.call(this);
		if(this.autoPlay === undefined) cfg.autoPlay = true;
		else cfg.autoPlay = this.autoPlay;
		return cfg;
	};
	
	var mapStart;
	mapStart = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
    mapStart.call(this);
	    if(ConfigManager.autoPlay == true) { 
		   var cmd = new Game_Interpreter();
		   cmd.pluginCommand('Astar', ['-1', '1', '3']);
		   $gameActors.actor(1).changeLevel(80, false);
		   $gameActors.actor(1).setHp($gameActors.actor(1).mhp);
		   $gameActors.actor(1).setMp($gameActors.actor(1).mmp);
     	}
	};
	
})();
