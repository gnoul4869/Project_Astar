/*:
 * @plugindesc Show enemy's HP bar.
 * @author Researched and modified by gnoul_
 *
 * @param High HP
 * @desc Insert the colour code.
 * @default #03fc39
 *
 * @param Medium HP
 * @desc Insert the colour code.
 * @default #fcca03
 *
 * @param Low HP
 * @desc Insert the colour code.
 * @default #fc0303
 *
 * param Critical HP
 * desc Insert the colour code.
 * default #ff3300
 *
 * @help 
 * USAGE: Use enemy note tags below (ONLY ONE)
 * <hpBar> to show hp bar
 * <hpBarSelectionOnly> to show the hp bar only during selection.
 * <hpBarTurnASelection> to show he bar during selection and attack.
 * <hpBarTurnOnly> to only show the bar during the attack phase.
 * <hpBarBoss> for boss encounters.
 * <hpBarM> for medium size enemy.
 * <hpBarS> for small size enemy.
 * 
 */
(function() {

    // Define our parameters so we are picked up on in the plugin manager.
    var parameters = PluginManager.parameters('monster healthbar');
    
    //==========================================================================
    // Create variables and define colour.
    //==========================================================================
    
    var _Game_Enemy_prototype = Game_Enemy.prototype;
    var _Scene_Battle_prototype = Scene_Battle.prototype;
    var _Game_Enemy_prototype = Game_Enemy.prototype;
    
    //Game_Enemy.prototype.battlerHeight = null;
    //Game_Enemy.prototype.battlerWidth = null;
    _Game_Enemy_prototype.battlerHeight = null;
    _Game_Enemy_prototype.battlerWidth = null;
    
    var high = parameters['High HP'] || '#03fc39';
    var medium = parameters['Medium HP'] || '#fcca03';
    var low = parameters['Low HP'] || '#fc0303';
    //var critical = parameters['Critical HP'] || '#ff3300';
    
    
    //==========================================================================
    // Create enemy HP window to display all the health bars.
    //==========================================================================
    
    function Enemy_Bars() {
        this.initialize.apply(this, arguments);
    };
    
    // Create a new window object for the new function.
    // We'll use Window_Base for this.
    Enemy_Bars.prototype = Object.create(Window_Base.prototype);
    
    // Then set up a constructor.
    Enemy_Bars.prototype.constructor = Enemy_Bars;
    
    
    // Next we'll define the position and look of the bars.
    Enemy_Bars.prototype.initialize = function(x, y, width, height) {
        
        // Setup the window hovering above the Enemy with the tag.
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        
        // Then deactivate the initialization.
        this.deactivate();
        
        // Then make transparent.
        this.opacity = 0;
    };
    
    
    // This update function clears the window and updates all the bars.
    Enemy_Bars.prototype.update = function() {  
        Window_Base.prototype.update.call(this);
        this.contents.clear();
        this.drawBar();
        
    };
    
    
    // Then return the colour of the HP bar based on current HP!
    Enemy_Bars.prototype.getColour = function(rate) {
        if(rate > 0.66) {
            return high;
        }
        else if(rate > 0.33) {
            return medium;
        }
        else {
            return low;
        }
        // else if(rate > 0.25) {
        //     return low;
        // }
        // else {
        //     return critical;
        // }
    };
    
    // This is the variable for the linebreak name offset.
    // I figured it was more efficiant to define this as a constant,
    // instead of redefining it over and over again in the loop.
    var nameOffset = 40;
    
    // Finally draw the bars.
    // Pay attention to the loop!
    // This will be useful for many scripts!
    Enemy_Bars.prototype.drawBar = function() {
        
        // Loop through the enemies and draw their bars.
        for(var i = 0; i < $gameTroop._enemies.length; i++) {
            
            // Store enemy ID in variable.
            var enemyId = $gameTroop._enemies[i]._enemyId;
            
            // Store enemy selection in variable.
            var selected = $gameTroop._enemies[i]._selected;
            
            // Check if enemy is appeared.
            var appeared = $gameTroop._enemies[i].isAppeared();
            //console.log(appeared);
            // Check to see if it is enemy's turn.
            // Used for HP bar shown only when enemy attacks.
            if(BattleManager._phase === "action" || BattleManager._phase === "turn") {
                var turn = true;
            }
            else {
                var turn = false;
                //console.log(BattleManager._phase);
            }
            
            // Boolean check to see if health bars are enabled.
            var enabled = false;
            var isBoss = false;
            var sizeM = false;
            var sizeS = false;
            // Read data from enemy notes.
            // $dataEnemies[id].meta appears to be what reads the notes.
            var meta = new Array(7);
            meta[0] = $dataEnemies[enemyId].meta.hpBar;
            meta[1] = $dataEnemies[enemyId].meta.hpBarSelectionOnly;
            meta[2] = $dataEnemies[enemyId].meta.hpBarTurnASelection;
            meta[3] = $dataEnemies[enemyId].meta.hpBarTurnOnly;
            meta[4] = $dataEnemies[enemyId].meta.hpBarBoss;
            meta[5] = $dataEnemies[enemyId].meta.hpBarM;
            meta[6] = $dataEnemies[enemyId].meta.hpBarS;
            
            if(meta[0] && appeared) {
                enabled = true;
                //console.log(meta[0]);
            }
            else if(meta[1] && selected && appeared) {
                enabled = true;
            }
            else if(meta[2] && (selected || turn) && appeared) {
                enabled = true;
            }
            else if(meta[3] && turn && appeared) {
                enabled = true;
            }
            else if(meta[4] && appeared) {
                enabled = true;
                isBoss = true;
                
            }
            else if(meta[5] && appeared) {
                enabled = true;
                sizeM = true;
            }
            else if(meta[6] && appeared) {
                enabled = true;
                sizeS = true;
            }
            else {
                enabled = false;
            }
            
            // This is one mother of a loop!
            // Anyway, get current HP.
            var currentHp = $gameTroop._enemies[i]._hp;
            // If enemy HP is not zero, draw HP bar.
            if(currentHp > 0 && enabled) {
                // Get Max HP
                var maxHp = $dataEnemies[enemyId].params[0];
                
                // Rate will be the current HP compared to max HP.
                var rate = currentHp/maxHp;
                
                //var enemyName = $gameTroop._enemies[i].name();
                /*if(isBoss)
                {
                    //this.changeTextSize(18);
                    enemyName = String('(BOSS) ' + enemyName);
                }
                else {
                    //this.changeTextSize(12);
                }*/
                
                // If monster is not a boss...
                // 
                // Then set the width of the bar.
                //var condi = String(/*enemyName + '\n' + */String(currentHp)+ ' / ' + String(maxHp));
                var condi = String(currentHp);
                //var width = this.textWidth(condi);
                var width = $dataEnemies[enemyId].battlerWidth;
                // Then its position.
                var xOffset = width / 2 + 16;
                var x = $gameTroop._enemies[i]._screenX - xOffset;
                var y = $gameTroop._enemies[i]._screenY - (64 * 4) - 90;
                if(sizeM) {
                    var y = $gameTroop._enemies[i]._screenY - (64 * 4) - 40;
                }
                if(sizeS) {
                    var y = $gameTroop._enemies[i]._screenY - (64 * 4) + 70;
                }
                if(isBoss)
                {
                    width = Window_BattleStatus.prototype.windowWidth();
                    var height = Window_BattleStatus.prototype.windowHeight();
                    // I couldn't work out how to automate finding the centre so...
                    // This is an approximation gained through trial & error.
                    x = (Graphics.boxWidth / 10) - 2.5;
                    y = (Graphics.boxHeight - (height * 1.32));
                    this.drawGauge(x, y, width, rate, this.getColour(rate), this.getColour(rate));
                    //this.changeTextColor(this.getColour(rate));
                    // drawText twice for linebreak.
                    //this.drawText(enemyName, x, (y - nameOffset), width, 'center');
                    this.drawText(condi, x, (y-20), width, 'center');
                }
                else 
                {
                    this.drawGauge(x, y, width, rate, this.getColour(rate), this.getColour(rate));
                    //this.changeTextColor(this.getColour(rate));
                    // We have to drawText twice in order to create a line break.
                    //this.drawText(enemyName, x, (y - nameOffset), width, 'center');
                    this.drawText(condi, x, (y-20), width, 'center');
                }                
            }
            
        }
        
        
    };
    
    
    //==========================================================================
    // Alias the Scene_Battle createAllWindows to add the HP window.
    //==========================================================================
    
    var _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _Scene_Battle_createAllWindows.call(this);
        this.Bar = new Enemy_Bars(0, 0, Graphics.width, Graphics.height);
        this.addChildAt(this.Bar, 1);
    };
    
    
    //==========================================================================
    // Then alias the Sprite_Enemy.updateFrame to return information back to HP window.
    //==========================================================================
    
    var _Sprite_Enemy_update = Sprite_Enemy.prototype.updateFrame;
    Sprite_Enemy.prototype.updateFrame = function() {
        Sprite_Battler.prototype.updateFrame.call(this);
        _Sprite_Enemy_update.call(this);
        // Then return bitmaps height and width, as we're
        // updating sprites.
        $dataEnemies[this._enemy._enemyId].battlerHeight = this.bitmap.height;
        $dataEnemies[this._enemy._enemyId].battlerWidth = this.bitmap.width;
    };
    
})();