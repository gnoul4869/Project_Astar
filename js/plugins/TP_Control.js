/*:
 * @plugindesc Takes control of TP, adjusting startling levels, dynamic controls, displays, and more.
 * @author Adreos http://www.adreos.com
 *
 * @param Initial TP
 * @desc Amount of TP a character starts with at level 1. Setting to 0 will remove starting TP. See notes for imporant info.
 * @default 100
 * 
 * @param TP Gained Per Level
 * @desc Amount of TP a character gains per level.
 * Set to 0 to not gain TP with levels.
 * @default 0
 * 
 * @param Dynamic TP Gain Percent
 * @desc Multiplies this percent of current level for a quadratic effect. Set to 0 to disable.
 * @default 0
 *
 * @param TP Cap
 * @desc Maximum TP may not go above this value.
 * Set to 0 to disable.
 * @default 0
 *
 * @param Show TP on Menu
 * @desc Show on menu. 0 = disable. 1 = enable.
 * @default 1
 *
 * @param Show TP on Status Screen
 * @desc Show on status screen. 0 = disable. 1 = enable.
 * @default 1
 *
 * @param Show TP & MP on Skills
 * @desc Show both TP and MP for combined use skills.
 * 0 = disable. 1 = enable.
 * @default 1
 *
 * @help This plugin does not provide plugin commands.
 *
 * This plugin effects maximum TP and Displaying TP.
 *
 * --MAXIMUM TP--
 *
 * -Important-
 * This plugin will not let maximum TP fall to zero as this causes divide by
 * zero errors to occur. If the maximum ends up being zero it will be adjusted
 * to one instead.
 *
 * Initial TP is the amount of TP the character will have a level one.
 * TP Gained his how much maxium TP goes up for every level after 1.
 * Dynamic TP Gain Percent is how much Percent of the current level is added to
 * the maximum TP.
 *
 * 100 is 100%.
 * Example: At 100 Level 1 adds 1 TP, Level 2 adds 2 TP and level 3 adds 3 TP.
 * Example: At 200 Level 1 adds 2 TP, Level 2 adds 4 TP and level 3 adds 6 TP.
 *
 * In a simple math formula
 * A = Dynamic TP Gain Percent
 * B = TP Gained Per Level
 * C = Initial TP
 * X = Current Level
 * Maximum TP = X(A/100) + B(X-1) + C
 *
 * TP Cap limits the overal TP characters may gain to. If set to zero the cap is
 * removed and TP may grow to any amount.
 *
 *
 * Characters and enemies with meta tags will override the global settings.
 * <tpinital:x> - Intinial TP
 * <tpgain:x> - TP Gained Per Level
 * <tpdynamic:x> - Dynamic TP Gain Percent
 *
 * Enemies can only accept the <tpinitial:x> meta tag. Without this tag they will default to 100
 * 
 * --DISPLAY SECTION--
 *  This plugin can display current and maximum TP in the menus and status screen
 *  by setting their respected parameters to 1. This may cause conflicts with
 *  other plugins adjusting the menu display. Is so set to 0 to disable.
 *
 *  For remaining TP to be greater then 0 out of battle the flag Preserve TP must
 *  be set for the character.
 *
 *  Show TP & MP on Skills Screen will display both the required TP and MP on
 *  skills requiring both. Again this may conflict with other display plugins so
 *  set to 0 to disable in this case.
 *
 *  --TERMS OF USE--
 *  This plugin is free to use for commercial and non-commercial projects.
 *  Only credit to the author must be given, URL is not required.
 */

