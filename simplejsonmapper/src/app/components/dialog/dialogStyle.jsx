var StyleSheet = require('react-style');

var DialogStyle = StyleSheet.create({
  initial: {
    "overflowY": "hidden",
    "padding": "0",
    "width": "450px",
    "height": "100px",
    "position": "absolute",
    "top": "-100px",
    "left": "0",
    "backgroundColor": "white",
    "boxShadow": "1px 1px 3px 1px #ccc",
    "WebkitTransition": "top 500ms",
    "MozTransition": "top 500ms",
    "OTransition": "top 500ms",
    "transition": "top 500ms",
    "resize": "horizontal",
    "overflow": "auto"
  }
});

module.exports = DialogStyle;