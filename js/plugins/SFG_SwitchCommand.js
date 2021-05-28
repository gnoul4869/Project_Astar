
/*:
@plugindesc [v1.1] Adds a switch command that you can use in events.
@author Solar Flare Games

@help
If you ever needed to do different actions depending on the value of a
variable, this lets you do that.

To use, create a Show Choices command where the choices are the values
you want to test for. Then add a switch plugin command above it.
If you need more than 6 options, you can add additional Show Choices
commands, and they will be treated as a single block.

If you add a When Cancel clause to the last Show Choices command (by choosing
Cancel -> Branch when setting up the Show Choices), then this will be
called if none of the other branches match.

Be warned - if you use multiple Show Choices, only put When Cancel on
the last one. Otherwise any Show Choices following the one with When Cancel
will be treated as standard Show Choices, putting up a choice for the
player to select.

Note: In all the below commands, replace the string "at" with an at sign.
This is needed because the Plugin Manager does not support including an at sigh
in the help text.

Switch commands can even be nested inside each other if you need to.

Plugin Commands
===============

These plugin commands are not split up into separate arguments.
The entire content other than the command name is taken as a single argument.

switch at 5
  Switch on the value of variable 5

switch some.js.expression()
  Switch on the result of a script eval.

Choice Commands
===============

When 12
  Run this branch if the value is equal to 12.
  If you want additional clarity, you can place an = in front.

When !12
  Run this branch if the value is not equal to 12.
  Note that using this will prevent any later branches from being called,
  unless they would match a value of 12.

When <12
  Run this branch if the value is less than 12.

When >12
  Run this branch if the value is greater than 12.

When <=12
  Run this branch if the value is less than or equal to 12.

When >=12
  Run this branch if the value is greater than or equal to 12.

When "Hello"
  Run this branch if the value is equal to the string "Hello", ignoring case.
  You can also add < > <= >= ~ in front, as above.

When ~"Doo+m"
  Run this branch if the value is a string matching the
  regular expression "Doo+m", ignoring case.
  This can match numbers as well as strings.

When at 12
  Run this branch if the value is equal to the value of variable 12.
  You can also add < > <= >= ! ~ in front, as above.

When #4~12
  Run this branch if the value is a number in the range 4 to 12 inclusive.
  You can put an at in front of either bound to instead use the value of that
  variable.
  Note: If you write 12~4, it is the same as 4~12.
  String values work too, eg #"a"~"d" will match any string beginning with
  a, b, or c, ignoring case. It will also match the string "d".

When #(some.js.expression())
  Run this branch if the expression returns true.
  The current value can be referenced as value.

*/

