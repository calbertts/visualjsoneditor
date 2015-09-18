var React = require('react');

var Button = require('./button/button.jsx');
var TreeContainer = require('./treeContainer/treeContainer.jsx');
//var JsonResultPanel = require('./jsonResultPanel/jsonResultPanel.jsx');
var TreeStructurePanel = require('./treeStructurePanel/treeStructurePanel.jsx');

var Main = React.createClass(
{
  getInitialState: function () {
      return {
          viewJSONText: "View JSON",
          viewStructureText: "View Structure"
      };
  },

  render()
  {
    return (
      <div>
        {/*<Button ref="viewJSON" text={this.state.viewJSONText} onClick={this._onViewJSONClick} style={{position: 'fixed', top: '10px', right: '10px', width: '100px', height: '27px'}} />*/}
        <Button ref="viewStruct" text={this.state.viewStructureText} onClick={this._onViewStructureClick} style={{position: 'fixed', top: '10px', right: '10px', width: '125px', height: '27px'}} />
        <iframe style={{position: 'fixed', bottom: '10px', right: '10px', border: '0'}} src="https://ghbtns.com/github-btn.html?user=calbertts&repo=simplejsonmapper&type=fork&count=true" frameBorder="0" scrolling="0" width="80px" height="20px"></iframe>

        <TreeContainer ref="treeContainer" onChangeTreeStructure={this._onChangeTreeStructure} />
        {/*<JsonResultPanel ref="jsonResultPanel" />*/}
        <TreeStructurePanel ref="treeStructurePanel" onChangeStructureContent={this._onChangeStructureContent} />
      </div>
    );
  },

  _onViewJSONClick(instance)
  {
    if(instance.props.text === "View JSON")
    {
        this.refs.treeStructurePanel.setVisible(false);
        //this.refs.jsonResultPanel.setVisible(true);
        
        this.setState({
          viewJSONText: "Hide JSON",
          viewStructureText: "View Structure"
        });
    }
    else
    {
        //this.refs.jsonResultPanel.setVisible(false);

        this.setState({
          viewJSONText: "View JSON",
        });
    }
  },

  _onViewStructureClick(instance)
  {
    if(instance.props.text === "View Structure")
    {
        //this.refs.jsonResultPanel.setVisible(false);
        this.refs.treeStructurePanel.setVisible(true);
        
        this.setState({
          viewJSONText: "View JSON",
          viewStructureText: "Hide Structure"
        });
    }
    else
    {
        this.refs.treeStructurePanel.setVisible(false);

        this.setState({
          viewStructureText: "View Structure"
        });
    }
  },

  _onChangeStructureContent()
  {
    try
    {
    $('svg').remove();
    var content = this.refs.treeStructurePanel.getStructure();
    var structure = this.refs.treeContainer.fromJSONToStructure(JSON.parse(content));
    
    this.refs.treeContainer.generateTree(structure);
    localStorage.setItem("structure", content);
    }
    catch(e) {}
  },

  _onChangeTreeStructure()
  {
    this.refs.treeStructurePanel.calculateJSONStructure();
    //this.refs.jsonResultPanel.calculateJSONResult();
  }
});

module.exports = Main;