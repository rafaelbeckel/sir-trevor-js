"use strict";

const _ = require('../lodash');
const Events = require('../packages/events');
const FormatBar = require('../format-bar');
const EventBus = require('../event-bus');
const ScribeInterface = require('../scribe-interface');

module.exports = {

  mixinName: "Formattable",

  initializeFormattable: function() {
    this.formatBar = new FormatBar(this.options.formatBar, this.mediator, this);

    this._initFormatting();
  },

  _initFormatting: function() {
    this.formatBar.getCommands().forEach( (cmd) => {
      if (_.isUndefined(cmd.keyCode)) {
        return;
      }

      var ctrlDown = false;

      Events.delegate(this.el, '[data-formattable]', 'keyup', (ev) => {
        if(ev.which === 17 || ev.which === 224 || ev.which === 91) {
          ctrlDown = false;
        }
      });
      Events.delegate(this.el, '[data-formattable]', 'keydown', (ev) => {
        if(ev.which === 17 || ev.which === 224 || ev.which === 91) {
          ctrlDown = true;
        }

        if(ev.which === cmd.keyCode && ctrlDown) {
          ev.preventDefault();
          this.execTextBlockCommand(cmd);
        }
      });
    });
  },

  getSelectionForFormatter: function(el, e) {
    setTimeout(() => {
      var selectionStr = window.getSelection().toString().trim();
          
      if (selectionStr === '') {
        this.formatBar.hide();
      } else {
        this.formatBar.renderBySelection(el);
      }
    }, 1);
  },

  clearInsertedStyles: function(e) {
    var target = e.target;
    if (_.isUndefined(target.tagName)) {
      target = target.parentNode;
    }
    target.removeAttribute('style'); // Hacky fix for Chrome.
  },

};
