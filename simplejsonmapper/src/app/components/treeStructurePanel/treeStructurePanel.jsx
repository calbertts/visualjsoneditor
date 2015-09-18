var React = require('react');
var TreeStructurePanelStyle = require('./treeStructurePanelStyle.jsx');
var AceEditor  = require('../../libs/ace/ace.js');

require('../../libs/ace/mode-json');
require('../../libs/ace/theme-github');

var TreeStructurePanel = React.createClass(
{
  propTypes: {
  	onChangeStructure: React.PropTypes.func
  },

  getDefaultProps() {
  	return {
  		fontSize: 14
  	}
  },

  calculateJSONStructure()
  {
  	// reload structure
  	var newStructure = {};

	jQuery.extend(newStructure, treeData);

	(function _removeParents(list)
	{
	    if(list)
	    {
	        for(var i=0; i < list.length; i++)
	        {
	            var obj = list[i];

	            // save collapsed children
				var collapsedChildren = obj["_children"];

	            for(var prop in obj)
	            {
	                if(prop != "name" && prop != "children" && prop != "_children")
	                {
	                    delete obj[prop];
	                }
	            }

	            _removeParents(obj["children"] || collapsedChildren);
	        }
	    }
	}([newStructure]));

	//localStorage.setItem("structure", JSON.stringify(newStructure, null, 2));

	var textarea = React.findDOMNode(this.refs.structureContent);
	//textarea.setValue(JSON.stringify(newStructure, null, 2));

	return newStructure;
  },

  componentDidMount()
  {
	var textarea = this.refs.structureContent;
    
    this.editor = ace.edit("aceContainer");
    this.editor.setTheme("ace/theme/github");
    this.editor.setFontSize(this.props.fontSize);
    this.editor.getSession().setMode("ace/mode/json");
    this.editor.$blockScrolling = Infinity;

    if(localStorage && localStorage.structure)
    {
    	this.editor.setValue(localStorage.structure);
    	this.editor.clearSelection();
    	this.editor.focus();
    }

    this.editor.on('change', this._onChangeStructure);

    var isCtrl = false;

    function ctrlCheck(e) {
        if (e.which === 17) {
            isCtrl = e.type === 'keydown' ? true : false;
        }
    }

    var self = this;
    function wheelCheck(e, delta) {
        if (isCtrl) {
            e.preventDefault();

            if(delta > 0)
            	self.props.fontSize++;
            else
            	self.props.fontSize--;

            self.editor.setFontSize(self.props.fontSize);
        }
    }

    var treeStructurePanel = React.findDOMNode(this.refs.treeStructurePanel);
    $(treeStructurePanel).
        keydown(ctrlCheck).
        keyup(ctrlCheck).
        mousewheel(wheelCheck);
  },

  render()
  {
    return (
      <div ref="treeStructurePanel" styles={[TreeStructurePanelStyle.initial, this.props.style]}>
      	<div id="aceContainer" style={{width: 'calc(100% - 6px)', height: '100%'}} ref="aceContainer"></div>
      </div>
    );
  },

  _onChangeStructure()
  {
  	if(this.props.onChangeStructureContent)
  	{
  		this.props.onChangeStructureContent();
  	}
  },

  setVisible(value)
  {
  	React.findDOMNode(this.refs.treeStructurePanel).style.left = (value) ? '0' : '-' + React.findDOMNode(this.refs.treeStructurePanel).style.width;
  	this.editor.focus();
  },

  getStructure()
  {
  	return this.editor.getValue();
  }
});

module.exports = TreeStructurePanel;