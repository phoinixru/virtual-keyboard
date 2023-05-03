import { elt } from './utils.js';

const CssClasses = {
  BLOCK: 'textarea',
};

const ARROWS = {
  ArrowLeft: '←',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowRight: '→',
};

export default class Textarea {
  constructor({ focused = true } = {}) {
    this.focused = focused;
    this.element = elt('textarea', { className: CssClasses.BLOCK, autofocus: true });

    this.addEventHandlers();
  }

  addEventHandlers() {
    document.addEventListener('keydown', (event) => this.handleKeyDown(event), true);
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

  addArrow(event) {
    const { key } = event;
    this.addChar(ARROWS[key]);
  }

  moveCursor(event) {
    const { key } = event;
    const { element } = this;
    const keyDirection = key.replace('Arrow', '');

    const granularity = ['Up', 'Down'].includes(keyDirection) ? 'line' : 'character';
    const direction = ['Left', 'Up'].includes(keyDirection) ? 'backward' : 'forward';

    element.selectionStart = element.selectionEnd;

    const selection = window.getSelection();
    selection.modify('move', direction, granularity);
  }
}