(function() {
	const match_simple = /([<>]?=?|[~!]?)\s*(@?)\s*(\d+|"(?:[^"\\]|\\"|\\\\|\\[ntxu])*")/;
	const match_range = /#\s*(@?)\s*(\d+|"(?:[^"\\]|\\"|\\\\|\\[ntxu])*")\s*~\s*(@?)\s*(\d+|"(?:[^"\\]|\\"|\\\\|\\[ntxu])*")/
	const match_expr = /#\s*\((.*)\)/;
	
	const parseValue = function(isVar, value) {
		isVar = isVar === '@';
		value = isVar ? $gameVariables.value(Number(value) || 0) : (Utils.isJson(value) ? JSON.parse(value) : 0);
		return value;
	};
	const parseBranch = function(branch) {
		const error = val => false;
		m = match_range.exec(branch);
		if(m) {
			let [aVar, aVal, bVar, bVal] = m.slice(1);
			aVal = parseValue(aVar, aVal);
			bVal = parseValue(bVar, bVal);
			if(aVal > bVal) [aVal, bVal] = [bVal, aVal];
			return val => aVal <= val && val <= bVal;
		}
		m = match_expr.exec(branch);
		if(m) {
			try {
				let expr = m[1];
				return Function('value', 'return ' + expr);
			} catch(e) {
				return error;
			}
		}
		var m = match_simple.exec(branch);
		if(m) {
			let [op, isVar, n] = m.slice(1);
			op = op || '=';
			n = parseValue(isVar, n);
			if(typeof(n) === 'string') n = n.toLowerCase();
			switch(op) {
				case '=': return val => val == n;
				case '!': return val => val != n;
				case '<': return val => val < n;
				case '>': return val => val > n;
				case '<=': return val => val <= n;
				case '>=': return val => val >= n;
				case '~': return val => RegExp(n, 'i').test(val);
			}
			return error;
		}
		return error;
	};
	
	const old_pluginCmd = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		old_pluginCmd.call(this, command, args);
		if(command.toLowerCase() === 'switch' && this.nextEventCode() == 102) {
			args = args.join(' ');
			this.pushSwitch(args.startsWith('@') ? $gameVariables.value(Number(args.slice(1).trim()) || 0) : eval(args));
		}
	};
	
	Game_Interpreter.prototype.pushSwitch = function(value) {
		if(this._switchCommandStack === undefined) {
			this._switchCommandStack = [];
		}
		if(typeof(value) === 'string') value = value.toLowerCase();
		this._switchCommandStack.push({value: value, indent: this._indent, matched: false});
	};
	
	Game_Interpreter.prototype.topSwitch = function() {
		if(this._switchCommandStack === undefined || this._switchCommandStack.length === 0) return null;
		return this._switchCommandStack[this._switchCommandStack.length - 1];
	};
	
	Game_Interpreter.prototype.isEvaluatingSwitch = function() {
		if(this._switchCommandStack === undefined || this._switchCommandStack.length === 0) return false;
		var top = this.topSwitch();
		return top.indent === this._indent;
	};
	
	Game_Interpreter.prototype.popSwitch = function() {
		if(!this.isEvaluatingSwitch(this._indent)) return false;
		this._switchCommandStack.pop();
	};
	
	const old_choiceCmd = Game_Interpreter.prototype.command102;
	Game_Interpreter.prototype.command102 = function() {
		if(this.isEvaluatingSwitch()) {
			this._index++;
			let choices = this._params[0];
			let sw = this.topSwitch();
			if(sw.matched) {
				this._branch[this._indent] = sw.matched ? choices.length : -1;
				return;
			}
			for(let i = 0; i < choices.length; i++) {
				let f = parseBranch(choices[i]);
				if(f(sw.value)) {
					this._branch[this._indent] = i
					sw.matched = true;
					return;
				}
			}
			this._branch[this._indent] = -1;
			return;
		}
		old_choiceCmd.call(this);
	};
	
	const old_execCmd = Game_Interpreter.prototype.executeCommand;
	Game_Interpreter.prototype.executeCommand = function() {
		var top = this.topSwitch();
		if(top) {
			var cur = this.currentCommand();
			if(!cur || (cur.indent == top.indent && ![0, 102, 402, 403, 404].contains(cur.code))) {
				this.popSwitch();
			}
		}
		old_execCmd.call(this);
	};
	
	const old_whenCancel = Game_Interpreter.prototype.command403;
	Game_Interpreter.prototype.command403 = function() {
		this.popSwitch();
		return old_whenCancel.call(this);
	}
	
	const tests = {
		simple: ['1','2','3','9','10','20','>30','"Harold"','~"[aeiou]{3,}"','12','!12','<12','>12','<=12','>=12','"Hello"','~"Doo+m"','@12','<@12','>@12','!@12','<=@12','>=@12','~@12'],
		range: ['#4~8','#"x"~"zzzzzzz"','#4~12','#12~4','#@3~2','#3~@2','#@3~@1','#"a"~"d"'],
		expr: ['#(value % 5 == 1)','#(some.js.expression())']
	};
	const expect = {
		simple: [
			['', '', '1'],
			['', '', '2'],
			['', '', '3'],
			['', '', '9'],
			['', '', '10'],
			['', '', '20'],
			['>', '', '30'],
			['', '', '"Harold"'],
			['~', '', '"[aeiou]{3,}"'],
			['', '', '12'],
			['!', '', '12'],
			['<', '', '12'],
			['>', '', '12'],
			['<=', '', '12'],
			['>=', '', '12'],
			['', '', '"Hello"'],
			['~', '', '"Doo+m"'],
			['', '@', '12'],
			['<', '@', '12'],
			['>', '@', '12'],
			['!', '@', '12'],
			['<=', '@', '12'],
			['>=', '@', '12'],
			['~', '@', '12'],
		],
		range: [
			['', '4', '', '8'],
			['', '"x"', '', '"zzzzzzz"'],
			['', '4', '', '12'],
			['', '12', '', '4'],
			['@', '3', '', '2'],
			['', '3', '@', '2'],
			['@', '3', '@', '1'],
			['', '"a"', '', '"d"'],
		],
		expr: [
			['value % 5 == 1'],
			['some.js.expression()'],
		],
	};
	const actual = {
		simple: tests.simple.map(x => match_simple.exec(x).slice(1)),
		range: tests.range.map(x => match_range.exec(x).slice(1)),
		expr: tests.expr.map(x => match_expr.exec(x).slice(1)),
	};
	console.log(expect, actual);
})();
