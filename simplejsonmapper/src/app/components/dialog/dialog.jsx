var React = require('react');
var DialogStyle = require('./dialogStyle.jsx');

var Dialog = React.createClass(
{
  propTypes: {
      onClick: React.PropTypes.func,
      text: React.PropTypes.string
  },

  getDefaultProps: function () {
      return {
          text: "Button"  
      };
  },

  getInitialState() {
      return {
        rollower: DialogStyle.normal
      };
  },

  render()
  {
    return (
      <div ref="dialogPanel" styles={[DialogStyle.initial, this.props.style]}>
        {this._createOptions()}
        <hr></hr>
        <button>OK</button>
      </div>
    );
  },

  _createOptions()
  {
    var options = this.props.options.map(function(item, index){
      return <option key={{index}}>{{item}}</option> //
    });

    return options;
  },

  setVisible(value)
  {
    React.findDOMNode(this.refs.dialogPanel).style.top = (value) ? '0' : '-' + React.findDOMNode(this.refs.dialogPanel).style.height;
  }
});

module.exports = Dialog;