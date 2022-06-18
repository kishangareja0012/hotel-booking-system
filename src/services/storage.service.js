export const USER_KEY = 'user';
export const LANG_KEY = 'lang';
export const HOTEL_KEY = 'property';

const listeners = {
  [USER_KEY]: [],
  [LANG_KEY]: [],
  // [HOTEL_KEY]: [],
};

function dispatcher(e) {
  const { key, newValue } = e;
  if (listeners[key] == null || !listeners[key].length) return;
  let val;
  try {
    val = JSON.parse(newValue);
  } catch (err) {
    val = newValue;
  }
  listeners[key].forEach((func) => func(val));
}
window.addEventListener('storage', dispatcher);

export const Storage = {
  addListener(key, func) {
    if (listeners[key] == null) return;
    listeners[key].push(func);
  },
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
      // console.log(USER)
      // return JSON.parse(USER);
    } catch (e) {
      return null;
    }
  },
  getUserId(user = null) {
    if (user != null) return user;
    const u = this.getUser();
    return u != null ? u.id : null;
  },
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  removeUser() {
    localStorage.removeItem(USER_KEY);
  },
  getLang() {
    const lang = localStorage.getItem(LANG_KEY);
    return lang != null ? lang : 'en';
  },
  setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
  },
  removeLang() {
    localStorage.removeItem(LANG_KEY);
  },
  getProperty(user = null) {
    let properties = null;
    try {
      properties = JSON.parse(localStorage.getItem(HOTEL_KEY));
    } catch (e) {
      return null;
    }
    if (properties == null) return null;
    const id = this.getUserId(user);
    if (id == null) return null;
    const property = properties[id];
    return property != null ? parseInt(property, 10) : null;
  },
  setProperty(property, user = null) {
    if (property == null) {
      // this.removeProperty();
      return;
    }
    const id = this.getUserId(user);
    if (id == null) return;
    let properties;
    try {
      properties = JSON.parse(localStorage.getItem(HOTEL_KEY));
      if (properties == null || typeof properties !== 'object') {
        properties = {};
      }
    } catch (e) {
      properties = {};
    }
    properties[id] = property;
    localStorage.setItem(HOTEL_KEY, JSON.stringify(properties));
  },
  removeProperty(user = null) {
    const id = this.getUserId(user);
    if (id == null) return;
    let properties;
    try {
      properties = JSON.parse(localStorage.getItem(HOTEL_KEY));
      if (properties == null || typeof properties !== 'object') {
        properties = {};
      }
    } catch (e) {
      return;
    }
    if (properties[id] != null) {
      delete properties[id];
      localStorage.setItem(HOTEL_KEY, JSON.stringify(properties));
    }
  },
  removeProperties() {
    localStorage.removeItem(HOTEL_KEY);
  },
};
export default Storage;
