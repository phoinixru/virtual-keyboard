import { elt } from './utils.js';
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
};

const LAYOUT = [
  ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace'],
  ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash', 'Delete'],
  ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'],
  ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ArrowUp', 'ShiftRight'],
  ['ControlLeft', 'AltLeft', 'MetaLeft', 'Space', 'MetaRight', 'AltRight', 'ArrowLeft', 'ArrowDown', 'ArrowRight'],
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
    this.container.addEventListener('click', (event) => this.handleClick(event));
  }

  renderKeyboard() {
    const layout = elt('div', { className: CssClasses.LAYOUT });

    layout.append(
      ...LAYOUT.map((keys) => {
        const row = elt('div', { className: CssClasses.ROW });

        row.append(
          ...keys.map((key) => this.renderKey(key)),
        );

        return row;
      }),
    );

    this.container.append(layout);
  }

  renderKey(code) {
    const btnKey = KEYS[code];
    const {
      key, keys, label, icon, isFunctional,
    } = btnKey;
    const { en, ru } = keys || {};

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
    }

    button.classList.add(`${CssClasses.KEY}_${code}`);

    button.innerText = btnLabel;

    this.buttons[code] = button;

    return button;
  }

  handleClick(event) {
    const {
      target,
    } = event;

    if (!target.matches('.key')) {
      return;
    }

    return true;
  }
}
