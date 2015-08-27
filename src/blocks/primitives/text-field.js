"use strict";

const _ = require('../../lodash');
const ScribeInterface = require('../../scribe-interface');
const stToHTML = require('../../to-html');
const FormatBar = require('../helpers/format-bar-2');

var TextField = function(template_or_node, content, options, block) {
  
  this.options = options;
  this.block = block;
  this.scribeOptions = this.block.scribeOptions || {};

  this.setElement(template_or_node);
  this.setupScribe(content);

  if (this.editor.getAttribute('data-formattable')) {
    this.setupFormatting();
  }
};

Object.assign(TextField.prototype, {

  setupScribe: function(content) {
    var configureScribe =
    _.isFunction(this.configureScribe) ? this.configureScribe.bind(this) : null;
  
    this.scribe = ScribeInterface.initScribeInstance(
      this.editor, this.getScribeOptions(), configureScribe
    );

    this.scribe.setContent(content);
  },

  getScribeOptions: function() {
    return this.scribeOptions[this.ref] || this.scribeOptions.default
  },

  setElement: function(template_or_node) {
    if (template_or_node.nodeType) {
      this.editor = template_or_node;
    } else {
      var wrapper = document.createElement('div');
      wrapper.innerHTML = template_or_node;
      this.editor = wrapper.querySelector('[data-richtext]');
      this.node = wrapper ? wrapper.removeChild(wrapper.firstChild) : null;
    }
    this.ref = this.editor.getAttribute('data-ref');
  },

  setupFormatting: function() {
    this.formatBar = new FormatBar(this, this.options.formatBar, this.block);

    this.editor.addEventListener('keyup', this.getSelectionForFormatter.bind(this));
    this.editor.addEventListener('mouseup', this.getSelectionForFormatter.bind(this));

    this.formatBar.getCommands().forEach( (cmd) => {

      if (_.isUndefined(cmd.keyCode)) {
        return;
      }

      var ctrlDown = false;

      this.editor.addEventListener('keyup', (ev) => {
        if(ev.which === 17 || ev.which === 224 || ev.which === 91) {
          ctrlDown = false;
        }
      });
      this.editor.addEventListener('keydown', (ev) => {
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

  appendToTextEditor: function(content) {
    var selection = new scribe.api.Selection();
    var range = selection.range.cloneRange();
    var lastChild = scribe.el.lastChild;
    range.setStartAfter(lastChild);
    range.collapse(true);
    selection.selection.removeAllRanges();
    selection.selection.addRange(range);

    if (content) {
      this.scribe.insertHTML(content);
    }
  },

  execTextBlockCommand: function(cmdName) {
    return ScribeInterface.execTextBlockCommand(
      this.scribe, cmdName
    );
  },

  queryTextBlockCommandState: function(cmdName) {
    return ScribeInterface.queryTextBlockCommandState(
      this.scribe, cmdName
    );
  },

  getSelectionForFormatter: function() {
    setTimeout(() => {
      var selectionStr = window.getSelection().toString().trim();
          
      if (selectionStr === '') {
        this.formatBar.hide();
      } else {
        this.formatBar.renderBySelection();
      }
    }, 1);
  }

});

module.exports = TextField;
