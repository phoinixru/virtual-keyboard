import { elt, assign, values } from './utils.js';
import KEYS from './keys.js';

const CssClasses = {
  BLOCK: 'keyboard',
  CREATED: 'keyboard__created',
  LANGUAGE: 'keyboard__lang',
  LANGUAGE_DEFAULT: 'keyboard_lang_default',
  LANGUAGE_ALTERNATE: 'keyboard_lang_alternate',
  LAYOUT: 'keyboard__layout',
  ROW: 'keyboard__row',
  CAPS: 'keyboard_caps',
  SHIFT_PRESSED: 'keyboard_shift_pressed',
  SHIFT_STICKY: 'keyboard_shift_sticky',
  KEY: 'key',
  KEY_FUNCTIONAL: 'key_functional',
  KEY_ARROW: 'key_arrow',
  KEY_ICON: 'key_icon',
  KEY_LEFT: 'key_left',
  KEY_RIGHT: 'key_right',
  KEY_PRESSED: 'key_pressed',
  KEY_LETTER: 'key_letter',
  KEY_LETTER_SL: 'key_letter-sl',
};

const LAYOUT = [
  ['Lang', 'Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace'],
  ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash', 'Delete'],
  ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'],
  ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ArrowUp', 'ShiftRight'],
  ['ControlLeft', 'AltLeft', 'MetaLeft', 'Space', 'MetaRight', 'AltRight', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'ControlRight'],
];

const LANGUAGE = {
  FIRST: 'en',
  SECOND: 'ru',
};
const DEFAULT_LANGUAGE = 'en';

const CREATED_IN_TEXT = 'The Keyboard created in MacOS';
const LANGUAGE_SWITCH_HINT = 'Switch Language: Ctrl + Opt(Alt)';

const REPEAT_KEYS_DEFAULT = true;
const REPEAT_KEYS_DELAY = 500;
const REPEAT_KEYS_INTERVAL = 100;

const SPECIAL_KEYS = ['CapsLock', 'Shift', 'Control', 'Alt', 'Meta'];

export default class VirtualKeyboard {
  constructor({ repeatKeys = REPEAT_KEYS_DEFAULT } = {}) {
    this.container = elt('div', { className: CssClasses.BLOCK });
    this.buttons = {};
    this.isCapsLocked = false;
    this.isShiftPressed = false;
    this.stickyShift = false;
    this.repeatKeys = repeatKeys;

    this.setLanguage();
    this.renderKeyboard();
    this.addCreatedClause();
    this.addLanguageSwitchHint();
    this.addEventListeners();
  }

  addEventListeners() {
    this.container.addEventListener('mousedown', (event) => this.handleMouseEvents(event));
    this.container.addEventListener('mouseup', (event) => this.handleMouseEvents(event));

    document.addEventListener('keydown', (event) => this.handleKeyboardEvents(event), true);
    document.addEventListener('keyup', (event) => this.handleKeyboardEvents(event), true);
  }

  addCreatedClause() {
    this.container.append(
      elt('p', {
        className: CssClasses.CREATED,
      }, CREATED_IN_TEXT),
    );
  }

  addLanguageSwitchHint() {
    this.container.append(
      elt('p', {
        className: CssClasses.LANGUAGE,
      }, LANGUAGE_SWITCH_HINT),
    );
  }

  setLanguage(change = false) {
    let lang = localStorage?.lang || DEFAULT_LANGUAGE;

    if (change) {
      lang = values(LANGUAGE).filter((e) => e !== lang).pop();
    }

    this.lang = lang;
    localStorage.lang = lang;

    const isDefaultLang = lang === DEFAULT_LANGUAGE;
    this.container.classList.toggle(CssClasses.LANGUAGE_DEFAULT, isDefaultLang);
    this.container.classList.toggle(CssClasses.LANGUAGE_ALTERNATE, !isDefaultLang);
  }

  renderKeyboard() {
    const layout = elt('div', { className: CssClasses.LAYOUT });

    const key = (code) => this.renderKey(code);
    const row = (keys) => elt('div', { className: CssClasses.ROW }, ...keys.map(key));

    layout.append(...LAYOUT.map(row));

    this.container.append(layout);
  }

