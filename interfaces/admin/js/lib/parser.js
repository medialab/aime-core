/**
 * AIME-admin Parser
 * ==================
 *
 * The custom markdown parser able to check some data about the given string
 * as well as rendering it correctly.
 */
import {Renderer} from 'marked';
import parser from '../../../../lib/abstract_parser.js';
import tree from '../tree.js';
import config from '../../config.json';

/**
 * Custom renderer
 */
const renderer = new Renderer();

renderer.paragraph = function(txt, docs=[]) {
  let renderedTxt = txt;

  docs.forEach(function(doc, i) {
    renderedTxt = renderedTxt.replace(doc, `<span class="document-item">${i}</span>`);
  });

  renderedTxt = renderedTxt.replace(/[{}]/g, '');

  return `<p>${renderedTxt}</p>`;
};

renderer.link = function(href, title, text) {
  return `<span class="vocabulary-item">${text}</span>`;
};

renderer.image = function(src) {

  var index = tree.facets.resIndex.get(),
      res = index[src];


  if(res.type === "media") {

    var ref = res.reference
              ? `<p class="caption reference ">${res.reference.html || res.reference.text}</p>` : '';

    switch (res.kind) {

      case "link":
        return  `<div class="resource-item ${res.type}
                  <p>${res.kind}">${res.html}</p>
                  ${ref}
                </div>`;

      case "image":

      var imgsrc = res.internal ?
                  `<img src="${config.api}/resources/images/${res.path}" />`
                  : res.html

        return  `<div class="resource-item ${res.type} ${res.kind}">
                  ${imgsrc}
                  ${ref}
                </div>
                `;

      case "pdf":
        return  `<div class="resource-item ${res.type} ${res.kind}">
                  ${res.html || res.title }
                  ${ref}
                </div>`;

      case "quote":
        return `<div class="resource-item ${res.type} ${res.kind}">
                  <p>${res.text}</p>
                  ${ref}
                </div>`;

      case "rich":
        return `<div class="resource-item ${res.type} ${res.kind}">
                 ${res.html}
                 ${ref}
                </div>`;

      case "video":
        return `<div class="resource-item ${res.type} ${res.kind} ${res.host}">
                  ${res.iframe || res.html}
                  ${ref}
                </div>`;

      default:
        return `<p class="resource-item ${res.type}">res_${res.type}</p>`;
    }
  }
  if(res.type === "reference"){
    return `<p class="resource-item ${res.type} ">${res.text}</p>`;
  }

  return `<p class="resource-item ${res.type} ${res.kind} ">
            ${res.type}_${res.slug_id}
          </p>`;
};

/**
 * Creating the function
 */
export default parser(renderer);
