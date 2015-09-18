var StyleSheet = require('react-style');

var TreeStructurePanelStyle = StyleSheet.create({
  initial: {
    "overflowY": "hidden",
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
    "transition": "left 500ms",
    "resize": "horizontal",
    "overflow": "auto"
  },

  structureArea: {
    "fontFamily": "Consolas",
    "fontSize": "13px",
    "width": "100%",
    "height": "100%",
    "border": "none",
    "outline": "none",
    "padding": "20px",
    "boxSizing": "border-box"
  }
});

module.exports = TreeStructurePanelStyle;