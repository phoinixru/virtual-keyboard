import { elt, assign } from './utils.js';
import KEYS from './keys.js';

const CssClasses = {
  BLOCK: 'keyboard',
  LAYOUT: 'keyboard__layout',
  ROW: 'keyboard__row',
  KEY: 'key',
  KEY_FUNCTIONAL: 'key_functional',
  KEY_ARROW: 'key_arrow',
  KEY_ICON: 'key_icon',
  KEY_LEFT: 'key_left',
  KEY_RIGHT: 'key_right',
  KEY_PRESSED: 'key_pressed',
};

const LAYOUT = [
  ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace'],
  ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash', 'Delete'],
  ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'],
  ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ArrowUp', 'ShiftRight'],
  ['ControlLeft', 'AltLeft', 'MetaLeft', 'Space', 'MetaRight', 'AltRight', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'ControlRight'],
];

export default class VirtualKeyboard {
  constructor() {
    this.container = elt('div', { className: CssClasses.BLOCK });
    this.buttons = {};
    this.lang = 'en';

    this.renderKeyboard();
    this.addEventListeners();
  }

  addEventListeners() {
    this.container.addEventListener('mousedown', (event) => this.handleMouseEvents(event));
    this.container.addEventListener('mouseup', (event) => this.handleMouseEvents(event));

    document.body.addEventListener('keydown', (event) => this.handleKeyDown(event));
    document.body.addEventListener('keyup', (event) => this.handleKeyUp(event));
  }

  renderKeyboard() {
    const layout = elt('div', { className: CssClasses.LAYOUT });

    const key = (key) => this.renderKey(key);
    const row = (keys) => elt('div', { className: CssClasses.ROW }, ...keys.map(key));

    layout.append(...LAYOUT.map(row));

    this.container.append(layout);
  }

  renderKey(code) {
    const btnKey = KEYS[code];
    const {
      key, keys, label = '', icon = '', isFunctional,
    } = btnKey;
    const { en, ru } = keys || {};
    const dataset = { code };

    const btnLabel = label || (en && en[0]) || code;

    const button = elt('button', { className: CssClasses.KEY });

    if (isFunctional) {
      button.classList.add(CssClasses.KEY_FUNCTIONAL);
    }

    if (code.match('Arrow')) {
      button.classList.add(CssClasses.KEY_ARROW);
    } else {
      if (code.match('Left')) {
        button.classList.add(CssClasses.KEY_LEFT);
      }

      if (code.match('Right')) {
        button.classList.add(CssClasses.KEY_RIGHT);
      }
    }

    if (icon) {
      button.classList.add(CssClasses.KEY_ICON);
      assign(dataset, { icon });
    }

    button.classList.add(`${CssClasses.KEY}_${code}`);

    assign(dataset, { label: btnLabel });
    assign(button.dataset, dataset);

    this.buttons[code] = button;

    return button;
  }

  handleMouseEvents(event) {
    const { target, button, type } = event;

    if (!target.matches('.key') || button) {
      return;
    }

    const { code } = target.dataset;
    const isPressed = type === 'mousedown';

    this.togglePressed(code, isPressed);

    if (type === 'mousedown') {
      document.addEventListener('mouseup', () => {
        this.togglePressed(code, false);
      }, { once: true });

      this.dispatchKeyboardEvent(code);
    }
  }

  handleKeyDown(event) {
    this.togglePressed(event.code, true);
  }

  handleKeyUp(event) {
    this.togglePressed(event.code, false);
  }

  togglePressed(code, isPressed = false) {
    const button = this.buttons[code];

    if (button) {
      button.classList.toggle(CssClasses.KEY_PRESSED, isPressed);
    }
  }

  dispatchKeyboardEvent(code) {
    const { key, keys, isFunctional } = KEYS[code];
    const { lang, isCapsLocked, isShiftPressed } = this;
    const shifted = isCapsLocked || isShiftPressed ? 1 : 0;
    let eventKey;

    if (isFunctional) {
      eventKey = key;
    } else {
      eventKey = key || keys[lang][shifted];
    }

    const event = new KeyboardEvent('keydown', {
      code, key: eventKey
    });

    console.log(event);
    document.body.dispatchEvent(event);
  }
}