  renderKey(code) {
    const {
      keys, label = '', icon = '', isFunctional,
    } = KEYS[code];

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
    let isLetter = false;
    let isSlLetter = false;

    if (mainKey) {
      assign(dataset, {
        mainKey, auxKey, slMainKey, slAuxKey,
      });

      isLetter = auxKey === mainKey.toUpperCase();
      isSlLetter = slAuxKey === slMainKey.toUpperCase();
    } else {
      assign(dataset, { label });
    }

    button.classList.add(`${CssClasses.KEY}_${code}`);
    button.classList.toggle(CssClasses.KEY_LETTER, isLetter);
    button.classList.toggle(CssClasses.KEY_LETTER_SL, isSlLetter);

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
    const { key } = KEYS[code];
    const isPressed = type === 'mousedown';

    this.togglePressed(code, isPressed);

    if (type === 'mousedown') {
      this.handleMouseDown(code);
    }

    if (key === 'CapsLock') {
      this.setCapsLock(event);
    }

    if (key === 'Shift') {
      this.setShift(event);
    }
  }

  handleMouseDown(code) {
    const { key = '' } = KEYS[code];
    const dispatch = () => this.dispatchKeyboardEvent(code);

    let repeatKeysDelay;
    let repeatKeysInterval;

    if (this.repeatKeys && !SPECIAL_KEYS.includes(key)) {
      repeatKeysDelay = setTimeout(() => {
        dispatch();
        repeatKeysInterval = setInterval(dispatch, REPEAT_KEYS_INTERVAL);
      }, REPEAT_KEYS_DELAY);
    }

    document.addEventListener('mouseup', (event) => {
      const { shiftKey } = event;
      this.togglePressed(code, false);

      clearInterval(repeatKeysDelay);
      clearInterval(repeatKeysInterval);

      if (key === 'Shift') {
        this.setShift({ type: 'mouseup', shiftKey });
      }
    }, { once: true });

    if (key === 'Lang') {
      this.setLanguage(true);
    }

    dispatch();
  }

  handleKeyboardEvents(event) {
    event.preventDefault();

    const {
      type, code, key, isTrusted,
    } = event;

    if (!isTrusted) {
      return;
    }

    if (type === 'keydown') {
      this.handleKeyDown(event);
    } else {
      this.handleKeyUp(event);
    }

    if (code === 'CapsLock') {
      this.setCapsLock(event);
    }

    if (key === 'Shift') {
      this.setShift(event);
    }
  }

  handleKeyDown(event) {
    const {
      code, altKey, metaKey, ctrlKey, key,
    } = event;
    const hasSpecial = altKey || metaKey || ctrlKey;

    this.togglePressed(code, true);

    const switchLang = (key === 'Alt' && ctrlKey) || (key === 'Control' && altKey);

    if (switchLang) {
      this.setLanguage(true);
    }

    if (hasSpecial && !SPECIAL_KEYS.includes(key)) {
      return;
    }

    this.dispatchKeyboardEvent(code);
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
    if (!KEYS[code]) {
      return;
    }

    const { key, keys, isFunctional } = KEYS[code];
    const {
      lang, isCapsLocked, isShiftPressed, stickyShift,
    } = this;
    let eventKey;

    if (isFunctional || key) {
      eventKey = key;
    } else {
      const [mainKey, auxKey] = keys[lang];
      const isCaps = isCapsLocked && code.startsWith('Key');
      const isShift = isShiftPressed || stickyShift;

      if (isCaps || isShift) {
        eventKey = auxKey;
      } else {
        eventKey = mainKey;
      }
    }

    const event = new KeyboardEvent('keydown', {
      code, key: eventKey,
    });

    document.body.dispatchEvent(event);

    if (eventKey.length === 1) {
      this.stickShift = false;
      this.stickyShift = false;
      this.toggleShift();
    }
  }

  setCapsLock(event) {
    const { type } = event;

    if (type.match('key')) {
      this.isCapsLocked = event.getModifierState('CapsLock');
    }

    if (type === 'mousedown') {
      this.isCapsLocked = !this.isCapsLocked;
    }

    this.container.classList.toggle(CssClasses.CAPS, this.isCapsLocked);
  }

  setShift(event) {
    const { type, shiftKey } = event;
    let { isShiftPressed, stickyShift, stickShift } = this;

    if (type.match('key')) {
      isShiftPressed = event.getModifierState('Shift');
      stickyShift = false;
    }

    if (type.match('mouse') && shiftKey) {
      return;
    }

    if (type === 'mousedown') {
      isShiftPressed = true;
      stickShift = !stickShift;
    }

    if (type === 'mouseup') {
      isShiftPressed = false;
      stickyShift = stickShift;
    }

    this.isShiftPressed = isShiftPressed;
    this.stickyShift = stickyShift;
    this.stickShift = stickShift;
    this.toggleShift();
  }

  toggleShift() {
    this.container.classList.toggle(CssClasses.SHIFT_PRESSED, this.isShiftPressed);
    this.container.classList.toggle(CssClasses.SHIFT_STICKY, this.stickyShift);
  }
}
