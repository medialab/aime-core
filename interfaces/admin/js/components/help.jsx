/**
 * AIME-admin Help popu
 * ==========================
 *
 * Display some help
 */
import React from 'react';
import PureComponent from '../lib/pure.js';
import {Layout} from './layout.jsx';
import {
  Row,
  Col
} from 'react-flexbox-grid';
import PropTypes from 'baobab-react/prop-types';


/**
 * Main component
 */
export default class Help extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  render() {

    const toogleHelp = () => {
      this.context.tree.emit('help:toogle');
    };

    return <div className="help-box">

        <Row>
          <Col md={11} ><h1>help</h1></Col>
          <Col md={1} >

          <button type="button" className="btn btn-default" aria-label="Left Align" onClick={toogleHelp}>
            <span className="glyphicon glyphicon-remove-circle" aria-hidden="true" />
          </button>
          </Col>


        </Row>

         <hr/>
        <Row>
          <Col md={5} ><pre>un **texte en gras**</pre> </Col>
          <Col md={7} className="render" >un <strong>texte en gras</strong></Col>
        </Row>

        <Row>
          <Col md={5} ><pre>un *texte en italique*</pre> </Col>
          <Col md={7} className="render" >un <em>texte en italique</em></Col>
        </Row>

        <hr/>

        <Row>
          <Col md={5} ><pre ><span className="cm-tag">![media]</span><span className="cm-string">(res_3240)</span></pre></Col>
          <Col md={7} className="preview">
            <div className="resource-item media pdf">
              <p className="caption reference "><span className="Z3988" title="rft.pub=University+of+Chicago+Press&amp;rft_val_fmt=info%3Aofi%2Ffmt%3Akev%3Amtx%3Abook&amp;rft.spage=275&amp;rft.epage=297&amp;rft.place=Chicago&amp;rft.date=2011&amp;rft.btitle=Switching+Codes.+Thinking+Through+Digital+Technology+in+the+Humanities+and+the+Arts&amp;rft.atitle=The+Migration+of+the+Aura+%E2%80%93+or+How+to+Explore+the+Original+Through+Its+Facsimiles&amp;ctx_ver=Z39.88-2004&amp;rft.genre=book"></span><span className="creator">Latour, Bruno</span>, and <span className="creator">Adam Lowe</span>. "<span className="title">The Migration of the Aura – or How to Explore the Original Through Its Facsimiles</span>." (…)</p>
            </div>
          </Col>
        </Row>

        <hr/>

        <Row>
          <Col md={5} ><pre>slide 1<br/><br/>---<br/><br/>slide 2<br/></pre></Col>
          <Col md={7} ><code>---</code> est un séparerateur de sildes</Col>
        </Row>

        <hr/>

        <Row>
          <Col md={5} ><pre>de [FIC] et de [MET]</pre></Col>
          <Col md={7} >déclarer un mode</Col>
        </Row>
    </div>
  }
}
