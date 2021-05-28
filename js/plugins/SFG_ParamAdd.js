
/*:
@plugindesc [v1.0] Adds a trait that adds to a parameter instead of multiplying it
@author Solar Flare Games

@param traitId
@text Trait ID
@desc The ID of the trait for adding to a parameter. This exists to resolve plugin conflicts.
@type number
@min 100
@max 999
@default 100

@help

This adds a fixed amount to a parameter, instead of multiplying the parameter.

<add_xxx:4> (anything with traits)
  Adds 4 to parameter xxx (for example atk, mhp, or def).
  Can also be a negative number.

*/

(function() {
	const TRAIT_PARAM_PLUS = Number(PluginManager.parameters('SFG_ParamAdd').traitId) || 100;
	const params = ['mhp', 'mmp', 'atk', 'def', 'mat', 'mdf', 'agi', 'luk'];

	const parseParamAdd = function(obj) {
		if(!obj || !obj.meta) return;
		for(let param = 0; param < params.length; param++) {
			let value = Number(obj.meta['add_' + params[param]]);
			if(value) {
				obj.traits.push({
					"code": TRAIT_PARAM_PLUS,
					"dataId": param,
					"value": value,
				});
			}
		}
	};

	var old_startup = Scene_Boot.prototype.start;
	Scene_Boot.prototype.start = function() {
		old_startup.call(this);
		for(var i = 1; i < $dataStates.length; i++) {
			parseParamAdd($dataStates[i]);
		}
		for(var i = 1; i < $dataActors.length; i++) {
			parseParamAdd($dataActors[i]);
		}
		// These already offer additive parameters so not much point, but what the heck, can't hurt
		for(var i = 1; i < $dataClasses.length; i++) {
			parseParamAdd($dataClasses[i]);
		}
		for(var i = 1; i < $dataWeapons.length; i++) {
			parseParamAdd($dataWeapons[i]);
		}
		for(var i = 1; i < $dataArmors.length; i++) {
			parseParamAdd($dataArmors[i]);
		}
		for(var i = 1; i < $dataEnemies.length; i++) {
			parseParamAdd($dataEnemies[i]);
		}
	};
	
	const old_paramPlus = Game_BattlerBase.prototype.paramPlus;
	Game_BattlerBase.prototype.paramPlus = function(param) {
		return old_paramPlus.call(this, param) + this.traitsSum(TRAIT_PARAM_PLUS, param);
	};
})();
