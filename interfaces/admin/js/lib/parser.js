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

  if(index[src].type === "media") {

    switch (index[src].kind) {

      case "html":
        return  `<p class="resource-item ${index[src].type} ${index[src].kind}">${index[src].html}</p>`;

      case "image":
        if(index[src].internal){
          // WORKS ONLY FOR AIME—INQUIRY UPLOADED IMAGES
          const rawfilename = index[src].filename.slice(0, -4);
          var imgsrc = config.imageUrl + rawfilename +"/710x710-" + index[src].filename;
        }else{
          var imgsrc = index[src].url;
        }

        if(index[src].reference)  var refsrc = `<p class="caption">${index[src].reference.html}</p>`;
        else  var refsrc = "";

        return  `<div class="resource-item ${index[src].type} ${index[src].kind}">
                  <img src="${imgsrc}">
                  ${refsrc}
                </div>
                `;

      case "pdf":
        return  `<p class="resource-item ${index[src].type} ${index[src].kind}">
                  ${index[src].title}, ${index[src].reference.html}
                </p>`;

      case "quote":
        return `<p class="resource-item ${index[src].type} ${index[src].kind}">
                  ${index[src].text}
                </p>`;

      case "rich":
        return `<p class="resource-item ${index[src].type} ${index[src].kind}">
                 ${index[src].html}
                </p>`;

      case "video":
        return `<p class="resource-item ${index[src].type} ${index[src].kind} ${index[src].host}">
                  ${index[src].iframe || index[src].html}
                </p>`;

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
