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

  var index = tree.facets.resIndex.get();

  console.log(index[src]);


  if(index[src].type === "media") {

    var ref = index[src].reference ? `<p class="caption reference "> ${index[src].reference.html || index[src].reference.text}</p>` : '';

    switch (index[src].kind) {

      case "link":
        return  `<div class="resource-item ${index[src].type}
                  <p>${index[src].kind}">${index[src].html}</p>
                  ${ref}
                </div>`;

      case "image":

      var imgsrc = index[src].internal ? `<img src="${config.imageUrl}${index[src].filename.replace(/\.[^/.]+$/, "")}/710x710${index[src].filename}" />` : index[src].html

        return  `<div class="resource-item ${index[src].type} ${index[src].kind}">
                  ${imgsrc}
                  ${ref}
                </div>
                `;

      case "pdf":
        return  `<div class="resource-item ${index[src].type} ${index[src].kind}">
                  ${index[src].html || index[src].title }
                  ${ref}
                </div>`;

      case "quote":
        return `<div class="resource-item ${index[src].type} ${index[src].kind}">
                  <p>${index[src].text}</p>
                  ${ref}
                </div>`;

      case "rich":
        return `<div class="resource-item ${index[src].type} ${index[src].kind}">
                 ${index[src].html}
                 ${ref}
                </div>`;

      case "video":
        return `<div class="resource-item ${index[src].type} ${index[src].kind} ${index[src].host}">
                  ${index[src].iframe || index[src].html}
                  ${ref}
                </div>`;

      default:
        return `<p class="resource-item ${index[src].type}">res_${index[src].type}</p>`;
    }
  }
  if(index[src].type === "reference"){
    return `<p class="resource-item ${index[src].type} ">${index[src].text}</p>`;
  }

  return `<p class="resource-item ${index[src].type} ${index[src].kind} ">
            ${index[src].type}_${index[src].slug_id}
          </p>`;
};

/**
 * Creating the function
 */
export default parser(renderer);
