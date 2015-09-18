(function(){
  var injectTapEventPlugin = require("react-tap-event-plugin");
  injectTapEventPlugin();
  window.React = React;
})();

var React = require('react'),
    Main = require('./components/main.jsx')
    Router = require('react-router'),
    DefaultRoute = Router.DefaultRoute,
    Route = Router.Route;

var routes = (
  <Route path="/">
    <DefaultRoute handler={Main} />
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler />, document.body);
});
