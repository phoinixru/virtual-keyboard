import { elt } from './utils.js';

const CssClasses = {
  BLOCK: 'textarea',
};

export default class Textarea {
  constructor({ focused = true } = {}) {
    this.focused = focused;
    this.element = elt('textarea', { className: CssClasses.BLOCK, autofocus: true });

    this.addEventHandlers();
  }

  addEventHandlers() {
    document.body.addEventListener('keydown', (event) => this.handleKeyDown(event), true);
  }

  handleKeyDown(event) {
    const {
      key, altKey, ctrlKey, metaKey,
    } = event;
    const specialKeys = altKey || ctrlKey || metaKey;

    if (specialKeys) {
      return;
    }

    event.preventDefault();

    if (key.length > 1) {
      this.handleSpecialKeys(event);
    } else {
      this.addChar(key);
    }

    this.focus();
  }

  addChar(char) {
    const { element } = this;

    element.setRangeText(char);
    element.selectionStart += 1;
  }

  focus() {
    this.element.focus();
  }

  handleSpecialKeys(event) {
    const { key } = event;

    if (key.startsWith('Arrow')) {
      this.moveCursor(event);
    }
  }

  moveCursor(event) {
    const { key } = event;
    const { element } = this;

    if (key === 'ArrowLeft') {
      if (element.selectionStart > 0) {
        element.selectionStart -= 1;
      }
      element.selectionEnd = element.selectionStart;
    }

    if (key === 'ArrowRight') {
      element.selectionEnd += 1;
      element.selectionStart = element.selectionEnd;
    }
  }
}
