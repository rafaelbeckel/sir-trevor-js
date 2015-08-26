"use strict";

const _ = require('../../lodash');
const ScribeInterface = require('../../scribe-interface');
const stToHTML = require('../../to-html');
const FormatBar = require('../../format-bar');

module.exports.create = function(SirTrevor, template_or_node) {
  
  var editor, formatBar;

  function setupFormatting() {

    formatBar = new FormatBar();

    editor.addEventListener('keyup', getSelectionForFormatter);
    editor.addEventListener('mouseup', getSelectionForFormatter);

    this.formatBar.getCommands().forEach( (cmd) => {

      if (_.isUndefined(cmd.keyCode)) {
        return;
      }

      var ctrlDown = false;

      editor.node.addEventListener('keyup', (ev) => {
        if(ev.which === 17 || ev.which === 224 || ev.which === 91) {
          ctrlDown = false;
        }
      });
      editor.node.addEventListener('keydown', (ev) => {
        if(ev.which === 17 || ev.which === 224 || ev.which === 91) {
          ctrlDown = true;
        }

        if(ev.which === cmd.keyCode && ctrlDown) {
          ev.preventDefault();
          this.execTextBlockCommand(cmd);
        }
      });

    });
  }

  function appendToTextEditor(content) {
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
  }

  function execTextBlockCommand(cmdName) {
    return ScribeInterface.execTextBlockCommand(
      scribe, cmdName
    );
  }

  function queryTextBlockCommandState(cmdName) {
    return ScribeInterface.queryTextBlockCommandState(
      scribe, cmdName
    );
  }

  function getSelectionForFormatterfunction() {
    setTimeout(() => {
      var selectionStr = window.getSelection().toString().trim();
          
      if (selectionStr === '') {
        formatBar.hide();
      } else {
        formatBar.renderBySelection();
      }
    }, 1);
  }
  
  if (template_or_node.nodeType) {
    editor = template_or_node;
  } else {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = template_or_node;
    editor = wrapper.querySelector('[data-richtext]',);
  }
  
  var id = _.uniqueId('editor-');
  editor.dataset.editorId = id;
  
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

  if (editor.getAttribute('data-formattable')) {
    setupFormatting();
  }

  return {el, editorObject};
};
