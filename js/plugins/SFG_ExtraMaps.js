//=============================================================================
// Extra maps
// Zeriab_ExtraMaps.js
// Last Updated: 2015.08.22
//=============================================================================

/*:
 * @plugindesc Allows using more than 999 maps
 * @author Solar Flare Games, based on a plugin by Zeriab
 *
 * @help
 *
 * Plugin Command:
 *   ExtraMaps set church
 *     Use maps from the specific "church" subfolder (data/church/Map003.json)
 *   ExtraMaps reset
 *     Use maps from the default folder (data/Map003.json)
 *
 *   Next transfer will use maps from the new folder
 */

(function() {
    var old_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        old_pluginCommand.call(this, command, args);
        if(command === 'ExtraMaps') {
            switch (args[0]) {
            case 'set':
                $gameSystem.setMapsFolder(args[1]);
                break;
            case 'reset':
                $gameSystem.clearMapsFolder();
                break;
            }
        }
    };
	
	const old_sysInit = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function() {
		old_sysInit.call(this);
		this._MapSubFolder = '';
	};
	
    Game_System.prototype.setMapsFolder = function(subfolder) {
		if(this._MapSubFolder !== subfolder) {
			this._MapSubFolder = subfolder;
			this._mapFolderChange = true;
		}
    };

    Game_System.prototype.clearMapsFolder = function() {
        this.setMapsFolder('');
    };

    // Overriding: DataManager.loadMapData
	DataManager.loadMapData = function(mapId) {
		subfolder = $gameSystem._MapSubFolder || '';
		if(mapId > 0) {
			if($gameSystem._mapFolderChange) {
				$dataMapInfos = null;
				if($gameSystem._MapSubFolder) {
					DataManager.loadDataFile('$dataMapInfos', $gameSystem._MapSubFolder + '/MapInfos.json')
				} else {
					DataManager.loadDataFile('$dataMapInfos', 'MapInfos.json')
				}
			}
			var filename = DataManager.makeMapName(mapId);
			this.loadDataFile('$dataMap', filename);
		} else {
			this.makeEmptyMap();
		}
		// Extra check needed since we need to reload the map transferring
		// to a different folder with unchanged mapId.
		DataManager.checkMapFolderReload();
	};
	
	DataManager.makeMapName = function(mapId) {
		var filename = 'Map%1.json'.format(mapId.padZero(3));
		if($gameSystem._MapSubFolder) {
			filename = '%1/%2'.format($gameSystem._MapSubFolder, filename);
		}
		return filename;
	};
	
	DataManager.checkMapFolderReload = function() {
		reloadNeeded = $gameSystem._mapFolderChange || false;
		if(reloadNeeded) {
			$gamePlayer.requestMapReload();
			$gameSystem._mapFolderChange = false;
		}
	};
	
	const old_mapReady = Scene_Map.prototype.isReady;
	Scene_Map.prototype.isReady = function() {
		return $dataMapInfos !== null && old_mapReady.call(this);
	}
})();
