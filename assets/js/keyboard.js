import { elt, assign } from './utils.js';
import KEYS from './keys.js';

const CssClasses = {
  BLOCK: 'keyboard',
  CREATED: 'keyboard__created',
  LAYOUT: 'keyboard__layout',
  ROW: 'keyboard__row',
  CAPS_LOCKED: 'keyboard_caps_locked',
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

const LANGUAGE = {
  FIRST: 'en',
  SECOND: 'ru',
};

const CREATED_IN_TEXT = 'Keyboard created in MacOS';

const REPEAT_KEYS_DEFAULT = true;
const REPEAT_KEYS_DELAY = 500;
const REPEAT_KEYS_INTERVAL = 100;

export default class VirtualKeyboard {
  constructor({ repeatKeys = REPEAT_KEYS_DEFAULT } = {}) {
    this.container = elt('div', { className: CssClasses.BLOCK });
    this.buttons = {};
    this.lang = 'en';
    this.isCapsLocked = false;
    this.isShiftPressed = false;
    this.repeatKeys = repeatKeys;

    this.renderKeyboard();
    this.addCreatedClause();
    this.addEventListeners();
  }

  addEventListeners() {
    this.container.addEventListener('mousedown', (event) => this.handleMouseEvents(event));
    this.container.addEventListener('mouseup', (event) => this.handleMouseEvents(event));

    document.body.addEventListener('keydown', (event) => this.handleKeyboardEvents(event));
    document.body.addEventListener('keyup', (event) => this.handleKeyboardEvents(event));
  }

  addCreatedClause() {
    this.container.append(
      elt('p', {
        className: CssClasses.CREATED,
      }, CREATED_IN_TEXT),
    );
  }

  renderKeyboard() {
    const layout = elt('div', { className: CssClasses.LAYOUT });

    const key = (code) => this.renderKey(code);
    const row = (keys) => elt('div', { className: CssClasses.ROW }, ...keys.map(key));

    layout.append(...LAYOUT.map(row));

    this.container.append(layout);
  }

  renderKey(code) {
    const btnKey = KEYS[code];
    const {
      keys, label = '', icon = '', isFunctional,
    } = btnKey;

    const dataset = { code };

    const button = elt('button', { className: CssClasses.KEY });

    if (code === 'CapsLock') {
      button.append(elt('i'));
    }

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

    const {
      [LANGUAGE.FIRST]: firstLang = [],
      [LANGUAGE.SECOND]: secondLang = [],
    } = keys || {};

    const [mainKey, auxKey] = firstLang;
    const [slMainKey, slAuxKey] = secondLang;

    if (mainKey) {
      assign(dataset, {
        mainKey, auxKey, slMainKey, slAuxKey,
      });
    } else {
      assign(dataset, { label: label || code });
    }

    button.classList.add(`${CssClasses.KEY}_${code}`);
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
      this.handleMouseDown(code);
    }

    if (code === 'CapsLock') {
      this.setCapsLock(event);
    }
  }

  handleMouseDown(code) {
    const dispatch = () => this.dispatchKeyboardEvent(code);

    let repeatKeysDelay, repeatKeysInterval;
    
    if (this.repeatKeys) {
      repeatKeysDelay = setTimeout(() => {
        dispatch();
        repeatKeysInterval = setInterval(dispatch, REPEAT_KEYS_INTERVAL)
      }, REPEAT_KEYS_DELAY);
    }

    document.addEventListener('mouseup', () => {
      this.togglePressed(code, false);

      clearInterval(repeatKeysDelay);
      clearInterval(repeatKeysInterval);
    }, { once: true });

    dispatch();
  }

  handleKeyboardEvents(event) {
    if (event.type === 'keydown') {
      this.handleKeyDown(event);
    } else {
      this.handleKeyUp(event);
    }

    if (event.code === 'CapsLock') {
      this.setCapsLock(event);
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
    let eventKey;

    if (isFunctional || key) {
      eventKey = key;
    } else {
      const [mainKey, auxKey] = keys[lang];

      if (
        isShiftPressed
        || (isCapsLocked && code.startsWith('Key'))
      ) {
        eventKey = auxKey;
      } else {
        eventKey = mainKey;
      }
    }

    const event = new KeyboardEvent('keydown', {
      code, key: eventKey,
    });

    document.body.dispatchEvent(event);
  }

  setCapsLock(event) {
    const { isTrusted, type } = event;

    if (!isTrusted) {
      return;
    }

    if (type.match('key')) {
      this.isCapsLocked = event.getModifierState('CapsLock');
    }

    if (type === 'mousedown') {
      this.isCapsLocked = !this.isCapsLocked;
    }

    this.container.classList.toggle(CssClasses.CAPS_LOCKED, this.isCapsLocked);
  }
}
