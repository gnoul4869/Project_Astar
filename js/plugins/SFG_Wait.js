
/*:
@plugindesc [v1.2] Wait for movement routes and other things after they've been set going without waiting
@author Solar Flare Games

@help
With this plugin you can wait for a movement route or other ongoing action that
was previously set going with wait disabled. For example, you could get a long,
complicated movement route going without waiting, then add some dialog as they
move, and later wait for the movement to finish before continuing the event.

Plugin Commands
===============

Many of these commands take a charId as parameter. This can take on any of
the following values:
-1 - the player
0 - the current event
1, 2, etc - the event with this ID

WaitforMovement charId
  Wait for the character's assigned movement route to complete.

WaitForBalloon charId
  Wait for the character's balloon icon to complete.
  Note: If using SFG_BattleBalloons, this must be preceded by the BattleBalloon
  commmand for the balloon you want to wait for.

WaitForAnimation charId
  Wait for the character's animation to complete.
  (This refers to battle animations, using the Show Animation node.)

WaitForPicture picId
  Wait for a picture to stop moving. Rotation doesn't count as moving.

WaitForPictureTint picId
  Wait for a picture's tint to stabilize.

WaitForTint
  Wait for the screen's tint to stabilize.

WaitForFlash
  Wait for the screen to stop flashing.

WaitForShake
  Wait for the screen to stop shaking.

WaitForWeather
  Wait for a weather effect to finish.

WaitForScroll
  Wait for the map to finish scrolling.

WaitForMusic
  Wait for background music (BGM) to reach the end of the track.
  Note: By default the music will still continue playing after the wait.
  If the music has been playing for awhile and already looped, this waits
  until the next time it loops.

WaitForAmbience
  Wait for background ambience (BGS) to reach the end of the track.
  Other than affecting BGS instead of BGM, this works the same as WaitForMusic.

WaitForJingle
  Waits for the current music effect (ME) to finish playing.

WaitForSound
  Waits for all sound effects (SE) to finish playing.

WaitForGather
  Waits for followers to finish gathering. This is only useful if the gather
  was requested by a different event (meaning parallel events are involved).

WaitForVehicle
  Waits for getting on or off a vehicle to complete. This is only useful if it
  was requested by a different event (meaning parallel events are involved) or
  if it was requested by player input and the wait is in a parallel event.

WaitForTransfer
  Waits for map transfer to complete. This is only useful if the transfer
  was requested by a different event (meaning parallel events are involved).

WaitForAction
  Waits for forced battle action to complete. This is only useful if the action
  was requested by a different event (meaning parallel events are involved).

WaitForVideo
  Waits for the current video to complete. This is only useful if the video
  was requested by a different event (meaning parallel events are involved).

WaitForMessage
  Waits for all messages to complete. This is only useful if the messages
  were requested by a different event (meaning parallel events are involved).

WaitForImage
  Waits for any pending images to finish loading. This could be useful if you
  used a script call to load an image that is needed for something.

WaitForInput key
  Waits until a specified key is pressed. Common keys are ok, left, right,
  up, down, pageup, pagedown, shift, control, escape, tab.
  You can also add more keys to Input.keyMapper.

WaitForCondition code
  Waits for an arbitrary script condition to become true.
  Use with care - if it never becomes true, the game will be stuck forever!
  Keep in mind that the condition would have to become true either in a
  different event or in the engine core.
  The condition can reference the following variables:
  v - game variables
  s - game switches
  p - party members
  t - troop members (if in battle)
  this - the game interpreter
*/

