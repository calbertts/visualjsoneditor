var React = require('react');
//var Dialog = require('../dialog/dialog.jsx');

var TreeContainer = React.createClass(
{
  propTypes: {
  },

  generateTree(data)
  {
      treeData = data;

      // Calculate total nodes, max label length
      var totalNodes = 0;
      var maxLabelLength = 0;

      // variables for drag/drop
      var selectedNode = null;
      var draggingNode = null;

      // panning variables
      var panSpeed = 200;
      var panBoundary = 20; // Within 20px from edges will pan when dragging.
      
      // Misc. variables
      var i = 0;
      var duration = 750;
      var root;

      // size of the diagram
      var viewerWidth = $(document).width();
      var viewerHeight = $(document).height();

      var tree = d3.layout.tree()
          .size([viewerHeight, viewerWidth]);

      // define a d3 diagonal projection for use by the node paths later on.
      var diagonal = d3.svg.diagonal()
          .projection(function(d) {
              return [d.y, d.x];
          });

      // A recursive helper function for performing some setup by walking through all nodes

      function visit(parent, visitFn, childrenFn) {
          if (!parent) return;

          visitFn(parent);

          var children = childrenFn(parent);
          if (children) {
              var count = children.length;
              for (var i = 0; i < count; i++) {
                  visit(children[i], visitFn, childrenFn);
              }
          }
      }

      // Call visit function to establish maxLabelLength
      visit(treeData, function(d) {
          totalNodes++;
          var dValue = (d.value != undefined) ? (d.value+"").length : 0;
          maxLabelLength = Math.max(d.name.length + dValue, maxLabelLength);
          maxLabelLength = (maxLabelLength > 20) ? 30 : maxLabelLength;

      }, function(d) {
          return d.children && d.children.length > 0 ? d.children : null;
      });


      // sort the tree according to the node names

      function sortTree() {
          tree.sort(function(a, b) {
              if(a.name.indexOf('[') > -1 || b.name.indexOf('[') > -1)
              {
                var aIndx = parseInt(a.name.replace('[', '').replace(']', ''));
                var bIndx = parseInt(b.name.replace('[', '').replace(']', ''));

                if(!isNaN(aIndx) && !isNaN(bIndx))
                {
                  return bIndx < aIndx ? 1 : -1;
                }
              }

              return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
          });
      }
      // Sort the tree initially incase the JSON isn't in a sorted order.
      sortTree();

      // TODO: Pan function, can be better implemented.

      function pan(domNode, direction) {
          var speed = panSpeed;
          if (panTimer) {
              clearTimeout(panTimer);
              translateCoords = d3.transform(svgGroup.attr("transform"));
              if (direction == 'left' || direction == 'right') {
                  translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                  translateY = translateCoords.translate[1];
              } else if (direction == 'up' || direction == 'down') {
                  translateX = translateCoords.translate[0];
                  translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
              }
              scaleX = translateCoords.scale[0];
              scaleY = translateCoords.scale[1];
              scale = zoomListener.scale();
              svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
              d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
              zoomListener.scale(zoomListener.scale());
              zoomListener.translate([translateX, translateY]);
              panTimer = setTimeout(function() {
                  pan(domNode, speed, direction);
              }, 50);
          }
      }

      // Define the zoom function for the zoomable tree

      function zoom() {
          svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      }


      // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
      var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

      function initiateDrag(d, domNode) {
          d3.selectAll(".ghostCircle")
              .data(nodes, function(circle) {
                  //console.log(1);
                  console.log(circle)
              })

          draggingNode = d;
          d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
          d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
          d3.select(domNode).attr('class', 'node activeDrag');

          svgGroup.selectAll("g.node").sort(function(a, b) { // select the parent and sort the path's
              if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
              else return -1; // a is the hovered element, bring "a" to the front
          });
          // if nodes has children, remove the links and nodes
          if (nodes.length > 1) {
              // remove link paths
              links = tree.links(nodes);
              nodePaths = svgGroup.selectAll("path.link")
                  .data(links, function(d) {
                      return d.target.id;
                  }).remove();
              // remove child nodes
              nodesExit = svgGroup.selectAll("g.node")
                  .data(nodes, function(d) {
                      return d.id;
                  }).filter(function(d, i) {
                      if (d.id == draggingNode.id) {
                          return false;
                      }
                      return true;
                  }).remove();
          }

          // remove parent link
          parentLink = tree.links(tree.nodes(draggingNode.parent));
          svgGroup.selectAll('path.link').filter(function(d, i) {
              if (d.target.id == draggingNode.id) {
                  return true;
              }
              return false;
          }).remove();

          dragStarted = null;
      }

      // define the baseSvg, attaching a class for styling and the zoomListener
      var baseSvg = d3.select("#tree-container").append("svg")
          .attr("width", viewerWidth)
          .attr("height", viewerHeight)
          .attr("class", "overlay")
          .call(zoomListener);

          var self = this;
      // Define the drag listeners for drag/drop behaviour of nodes.
      dragListener = d3.behavior.drag()
          .on("dragstart", function(d) {
              if (d == root || (d.type === 'property' && d.parent.type === 'item' && !('value' in d))) {
                  return;
              }
              dragStarted = true;
              nodes = tree.nodes(d);
              d3.event.sourceEvent.stopPropagation();
              // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
          })
          .on("drag", function(d) {
              if (d == root) {
                  return;
              }
              if (dragStarted) {
                  domNode = this;
                  initiateDrag(d, domNode);
              }

              // get coords of mouseEvent relative to svg container to allow for panning
              relCoords = d3.mouse($('svg').get(0));
              if (relCoords[0] < panBoundary) {
                  panTimer = true;
                  pan(this, 'left');
              } else if (relCoords[0] > ($('svg').width() - panBoundary)) {

                  panTimer = true;
                  pan(this, 'right');
              } else if (relCoords[1] < panBoundary) {
                  panTimer = true;
                  pan(this, 'up');
              } else if (relCoords[1] > ($('svg').height() - panBoundary)) {
                  panTimer = true;
                  pan(this, 'down');
              } else {
                  try {
                      clearTimeout(panTimer);
                  } catch (e) {

                  }
              }

              d.x0 += d3.event.dy;
              d.y0 += d3.event.dx;
              var node = d3.select(this);
              node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
              updateTempConnector();
          }).on("dragend", function(d) {
              if (d == root || (selectedNode !== null && selectedNode.type === 'property' && selectedNode.parent.type === 'item' && !('value' in selectedNode))) {
                  return;
              }
              domNode = this;
              if (selectedNode) {
                  /*console.log("draggingNode: ", draggingNode.type);
                  console.log("selectedNode: ", selectedNode.type);*/

                  // From property to item in an array
                  if(draggingNode.type === 'property' && (selectedNode.type === 'array' || selectedNode.subtype === 'array'))
                  {
                    var index = draggingNode.parent.children.indexOf(draggingNode);

                    var item = {
                      name: '['+(selectedNode.children.length+1)+']',
                      type: 'item',
                      parent: selectedNode,
                      children: []
                    }

                    // Remove from the previous parent
                    var index = draggingNode.parent.children.indexOf(draggingNode);
                    if (index > -1) {
                        draggingNode.parent.children.splice(index, 1);
                    }

                    item.children.push(draggingNode);

                    selectedNode.children.push(item);

                    sortTree();
                    expand(selectedNode);
                    endDrag();

                    return;
                  }

                  else if(draggingNode.type === 'item' && (selectedNode.type === 'property' || selectedNode.type === 'object'))
                  {
                      var resp = prompt("What do you want to do?\n" +
                          "1. Replace the value for: " + selectedNode.name + "\n" +
                          "2. Create a new property");

                      if(resp === '1')
                      {
                          selectedNode.value = undefined;
                          selectedNode._children = null;
                          selectedNode.children = [];
                          selectedNode.type = 'object'

                          selectedNode.children = draggingNode.children;

                          // Remove from the previous parent
                          var index = draggingNode.parent.children.indexOf(draggingNode);
                          if (index > -1) {
                              draggingNode.parent.children.splice(index, 1);
                          }

                          console.log("FINAL -> selectedNode", selectedNode);
                      }

                      else if(resp === '2')
                      {
                          var newPropertyName = prompt("Enter the property's name");
                          draggingNode.name = newPropertyName;

                          console.log("FINAL -> selectedNode", selectedNode);
                      }

                      else
                      {
                          alert("Not an option");
                          return;
                      }

                      sortTree();
                      expand(selectedNode);
                      endDrag();

                      return;
                  }

                  if(selectedNode.type && selectedNode.type === 'array')
                  {
                    if(draggingNode.type && draggingNode.type === 'item')
                    {
                      var name = draggingNode.name;

                      var currentSize;

                      if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                        if (typeof selectedNode.children !== 'undefined') {
                          currentSize = selectedNode.children.length;
                        }
                        else {
                          currentSize = selectedNode._children.length;
                        }
                      }
                      else {
                        currentSize = 0;
                      }

                      var nextItemId = currentSize + 1;

                      name = '[' + nextItemId + ']';

                      draggingNode.name = name;
                      selectedNode.name = selectedNode.name.replace(/\[[0-9]*\]/, name);
                    }

                    console.log(draggingNode, selectedNode);
                  }

                  // now remove the element from the parent, and insert it into the new elements children
                  var index = draggingNode.parent.children.indexOf(draggingNode);
                  if (index > -1) {
                      draggingNode.parent.children.splice(index, 1);
                  }
                  if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                      if (typeof selectedNode.children !== 'undefined') {
                          selectedNode.children.push(draggingNode);
                      } else {
                          if(!selectedNode._children) {
                            selectedNode._children = [];
                          }
                          selectedNode._children.push(draggingNode);
                      }
                  } else {
                      selectedNode.children = [];
                      selectedNode.children.push(draggingNode);
                  }

                  // self.onDropNode(selectedNode, draggingNode);

                  // Make sure that the node being added to is expanded so user can see added node is correctly moved
                  sortTree();
                  expand(selectedNode);
                  endDrag();
              } else {
                  endDrag();
              }
          });

      function endDrag() {
          selectedNode = null;
          d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
          d3.select(domNode).attr('class', 'node');
          // now restore the mouseover event or we won't be able to drag a 2nd time
          d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
          updateTempConnector();
          if (draggingNode !== null) {
              update(root);
              centerNode(draggingNode);
              draggingNode = null;
          }
      }

      // Helper functions for collapsing and expanding nodes.

      function isCollapsed(d)
      {
        return (d._children) ? true : false;
      }

      function isExpanded(d)
      {
        return (d.children) ? true : false;
      }

      function collapse(d) {
          if (d.children) {
              d._children = d.children;
              d._children.forEach(collapse);
              d.children = null;
          }
      }

      function expand(d) {
          if (d._children) {
              d.children = d._children;
              d.children.forEach(expand);
              d._children = null;
          }
      }

      function expandOneLevel(d) {
          if (d._children) {
              d.children = d._children;
              //d.children.forEach(expand);
              d._children = null;
          }
      }

      var overCircle = function(d) {
          selectedNode = d;
          updateTempConnector();
      };
      var outCircle = function(d) {
          selectedNode = null;
          updateTempConnector();
      };

      // Function to update the temporary connector indicating dragging affiliation
      var updateTempConnector = function() {
          var data = [];
          if (draggingNode !== null && selectedNode !== null) {
              // have to flip the source coordinates since we did this for the existing connectors on the original tree
              data = [{
                  source: {
                      x: selectedNode.y0,
                      y: selectedNode.x0
                  },
                  target: {
                      x: draggingNode.y0,
                      y: draggingNode.x0
                  }
              }];
          }
          var link = svgGroup.selectAll(".templink").data(data);

          link.enter().append("path")
              .attr("class", "templink")
              .attr("d", d3.svg.diagonal())
              .attr('pointer-events', 'none');

          link.attr("d", d3.svg.diagonal());

          link.exit().remove();
      };

      // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

      function centerNode(source) {
          scale = zoomListener.scale();
          x = -source.y0;
          y = -source.x0;
          x = x * scale + viewerWidth / 2;
          y = y * scale + viewerHeight / 2;
          d3.select('g').transition()
              .duration(duration)
              .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
          zoomListener.scale(scale);
          zoomListener.translate([x, y]);
      }

      // Toggle children function

      function toggleChildren(d) {
          if (d.children) {
              d._children = d.children;
              d.children = null;
          } else if (d._children) {
              d.children = d._children;
              d._children = null;
          }
          return d;
      }

      // Toggle children on click.

      function click(d) {
          if (d3.event.defaultPrevented) return; // click suppressed
          d = toggleChildren(d);
          update(d);
          centerNode(d);
      }

      // Toggle all children on right-click

      function rightClick(d) {
        if (d3.event.defaultPrevented) return false; // right-click suppressed
        
        if(isCollapsed(d))
          expand(d);
        else
          collapse(d);

        update(d);
        centerNode(d);

        return false;
      }

      function update(source) {
          // Compute the new height, function counts total children of root node and sets tree height accordingly.
          // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
          // This makes the layout more consistent.
          var levelWidth = [1];
          var childCount = function(level, n) {

              if (n.children && n.children.length > 0) {
                  if (levelWidth.length <= level + 1) levelWidth.push(0);

                  levelWidth[level + 1] += n.children.length;
                  n.children.forEach(function(d) {
                      childCount(level + 1, d);
                  });
              }
          };
          childCount(0, root);
          var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line  
          tree = tree.size([newHeight, viewerWidth]);

          // Compute the new tree layout.
          var nodes = tree.nodes(root).reverse(),
              links = tree.links(nodes);

          // Set widths between levels based on maxLabelLength.
          nodes.forEach(function(d) {
              d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
              // alternatively to keep a fixed scale one can set a fixed depth per level
              // Normalize for fixed-depth by commenting out below line
              //d.y = (d.depth * 500); //500px per level.
          });

          // Update the nodes…
          node = svgGroup.selectAll("g.node")
              .data(nodes, function(d) {
                  return d.id || (d.id = ++i);
              });

          // Enter any new nodes at the parent's previous position.
          var nodeEnter = node.enter().append("g")
              .call(dragListener)
              .attr("class", "node")
              .attr("transform", function(d) {
                  return "translate(" + source.y0 + "," + source.x0 + ")";
              })
              .on('click', click)
              .on('contextmenu', rightClick);

          //console.log("creating circle", source);
          nodeEnter.append("circle")
              .attr('class', 'nodeCircle')
              .attr("r", 0)
              .style("stroke", function(d) {
                  if(d.type === 'property' && d.parent.type === 'item' && !('value' in d)) {
                      return "rgb(238, 238, 238)";
                  }
              })
              .style("fill", function(d) {
                  if(d.type === 'property' && d.parent.type === 'item' && !('value' in d))
                      return "rgb(238, 238, 238)";
                  else
                      return d._children ? "lightsteelblue" : "#fff";
              })
              .style("stroke-width", function(d) {
                  if(d.type === 'property' && d.parent.type === 'item' && !('value' in d))
                    return '0';
              })
              .style("display", function(d) {
                  return (d.type === 'property' && d.parent.type === 'item' && !('value' in d)) ? 'none' : 'block'
              });

          nodeEnter.append("text")
              .attr("x", function(d) {
                  return d.children || d._children ? -10 : 10;
              })
              .attr("dy", ".35em")
              .attr('class', 'nodeText')
              .attr("text-anchor", function(d) {
                  return d.children || d._children ? "end" : "start";
              })
              .text(function(d) {
                  return d.name;
              })
              .style("fill-opacity", 0);

          // phantom node to give us mouseover in a radius around it
          nodeEnter.append("circle")
              .attr('class', 'ghostCircle')
              .attr("r", 20)
              .attr("opacity", 0.2) // change this to zero to hide the target area
          .style("fill", "red")
              .attr('pointer-events', 'mouseover')
              .on("mouseover", function(node) {
                  overCircle(node);
              })
              .on("mouseout", function(node) {
                  outCircle(node);
              });

          var tmpList = {};

          // Update the text to reflect whether node has children or not.
          node.select('text')
              .attr("x", function(d) {
                  return d.children || d._children ? -10 : 10;
              })
              .attr("text-anchor", function(d) {
                  return d.children || d._children ? "end" : "start";
              })
              .html(function(d) {
                  //console.log(arguments);
                  var label = d.name;

                  var getColorDataType = function(value) {
                    if(value == 'null')
                      return '#eeee';

                    switch(value.constructor) {
                      case Boolean: return '#196CA2';
                      case String: return '#B13636';
                      case Number: return 'green';
                      case Array: return 'gray';
                    }
                  };

                  if(d.value != undefined)
                  {
                    var value = (d.value.length > 20) ? d.value.substring(0, 17) + "..." : d.value;

                    label = d.name + ' : ' + '<tspan style="fill: ' + getColorDataType(value) + '">' + value + '</tspan>';
                  }

                  else if(d.parent && d.parent.type && d.parent.type === 'item' && d.value === undefined && d.children === undefined)
                  {
                    var name = d.name === 'true' ? true : (d.name === 'false' ? false : (!isNaN(d.name)) ? parseInt(d.name) : d.name);

                    label = '<tspan style="fill: ' + getColorDataType(name) + '">' + name + '</tspan>';
                  }

                  if((d.type && d.type === 'array') || (d.subtype && d.subtype === 'array'))
                  {
                    var length = (d.children) ? d.children.length : (d._children) ? d._children.length : 0;
                    label += '<tspan style="fill: #666"> :['+ length +']</tspan>';

                    if(!tmpList[d.id])
                    {
                      tmpList[d.id] = length + 1;
                    }
                  }

                  if(d.type && d.type === 'item')// && ((d.subtype && d.subtype !== 'array') || !d.subtype))
                  {
                    if(!tmpList[d.parent.id])
                    {
                      var length = (d.parent.children) ? d.parent.children.length : (d.parent._children) ? d.parent._children.length : 0;
                      tmpList[d.parent.id] = length + 1;
                    }

                    tmpList[d.parent.id] = tmpList[d.parent.id] - 1;
                    label = '['+ tmpList[d.parent.id] +']';

                    /** to test */
                    if(d.subtype && d.subtype === 'array')
                    {
                      var length = (d.children) ? d.children.length : (d._children) ? d._children.length : 0;
                      label += '<tspan style="fill: #666"> :['+ length +']</tspan>';

                      if(!tmpList[d.id])
                      {
                        tmpList[d.id] = length + 1;
                      }
                    }
                  }

                  return (d.value) ? "<title>"+d.value+"</title>" + label : label;
              });

          // Change the circle fill depending on whether it has children and is collapsed
          node.select("circle.nodeCircle")
              .attr("r", 4.5)
              .style("fill", function(d) {
                  if(d.type === 'property' && d.parent.type === 'item' && !('value' in d))
                      return "rgb(238, 238, 238)";
                  else
                      return d._children ? "lightsteelblue" : "#fff";
              });

          // Transition nodes to their new position.
          var nodeUpdate = node.transition()
              .duration(duration)
              .attr("transform", function(d) {
                  return "translate(" + d.y + "," + d.x + ")";
              });

          // Fade the text in
          nodeUpdate.select("text")
              .style("fill-opacity", 1);

          // Transition exiting nodes to the parent's new position.
          var nodeExit = node.exit().transition()
              .duration(duration)
              .attr("transform", function(d) {
                  return "translate(" + source.y + "," + source.x + ")";
              })
              .remove();

          nodeExit.select("circle")
              .attr("r", 0);

          nodeExit.select("text")
              .style("fill-opacity", 0);

          // Update the links…
          var link = svgGroup.selectAll("path.link")
              .data(links, function(d) {
                  return d.target.id;
              });

          // Enter any new links at the parent's previous position.
          link.enter().insert("path", "g")
              .attr("class", "link")
              .attr("d", function(d) {
                  var o = {
                      x: source.x0,
                      y: source.y0
                  };
                  return diagonal({
                      source: o,
                      target: o
                  });
              });

          // Transition links to their new position.
          link.transition()
              .duration(duration)
              .attr("d", diagonal);

          // Transition exiting nodes to the parent's new position.
          link.exit().transition()
              .duration(duration)
              .attr("d", function(d) {
                  var o = {
                      x: source.x,
                      y: source.y
                  };
                  return diagonal({
                      source: o,
                      target: o
                  });
              })
              .remove();

          // Stash the old positions for transition.
          nodes.forEach(function(d) {
              d.x0 = d.x;
              d.y0 = d.y;
          });
      }

      // Append a group which holds all nodes and which the zoom Listener can act upon.
      var svgGroup = baseSvg.append("g");

      // Define the root
      root = treeData;
      root.x0 = viewerHeight / 2;
      root.y0 = 0;

      // Layout the tree initially and center on the root node.
      update(root);
      centerNode(root);
      
      collapse(root);
      expandOneLevel(root);
      update(root);
      centerNode(root);
  },

  componentDidMount()
  {
    try
    {
      if(localStorage && localStorage.structure)
      {
          var data = JSON.parse(localStorage.structure);
          this.generateTree(this.fromJSONToStructure(data));
      }
    }
    catch(e)
    {
      console.log("Problem parsing JSON");
    }
  },

  render()
  {
    return (
      <div id="tree-container">
          {/*<Dialog ref="dialog" options={["Option 1", "Option 2", "Option 3"]} />*/}
      </div>
    );
  },

  onDropNode(newParent, node)
  {
  	if(this.props.onChangeTreeStructure)
  	{
  		this.props.onChangeTreeStructure(node);
  	}
  },

  fromJSONToStructure(obj)
  {
    var treeData = {
      name: 'Root',
      children: [
      ]
    };

    var fn = function(list, obj)
    {
      try
      {
        if(obj !== null)
        {
          if(obj.constructor === Array)
          {
            for(var i=0; i<obj.length; i++)
            {
              var index = (i+1);

              var item = {
                name: '['+index+']',
                type: 'item',
                children: []
              }

              if(obj[i] && obj[i].constructor === Array)
              {
                item.subtype = 'array';
              }

              list.push(item);
              fn(item.children, obj[i]);
            }
          }
          else if(obj.constructor === Object)
          {
            for(var prop in obj)
            {
              if(obj[prop] !== null && (obj[prop].constructor === Object || obj[prop].constructor === Array))
              {
                var property;

                if(obj[prop].constructor === Array)
                {
                  property = {
                    name: prop,
                    type: 'array',
                    children: []
                  }
                }
                else if(obj[prop].constructor === Object)
                {
                  property = {
                    name: prop + '',
                    type: 'object',
                    children: []
                  }
                }

                list.push(property);
                fn(property.children, obj[prop]);
              }
              else
              {
                var property = {
                  name: prop + '',
                  type: 'property',
                  value: obj[prop]
                };

                list.push(property);
              }
            }
          }
          else
          {
            property = {
              name: obj + '',
              type: 'property'
            }

            list.push(property);
          }
        }
        else
        {
          property = {
            name: obj + '',
            type: 'property'
          }

          list.push(property);
        }
      }
      catch(e)
      {
        console.log(e);
      }
    };

    fn(treeData.children, obj);
    return treeData;
  }
});

module.exports = TreeContainer;