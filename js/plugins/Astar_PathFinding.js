//=============================================================================
//A-Star Pathfinding for RPG Maker MV
//Researched and edited by Luong
//Written in JavaScript
//=============================================================================

/*:
 *
 *
 * Plugin Command:
 *  Astar eventId1 eventId2      # Makes event 1 find path to event 2
 *  Astar eventId x y            # Makes event find a path to location x, y
 *  Astar eventId cancel         # Cancel Pathfinding for event
 *
 *  event = number for specific event
 *  event = 0 = this event
 *  event = -1 = player
 *  event = $gameVariables.value(x) to get the event id from variable x
 *
 *  x, y = coordinates or $gameVariables.value(#) to use a variable coordinate
 *
 *   Use Game_Interpreter.findEvent to allow specifying events by name.
 */

(function() {
  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command.toUpperCase() === 'ASTAR') {
      subject = this.findEvent 
        ? this.findEvent(args[0])
        : this.character(eval(args[0]));

      if (args[1].toUpperCase() === 'CANCEL') {
        subject.clearTarget();
	  } 
      else if (args.length > 2) {
        subject.setTarget(null, eval(args[1]), eval(args[2])); // X & Y instead of eventID
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
    this._break = false;
  };

  Game_CharacterBase.prototype.setTarget = function(target, targetX, targetY) {
	this._target = target; // Initial X & Y of the target
	//console.log(target);
    if (this._target) {
      this._targetX = this._target.x;
      this._targetY = this._target.y;
    } else {
      this._targetX = targetX;
      this._targetY = targetY;
	}
	//console.log("target x = " + this._targetX);
    //console.log("target y = " + this._targetY);
  };

  Game_CharacterBase.prototype.clearTarget = function() {
    this._target = null;
    this._targetX = null;
    this._targetY = null;
  };

  var _Game_CharacterBase_updateStop = Game_CharacterBase.prototype.updateStop; // Replace updateStop function
  Game_CharacterBase.prototype.updateStop = function() {
    _Game_CharacterBase_updateStop.call(this);
    // Update X & Y of the target
    if (this._target) {
      this._targetX = this._target.x;
	  this._targetY = this._target.y;
	  //console.log("target x = " + this._targetX);
      //console.log("target y = " + this._targetY);
    }

    if (this._targetX != null) {
      direction = this.findDirectionTo2(this._targetX, this._targetY);
      if (direction > 0)
      {
		//console.log("direction = " + direction);
        this.moveStraight(direction); // Move to direction
      }
    }
  };
})();

Game_Character.prototype.findDirectionTo2 = function(goalX, goalY) {
  const loc = (function() {
    const knownLocs = {};
    return function(x, y) {
	  //console.log(goalX + " & " + x);
	  const locator = x + "x" + y; // X x Y
      if(!knownLocs[locator]) {
        knownLocs[locator] = [x, y];
	  }
	  //console.log("knownLocs = " + knownLocs[locator]);
	  return knownLocs[locator]; // knownLocs = Xs & Ys to target's location
    }
  })();

  const route = astar({ // Array of nodes to the target
    neighbors: (node) => {
      var result = [];
      for(var j = 0; j < 4; ++ j) { // j = 0 -> 3
		var direction = 2 + j * 2; // 2, 4, 6, 8
		//console.log("node 0 = " + node[0]); 
		//console.log("node 1 = " + node[1]); 
		// node[0] = X, node[1] = Y to target's location
        if(this.canPass(node[0], node[1], direction)) { // canPass(x,y,d) => true/false
          result.push(loc($gameMap.roundXWithDirection(node[0], direction), $gameMap.roundYWithDirection(node[1], direction)));
        }
      }
      return result;
    },
	cost: (source, target) => { // Cost of the nodes
	  //console.log("cost = " + Math.abs(source[0] - target[0]) + Math.abs(source[1] - target[1]));
      return Math.abs(source[0] - target[0]) + Math.abs(source[1] - target[1]); // 0 = X, 1 = Y
    }
  }, loc(this.x, this.y), loc(goalX, goalY));
  //console.log(route);
  if(route && route.length > 1) {
    var deltaX = $gameMap.deltaX(route[1][0], this.x);
	var deltaY = $gameMap.deltaY(route[1][1], this.y);
	//console.log(deltaX);
	//console.log(deltaY);
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
	/** @type {Set<T>} */
	const visited = new Set();
	/** @type {Map<T, T>} */
  const previous = new Map();
    /** @type {BinaryHeap<T>} */
	const open = new BinaryHeap((node) => { // Add node to a binary heap
		//console.log(node);
	var result = costs.get(node);
    return result;
  });
	costs.set(start, 0);
	var foundRoute = (start === target);
    var current = start; // Starting position X & Y
	var route = [start]; // Starting position X & Y in array
	while(!foundRoute && current !== undefined) {
		/* recalculate costs to neighbors, and make sure to record the links in previous */
		for(const neighbor of graph.neighbors(current)) {
			if(!visited.has(neighbor)) { // Check if visited tiles are the same as neighbor tiles	
				var tentativeDistance = costs.get(current) + graph.cost(current, neighbor); // Calculate tentativeDistance
				if(!costs.has(neighbor) || costs.get(neighbor) > tentativeDistance) { // Check if costs tiles = neighbor tiles OR costs of neighbor tiles is larger than tentativeDistance
                       costs.set(neighbor, tentativeDistance);
                       if(open.has(neighbor)) {
                           open.rescoreDown(neighbor); // Remove neighbor from open
                        } else {
                           open.push(neighbor); // Add neighbor to open
                        }
					    previous.set(neighbor, current);
				}
			}
		}
		visited.add(current);
		/* search for an unvisited node with the smallest cost */
		current = open.pop(); // Add node from open to current
		foundRoute = (current === target); // true/false
		route = [current];
	}
	/* If we found something, reconstruct the route from the "previous" map */
	if(foundRoute) { //if true
		while(previous.has(route[0])) {
			route.unshift(previous.get(route[0])); // Take previous nodes and add them to route to complete the route
		}
		return route;
	} else {
		//console.log("failed");
		return undefined; // Stop moving if the destination cant be reached
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