(function() {
	Game_Interpreter.prototype.evalWaitCondition = function() {
		var v = $gameVariables._data, s = $gameSwitches._data;
		var p = [null].concat($gameParty.allMembers()), t = [null].concat($gameTroop.members());
		return eval(this._waitCondition);
	};
	
	var old_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		old_pluginCommand.call(this, command, args);
		if(command.toLowerCase().startsWith("waitfor")) {
			let id = parseInt(args[0]), cmd = command.toLowerCase();
			if(id == id) {
				let char = this.character(id), pic = $gameScreen.picture(id);
				if(char) {
					if(cmd === "waitformovement") {
						this._character = char;
						this.setWaitMode('route');
					} else if(cmd === "waitforballoon") {
						// Some slightly weird logic in order to support SFG_BattleBalloons
						if(!$gameParty.inBattle())
							this._character = char;
						if(this._character)
							this.setWaitMode('balloon');
					} else if(cmd === "waitforanimation") {
						this._character = char;
						this.setWaitMode('animation');
					}
				} else if(pic) {
					if(cmd === "waitforpicture") {
						this.wait(pic._duration);
					} else if(cmd === "waitforpicturetint") {
						this.wait(pic._toneDuration);
					}
				}
			} else if(cmd === "waitfortint") {
				this.wait($gameScreen._toneDuration);
			} else if(cmd === "waitforflash") {
				this.wait($gameScreen._flashDuration);
			} else if(cmd === "waitforshake") {
				this.wait($gameScreen._shakeDuration);
			} else if(cmd === "waitforzoom") {
				this.wait($gameScreen._zoomDuration);
			} else if(cmd === "waitforweather") {
				this.wait($gameScreen._zoomDuration);
			} else if(cmd === "waitforscroll") {
				if($gameMap.isScrolling())
					this.setWaitMode('scroll');
			} else if(cmd === "waitforgather") {
				if($gamePlayer.areFollowersGathering())
					this.setWaitMode('gather');
			} else if(cmd === "waitforvehicle") {
				if($gamePlayer._vehicleGettingOff || $gamePlayer._vehicleGettingOn)
					this.setWaitMode('vehicle');
			} else if(cmd === "waitforvideo") {
				if(Graphics.isVideoPlaying())
					this.setWaitMode('video');
			} else if(cmd === "waitforaction") {
				if(BattleManager.isActionForced())
					this.setWaitMode('action');
			} else if(cmd === "waitfortransfer") {
				if($gamePlayer.isTransferring())
					this.setWaitMode('transfer');
			} else if(cmd === "waitformessage") {
				if($gameMessage.isBusy())
					this.setWaitMode('message');
			} else if(cmd === "waitforimage") {
				if(!ImageManager.isReady())
					this.setWaitMode('image');
			} else if(cmd === "waitformusic") {
				if(AudioManager._bgmBuffer) {
					this._musicWaitStart = WebAudio._context.currentTime;
					this.setWaitMode('music');
				}
			} else if(cmd === "waitforambience") {
				if(AudioManager._bgsBuffer) {
					this._musicWaitStart = WebAudio._context.currentTime;
					this.setWaitMode('ambience');
				}
			} else if(cmd === "waitforjingle") {
				if(AudioManager._meBuffer) {
					this.setWaitMode('jingle');
				}
			} else if(cmd === "waitforsound") {
				if(AudioManager._seBuffers.length) {
					this.setWaitMode('sound');
				}
			} else if(cmd === "waitforinput") {
				let key = args[0].toLowerCase();
				if(Object.values(Input.keyMapper).contains(key)) {
					this._awaitKey = key;
					this.setWaitMode('input');
				}
			} else if(cmd === "waitforcondition") {
				this._waitCondition = args.join(' ');
				if(!this.evalWaitCondition())
					this.setWaitMode('condition');
			}
		}
	};
	
	const old_updateWait = Game_Interpreter.prototype.updateWaitMode;
	Game_Interpreter.prototype.updateWaitMode = function() {
		if(this._waitMode === 'music' || this._waitMode === 'ambience') {
			let isMusic = this._waitMode === 'music';
			// I assume WebAudio, because it looks like the HTML5Audio is not actually used.
			let ctx = WebAudio._context, bgm = AudioManager[isMusic ? '_bgmBuffer' : '_bgsBuffer'], node = bgm._sourceNode;
			if(!node) return true; // Assume the music is in the process of starting, not sure if that's a good assumption tho
			var elapsed = (ctx.currentTime - bgm._startTime) * node.playbackRate.value;
			var total = bgm._totalTime * node.playbackRate.value;
			if(elapsed == 0) return true;
			var loopCount = Math.max(1, Math.ceil((this._musicWaitStart - bgm._startTime) / total));
			if(elapsed > total * loopCount) {
				this.setWaitMode('');
				return false;
			}
			return true;
		} else if(this._waitMode === 'jingle') {
			return !!AudioManager._meBuffer;
		} else if(this._waitMode === 'sound') {
			return AudioManager._seBuffers.some(se => se.isPlaying());
		} else if(this._waitMode === 'vehicle') {
			return $gamePlayer._vehicleGettingOn || $gamePlayer._vehicleGettingOff;
		} else if(this._waitMode === 'input') {
			return !Input.isTriggered(this._awaitKey);
		} else if(this._waitMode === 'condition') {
			return !this.evalWaitCondition();
		}
		return old_updateWait.call(this);
	};
})();
