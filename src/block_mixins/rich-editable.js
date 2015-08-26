"use strict";

var _ = require('../lodash');
var ScribeInterface = require('../scribe-interface');
var stToHTML = require('../to-html');

module.exports = {
  mixinName: 'RichEditor',

  finder: '[data-richtext]',

  initializeRichEditor: function() {
    this.editors = {};
  },

  newTextEditor: function(template_or_node, content) {
    var editor;
    if (template_or_node.nodeType) {
      editor = template_or_node;
    } else {
      // render template outside of dom
      var wrapper = document.createElement('div');
      wrapper.innerHTML = template_or_node;
      editor = wrapper.querySelector(this.finder);
    }
    
    var id = _.uniqueId('editor-');
    editor.dataset.editorId = id;
    
    if (editor.getAttribute('data-formattable')) {
      editor.addEventListener('keyup', this.getSelectionForFormatter.bind(this, editor));
      editor.addEventListener('mouseup', this.getSelectionForFormatter.bind(this, editor));
    }

    var configureScribe =
      _.isFunction(this.configureScribe) ? this.configureScribe.bind(this) : null;
    var scribe = ScribeInterface.initScribeInstance(
      editor, this.scribeOptions, configureScribe
    );

    scribe.setContent(content);

    var editorObject = {
      node: wrapper ? wrapper.removeChild(wrapper.firstChild) : null,
      el: editor,
      scribe: scribe,
      id: id
    };

    this.editors[id] = editorObject;

    return editorObject;
  },

  getCurrentTextEditor: function() {
    var id = document.activeElement.dataset.editorId;
    var editor = this.getTextEditor(id);

    if (editor) {
      this.currentEditor = editor;
    }

    return this.currentEditor;
  },

  appendToTextEditor: function(id, content) {
    var scribe = this.getTextEditor(id).scribe;
    var selection = new scribe.api.Selection();
    var range = selection.range.cloneRange();
    var lastChild = scribe.el.lastChild;
    range.setStartAfter(lastChild);
    range.collapse(true);
    selection.selection.removeAllRanges();
    selection.selection.addRange(range);

    if (content) {
      scribe.insertHTML(content);
    }
  },

  getCurrentScribeInstance: function() {
    return this.getCurrentTextEditor().scribe;
  },

  getTextEditor: function(id) {
    return this.editors[id];
  },

  removeTextEditor: function(id) {
    delete this.editors[id];
  },

  // scribe commands for FormatBar
  execTextBlockCommand: function(cmdName) {
    return ScribeInterface.execTextBlockCommand(
      this.getCurrentScribeInstance(), cmdName
    );
  },

  queryTextBlockCommandState: function(cmdName) {
    return ScribeInterface.queryTextBlockCommandState(
      this.getCurrentScribeInstance(), cmdName
    );
  },

  getSelectionForFormatter: function() {},

  loadMixinData: function(data) {
    var content;
    [].forEach.call(this.inner.querySelectorAll(this.finder), (el) => {
      content = data[el.getAttribute('data-ref')] || "";
      if (this.options.convertFromMarkdown && data.format !== "html") {
        content = stToHTML(content, this.type);
      }
      this.newTextEditor(el, content);
    });
  },

};
