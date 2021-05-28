
/*:
@plugindesc [v1.0] Allow playing screen shakes and weather effects as part of a battle animation
@author Solar Flare Games

@help
This adds two new options for animation timings. To use these options, set
the flash option to Target or Screen, and set the intensity to 0.
If the intensity is anything other than 0, you will get a flash effect
as normal. Otherwise, you will get the custom effect from this plugin.
The duration field is used normally for this effect.

To add a weather effect, select Target and set Red to the weather type, Blue to
the power, and Green to the fade in duration. Weather types are:
0 - none
1 - rain
2 - storm
3 - snow
The value of 0 may be useful if you want to change weather multiple times in
the same animation. However, fade is currently not supported for this case.

To add a screen shake effect, select Screen and set Red to the shake power and
Green to the shake speed. The Blue value is not used.
*/

(function() {
	const TIMING_SCREEN_SHAKE = 2, TIMING_WEATHER_EFFECT = 1;
	
	const old_processTiming = Sprite_Animation.prototype.processTimingData;
	Sprite_Animation.prototype.processTimingData = function(timing) {
		if(timing.flashColor[3] == 0) {
			var duration = timing.flashDuration * this._rate;
			let [param1, param2, param3] = timing.flashColor;
			switch(timing.flashScope) {
				case TIMING_SCREEN_SHAKE:
					$gameScreen.startShake(param1, param2, duration);
				break;
				case TIMING_WEATHER_EFFECT:
					if(param1 >= 0 && param1 < 4)
						this.createWeather(['none', 'rain', 'storm', 'snow'][param1], param2, param3 * this._rate, duration);
				break;
			}
		}
		old_processTiming.call(this, timing);
	};
	
	Sprite_Animation.prototype.createWeather = function(type, power, fade, duration) {
		this._weather = this._weather || new Weather();
		this._weather.type = type;
		this._weatherPower = power;
		this._weatherDuration = duration;
		this._weatherFade = fade;
		if(fade == 0) {
			this._weather.power = power;
		}
		this.parent.parent.parent.addChild(this._weather);
	};
	
	Sprite_Animation.prototype.removeWeather = function() {
		if(this._weather) {
			this.parent.parent.parent.removeChild(this._weather);
			delete this._weather;
			delete this._weatherPower;
			delete this._weatherDuration;
			delete this._weatherFade;
		}
	};
	
	const old_updateAnim = Sprite_Animation.prototype.update;
	Sprite_Animation.prototype.update = function() {
		old_updateAnim.call(this);
		if(this._weather) {
			console.log(this._weather.power, this._weatherFade, this._weatherDuration);
			if(this._weatherFade > 0) {
				var d = this._weatherFade, t = this._weatherPower;
				this._weather.power = (this._weather.power * (d - 1) + t) / d;
				this._weatherFade--;
			}
			this._weatherDuration--;
			if(this._weatherDuration == 0) {
				this.removeWeather();
			}
		}
	};
	
	const old_removeAnim = Sprite_Animation.prototype.remove;
	Sprite_Animation.prototype.remove = function() {
		this.removeWeather();
		old_removeAnim.call(this);
	};
})();
