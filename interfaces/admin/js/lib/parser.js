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

    if(index[src].reference) var ref = `<p class="caption reference "> ${index[src].reference.html || index[src].reference.text}</p>`;
    else var ref = '';


    switch (index[src].kind) {

      case "link":
        return  `<p class="resource-item ${index[src].type} ${index[src].kind}">${index[src].html}</p>`;

      case "image":
        if(index[src].internal){
          // WORKS ONLY FOR AIME—INQUIRY UPLOADED IMAGES
          const rawfilename = index[src].filename.slice(0, -4);
          var imgsrc = config.imageUrl + rawfilename +"/710x710-" + index[src].filename;
        }else{
          var imgsrc = index[src].url;
        }

        return  `<div class="resource-item ${index[src].type} ${index[src].kind}">
                  <img src="${imgsrc}">
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
