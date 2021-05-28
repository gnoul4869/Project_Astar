/*:
@plugindesc [v1.0] Expanded TP settings
@author Solar Flare Games

@param effectId
@text Effect ID
@desc Effect ID for the TP Recover effect.
@type number
@min 100
@max 999
@default 100

@param showTpInStatus
@text Show In Status
@desc Whether to show a TP bar in the status window. Only enable if you're using no other status window customization.
@type boolean
@default false

@param TP Icons

@param buffIcon
@text Buff Icon
@desc Icon shown when an actor or enemy has a buff to max TP. Right-click and choose IconSet Viewer.
@parent TP Icons
@type text

@param greaterBuffIcon
@text Greater Buff Icon
@desc Icon shown when an actor or enemy has a greater buff to max TP. Right-click and choose IconSet Viewer.
@parent TP Icons
@type text

@param debuffIcon
@text Debuff Icon
@desc Icon shown when an actor or enemy has a debuff to max TP. Right-click and choose IconSet Viewer.
@parent TP Icons
@type text

@param greaterDebuffIcon
@text Greater Debuff Icon
@desc Icon shown when an actor or enemy has a greater debuff to max TP. Right-click and choose IconSet Viewer.
@parent TP Icons
@type text

@param Preserve TP

@param invertTp
@text Invert
@desc Turn on to make all actors preserve TP by default. When turned on, actors with the Preserve TP will not preserve TP.
@parent Preserve TP
@type boolean
@default false
@on Inverted
@off Normal

@param initTp
@text Init Value
@desc Initial TP value for battlers who do not preserve TP. This is an eval where a is the battler.
@parent Preserve TP
@type text
@default Math.randomInt(25)

@param clearTp
@text Clear Value
@desc TP after battle ends for battlers who do not preserve TP. This is an eval where a is the battler.
@parent Preserve TP
@type text
@default 0

@param Charge TP by Damage

@param chargeTpFromHp
@text HP Damage
@desc Whether to enable gaining TP whenever you take HP damage.
@parent Charge TP by Damage
@type boolean
@default true
@on Enabled
@off Disabled

@param chargeTpFromMp
@text MP Damage
@desc Whether to enable gaining TP whenever you take MP damage.
@parent Charge TP by Damage
@type boolean
@default false
@on Enabled
@off Disabled

@param tpChargeFormula
@text Formula
@desc The formula for gaining TP from damage, where a is the battler, type is 'hp' or 'mp', rate is cur/max.
@parent Charge TP by Damage
@type text
@default 50 * rate * a.tcr * critBonus * superBonus

@param TP Gain Bonuses

@param tpCriticalBonus
@text Critical Bonus
@desc Multiply TP gain by this percent if you score a critical hit. Also available as critBonus in the TP Charge formula.
@parent TP Gain Bonuses
@type number
@min 0
@max 1000
@default 150

@param tpSuperBonus
@text Super Bonus
@desc Multiply TP gain by this percent if the enemy is weak to the element. Available as superBonus in the TP Charge formula.
@parent TP Gain Bonuses
@type number
@min 0
@max 1000
@default 150

@help
This gives TP functionality to match everything that HP and MP already has.

- Max TP can grow as you level up
- Modify max TP with traits
- TP damage, recovery, and drain
- TP percent+fixed recovery
- Buffs/debuffs to max TP
- Permanently grow max TP with items
- Customize TP charge behaviour with formulas
- Customize TP settings when battle begins and ends (without Preserve TP)
- Boost TP gain for critical hits or elemental weaknesses

If using SFG_ParamAdd, place this plugin below it.

Configuration
=============

The Effect ID can be ignored unless you have other SFG plugins with an
Effect ID parameter, in which case you just need to make sure it has a
different value for each plugin.

If you're using the default status panel, you can show a TP bar in the
status panel by enabling Show In Status. However, this can conflict with
other status screen customizations, so if you are using another status
screen plugin it's better to configure it to add the TP bar instead.
This option also shows it in the actor select screen.

TP Icons
--------

If you are using buffs or debuffs for max TP, you will need to configure the
icon to display for these. Just as with standard buffs and debuffs, they
come in two levels, so there are a total of four icons.

You can select an icon by right-clicking the empty text field and choosing
IconSet Viewer from the menu.

Preserve TP
-----------

This section controls the behaviour of Preserve TP.

If you turn on Invert, then all actors will preserve TP by default.
However, an actor with the Preserve TP trait will exhibit the default behaviour.

For actors that do not preserve TP, you can also set their initial TP when
a battle begins, and how much TP they retain when the battle ends.

In the Init Value and Clear Value formulas, you can access the following
variables:
a - the current actor
v - game variables
s - game switches

Charge TP by Damage
-------------------

This section customizes the TP gain when an actor or enemy takes damage.
It can be disabled entirely, or you can customize the amount of TP gained
based on the damage. You can even enable gaining TP when the battler takes
MP damage.

In the TP Charge formula, you can access the following variables:
a - the actor or enemy currently being targeted
b - the opponent actor or enemy
item - the item or skill being used
v - game variables
s - game switches
rate - the rate of TP gain based on current and max HP or MP
type - either 'hp' or 'mp'
critBonus - the value from Critical Bonus, as a ratio (divided by 100)
superBonus - the value from Super Bonus, as a ratio (divided by 100)

TP Gain Bonuses
---------------

In this section you can specify a percentage bonus to TP gain if scoring a
critical hit or attacking an elemental weakness. TP gain from skill use is
automatically multiplied by this value. If you wish, you can also include it
in the TP charge formula.

Note Tags
=========

<base_mtp:56> (classes, enemies, weapons, armours)
  Specifies the base max TP for this class or enemy.
  Used on a weapon or armour, it specifies a bonus to max TP.

<base_mtp:12,34,67,98> (classes)
  Specify the base max TP for each level, starting from 1. Any missing levels
  will be set equal to the last specified level.

<base_mtp:formula> (classes)
  Specify the base TP as a formula. You can reference the following variables:
    level, mhp, mmp, atk, def, mat, mdf, agi, luk
  The parameters refer to that parameter's value at the current level.
  For example, set the formula to "luk" to make it grow at the same rate
  as the class's luck.

<init_tp:formula> (classes, enemies, actors)
  Override the default Init Value for this battler's TP.
  If both an actor and a class have this tag, the actor's formula is used.

<clear_tp:formula> (classes, enemies, actors)
  Override the default Clear Value for this battler's TP.
  If both an actor and their class have this tag, only the actor's formula is
  used.

<mtp_rate:22> (anything with traits)
  Maximum TP will be multiplied by this value.

<add_mtp:12> (anything with traits) -- requires SFG_ParamAdd
  Adds this value to the maximum TP.

<tp_formula> (skills, items)
  Specifies that the damage formula box should affect TP instead of MP or HP.
  Whether it does damage, recovery, or drain is based on the type selection.

<tp_recover:12%> (skills, items)
  Recover 12% of your maximum TP.

<tp_recover:+12> (skills, items)
  Recover 12 TP. This is identical to the Gain TP effect.

<tp_recover:12% + 12> (skills, items)
  Recover 12% of your maximum TP, plus an additional 12 TP.

<buff_mtp:5> (skills, items)
  Add a buff to max TP for 5 turns.

<buff_mtp:remove> (skills, items)
  Remove any buff to max TP.

<debuff_mtp:5> (skills, items)
  Add a debuff to max TP for 5 turns.

<debuff_mtp:remove> (skills, items)
  Remove any debuff to max TP.

<grow_mtp:5> (skills, items)
  Permanently increase the target's max TP by 5.

<require_mtp:5> (armours, weapons) -- requires SFG_EquipParams
  Require a max TP of at least 5 to equip this item.
*/

