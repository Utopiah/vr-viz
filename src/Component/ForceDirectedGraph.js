import React, { Component } from 'react';
import * as AFRAME from 'aframe';
import * as d3 from 'd3';

import GetDomain from '../Utils/GetDomain.js';

import { csv } from 'd3-request';
import { json } from 'd3-request';
import { text } from 'd3-request';
import ReadPLY from './ReadPLY.js';


class ForceDirectedGraph extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }


  componentWillMount() {
    if (this.props.data) {
      switch (this.props.data.fileType) {
        case 'json': {
          json(this.props.data.dataFile, (error, data) => {

            if (error) {
              this.setState({
                error: true,
              });
            } else {
              this.setState({
                data: data,
              });
            }
          });
          break;
        }
        case 'csv': {
          csv(this.props.data.dataFile, (error, data) => {
            data = data.map(d => {
              for (let i = 0; i < this.props.data.fieldDesc.length; i++) {
                if (this.props.data.fieldDesc[i][1] === 'number')
                  d[this.props.data.fieldDesc[i][0]] = +d[this.props.data.fieldDesc[i][0]]
              }
              return d
            })
            if (error) {
              this.setState({
                error: true,
              });
            } else {
              this.setState({
                data: data,
              });
            }
          });
          break;
        }
        case 'ply': {
          let data = ReadPLY(this.props.data.dataFile);
          this.setState({
            data: data,
          })
          break;
        }
        case 'text': {
          text(this.props.data.dataFile, (error, text) => {

            let data = d3.csvParseRows(text).map(function (row) {
              return row.map(function (value) {
                return +value;
              });
            });
            if (error) {
              this.setState({
                error: true,
              });
            } else {
              this.setState({
                data: data,
              });
            }
          });
          break;
        }
        default: {
          csv(this.props.data.dataFile, (error, data) => {
            data = data.map(d => {
              for (let i = 0; i < this.props.data.fieldDesc.length; i++) {
                if (this.props.data.fieldDesc[i][1] === 'number')
                  d[this.props.data.fieldDesc[i][0]] = +d[this.props.data.fieldDesc[i][0]]
              }
              return d
            })
            if (error) {
              this.setState({
                error: true,
              });
            } else {
              this.setState({
                data: data,
              });
            }
          });
          break;
        }
      }
    } else {
      this.setState({
        data: 'NA',
      });
    }
  }

  render() {
    if (!this.state.data) {
      return <a-entity />
    }
    else {
    
      let radiusValue = this.props.mark.nodes.style.radius.value, nodeColorValue = this.props.mark.nodes.style.color.fill, ifNodeColorScale = this.props.mark.nodes.style.color.scale, ifLinkColorScale = this.props.mark.links.style.color.scale, ifLinkOpacityScale = this.props.mark.links.style.opacity.scale,ifRadiusScale = this.props.mark.nodes.style.radius.scale, linkColor = this.props.mark.links.style.color.fill, linkOpacity = ifLinkColorScale = this.props.mark.links.style.opacity.value, ifLabel = this.props.mark.labels, labelWidth;

      let nodeType = this.props.mark.nodes.type, labelPadding, scale = this.props.style.scale; 

      

      if(ifLabel){
        labelWidth = this.props.mark.labels.style.size
        labelPadding = this.props.mark.labels.style.padding
      }
      

      // Adding Domain
      let nodeRadiusDomain, linkColorDomain, nodeColorDomain, linkOpacityDomain;

      if (this.props.mark.nodes.style.radius.scale) {
        if (!this.props.mark.nodes.style.radius.domain) {
          nodeRadiusDomain = GetDomain(this.state.data.nodes, this.props.mark.nodes.style.radius.field, this.props.mark.nodes.style.radius.scaleType)
        } else
          nodeRadiusDomain = this.props.mark.nodes.style.radius.domain
      }

      if (this.props.mark.nodes.style.color.scale) {
        if (!this.props.mark.nodes.style.color.domain) {
          nodeColorDomain = GetDomain(this.state.data.nodes, this.props.mark.nodes.style.color.field, this.props.mark.nodes.style.color.scaleType)
        } else
          nodeColorDomain = this.props.mark.nodes.style.color.domain
      }

      if (this.props.mark.links.style.color.scale) {
        if (!this.props.mark.links.style.color.domain) {
          linkColorDomain = GetDomain(this.state.data.link, this.props.mark.links.style.color.field, this.props.mark.links.style.color.scaleType)
        } else
          linkColorDomain = this.props.mark.links.style.color.domain
      }

      if (this.props.mark.links.style.opacity.scale) {
        if (!this.props.mark.links.style.opacity.domain) {
          linkOpacityDomain = GetDomain(this.state.data.link, this.props.mark.links.style.opacity.field, this.props.mark.links.style.opacity.scaleType)
        } else
          linkOpacityDomain = this.props.mark.links.style.opacity.domain
      }




      // Scales

      let nodeRadiusScale, nodeColorScale, linkColorScale, linkOpacityScale;

      if (this.props.mark.nodes.style.radius.scale)
        nodeRadiusScale = d3.scaleLinear()
          .domain(nodeRadiusDomain)
          .range(this.props.mark.nodes.style.radius.value)

      if (this.props.mark.nodes.style.color)
        if (this.props.mark.nodes.style.color.scaleType === 'ordinal')
          nodeColorScale = d3.scaleOrdinal()
            .domain(nodeColorDomain)
            .range(this.props.mark.nodes.style.color.fill)
        else
          nodeColorScale = d3.scaleLinear()
            .domain(nodeColorDomain)
            .range(this.props.mark.nodes.style.color.fill)

      if (this.props.mark.links.style.color)
        if (this.props.mark.links.style.color.type === 'ordinal')
          linkColorScale = d3.scaleOrdinal()
            .domain(linkColorDomain)
            .range(this.props.mark.links.style.color.fill);
        else
          linkColorScale = d3.scaleLinear()
            .domain(linkColorDomain)
            .range(this.props.mark.links.style.color.fill);

      if (this.props.mark.links.style.opacity.scale)
        linkOpacityScale = d3.scaleLinear()
          .domain(linkOpacityDomain)
          .range(this.props.mark.links.style.opacity.value)




      //Graph Coordinates

      let createGraph = require('ngraph.graph');

      let g = createGraph()
      let physicsSettings = { integrator: 'verlet' };

      for (let i = 0; i < this.state.data.nodes.length; i++) {
        let col, r, lab;
        if (this.props.mark.nodes.style.radius.scale)
          r = nodeRadiusScale(this.state.data.nodes[i][this.props.mark.nodes.style.radius.field])
        else
          r = this.props.mark.nodes.style.radius.value
        if (this.props.mark.nodes.style.color.scale)
          col = nodeColorScale(this.state.data.nodes[i][this.props.mark.nodes.style.color.field])
        else
          col = this.props.mark.nodes.style.color.fill
        if (this.props.mark.labels) 
          lab = this.state.data.nodes[i][this.props.mark.labels.field]
        else
          lab = ''
        g.addNode(this.state.data.nodes[i].id, {
          color: col,
          radius: r,
          text: lab
        })
      }


      for (let i = 0; i < this.state.data.links.length; i++) {
        let col, op;
        if (this.props.mark.links.style.opacity.scale)
          op = linkOpacityScale(this.state.data.links[i][this.props.mark.links.style.opacity.field])
        else
          op = this.props.mark.links.style.opacity.value
        if (this.props.mark.links.style.color.scale)
          col = linkColorScale(this.state.data.links[i][this.props.mark.links.style.color.field])
        else
          col = this.props.mark.links.style.color.fill

        g.addLink(this.state.data.links[i].fromId, this.state.data.links[i].toId, {
          color: col,
          opacity: op
        })
      }

      var layout = require('ngraph.forcelayout3d')(g, physicsSettings);

      for (var i = 0; i < 1000; ++i) {
        layout.step();
      }
      let sphere = [], lines = [], label = []
      g.forEachNode((node) => {
        if (nodeType === 'box')
          sphere.push(<a-box color={node.data.color} width={node.data.radius} height={node.data.radius} depth={node.data.radius} position={`${layout.getNodePosition(node.id).x * scale} ${layout.getNodePosition(node.id).y * scale} ${layout.getNodePosition(node.id).z * scale}`} />)
        else
          sphere.push(<a-sphere color={node.data.color} radius={node.data.radius} position={`${layout.getNodePosition(node.id).x * scale} ${layout.getNodePosition(node.id).y * scale} ${layout.getNodePosition(node.id).z * scale}`} />)
        if (ifLabel)
          label.push(<a-text color={node.data.color} width={labelWidth} value={node.data.text} anchor='align' side='double' side='double' align='left' position={`${layout.getNodePosition(node.id).x * scale + node.data.radius / 2 + labelPadding} ${layout.getNodePosition(node.id).y * scale} ${layout.getNodePosition(node.id).z * scale}`} />)
      });
      g.forEachLink((link) => {
        lines.push(<a-entity line={`start: ${layout.getLinkPosition(link.id).from.x * scale}, ${layout.getLinkPosition(link.id).from.y * scale}, ${layout.getLinkPosition(link.id).from.z * scale}; end: ${layout.getLinkPosition(link.id).to.x * scale} ${layout.getLinkPosition(link.id).to.y * scale} ${layout.getLinkPosition(link.id).to.z * scale}; color: ${link.data.color}; opacity: ${link.data.opacity}`} />)
      })
      return (
        <a-entity position = {`${this.props.style.origin[0]} ${this.props.style.origin[1]} ${this.props.style.origin[2]}`}>
          {sphere}
          {lines}
          {label}
        </a-entity>
      );
    }
  }
}
export default ForceDirectedGraph