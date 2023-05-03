import { elt } from './assets/js/utils.js';
import Textarea from './assets/js/textarea.js';
import VirtualKeyboard from './assets/js/keyboard.js';

const CssClasses = {
  WRAPPER: 'wrapper',
};

function init() {
  const textarea = new Textarea();
  const keyboard = new VirtualKeyboard();

  const wrapper = elt('div', { className: CssClasses.WRAPPER });

  wrapper.append(
    textarea.element,
    keyboard.container,
  );

  document.body.append(wrapper);
}

window.addEventListener('load', init);
