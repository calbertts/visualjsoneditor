var React = require('react');
var ButtonStyle = require('./buttonStyle.jsx');

var Button = React.createClass(
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
        rollower: ButtonStyle.normal
      };
  },

  render()
  {
    return (
      <div ref="buttonContainer" styles={[ButtonStyle.button, this.state.rollower, this.props.style]} onClick={this._onClick} onMouseOver={this._onMouseOver} onMouseOut={this._onMouseOut} onMouseDown={this._onMouseDown} onMouseUp={this._onMouseOut}>
        {this.props.text}
      </div>
    );
  },

  _onClick()
  {
    if(this.props.onClick)
    {
      this.props.onClick(this);
    }
  },

  _onMouseOver()
  {
    this.setState({
      rollower: ButtonStyle.hover
    });
  },

  _onMouseOut()
  {
    this.setState({
      rollower: ButtonStyle.normal
    });
  },

  _onMouseDown()
  {
    this.setState({
      rollower: ButtonStyle.active
    });
  }
});

module.exports = Button;