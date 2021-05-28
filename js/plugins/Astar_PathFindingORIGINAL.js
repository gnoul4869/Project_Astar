//=============================================================================
// Smart Pathfinding
// by Shaz (originally)
// Last Updated: 2019-11-22 by Akjosch
//=============================================================================

/*:
 * @plugindesc Allows events or players to do smart Pathfinding
 * @author Shaz (originally)
 *
 * @help
 *
 * This is merely a fork of Shaz's SMARTPATH plugin. I've added some extra
 * functionality to be able to auto-cancel the pathfinding as well as to 
 * have the event interpreter WAIT while the pathing takes place.
 *
 * Plugin Command:
 *  SmartPath eventId1 eventId2      # Makes event 1 find path to event 2
 *  SmartPath eventId x y            # Makes event find a path to location x, y
 *  SmartPath eventId cancel         # Cancel Pathfinding for event
 *
 *  event = number for specific event
 *  event = 0 for "this" event
 *  event = -1 for player
 *  event = $gameVariables.value(x) to get the event id from variable x
 *
 *  x, y = coordinates or $gameVariables.value(#) to use a variable coordinate
 *
 * Update by DragoonKain:
 *   Use Game_Interpreter.findEvent to allow specifying events by name.
 *   Added Wait, Auto_Cancel and Auto_Cancel_Near.
 */

(function() {
  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command.toUpperCase() === 'SMARTPATH') {
      subject = this.findEvent 
        ? this.findEvent(args[0])
        : this.character(eval(args[0]));

      if (args[1].toUpperCase() === 'CANCEL') {
        subject.clearTarget();
      } else if (args[1].toUpperCase() === 'WAIT') {
        if (subject._target && !subject.isOnTarget(subject._targetX, subject._targetY)) {
          this.wait(20);
          this.jumpTo(this._index-1);
        }
      } else if (args[1].toUpperCase() == 'AUTO_CANCEL') {
        subject.setTargetAutoCancel('on');
      } else if (args[1].toUpperCase() == 'AUTO_CANCEL_NEAR') {
        subject.setTargetAutoCancel('near');

        if (args.length > 2) {
          subject.setTargetAutoCancelThreshold(parseInt(args[2]));
        }
      } else if (args.length > 2) {
        subject.setTarget(null, eval(args[1]), eval(args[2]));
      } else {
        var target = this.findEvent 
          ? this.findEvent(args[1])
          : this.character(eval(args[1]));
        subject.setTarget(target);
      }
    }
  };

  var _Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
  Game_CharacterBase.prototype.initMembers = function() {
    _Game_CharacterBase_initMembers.call(this);
    this._target = null;
    this._targetX = null;
    this._targetY = null;
    this._targetAutoCancel = false; // 'on', 'near', false
    this._targetAutoCancelThreshold = 1;
    this._break = false;
  };

  Game_CharacterBase.prototype.setTarget = function(target, targetX, targetY) {
    this._target = target;
    if (this._target) {
      this._targetX = this._target.x;
      this._targetY = this._target.y;
    } else {
      this._targetX = targetX;
      this._targetY = targetY;
    }
    this._targetAutoCancel = false;
  };

  Game_CharacterBase.prototype.setTargetAutoCancel = function(targetAutoCancel) {
    this._targetAutoCancel = targetAutoCancel;
  }

  Game_CharacterBase.prototype.setTargetAutoCancelThreshold = function(threshold) {
    this._targetAutoCancelThreshold = threshold;
  }

  Game_CharacterBase.prototype.clearTarget = function() {
    this._target = null;
    this._targetX = null;
    this._targetY = null;
  };

  Game_CharacterBase.prototype.isNearTarget = function(x, y) {
    var isNear =    Math.abs(this.x - x) <= this._targetAutoCancelThreshold &&
                    Math.abs(this.y - y) <= this._targetAutoCancelThreshold;
    return isNear;
  }

  Game_CharacterBase.prototype.isOnTarget = function(x, y) {
    return this.x == x &&
           this.y == y;
  }

  var _Game_CharacterBase_updateStop = Game_CharacterBase.prototype.updateStop;
  Game_CharacterBase.prototype.updateStop = function() {
    _Game_CharacterBase_updateStop.call(this);

    if (this._target) {
      this._targetX = this._target.x;
      this._targetY = this._target.y;
    }

    if (this._targetX != null) {
      direction = this.findDirectionTo2(this._targetX, this._targetY);
      if (direction > 0)
      {
        this.moveStraight(direction);
      }
    }

    if (this._target && this._targetAutoCancel) {
      if (this._targetAutoCancel.toUpperCase() === 'ON') {
        if (this.isOnTarget(this._targetX, this._targetY)) {
          this.clearTarget();
        }
      } else if (this._targetAutoCancel.toUpperCase() === 'NEAR') {
        if (this.isNearTarget(this._targetX, this._targetY)) {
          this.clearTarget();
        }
      }
    }
  };
})();

Game_Character.prototype.findDirectionTo2 = function(goalX, goalY) {
  const loc = (function() {
    const knownLocs = {};

    return function(x, y) {
      const locator = x + "x" + y;
      if(!knownLocs[locator]) {
        knownLocs[locator] = [x, y];
      }
      return knownLocs[locator];
    }
  })();

  const route = astar({
    neighbors: (node) => {
      var result = [];
      for(var j = 0; j < 4; ++ j) {
        var direction = 2 + j * 2;
        if(this.canPass(node[0], node[1], direction)) {
          result.push(loc($gameMap.roundXWithDirection(node[0], direction), $gameMap.roundYWithDirection(node[1], direction)));
        }
      }
      return result;
    },
    cost: (source, target) => {
      return Math.abs(source[0] - target[0]) + Math.abs(source[1] - target[1]);
    },
    heuristics: (node, target) => {
      return $gameMap.distance(node[0], node[1], target[0], target[1]);
    }
  }, loc(this.x, this.y), loc(goalX, goalY));
  if(route && route.length > 1) {
    var deltaX = $gameMap.deltaX(route[1][0], this.x);
    var deltaY = $gameMap.deltaY(route[1][1], this.y);
    if(deltaY > 0) { return 2; }
    else if(deltaX < 0) { return 4; }
    else if(deltaX > 0) { return 6; }
    else if(deltaY < 0) { return 8; }
    else { return 0; }
  } else {
    return 0;
  }
}

