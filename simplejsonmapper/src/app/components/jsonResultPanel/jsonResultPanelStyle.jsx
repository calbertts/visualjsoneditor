var StyleSheet = require('react-style');

var JsonResultPanelStyle = StyleSheet.create({
  initial: {
    "overflowY": "auto",
    "padding": "0",
    "width": "450px",
    "height": "100%",
    "position": "absolute",
    "top": "0",
    "left": "-490px",
    "backgroundColor": "white",
    "boxShadow": "1px 1px 3px 1px #ccc",
    "WebkitTransition": "left 500ms",
    "MozTransition": "left 500ms",
    "OTransition": "left 500ms",
    "transition": "left 500ms"
  }
});

module.exports = JsonResultPanelStyle;