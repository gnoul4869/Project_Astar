
/*:
@plugindesc [v1.0] Add an option enable auto-battle for all actors.
@author Solar Flare Games

@param optionText
@text Option Menu Text
@desc Text to show in the options menu.
@type text
@default Auto Battle

@help

This adds an option to enable auto-battle for all actors.

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
	Object.defineProperty(TextManager, 'optionAutoBattle', Utils.paramGetter('SFG_AutoBattle', 'optionText', 'Auto Battle'));
	
	//Add option to OPTIONS MENU
	const old_addOptions = Window_Options.prototype.addGeneralOptions;
	Window_Options.prototype.addGeneralOptions = function() {
		old_addOptions.call(this);
		this.addCommand(TextManager.optionAutoBattle, 'autoBattle');
	};
	
	const old_cfgLoad = ConfigManager.applyData;
	ConfigManager.applyData = function(cfg) {
		old_cfgLoad.call(this, cfg);
		if(cfg.autoBattle === undefined) this.autoBattle = false;
		else this.autoBattle = cfg.autoBattle;
	};
	
	const old_cfgSave = ConfigManager.makeData;
	ConfigManager.makeData = function() {
		var cfg = old_cfgSave.call(this);
		if(this.autoBattle === undefined) cfg.autoBattle = true;
		else cfg.autoBattle = this.autoBattle;
		return cfg;
	};
	
	Game_Actor.prototype.isAutoBattle = function() {
		return ConfigManager.autoBattle || Game_BattlerBase.prototype.isAutoBattle.call(this);
	}
})();
