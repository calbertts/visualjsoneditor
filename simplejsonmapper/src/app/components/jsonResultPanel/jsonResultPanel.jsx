var React = require('react');
var JsonResultPanelStyle = require('./jsonResultPanelStyle.jsx');

var JsonResultPanel = React.createClass(
{
  propTypes: {
  },

  syntaxHighlight(json) {
  	json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  	return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
  	  var cls = 'number';
  	  if (/^"/.test(match)) {
  	      if (/:$/.test(match)) {
  	          cls = 'key';
  	      } else {
  	          cls = 'string';
  	      }
  	  } else if (/true|false/.test(match)) {
  	      cls = 'boolean';
  	  } else if (/null/.test(match)) {
  	      cls = 'null';
  	  }
  	  return '<span class="' + cls + '">' + match + '</span>';
  	});
  },

  getJSON(parent, list)
  {
      obj = {};

      return (function _getJSON(parent, list)
      {
          if(!list)
          {
              return;
          }

          else
          {
              for(var i=0; i<list.length; i++)
              {
                  var item = list[i];

                  if(item.children || item._children)
                  {
                      parent[item.name] = {};
                      _getJSON(parent[item.name], item.children || item._children);
                  }

                  else
                  {
                      parent[item.name] = item.type || "String";
                  }
              }

              return parent;
          }
      }(parent, list));

      return obj;
  },

  componentDidMount() {
  	this.calculateJSONResult();
  },

  render()
  {
    return (
      <div ref="jsonResultPanel" styles={[JsonResultPanelStyle.initial, this.props.style]} id="json-container">
      	<pre ref="pre"></pre>
      </div>
    );
  },

  setVisible(value)
  {
  	React.findDOMNode(this.refs.jsonResultPanel).style.left = (value) ? '0' : '-490px';
  },

  calculateJSONResult()
  {
    if(window.treeData)
    {
    	var code = JSON.stringify(this.getJSON({}, treeData.children || treeData._children), null, 2);
      code = this.syntaxHighlight(code.replace(/\"Numeric\"/gm, 0).replace(/\"Date\"/gm, "{d: 22, m: 05, y: 2015}", "gm").replace(/\"Boolean\"/gm, "true") + "\n\n");

      React.findDOMNode(this.refs.pre).innerHTML = code;
    }
  }
});

module.exports = JsonResultPanel;