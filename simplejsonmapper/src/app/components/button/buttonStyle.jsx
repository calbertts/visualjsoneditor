var StyleSheet = require('react-style');

var ButtonStyle = StyleSheet.create({
  button: {
    "textAlign": "center",
    "paddingTop": "10px",
    "border": "1px solid #ccc",
    "borderRadius": "4px",
    "boxShadow": "rgb(140, 140, 140) 1px 1px 6px -3px",
    "cursor": "pointer",
    "fontFamily": "sans-serif",
    "fontSize": "14px",
    "fontWeight": "400",
    "color": "#aaa",
    "WebkitTouchCallout": "none",
    "WebkitUserSelect": "none",
    "KhtmlUserSelect": "none",
    "MozUserSelect": "none",
    "MsUserSelect": "none",
    "userSelect": "none"
  },

  normal: {
    "backgroundColor": "#FAFAFA"
  },

  hover: {
    "backgroundColor": "#FCFCFC"
  },

  active: {
    "backgroundColor": "#F5F5F5"
  }
});

module.exports = ButtonStyle;