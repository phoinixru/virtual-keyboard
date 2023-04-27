import { elt } from './assets/js/utils.js';
import Textarea from './assets/js/textarea.js';

const CssClasses = {
  WRAPPER: 'wrapper',
};

function init() {
  const textarea = new Textarea();

  const wrapper = elt('div', { className: CssClasses.WRAPPER });
  wrapper.append(textarea.element);

  document.body.append(wrapper);
}

window.addEventListener('load', init);
