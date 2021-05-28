
/*:
@plugindesc [v1.0] Add an option to show or hide NPC faces in messages
@author Solar Flare Games

@param optionText
@text Option Menu Text
@desc Text to show in the options menu.
@type text
@default Show NPC Faces

@help

This adds an option to hide NPC faces from message dialogs.

Note Tags
=========

<facealways> (event comments)
  If you place this code in a comment in your event, the next message will
  ignore the setting and always show a face graphic (assuming it has one).

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
	Object.defineProperty(TextManager, 'optionShowFaces', Utils.paramGetter('SFG_OptionalFaces', 'optionText', 'Show NPC Faces'));
	
	const old_addOptions = Window_Options.prototype.addGeneralOptions;
	Window_Options.prototype.addGeneralOptions = function() {
		old_addOptions.call(this);
		this.addCommand(TextManager.optionShowFaces, 'showFaces');
	};
	
	const old_message = Game_Interpreter.prototype.command101;
	Game_Interpreter.prototype.command101 = function() {
		const result = old_message.call(this);
		const alwaysShowFace = Array.isArray(this._comments) && this._comments.some(cmt => cmt.toLowerCase().includes("<facealways>"));
		if(!ConfigManager.showFaces && !alwaysShowFace) {
			$gameMessage.setFaceImage("", 0);
		}
		this._comments = [];
		return result;
	};
	
	const old_cfgLoad = ConfigManager.applyData;
	ConfigManager.applyData = function(cfg) {
		old_cfgLoad.call(this, cfg);
		if(cfg.showFaces === undefined) this.showFaces = true;
		else this.showFaces = cfg.showFaces;
	};
	
	const old_cfgSave = ConfigManager.makeData;
	ConfigManager.makeData = function() {
		var cfg = old_cfgSave.call(this);
		if(this.showFaces === undefined) cfg.showFaces = true;
		else cfg.showFaces = this.showFaces;
		return cfg;
	};
})();
