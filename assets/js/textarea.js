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
    const { isTrusted, key } = event;
    event.preventDefault();

    if (isTrusted) {
      return;
    }

    if (key.length > 1) {
      this.handleSpecialKeys(event);
    } else {
      this.addChar(key);
    }

    setTimeout(() => this.focus(), 1);
  }

  addChar(char) {
    const { element } = this;

    element.setRangeText(char);
    element.selectionStart += 1;
  }

  deleteSelection(count = -1) {
    const { element } = this;
    const { selectionStart, selectionEnd } = element;

    if (selectionStart === selectionEnd) {
      if (count < 0) {
        element.selectionStart = Math.max(selectionStart + count, 0);
      } else {
        element.selectionEnd += count;
      }
    }
    element.setRangeText('');
  }

  focus() {
    this.element.focus();
  }

  handleSpecialKeys(event) {
    const { key } = event;

    if (key.startsWith('Arrow')) {
      this.moveCursor(event);
    }

    if (key === 'Delete') {
      this.deleteSelection(1);
    }

    if (key === 'Backspace') {
      this.deleteSelection(-1);
    }

    if (key === 'Tab') {
      this.addChar('\t');
    }

    if (key === 'Enter') {
      this.addChar('\n');
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
