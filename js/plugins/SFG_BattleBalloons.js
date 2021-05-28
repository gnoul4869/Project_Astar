
/*:
@plugindesc [v1.0] Allow using balloon icons in battle cutscenes
@author Solar Flare Games

@help
To use a balloon in battle, use the plugin command followed by a Show
Balloon Icon command. The character chosen in Show Balloon Icon will be
ignored.

Plugin Commands
===============

BattleBalloon actor 1
  Show a balloon above actor 1's head, if they are in the battle.

BattleBalloon actor 1 ifAlive
  Show a balloon above actor 1's head, if they are in the battle and alive.

BattleBalloon party 5
  Show a balloon above the fifth party member's head, if they are in the
  battle.

BattleBalloon party 5 ifAlive
  Show a balloon above the fifth party member's head, if they are in the
  battle and alive.

BattleBalloon enemy 3
  Show a balloon above the third enemy's head, if they are appeared and alive.
*/

(function() {
	const old_initBattlerSprite = Sprite_Battler.prototype.initMembers;
	Sprite_Battler.prototype.initMembers = function() {
		old_initBattlerSprite.call(this);
		this._balloonDuration = 0;
	};
	
	const old_battlerUpdate = Sprite_Battler.prototype.update;
	Sprite_Battler.prototype.update = function() {
		old_battlerUpdate.call(this);
		if(this._battler && !this.isBalloonPlaying()) {
			this._battler.endBalloon();
		}
		this.updateBalloon();
	};

	Sprite_Battler.prototype.setupBalloon = function() {
		if(this._battler && this._battler.balloonId() > 0) {
			this.startBalloon();
			this._battler.startBalloon();
		}
	};

	Sprite_Battler.prototype.startBalloon = function() {
		if(!this._balloonSprite) {
			this._balloonSprite = new Sprite_Balloon();
		}
		this._balloonSprite.setup(this._battler.balloonId());
		this.parent.addChild(this._balloonSprite);
	};

	Sprite_Battler.prototype.updateBalloon = function() {
		this.setupBalloon();
		if(this._balloonSprite) {
			this._balloonSprite.x = this.x;
			this._balloonSprite.y = this.y - this.height;
			if(!this._balloonSprite.isPlaying()) {
				this.endBalloon();
			}
		}
	};

	Sprite_Battler.prototype.endBalloon = function() {
		if(this._balloonSprite) {
			this.parent.removeChild(this._balloonSprite);
			this._balloonSprite = null;
		}
	};

	Sprite_Battler.prototype.isBalloonPlaying = function() {
		return !!this._balloonSprite;
	};
	
	Object.defineProperty(Sprite_Actor.prototype, 'height', {
		get: function() {
			return this._mainSprite.height;
		},
		configurable: true,
	});
	
	const old_pluginCommand = Game_Interpreter.prototype.pluginCommand
	Game_Interpreter.prototype.pluginCommand = function(cmd, args) {
		if(cmd.toLowerCase() === 'battleballoon' && $gameParty.inBattle()) {
			let who = Number(args[1]);
			if(who != who) return;
			if(args[0].toLowerCase() === 'enemy') {
				who--;
				let troop = $gameTroop.members();
				if(who in troop) this._character = troop[who];
				else this._character = null;
			} else if(args[0].toLowerCase() === 'party') {
				who--;
				let party = $gameParty.members();
				if(who in party) this._character = party[who];
				else this._character = null;
			} else if(args[0].toLowerCase() === 'actor') {
				let party = $gameParty.members(), actor = $gameActors.actor(who);
				if(party.includes(actor)) this._character = actor;
				else this._character = null;
			}
			if(args[2] && args[2].toLowerCase() === 'ifalive' && !this._character.isAlive())
				this._character = null;
		}
	};
	
	const old_showBalloon = Game_Interpreter.prototype.command213;
	Game_Interpreter.prototype.command213 = function() {
		if($gameParty.inBattle()) {
			// This is identical to the base function minus the first line.
			if (this._character) {
				this._character.requestBalloon(this._params[1]);
				if (this._params[2]) {
					this.setWaitMode('balloon');
				}
			}
			return true;
		} else return old_showBalloon.call(this);
	};
	
	const old_initBattler = Game_BattlerBase.prototype.initMembers;
	Game_BattlerBase.prototype.initMembers = function() {
		old_initBattler.call(this);
		this._balloonId = 0;
		this._balloonPlaying = false;
	};
	
	Game_BattlerBase.prototype.requestBalloon = function(balloonId) {
		this._balloonId = balloonId;
	};
	
	Game_BattlerBase.prototype.balloonId = function() {
		return this._balloonId;
	};
	
	Game_BattlerBase.prototype.startBalloon = function() {
		this._balloonId = 0;
		this._balloonPlaying = true;
	};
	
	Game_BattlerBase.prototype.isBalloonPlaying = function() {
		return this._balloonId > 0 || this._balloonPlaying;
	};
	
	Game_BattlerBase.prototype.endBalloon = function() {
		this._balloonPlaying = false;
	};
})();