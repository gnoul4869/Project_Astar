/*:
@plugindesc Change windows menu options.
@author gnoul_
@help This will change windows menu options.
*/
Window_TitleCommand.prototype.makeCommandList = function () {
    this.addCommand(TextManager.newGame, 'newGame');
    //this.addCommand(TextManager.continue_, 'continue', this.isContinueEnabled);
    this.addCommand(TextManager.options, 'options');
};

Window_MenuCommand.prototype.addOptionsCommand = function () {

};