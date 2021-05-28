/*
 * ==============================================================================
 * * GTP: Gamefall Team Plugins - Simple Player Map Hud
 * ------------------------------------------------------------------------------
 *  ChoicePosition.js  Version 1.0
 * ==============================================================================
 */

var Imported = Imported || {};
Imported.ChoicePosition = true;
Imported.ChoicePosition = 1.0;

/*:
* @plugindesc Change the messagge box position X and Y
* @author Gamefall || Luca
* @help As the plugin desc said, this plugin changes the position of the message box;
* Plugin Commands: setX "Number" -- set the X position of the Window;
*				   setY "Number" -- set the Y position of the Window;
				   resetWindow -- set the original position of the Window. 
				   Use this command at the end of the events;ù
*/

//Plugin Commands
gamefall_pluginCommandChoice = Game_Interpreter.prototype.pluginCommand;

Game_Interpreter.prototype.pluginCommand = function(command, args) {
    gamefall_pluginCommandChoice.call(this, command, args);
    if(command === 'setX') {
    	xM = Number(args[0]);
    	gameCustom = true;
    }
    if(command === 'setY') {
    	yM = Number(args[0]);
    	gameCustom = true;
    }
    if(command === 'resetWindow') {
    	gameCustom = false;
    }
};


var xM = 0;
var yM = 0;
var gameCustom = false;


Window_ChoiceList.prototype.updatePlacement = function() {
    var positionType = $gameMessage.choicePositionType();
    var messageY = this._messageWindow.y;
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    if(!gameCustom) {
	    switch (positionType) {
	    case 0:
	        this.x = 0;
	        break;
	    case 1:
	        this.x = (Graphics.boxWidth - this.width) / 2;
	        break;
	    case 2:
	        this.x = Graphics.boxWidth - this.width;
	        break;
	    }
	    if (messageY >= Graphics.boxHeight / 2) {
	        this.y = messageY - this.height;
	    } else {
	        this.y = messageY + this._messageWindow.height;
	    }
	}
	else {
		this.x = xM;
		this.y = yM;
	}
};