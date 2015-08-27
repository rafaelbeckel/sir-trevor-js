"use strict";

var _ = require('../lodash');
var ScribeInterface = require('../scribe-interface');
var stToHTML = require('../to-html');
var TextField = require('../blocks/primitives/text-field');

module.exports = {
  mixinName: 'RichEditor',

  richEditorFinder: '[data-richtext]',

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
      editor = wrapper.querySelector(this.richEditorFinder);
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

  loadRichEditableFields: function(data) {
    var content, textField;
    [].forEach.call(this.inner.querySelectorAll(this.richEditorFinder), (el) => {
      content = "";
      if (data) {
        content = data[el.getAttribute('data-ref') || "text"] || "";
        if (this.options.convertFromMarkdown && data.format !== "html") {
          content = stToHTML(content, this.type);
        }
      }
      textField = new TextField(el, content, this.options, this);
      this.editors[textField.ref] = textField;
    });
    textField = content = null;
  },

  saveRichEditableFields: function() {
    var data = {}, textField;
    Object.keys(this.editors).forEach( (ref) => {
      textField = this.editors[ref];
      data[textField.ref] = textField.scribe.getContent();
    });

    textField = null;

    return data;
  }

};
