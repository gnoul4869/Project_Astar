
/*:
@plugindesc [v1.0] Trigger events with the airship or when lined up with them
@author Solar Flare Games

@help
This plugin lets you trigger events while flying the airship, or by stepping
on any tile in the same row or column as the event.

Note Tags
=========

<airship> (events)
  This event can be triggered while in the airship.

<horz> (events)
  This event triggers when stepping on any tile in the same horizontal row.

<vert> (events)
  This event triggers when stepping on any tile in the same vertical column.

<horz:42> (events)
  Like <horz>, but limits the range of effect to between the event and x=42
  or between the event and the map edge opposite x=42.
  This syntax also works in <vert>.

<vert:12~22> (events)
  Like <vert>, but limits the range of effect to between y=12 and y=22.
  If the event is not placed in that range, its location will also trigger it.
  This syntax also works in <horz>.

<relativeTransfer> (event comments)
  When placed before a Map Transfer command, the transfer location will be
  altered based on the player's relative location to the event.
  For example, if the event is on 24,0 and the transfer is to 36,32, but the
  player triggered the event by stepping on 26,0, then they would be
  transferred to 38,32.
*/

(function() {
	// Allow airship to trigger whitelisted events
	// TODO: this'll trigger ALL events that happen to be on the same space...
	const old_canStartEvent = Game_Player.prototype.canStartLocalEvents;
	Game_Player.prototype.canStartLocalEvents = function() {
		return old_canStartEvent.call(this) || $gameMap.eventsXy(this.x, this.y).some(function(evt) {
			return $dataMap.events[evt._eventId].meta.airship;
		});
	};
	
	// Events that trigger when stepping in line with them, not just directly on them
	const old_evtPos = Game_Event.prototype.pos;
	Game_Event.prototype.pos = function(x, y) {
		var evt = this.event();
		if(evt.meta.horz) {
			let w = $gameMap.width();
			let range = Utils.parseRange(evt.meta.horz) || [0, w - 1];
			if(range.length === 1) {
				if(range[0] < this.x) range.push(w - 1);
				else range.unshift(0);
			}
			return this.y == y && x >= range[0] && x <= range[1];
		}
		if(evt.meta.vert) {
			let h = $gameMap.height();
			let range = Utils.parseRange(evt.meta.vert) || [0, h - 1];
			if(range.length === 1) {
				if(range[0] < this.y) range.push(h - 1);
				else range.unshift(0);
			}
			return this.x == x && y >= range[0] && y <= range[1];
		};
		return old_evtPos.call(this, x, y);
	};
	
	// Relative map transfers for line-trigger events
	const old_transferCmd = Game_Interpreter.prototype.command201;
	Game_Interpreter.prototype.command201 = function() {
		if(this._params[0] === 0) {
			const isRelative = Array.isArray(this._comments) && this._comments.some(cmt => cmt.toLowerCase().includes("<relativetransfer>"));
			if(isRelative) {
				let evt = this.character(0), player = this.character(-1);
				let dx = player.x - evt.x, dy = player.y - evt.y;
				this._params[2] += dx;
				this._params[3] += dy;
				this._comments = [];
			}
		}
		old_transferCmd.call(this);
	};
})();
