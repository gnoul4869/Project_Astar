
/*:
@plugindesc [v1.0] Sorts items and skills by category in various views.
@author Solar Flare Games

@param alpha
@text Sort Method
@desc How entries should be sorted within a given sort key.
@type boolean
@default false
@on Alphabetically
@off By ID

@help

This plugin sorts items and skills alphabetically in the item list, skill list,
amd shop list views.

If you use the ItemBook plugin, you can also apply this sorting to it by
adding a line "Utils.sortItemList(this._list);" in that plugin,
just above the line "this.createContents();"
in the function "Window_ItemBookIndex.prototype.refresh".

If you use the EnemyBook plugin, you can also apply this sorting to it by
adding a line "Utils.sortEnemyList(this._list);" in that plugin,
just above the line "this.createContents();"
in the function "Window_EnemyBookIndex.prototype.refresh".

Note Tags
=========

<sortKey:4> (items, weapons, armors, skills, enemies)
  Sets a priority for sorting this item. Can be either a number or a string,
  or a comma-separated list of keys that are numbers or strings.

  Numbers can be useful if you want to group a set of items without changing
  how they sort amongst themselves - just give them all the same number.

  Strings can be useful if you have names of the form X Y and you want all
  with the same Y to sort togather.

  A comma-separated list can be useful if you want subgroupings within a
  larger grouping.
*/

(function() {
	var lexic = JSON.parse(PluginManager.parameters('SFG_SortKeys').alpha);
	Utils.sortItemList = function(list) {
		if(!Array.isArray(list)) return;
		list.sort(function(a, b) {
			var atype = DataManager.getItemType(a), btype = DataManager.getItemType(b);
			// If they're of different types, use the order:
			// item, key item, hidden items, weapon, armour, skill (grouped by skill type)
			// (Though I don't expect skills will ever be mixed in with items.)
			if(atype === 'item'){
				if(btype === 'item') {
					if(a.itypeId != b.itypeId)
						return a.itypeId - b.itypeId
				} else return -1;
			} else if(atype === 'weapon') {
				if(btype === 'item') return 1;
				else if(btype !== 'weapon') return -1;
			} else if(atype === 'armor') {
				if(btype === 'skill') return -1;
				else if(btype !== 'armor') return 1;
			} else if(atype === 'skill') {
				if(btype !== 'skill') return -1;
				else if(a.stypeId != b.stypeId)
					return a.stypeId - b.stypeId;
			}
			var sortKeyCompare = DataManager.getSortKey(a).compare(DataManager.getSortKey(b));
			if(sortKeyCompare != 0) return sortKeyCompare;
			if(lexic) {
				var nameA = a.name.toUpperCase();
				var nameB = b.name.toUpperCase();
				if (nameA < nameB) return -1;
				if (nameA > nameB) return 1;
				return 0;
			}
			return a.id - b.id;
		});
	};
	
	Utils.sortEnemyList = function(list) {
		if(!Array.isArray(list)) return;
		list.sort(function(a,b) {
			var sortKeyCompare = DataManager.getSortKey(a).compare(DataManager.getSortKey(b));
			if(sortKeyCompare != 0) return sortKeyCompare;
			if(lexic) {
				var nameA = a.name.toUpperCase();
				var nameB = b.name.toUpperCase();
				if (nameA < nameB) return -1;
				if (nameA > nameB) return 1;
				return 0;
			}
			return a.id - b.id;
		});
	};
	
	DataManager.getItemType = function(item) {
		if(DataManager.isItem(item)) return 'item';
		if(DataManager.isWeapon(item)) return 'weapon';
		if(DataManager.isArmor(item)) return 'armor';
		if(DataManager.isSkill(item)) return 'skill';
		return '';
	};
	
	DataManager.getSortKey = function(obj) {
		var key = [];
		if(obj.meta.sortKey) {
			let split = obj.meta.sortKey.split(',');
			for(let i = 0; i < split.length; i++) {
				if(Number(split[i]) == Number(split[i])) {
					key[i] = Number(split[i]);
				} else key[i] = split[i];
			}
		}
		key.compare = function(otherKey) {
			if(key.length < otherKey.length) {
				return -1;
			} else if(key.length > otherKey.length) {
				return 1;
			} else for(let i = 0; i < key.length; i++) {
				let isNum = typeof(key[i]) === 'number', otherIsNum = typeof(otherKey[i]) === 'number';
				if(isNum && otherIsNum) {
					if(key[i] != otherKey[i])
						return key[i] - otherKey[i];
				} else if(isNum) {
					return -1;
				} else if(otherIsNum) {
					return 1;
				} else if(key[i] < otherKey[i]) {
					return -1;
				} else if(key[i] > otherKey[i]) {
					return 1;
				}
			}
			return 0;
		};
		return key;
	};
	
	var old_ItemList_make = Window_ItemList.prototype.makeItemList;
	Window_ItemList.prototype.makeItemList = function() {
		old_ItemList_make.call(this);
		Utils.sortItemList(this._data);
	};
	
	var old_SkillList_make = Window_SkillList.prototype.makeItemList;
	Window_SkillList.prototype.makeItemList = function() {
		old_SkillList_make.call(this);
		Utils.sortItemList(this._data);
	};
	
	var old_ShopBuy_make = Window_ShopBuy.prototype.makeItemList;
	Window_ShopBuy.prototype.makeItemList = function() {
		old_ShopBuy_make.call(this);
		for(let i = 0; i < this._data.length; i++) {
			this._data[i]._priceTemp = this._price[i];
		}
		Utils.sortItemList(this._data);
		for(let i = 0; i < this._data.length; i++) {
			this._price[i] = this._data[i]._priceTemp;
			delete this._data[i]._priceTemp;
		}
	};
})();