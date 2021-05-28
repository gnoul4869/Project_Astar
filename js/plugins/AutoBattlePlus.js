//=============================================================================
// AutoBattlePlus.js
//=============================================================================

/*:
 * @plugindesc add 'auto' and 'repeat' to battle party command
 * @author Sasuke KANNAZUKI (thx to tomoaky)
 * 
 * @param Auto Command Name
 * @desc Command name of Auto
 * @default Auto
 *
 * @param Repeat Command Name
 * @desc Command name of Repeat
 * @default Repeat
 * 
 * @help This plugin does not provide plugin commands.
 * 
 * - Choose "Auto" to all actors determine automatically their actions
 *   at the turn.
 * - Choose "Repeat" to make actors the same action as the previous turn.
 *
 * note:
 * - At "Repeat" mode, when the actor cannot perform the same action
 * (ex. MP has run out), perform normal attack instead.
 * - When choose "Repeat" at first turn, let all actions be normal attack.
 *
 * copyright: this plugin is based on tomoaky's RGSS3 script material.
 * see "Hikimoki" http://hikimoki.sakura.ne.jp/
 * Thanks to tomoaky.
 *
 * This plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

(function() {
  //
  // process parameters
  //
  var parameters = PluginManager.parameters('AutoBattlePlus');
  var autoName = parameters['Auto Command Name'] || 'Auto';
  var repeatName = parameters['Repeat Command Name'] || 'Repeat';

  //
  // add commands and handlers
  //
  Window_PartyCommand.prototype.makeCommandList = function() {
    this.addCommand(TextManager.fight,  'fight');
    this.addCommand(autoName,           'auto');
    this.addCommand(repeatName,         'repeat');
    this.addCommand(TextManager.escape, 'escape', BattleManager.canEscape());
  };

  var _Scene_Battle_createPartyCommandWindow =
   Scene_Battle.prototype.createPartyCommandWindow;
  Scene_Battle.prototype.createPartyCommandWindow = function() {
    _Scene_Battle_createPartyCommandWindow.call(this);
    //this._partyCommandWindow.setHandler('auto', this.commandAuto.bind(this));
    this._partyCommandWindow.setHandler('repeat', this.commandRepeat.bind(this));
  };

  //
  // handler functions
  //

  $gamePlayer.triggerButtonAction

  Scene_Battle.prototype.commandAuto = function() {
    $gameParty.members().forEach(function(actor) {
      if (actor.canMove() && actor._actionState  === 'undecided') {
        actor.makeAutoBattleActions();
      }
    });
    this.endCommandSelection();
    BattleManager.startTurn();
  };

  Scene_Battle.prototype.commandRepeat = function() {
    BattleManager.resumeCommandRecord();
    this.endCommandSelection();
    BattleManager.startTurn();
  };

  //
  // command record cotrol functions
  //
  var _BattleManager_initMembers = BattleManager.initMembers;
  BattleManager.initMembers = function() {
    _BattleManager_initMembers.call(this);
    this.resetCommandRecord();
  };

  var _BattleManager_startBattle = BattleManager.startBattle;
  BattleManager.startBattle = function() {
    _BattleManager_startBattle.call(this);
    this.resetCommandRecord();
  };

  var _BattleManager_startTurn = BattleManager.startTurn;
  BattleManager.startTurn = function() {
    this.setCommandRecord();
    _BattleManager_startTurn.call(this);
  };

  //
  // record command module
  //
  BattleManager.resetCommandRecord = function() {
    this._commandRecord = [];
  };

  BattleManager.setCommandRecord = function() {
    var actors = $gameParty.members();
    for (var i = 0; i < actors.length; i++) {
      if (actors[i].canMove()) {
        this._commandRecord[i] = actors[i]._actions.clone();
      }
    }
  };

  BattleManager.resumeCommandRecord = function() {
    var actors = $gameParty.members();
    for (var i = 0; i < actors.length; i++) {
      var actor = actors[i];
      if(!actor.canMove()) {
        actor.clearActions();
      }
      if (actor.canMove() && actor._actionState  === 'undecided') {
        var oldAct = this._commandRecord[i] || [];
        for (var j = 0; j < actor.numActions() ; j++) {
          if (oldAct[j] && oldAct[j].isValid()) {
	        actor._actions[j] = oldAct[j];
	      } else {
	        actor._actions[j].setAttack();
	      }
        }
      }
    }
  };

})();