(function() {
    var params = PluginManager.parameters("SFG_ExpandedTP");
    const PRESERVE_TP = JSON.parse(params.invertTp);
    const CHARGE_TP_FROM_HP = JSON.parse(params.chargeTpFromHp);
    const CHARGE_TP_FROM_MP = JSON.parse(params.chargeTpFromMp);
    const TP_DAMAGE = 7, TP_RECOVER = 8, TP_DRAIN = 9;
    const PARAM_MTP = 8;
    const TRAIT_PARAM_PLUS = PluginManager.isEnabled('SFG_ParamAdd') ? (Number(PluginManager.parameters('SFG_ParamAdd').traitId) || 100) : 0;
    const HAVE_EQUIP_PARAMS = PluginManager.isEnabled('SFG_EquipParams');
    const EFFECT_TP_RECOVER = Number(params.effectId) || 100;
    const TP_BUFF_ICONS = {
        [-2]: Number(params.greaterDebuffIcon) || 0,
        [-1]: Number(params.debuffIcon) || 0,
        0: 0,
        1: Number(params.buffIcon) || 0,
        2: Number(params.greaterBuffIcon) || 0,
    };
    const tp_recover_pat = /(\d+%)\s*(?:\+\s*(\d+))/, int_list_pat = /^\s*\d+(\s*,\s*\d+)*\s*$/;
    Object.defineProperty(Game_BattlerBase.prototype, 'mtp', {get: function() {return this.param(PARAM_MTP);}, configurable: true});

    const parseTpBase = function(obj, dflt) {
        if(!obj) return;
        var base_mtp = obj.meta ? obj.meta.base_mtp : dflt;
        if(base_mtp === undefined) base_mtp = dflt;
        // Are we a class or an enemy?
        if(typeof(obj.params[0]) === 'number') {
            // Enemy
            if(Number(base_mtp)) {
                obj.params[PARAM_MTP] = Number(base_mtp);
            } else {
                obj.params[PARAM_MTP] = dflt;
            }
        } else {
            // Class
            obj.params[PARAM_MTP] = [1];
            if(Number(base_mtp)) {
                for(let i = 1; i < 100; i++) {
                    obj.params[PARAM_MTP][i] = Number(base_mtp) || 100;
                }
            } else if(typeof(base_mtp) === 'string' && base_mtp.match(int_list_pat)) {
                obj.params[PARAM_MTP] = [1].concat(Utils.parseIntList(base_mtp));
                if(obj.params[PARAM_MTP].length > 100) {
                    obj.params[PARAM_MTP] = obj.params[PARAM_MTP].slice(0, 100);
                } else {
                    for(let i = obj.params[PARAM_MTP].length; i < 100; i++) {
                        obj.params[PARAM_MTP][i] = obj.params[PARAM_MTP][i - 1];
                    }
                }
            } else for(let level = 1; level < 100; level++) {
                let mhp = obj.params[0][level], mmp = obj.params[1][level], atk = obj.params[2][level], def = obj.params[3][level];
                let mat = obj.params[4][level], mdf = obj.params[5][level], agi = obj.params[6][level], luk = obj.params[7][level];
                try {
                    obj.params[PARAM_MTP][level] = eval(base_mtp);
                } catch(e) {
                    obj.params[PARAM_MTP][level] = 100;
                }
            }
        }
    };
  
    const parseTpInitClear = function(obj) {
        if(!obj || !obj.meta) return;
        if(obj.meta.init_tp) {
            obj.initTp = obj.meta.init_tp;
        }
        if(obj.meta.clear_tp) {
            obj.clearTp = obj.meta.clear_tp;
        }
    };

    const parseTpTraits = function(obj) {
        if(!obj || !obj.meta) return;
        if(obj.meta.mtp_rate) {
            let trait = {
                code: Game_BattlerBase.TRAIT_PARAM,
                dataId: PARAM_MTP,
                value: (Number(obj.meta.mtp_rate) || 0) / 100,
            };
            obj.traits.push(trait);
        }
        if(TRAIT_PARAM_PLUS && obj.meta.add_mtp) {
            let trait = {
                code: TRAIT_PARAM_PLUS,
                dataId: PARAM_MTP,
                value: Number(obj.meta.add_mtp) || 0,
            };
            obj.traits.push(trait);
        }
    };

    const parseTpDamage = function(obj) {
        if(!obj || !obj.meta || !obj.meta.tp_formula) return;
        switch(obj.damage.type) {
            case 1: case 2:
                obj.damage.type = TP_DAMAGE;
                break;
            case 3: case 4:
                obj.damage.type = TP_RECOVER;
                break;
            case 5: case 6:
                obj.damage.type = TP_DRAIN;
                break;
        }
    };
  
    const parseTpEffects = function(obj) {
        if(!obj || !obj.meta) return;
        if(obj.meta.tp_recover) {
            let m = obj.meta.tp_recover.match(tp_recover_pat);
            if(m) {
                let effect = {
                    code: EFFECT_TP_RECOVER,
                    dataId: 0,
                    value1: 0,
                    value2: 0,
                };
                if(m[1]) {
                    effect.value1 = Number(m[1]) / 100;
                }
                if(m[2]) {
                    effect.value2 = Number(m[2]);
                }
                obj.effects.push(effect);
            }
        }
        if(obj.meta.buff_mtp) {
            let effect = {
                dataId: PARAM_MTP,
                value1: 0,
                value2: 0,
            };
            if(obj.meta.buff_mtp.trim().toLowerCase() == 'remove') {
                effect.code = Game_Action.EFFECT_REMOVE_BUFF;
                obj.effects.push(effect);
            } else if(Number(obj.meta.buff_mtp)) {
                effect.code = Game_Action.EFFECT_ADD_BUFF;
                effect.value1 = Number(obj.meta.buff_mtp);
                obj.effects.push(effect);
            }
        }
        if(obj.meta.debuff_mtp) {
            let effect = {
                dataId: PARAM_MTP,
                value1: 0,
                value2: 0,
            };
            if(obj.meta.debuff_mtp.trim().toLowerCase() == 'remove') {
                effect.code = Game_Action.EFFECT_REMOVE_DEBUFF;
                obj.effects.push(effect);
            } else if(Number(obj.meta.debuff_mtp)) {
                effect.code = Game_Action.EFFECT_ADD_DEBUFF;
                effect.value1 = Number(obj.meta.debuff_mtp);
                obj.effects.push(effect);
            }
        }
        if(Number(obj.meta.grow_mtp)) {
            let effect = {
                code: Game_Action.EFFECT_GROW,
                dataId: PARAM_MTP,
                value1: Number(obj.meta.grow_mtp),
                value2: 0,
            };
            obj.effects.push(effect);
        }
    }

    var old_startup = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        for(var i = 1; i < $dataStates.length; i++) {
            parseTpTraits($dataStates[i]);
        }
        for(var i = 1; i < $dataActors.length; i++) {
            parseTpTraits($dataActors[i]);
            parseTpInitClear($dataActors[i]);
        }
        for(var i = 1; i < $dataClasses.length; i++) {
            parseTpBase($dataClasses[i], 100);
            parseTpTraits($dataClasses[i]);
            parseTpInitClear($dataClasses[i]);
        }
        for(var i = 1; i < $dataWeapons.length; i++) {
            parseTpBase($dataWeapons[i], 0);
            parseTpTraits($dataWeapons[i]);
        }
        for(var i = 1; i < $dataArmors.length; i++) {
            parseTpBase($dataArmors[i], 0);
            parseTpTraits($dataArmors[i]);
        }
        for(var i = 1; i < $dataEnemies.length; i++) {
            parseTpBase($dataEnemies[i], 100);
            parseTpTraits($dataEnemies[i]);
            parseTpInitClear($dataEnemies[i]);
        }
        for(var i = 1; i < $dataItems.length; i++) {
            parseTpDamage($dataItems[i]);
            parseTpEffects($dataItems[i]);
        }
        for(var i = 1; i < $dataSkills.length; i++) {
            parseTpDamage($dataSkills[i]);
            parseTpEffects($dataSkills[i]);
        }
        old_startup.call(this);
    };
  
    // Overwrite, not alias
    Game_BattlerBase.prototype.maxTp = function() {
        return this.mtp;
    };
  
    // Overwrite, not alias
    Game_Battler.prototype.regenerateTp = function() {
        var value = Math.floor(this.mtp * this.trg);
        this.gainSilentTp(value);
    };
  
    const old_clearPlus = Game_BattlerBase.prototype.clearParamPlus;
    Game_BattlerBase.prototype.clearParamPlus = function() {
        old_clearPlus.call(this);
        this._paramPlus.push(0);
    };
  
    const old_clearBuffs = Game_BattlerBase.prototype.clearBuffs;
    Game_BattlerBase.prototype.clearBuffs = function() {
        old_clearBuffs.call(this);
        this._buffs.push(0);
        this._buffTurns.push(0);
    };
  
    // Overwrite, not alias
    Game_BattlerBase.prototype.isPreserveTp = function() {
        return this.specialFlag(Game_BattlerBase.FLAG_ID_PRESERVE_TP) !== PRESERVE_TP;
    };
  
    const old_buffIcon = Game_BattlerBase.prototype.buffIconIndex;
    Game_BattlerBase.prototype.buffIconIndex = function(level, param) {
        if(param == PARAM_MTP) return TP_BUFF_ICONS[level];
        else return old_buffIcon.call(this, level, param);
    };
  
    Game_Battler.prototype.initTpFormula = function() {
        return params.initTp;
    };
  
    Game_Enemy.prototype.initTpFormula = function() {
        return this.enemy().initTp || Game_Battler.prototype.initTpFormula.call(this);
    };
  
    Game_Actor.prototype.initTpFormula = function() {
        return this.actor().initTp || this.currentClass().initTp || Game_Battler.prototype.initTpFormula.call(this);
    };
  
    const old_initTp = Game_Battler.prototype.initTp;
    Game_Battler.prototype.initTp = function() {
        let a = this;
        let v = $gameVariables._data, s = $gameSwitches._data;
        try {
            this.setTp(Math.round(eval(this.initTpFormula())));
        } catch(e) {
            old_initTp.call(this);
        }
    };
  
    Game_Battler.prototype.clearTpFormula = function() {
        return params.clearTp;
    };
  
    Game_Enemy.prototype.clearTpFormula = function() {
        return this.enemy().clearTp || Game_Battler.prototype.clearTpFormula.call(this);
    };
  
    Game_Actor.prototype.clearTpFormula = function() {
        return this.actor().clearTp || this.currentClass().clearTp || Game_Battler.prototype.clearTpFormula.call(this);
    };
  
    const old_clearTp = Game_Battler.prototype.clearTp;
    Game_Battler.prototype.clearTp = function() {
        let a = this;
        let v = $gameVariables._data, s = $gameSwitches._data;
        try {
            this.setTp(Math.round(eval(this.clearTpFormula())));
        } catch(e) {
            old_clearTp.call(this);
        }
    };
  
    const old_chargeTp = Game_Battler.prototype.chargeTpByDamage;
    Game_Battler.prototype.chargeTpByDamage = function(rate, type = 'hp') {
        if(type == 'hp' && !CHARGE_TP_FROM_HP) return;
        if(type == 'mp' && !CHARGE_TP_FROM_MP) return;
        try {
            var item = this._opponentAction.item();
            var a = this, b = this._opponentAction.subject();
            let v = $gameVariables._data, s = $gameSwitches._data;
            var critBonus = 1, superBonus = 1;
            if(this.result().critical) {
                critBonus *= params.tpCriticalBonus / 100;
            }
            if(this._opponentAction.calcElementRate(this) > 1) {
                superBonus *= params.tpSuperBonus / 100;
            }
            var value = Math.round(eval(params.tpChargeFormula));
            if(value > 0) this.gainSilentTp(value);
        } catch(e) {
            old_chargeTp.call(this, rate);
        }
    };
  
    const old_execMpDmg = Game_Action.prototype.executeMpDamage;
    Game_Action.prototype.executeMpDamage = function(target, value) {
        old_execMpDmg.call(this, target, value);
        if(value > 0) {
            target.chargeTpByDamage(value / target.mmp, 'mp');
        }
    };
  
    const old_execDmg = Game_Action.prototype.executeDamage;
    Game_Action.prototype.executeDamage = function(target, value) {
        target._opponentAction = this;
        old_execDmg.call(this, target, value);
        if(this.isTpEffect()) {
            this.executeTpDamage(target, value);
        }
        delete target._opponentAction;
    };

    Game_Action.prototype.isTpEffect = function() {
        return this.checkDamageType([TP_DAMAGE, TP_RECOVER, TP_DRAIN]);
    };

    Game_Action.prototype.isTpRecover = function() {
        return this.checkDamageType([TP_RECOVER]);
    };
  
    const old_isDmg = Game_Action.prototype.isDamage;
    Game_Action.prototype.isDamage = function() {
        return old_isDmg.call(this) || this.checkDamageType([TP_DAMAGE]);
    };
  
    const old_isHeal = Game_Action.prototype.isRecover;
    Game_Action.prototype.isRecover = function() {
        return old_isHeal.call(this) || this.checkDamageType([TP_RECOVER]);
    };
  
    const old_isDrain = Game_Action.prototype.isDrain;
    Game_Action.prototype.isDrain = function() {
        return old_isDrain.call(this) || this.checkDamageType([TP_DRAIN]);
    };
  
    Game_Action.prototype.executeTpDamage = function(target, value) {
        if (!this.isTpRecover()) {
            value = Math.min(target.tp, value);
        }
        if (value !== 0) {
            this.makeSuccess(target);
        }
        target.gainTp(-value);
        this.gainDrainedTp(value);
    };

    Game_Action.prototype.gainDrainedTp = function(value) {
        if (this.isDrain()) {
           var gainTarget = this.subject();
           if (this._reflectionTarget !== undefined) {
               gainTarget = this._reflectionTarget;
           }
           gainTarget.gainTp(value);
        }
    };
  
    // Overwrite, not alias
    Game_Action.prototype.applyItemUserEffect = function(target) {
        var value = this.item().tpGain * this.subject().tcr;
        if(target.result().critical) {
            value *= params.tpCriticalBonus / 100;
        }
        if(this.calcElementRate(target) > 1) {
            value *= params.tpSuperBonus / 100;
        }
        this.subject().gainSilentTp(Math.floor(value));
    };
  
    if(params.showTpInStatus) {
        // These are overwrites, not aliases
        Window_Status.prototype.drawBlock1 = function(y) {
            this.drawActorName(this._actor, 6, y);
            this.drawActorClass(this._actor, 192, y);
            this.drawActorNickname(this._actor, 432, y);
            this.drawActorIcons(this._actor, 568, y, 192);
        };

        Window_Status.prototype.drawBasicInfo = function(x, y) {
            var lineHeight = this.lineHeight();
            this.drawActorLevel(this._actor, x, y + lineHeight * 0);
            this.drawActorHp(this._actor, x, y + lineHeight * 1);
            this.drawActorMp(this._actor, x, y + lineHeight * 2);
            this.drawActorTp(this._actor, x, y + lineHeight * 3, 186);
        };
      
        Window_Base.prototype.drawActorSimpleStatus = function(actor, x, y, width) {
            var lineHeight = this.lineHeight();
            var x2 = x + 180;
            var width2 = Math.min(200, width - 180 - this.textPadding());
            this.drawActorName(actor, x, y);
            this.drawActorLevel(actor, x, y + lineHeight * 1);
            this.drawActorIcons(actor, x, y + lineHeight * 2);
            this.drawActorClass(actor, x2, y, width2);
            this.drawActorHp(actor, x2, y + lineHeight * 1, width2);
            this.drawActorMp(actor, x2, y + lineHeight * 1.8, width2);
            this.drawActorTp(actor, x2, y + lineHeight * 2.6, width2);
        };
    }
  
    if(HAVE_EQUIP_PARAMS) {
        var old_equip_ok = Game_BattlerBase.prototype.canEquip;
        Game_BattlerBase.prototype.canEquip = function(item) {
            if(!old_equip_ok.call(this, item)) return false;
            var bravery = parseInt(item.meta.require_mtp);
            if(!isNaN(bravery) && bravery > this.mtp)
                return false;
            return true;
        };
    }
})();