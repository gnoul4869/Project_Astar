
/*:
@plugindesc [v1.2] Not a plugin, just a collection of common utilities used by Solar Flare Games plugins.
@author Solar Flare Games

@help

Be sure to place this above any other Solar Flare Games plugins!

*/

if(!Array.prototype.remove) {
	Object.defineProperty(Array.prototype, 'remove', {
		value: function(val) {
			var i;
			while((i = this.indexOf(val)) >= 0)
				this.splice(i, 1);
		},
		enumerable: false,
	});
}

if(!Array.prototype.remdups) {
	Object.defineProperty(Array.prototype, 'remdups', {
		value: function() {
			var removed = [...new Set(this)];
			this.splice(0, this.length, ...removed);
		},
		enumerable: false,
	});
}

// Try to guess if a value is JSON. Can give false positives!
Utils.isJson = function(val) {
	if(typeof(val) !== 'string' || val === '') return false;
	if(val === 'true' || val === 'false' || val === 'null') return true;
	if(Number(val) === Number(val)) return true;
	return /^".*"$/.test(val) || /^{.*}$/.test(val) || /^\[.*\]$/.test(val);
};

// These are so useful, so let's move them to base!
Window_Base.prototype.textWidthEx = Window_ChoiceList.prototype.textWidthEx;
Window_Base.prototype.isTouchedInsideFrame = Window_ShopStatus.prototype.isTouchedInsideFrame;

// Recursively parse a multiply-JSON-encoded structure from a plugin parameter.
Utils.parseRecursive = function(val) {
	try {
		if(!Array.isArray(val) && typeof(val) !== 'object' && Utils.isJson(val)) {
			val = JSON.parse(val);
		}
		if(Array.isArray(val)) {
			for(var i = 0; i < val.length; i++) {
				val[i] = Utils.parseRecursive(val[i]);
			}
		} else if(typeof(val) == 'object') {
			for(var key in val) {
				if(val.hasOwnProperty(key)) {
					val[key] = Utils.parseRecursive(val[key]);
				}
			}
		}
		return val;
	} catch(e) {
		return val;
	}
};

// Parse a range of the form a~b, or a single number
Utils.parseRange = function(str) {
	if(typeof(str) !== 'string') return null;
	if(str === '') return [];
	var range = str.match(/(\d+)~(\d+)/), result = [];
	if(range) {
		var a = Number(range[1]), b = Number(range[2]);
		for(var n = Math.min(a, b); n <= Math.max(a, b); n++) {
			result.push(n);
		}
	} else {
		str = Number(str);
		if(str || str == 0) {
			result.push(str);
		}
	}
	return result;
};

// Parse a comma-separated list of numbers and ranges.
Utils.parseIntList = function(str) {
	if(!str) return [];
	var list = str.split(','), result = [];
	if(list.length) {
		for(var i = 0; i < list.length; i++) {
			let elem = list[i].trim();
			if(elem) {
				result = result.concat(Utils.parseRange(elem));
			}
		}
	}
	return result;
};

// Parse a comma-separated list of object IDs - either numbers, or tag expressions
Utils.parseIdList = function(str, objList) {
	if(!str) return [];
	var list = str.split(','), result = [];
	if(list.length) {
		for(var i = 0; i < list.length; i++) {
			let elem = list[i];
			let nums = Utils.parseRange(elem);
			if(nums.length) result = result.concat(nums);
			else {
				let conditions = elem.split('&').map(function(cond) {
					let kv = cond.split('=');
					if(kv.length == 0) return obj => true;
					let key = kv[0].trim();
					if(kv.length == 1) return obj => obj.meta[key];
					let val = kv.slice(1).join('=').trim();
					return obj => obj.meta[key] == val;
				});
				result = result.concat(objList.filter(obj => obj && conditions.every(cond => cond(obj))));
			}
		}
	}
	return result;
};

Utils.paramGetter = function(plugin, param, def, parse = false) {
	return {
		get: function() {
			var params = PluginManager.parameters(plugin);
			if(params[param] === undefined) return def;
			if(parse) return JSON.parse(params[param]);
			return params[param];
		},
		configurable: true,
	};
};

PluginManager.isEnabled = function(plugin) {
	return this._scripts.includes(plugin);
};

// Extract metadata from skill learning and from event comments
(function() {
	const old_onLoad = DataManager.onLoad;
	DataManager.extractCommentMetadata = function(data) {
		if(data.list[0].code == 108) {
			data.note = data.list[0].parameters[0];
			for(var j = 1; j < data.list.length; j++) {
				if(data.list[j].code == 408) {
					data.note += '\n' + data.list[j].parameters[0];
				} else break;
			}
			DataManager.extractMetadata(data);
			delete data.note;
		}
	};
	
	DataManager.onLoad = function(obj) {
		old_onLoad.call(this, obj);
		if(obj == $dataClasses) {
			for(var i = 1; i < obj.length; i++) {
				var learn = obj[i].learnings;
				for(var j = 0; j < learn.length; j++) {
					DataManager.extractMetadata(learn[j]);
				}
			}
		} else if(obj == $dataMap) {
			for(var i = 1; i < obj.events.length; i++) {
				var evt = obj.events[i];
				if(evt == null) continue;
				for(var j = 0; j < evt.pages.length; j++) {
					DataManager.extractCommentMetadata(evt.pages[j]);
				}
			}
		} else if(obj == $dataCommonEvents) {
			for(var i = 1; i < obj.length; i++) {
				DataManager.extractCommentMetadata(obj[i]);
			}
		} else if(obj == $dataTroops) {
			for(var i = 1; i < obj.length; i++) {
				var troop = obj[i];
				for(var j = 0; j < troop.pages.length; j++) {
					DataManager.extractCommentMetadata(troop.pages[j]);
				}
			}
		}
	};
})();
