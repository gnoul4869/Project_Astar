
/*:
@plugindesc [v1.3] Make additional states count for party death
@author Solar Flare Games

@param deathStates
@text Death States
@desc A list of states that will be considered for determining whether the party is defeated.
@type struct<DeathState>[]
@default []

@param lowMpState
@text Low MP State
@desc A state that will be added when a character's MP reaches 0. It won't count for party death by default.
@type state
@default 0

@param autoRemoveLowMp
@text Auto Remove
@parent lowMpState
@desc Whether to automatically remove the low MP state if an item or skill would add MP.
@type boolean
@default true
@on Auto-remove
@off Leave

@param lowMpClearsStatesAndBuffs
@text Clear States & Buffs
@parent lowMpState
@desc Whether to automatically clear states and buffs when afflicted by the low MP state.
@type boolean
@default false
@on Clear States & Buffs
@off Leave States & Buffs

@help

This plugin allows you to set additional states to count for the purpose of
determining defeat. If every member of the party or troop is afflicted by
one of these states, they will be considered defeated.

Additionally you can set a state to be added when MP becomes zero. If you
wish, you can also set this state as a death state, so that characters and
enemies are defeated when their MP is exhausted. Characters with no MP will
 never be afflicted by this state.

Settings
========

Death States: Any states added to this list will be treated as death states in
one or both of the following ways:

- Targeted as Alive - Means someone afflicted by this state is targeted by
  "1 Ally" / "All Allies" items

- Targeted as Dead - Means someone afflicted by this state is targeted by
  "1 Ally (Dead)" / "All Allies (Dead)" items.

- Causes Game Over - Determines whether you get a game over when every battle
  member is afflicted by this state. If setting this to false, you will probably
  want to set the state to have either no restrictions or to remove by damage.
  Otherwise, the battle will continue even though the party can't do anything.

Low MP State: A state that will be afflicted the moment an actor or enemy
reaches 0 MP. Will not be treated as a death state, unless it is also added to
the Death States list.

Auto Remove: Whether to remove the Low MP State when an actor or gains MP. If
set to false, they can gain MP but still be afflicted by the state.

Clear States & Buffs: Whether to clear active states and buffs from a character
afflicted by this state. The normal death state will not be cleared.

Compatibility Notes
===================

This plugin overrides the isAllDead, isAlive, and isDead methods of
Game_BattlerBase. It may cause compatibility issues with other plugins
that alter the same methods and if possible should be placed above them
for best results.

*//*~struct~DeathState:

@param id
@text State
@desc The state to treat as a death state
@type state

@param mode
@text Death Mode
@desc The death mode to use for this state
@type select
@default 3
@option Targeted as Alive, Causes Game Over
@value 1
@option Targeted as Dead, Doesn't Cause Game Over
@value 2
@option Targeted as Dead, Causes Game Over
@value 3
*/


(function() {
	const params = PluginManager.parameters('SFG_AltDeathState');
	const deathStates = Utils.parseRecursive(params.deathStates);
	const lowMpState = Number(params.lowMpState) || 0;
	const autoRemoveLowMp = JSON.parse(params.autoRemoveLowMp);
	const MODE_GAME_OVER = 1, MODE_TARGETING = 2;
	
	Game_Unit.prototype.isAllDead = function() {
		return this.members().every(who => who.isGameOver());
	};
	
	Game_BattlerBase.prototype.deathStates = function(mode) {
		let states = deathStates.filter(state => state.mode & mode).map(state => state.id);
		return [this.deathStateId()].concat(states);
	};
	
	Game_BattlerBase.prototype.isGameOver = function() {
		return this.deathStates(MODE_GAME_OVER).some(state => this.isStateAffected(state));
	};
	
	Game_BattlerBase.prototype.isDeathStateAffected = function() {
		return this.deathStates(MODE_TARGETING).some(state => this.isStateAffected(state));
	};
	
	const old_addState = Game_BattlerBase.addNewState;
	Game_BattlerBase.addNewState = function(state) {
		if(state === lowMpState) {
			if(lowMpClearsStatesAndBuffs) {
				let isDead = this.isDeathStateAffected();
				this.clearStates();
				this.clearBuffs();
				if(isDead) this._states.push(this.deathStateId());
			}
			this._mp = 0;
		}
		old_addState.call(this, state);
	};
	
	const old_removeState = Game_Battler.prototype.removeState;
	Game_Battler.prototype.removeState = function(state) {
		if(state === lowMpState && this.isStateAffected(state) && this._mp == 0)
			this._mp = 1;
		old_removeState.call(this, state);
	};
	
	const old_refresh = Game_Battler.prototype.refresh;
	Game_Battler.prototype.refresh = function() {
		old_refresh.call(this);
		if(this.mmp > 0 && this.mp === 0) {
			if(!this.isStateAffected(lowMpState)) this.addState(lowMpState);
		} else if(autoRemoveLowMp) {
			if(this.isStateAffected(lowMpState)) this.removeState(lowMpState);
		}
	};
})();