(function() {

	var parameters = PluginManager.parameters('TP_Control');
	var initial = Number(parameters['Initial TP']);
	if(initial < 1)
		initial = 1;
	var perlevel = Number(parameters['TP Gained Per Level']);
	var dynamic = Number(parameters['Dynamic TP Gain Percent']);
	var tpcap = Number(parameters['TP Cap']);
	var showmenu = Number(parameters['Show TP on Menu']);
	var showstatus = Number(parameters['Show TP on Status Screen']);
	var showskill = Number(parameters['Show TP & MP on Skills']);
	//The code below adjusts the maximum TP to the set level.
	Game_BattlerBase.prototype.maxTp = function() {
		var mtp = 1;
		if(this.isActor()) {
			if($dataActors[this.actor().id].meta.tpinitial > 0)
				initial = Number($dataActors[this.actor().id].meta.tpinitial);
			if($dataActors[this.actor().id].meta.tpgain > 0)
				perlevel = Number($dataActors[this.actor().id].meta.tpgain);
			if($dataActors[this.actor().id].meta.tpdynamic > 0)
				dynamic = Number($dataActors[this.actor().id].meta.tpdynamic);
			mtp = Math.floor((this.level * ( dynamic / 100 ) ) + ((this._level - 1) * perlevel) + initial);
		} else {
			if($dataEnemies[this.enemy().id].meta.tpinitial > 0)
				mtp = Number($dataEnemies[this.enemy().id].meta.tpinitial);
			else
				mtp = 100;
		}
		if(tpcap > 0 && mtp > tpcap)
			mtp = tpcap;
		if( mtp < 1 )
			mtp = 1;
    		return mtp;
	};
	// The code below readjusts the status screen to show TP and moves the icons up by the level to make room, shifting the level over
	if ( showstatus == 1 ) {
		Window_Base.prototype.drawActorLevel = function(actor, x, y) {
		    this.changeTextColor(this.systemColor());
		    this.drawText(TextManager.levelA, x, y, 48);
		    this.resetTextColor();
		    this.drawText(actor.level, x + 52, y, 36, 'right');
		};
		Window_Status.prototype.drawBasicInfo = function(x, y) {
		    var lineHeight = this.lineHeight();
		    this.drawActorLevel(this._actor, x, y + lineHeight * 0);
		    this.drawActorIcons(this._actor, x + 95 , y );
		    this.drawActorHp(this._actor, x, y + lineHeight * 1);
		    this.drawActorMp(this._actor, x, y + lineHeight * 2);
		    this.drawActorTp(this._actor, x, y + lineHeight * 3);
		};
		Window_Base.prototype.drawActorTp = function(actor, x, y, width) {
		    width = width || 186;
		    var color1 = this.tpGaugeColor1();
		    var color2 = this.tpGaugeColor2();
		    this.drawGauge(x, y, width, actor.tpRate(), color1, color2);
		    this.changeTextColor(this.systemColor());
		    this.drawText(TextManager.tpA, x, y, 44);
		    this.drawCurrentAndMax(actor.tp, actor.maxTp(), x, y, width,
                		           this.mpColor(actor), this.normalColor());
		};
		Window_Base.prototype.drawActorMp = function(actor, x, y, width) {
		    width = width || 186;
		    var color1 = this.mpGaugeColor1();
		    var color2 = this.mpGaugeColor2();
		    this.drawGauge(x, y, width, actor.mpRate(), color1, color2);
		    this.changeTextColor(this.systemColor());
		    this.drawText(TextManager.mpA, x, y, 44);
		    this.drawCurrentAndMax(actor.mp, actor.mmp, x, y, width,
                		           this.mpColor(actor), this.normalColor());
		};
	}
	// The code below adjusts the layout of the characters in the main menu to show their TP
	if ( showmenu == 1 ) {
		Window_Base.prototype.drawActorSimpleStatus = function(actor, x, y, width) {
		    var lineHeight = this.lineHeight();
		    var x2 = x + 180;
		    var width2 = Math.min(200, width - 180 - this.textPadding());
		    this.drawActorName(actor, x, y-12);
		    this.drawActorLevel(actor, x, y - 12 + lineHeight * 0.9 * 1);
		    this.drawActorIcons(actor, x, y - 12 + lineHeight * 2);
		    this.drawActorClass(actor, x2, y-12);
		    this.drawActorHp(actor, x2, (y + lineHeight * 0.9 * 1)-12, width2);
		    this.drawActorMp(actor, x2, (y + lineHeight * 0.9 * 2)-12, width2);
		    this.drawActorTp(actor, x2, (y + lineHeight * 0.9 * 3)-12, width2);
		};
	}
	// The code below shows both TP and MP on skills requring both on the skills screens.
	if ( showskill == 1 ) {
		Window_SkillList.prototype.drawSkillCost = function(skill, x, y, width) {
	  	  if (this._actor.skillTpCost(skill) > 0 && this._actor.skillMpCost(skill) > 0) {
	  		var skillcost = String(this._actor.skillTpCost(skill));
		        this.changeTextColor(this.tpCostColor());
		        this.drawText(this._actor.skillTpCost(skill), x, y, width, 'right');
		        this.changeTextColor(this.mpCostColor());
		        this.drawText(this._actor.skillMpCost(skill), x-(14*skillcost.length)-8, y, width, 'right');
			this.changeTextColor(this.systemColor());
		        this.drawText("|", x-(14*skillcost.length)+3, y, width, 'right');
		    } else if (this._actor.skillTpCost(skill) > 0) {
		        this.changeTextColor(this.tpCostColor());
		        this.drawText(this._actor.skillTpCost(skill), x, y, width, 'right');
		    } else if (this._actor.skillMpCost(skill) > 0) {
		        this.changeTextColor(this.mpCostColor());
		        this.drawText(this._actor.skillMpCost(skill), x, y, width, 'right');
		    }
		};
	}
})();
