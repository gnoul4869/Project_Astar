
/*:
@plugindesc [v1.0.1] Makes maps inherit background music, sounds, and battle backs from their parent map.
@author Solar Flare Games

@param bgm
@text Inherit BGM
@desc Whether maps should inherit background music from the parent map.
@type boolean
@default true

@param bgs
@text Inherit BGS
@desc Whether maps should inherit ambient background sounds from the parent map.
@type boolean
@default true

@param bb
@text Inherit Battlebacks
@desc Whether maps should inherit battlebacks from the parent map.
@type boolean
@default true

@help
This plugin makes use of the map hierarchy in the editor to determine which
maps should inherit properties from other maps. If a map specifies one of the
inherited properties, that will be used. Otherwise, the game will look up
the hierarchy until it finds one that does specify the property, and then use
that. If no map in the hierarchy specifies the property, it will be left as
default - that is, blank.

You can force a map to ignore the hierarchy with the <no_inherit> note tag.
A map with this note tag will not inherit from parent maps, but children
of the map will inherit from it. In effect, the map is treated the same
as if it were at the top level.

This plugin is not compatible with Zeriab_ExtraMaps. If you are using
Zeriab_Extra maps to overcome the limit on the maximum number of maps,
you can replace it with SFG_ExtraMaps which does the same thing in the same
way but is compatible with this plugin.
*/

(function() {
	var params = PluginManager.parameters('SFG_MapHierarchy'), $mapLoading = null, loadingId = 0;
	
	const old_loadMap = DataManager.loadMapData;
	DataManager.loadMapData = function(mapId) {
		loadingId = mapId;
		old_loadMap.call(this, mapId);
	};
	
	const old_onMapLoad = DataManager.isMapLoaded;
	DataManager.isMapLoaded = function() {
		if(old_onMapLoad.call(this)) {
			if(loadingId <= 0) {
				loadingId = 0;
				return true;
			}
			if($mapLoading == null) {
				$mapLoading = $dataMap;
			} else {
				if(params.bgm && !$mapLoading.autoplayBgm && $dataMap.autoplayBgm) {
					$mapLoading.autoplayBgm = true;
					$mapLoading.bgm = $dataMap.bgm;
				}
				if(params.bgs && !$mapLoading.autoplayBgs && $dataMap.autoplayBgs) {
					$mapLoading.autoplayBgs = true;
					$mapLoading.bgs = $dataMap.bgs;
				}
				if(params.bb && !$mapLoading.specifyBattleback && $dataMap.specifyBattleback) {
					$mapLoading.specifyBattleback = true;
					$mapLoading.battleback1Name = $dataMap.battleback1Name;
					$mapLoading.battleback2_name = $dataMap.battleback2_name;
				}
			}
			if(($dataMap.meta && $dataMap.meta.no_inherit) || $dataMapInfos[loadingId].parentId == 0 || ($dataMap.autoplayBgm && $dataMap.autoplayBgs && $dataMap.specifyBattleback)) {
				if($mapLoading) $dataMap = $mapLoading;
				$mapLoading = null;
				loadingId = 0;
				return true;
			}
			DataManager.loadMapData($dataMapInfos[loadingId].parentId);
			return false;
		} else return false;
	};
})();