/**
 * @param {{ neighbors: (note: T) => T[]; cost: (source: T, target: T) => number; }} graph
 * @param {T} start
 * @param {T} target
 * @returns {T[]} - the least-cost route, or undefined if there isn't any
 * @template T
 */
function astar(graph, start, target) {
	/** @type {Map<T, number>} */
  const costs = new Map();
	/** @type {Map<T, number>} */
  const heuristics = (typeof graph.heuristics === "function" ? new Map() : undefined);
	/** @type {Set<T>} */
	const visited = new Set();
	/** @type {Map<T, T>} */
  const previous = new Map();
  /** @type {BinaryHeap<T>} */
	const open = new BinaryHeap((node) => {
    var result = costs.get(node);
    if(heuristics) {
      if(!heuristics.has(node)) {
        heuristics.set(node, graph.heuristics(node, target));
      }
      result += heuristics.get(node);
    }
    return result;
  });
	costs.set(start, 0);
	var foundRoute = (start === target);
  var current = start;
  var route = [start];
	while(!foundRoute && current !== undefined) {
		/* recalculate costs to neighbors, and make sure to record the links in previous */
		for(const neighbor of graph.neighbors(current)) {
			if(!visited.has(neighbor)) {
				var tentativeDistance = costs.get(current) + graph.cost(current, neighbor);
				if(!costs.has(neighbor) || costs.get(neighbor) > tentativeDistance) {
          costs.set(neighbor, tentativeDistance);
          if(open.has(neighbor)) {
            open.rescoreDown(neighbor);
          } else {
            open.push(neighbor);
          }
					previous.set(neighbor, current);
				}
			}
		}
		visited.add(current);
		/* search for an unvisited node with the smallest cost */
		current = open.pop();
    foundRoute = (current === target);
    route = [current];
	}
	/* If we found something, reconstruct the route from the "previous" map */
	if(foundRoute) {
		while(previous.has(route[0])) {
			route.unshift(previous.get(route[0]));
		}
		return route;
	} else {
		return undefined;
	}
}

window.BinaryHeap = (function() {
	const _content = Symbol("content");
	const _scoring = Symbol("scoring function");

	/**
	 * @param {T[]} content 
	 * @param {(value:T) => number} scoring}
	 * @param {number} pos
	 * @template T
	 */
	function bubbleUp(content, scoring, pos) {
		var element = content[pos];
		var score = scoring(element);
		while(pos > 0) {
			var parentIdx = Math.floor((pos + 1) / 2) - 1;
			var parent = content[parentIdx];
			if(score >= scoring(parent)) {
				break;
			}
			content[parentIdx] = element;
			content[pos] = parent;
			pos = parentIdx;
		}
	}

	/**
	 * @param {T[]} content 
	 * @param {(value:T) => number} scoring}
	 * @param {number} pos
	 * @template T
	 */
	function sinkDown(content, scoring, pos) {
		var length = content.length;
		var element = content[pos];
		var elementScore = scoring(element);

		// eslint-disable-next-line no-constant-condition
		while(true) {
			var child2Idx = (pos + 1) * 2;
			var child1Idx = child2Idx - 1;
			/** @type {number} */
			var swap = NaN;
			if(child1Idx < length) {
				var child1 = content[child1Idx];
				var child1Score = scoring(child1);
				if(child1Score < elementScore) {
					swap = child1Idx;
				}
			}
			if(child2Idx < length) {
				var child2 = content[child2Idx];
				var child2Score = scoring(child2);
				if(child2Score < (Number.isNaN(swap) ? elementScore : child1Score)) {
					swap = child2Idx;
				}
			}
			if(Number.isNaN(swap)) {
				break;
			}
			content[pos] = content[swap];
			content[swap] = element;
			pos = swap;
		}
	}

	/**
	 * @template T
	 */
	class BinaryHeap {
		/**
		 * @param {(value:T) => number} scoring 
		 */
		constructor(scoring) {
			this[_content] = [];
			if(typeof scoring === "function") {
				this[_scoring] = scoring;
			}
		}

		/**
		 * @param {T} element 
		 */
		push(element) {
			this[_content].push(element);
			bubbleUp(this[_content], this[_scoring], this[_content].length - 1);
		}

		/**
		 * @param {T} element 
		 */
		rescoreDown(element) {
			var elementIdx = this[_content].indexOf(element);
			if(elementIdx >= 0) {
				sinkDown(this[_content], this[_scoring], elementIdx);
			}
		}
		
		/**
		 * @returns {T}
		 */
		pop() {
			/** @type {T} */
			var result = this[_content][0];
			/** @type {T} */
			var end = this[_content].pop();
			if(this[_content].length > 0) {
				this[_content][0] = end;
				sinkDown(this[_content], this[_scoring], 0);
			}
			return result;
		}

		/**
		 * @returns {T}
		 */
		peek() {
			return this[_content][0];
    }
    
		/**
		 * @param {T} element 
     * @returns {boolean}
		 */
    has(element) {
      return (this[_content].indexOf(element) > -1);
    }

		get length() {
			return this[_content].length;
		}
	}

	return BinaryHeap;
})();