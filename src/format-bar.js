"use strict";

/**
 * Format Bar
 * --
 * Displayed on focus on a text area.
 * Renders with all available options for the editor instance
 */

var _ = require('./lodash');

var config = require('./config');
var utils = require('./utils');
var Dom = require('./packages/dom');
var Events = require('./packages/events');

const FORMAT_BUTTON_TEMPLATE = require("./templates/format-button");

var FormatBar = function(options, mediator, block) {
  this.block = block;
  this.mediator = mediator;
  this.options = Object.assign({}, config.defaults.formatBar, options || {});
  this.commands = this.options.commands;
  this.available = this.options.available;
  
  this._ensureElement();
  this._bindFunctions();
  this._bindMediatedEvents();
  
  this.initialize.apply(this, arguments);
};

Object.assign(FormatBar.prototype, require('./function-bind'), require('./mediated-events'), require('./events'), require('./renderable'), {

  className: 'st-format-bar',

  bound: ["onFormatButtonClick", "renderBySelection", "hide"],

  eventNamespace: 'formatter',

  mediatedEvents: {
    'hide': 'hide'
  },

  initialize: function() {
    Events.delegate(this.el, '.st-format-btn', 'click', this.onFormatButtonClick);
  },

  hide: function() {
    this.el.classList.remove('st-format-bar--is-ready');
    Dom.remove(this.buttons);
    Dom.remove(this.el);
  },

  show: function() {
    this.block.inner.appendChild(this.el);
    this.el.classList.add('st-format-bar--is-ready');
  },

  remove: function(){ Dom.remove(this.el); },

  renderBySelection: function(el) {
    this.hide();
    this.renderButtons(el);
    this.highlightSelectedButtons();
    this.show();
    this.calculatePosition();
  },

  renderButtons: function(el) {
    this.buttons = Dom.createElement('div', {
      html: this.getCommands(el).reduce(function(memo, format) {
              return memo += FORMAT_BUTTON_TEMPLATE(format);
            }, "")
    });

    this.el.appendChild(this.buttons);
  },

  calculatePosition: function() {
    var selection = window.getSelection(),
        range = selection.getRangeAt(0),
        boundary = range.getBoundingClientRect(),
        coords = {},
        outer = this.block.inner,
        outerBoundary = outer.getBoundingClientRect();

    coords.top = (boundary.top - outerBoundary.top) + 'px';
    coords.left = (((boundary.left + boundary.right) / 2) -
      (this.el.offsetWidth / 2) - outerBoundary.left) + 'px';

    this.el.style.top = coords.top;
    this.el.style.left = coords.left;
  },

  highlightSelectedButtons: function() {
    [].forEach.call(this.el.querySelectorAll(".st-format-btn"), (btn) => {
      var cmd = btn.getAttribute('data-cmd');
      btn.classList.toggle("st-format-btn--is-active",
                      this.block.queryTextBlockCommandState(cmd));
      btn = null;
    });
  },

  onFormatButtonClick: function(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    var btn = ev.target,
        cmd = btn.getAttribute('data-cmd');

    if (_.isUndefined(cmd)) {
      return false;
    }

    this.block.execTextBlockCommand(cmd);

    this.highlightSelectedButtons();

    return false;
  },

  getCommands: function(el) {
    var cmds = this.available[ el && el.getAttribute('data-ref') ] || this.available.default;
    return cmds.map( (cmd) => {
      return this.commands[cmd];
    });
  }

});

module.exports = FormatBar;
