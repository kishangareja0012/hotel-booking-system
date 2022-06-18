/* eslint-disable no-shadow */

import StorageService from '@/services/storage.service';

import Vue from 'vue';
import { router } from '@/router';
import UserService from '@/services/user.service';
import {
  AuthError, TooManyAttemptsError, ValidationError, PMSError, HttpError,
} from '@/errors';
import {
  locales, apiEndpoint, defaultTextColors, defaultBackgroundColor,
  externalEngineTpl, externalEngineHost,
} from '@/shared';
import ApiService from '@/services/api.service';
import moment from 'moment';
import i18n from '@/i18n';
import { localize } from 'vee-validate';

const endpoint = `${apiEndpoint}/user`;

const initialLang = StorageService.getLang();
ApiService.setLang(initialLang);
moment.locale(initialLang);
i18n.locale = initialLang;
localize(initialLang);
const initialProperty = StorageService.getProperty();
ApiService.setProperty(initialProperty);

const state = {
  user: StorageService.getUser(),
  emailResent: false,
  validationError: null,
  rateLimitError: null,
  pending: false,
  sessionExpired: false,
  lang: initialLang,
  property: initialProperty,
  propertiesPending: false,
  propertiesLoaded: false,
  pages: null,
  groupUpdatePending: false,
  hostInfo: null,
  propertyId: null,
};

const getters = {
  loggedIn: (state) => state.user != null,
  hostLoaded: (state) => state.hostInfo != null,
  hostInfo: (state, getters) => (getters.hostLoaded ? state.hostInfo : {}),
  user: (state) => state.user,
  userID: (state, getters) => (getters.loggedIn ? state.user.id : null),
  settings: (state, getters) => (getters.user ? state.user.profile : {}),
  numberFormat: (state, getters) => {
    // eslint-disable-next-line camelcase
    const { number_format: numberFormat } = getters.settings;
    return numberFormat || 'de-DE';
  },
  dateFormat: (state, getters) => {
    // eslint-disable-next-line camelcase
    const { date_format: dateFormat } = getters.settings;
    return dateFormat || 'DD MMM YYYY';
  },
  isAgentUser: (state, getters) => (getters.loggedIn ? state.user.of_agent : false),
  isAgentDomain: (state, getters) => (getters.hostLoaded ? getters.hostInfo.agent : false),
  engineURL: (state, getters) => {
    const { group, hostInfo } = getters;
    // eslint-disable-next-line camelcase
    const host = group?.b_domain ?? hostInfo?.b_domain ?? externalEngineHost;
    return externalEngineTpl.replace('{host}', host);
  },
  userOTL: (state, getters) => (getters.isAgentUser ? state.user.otl : null),
  sessionExpired: (state) => state.sessionExpired,
  emailResent: (state) => state.emailResent,
  emailVerified: (state, getters) => getters.loggedIn && state.user.email_verified,
  pdFilled: (state, getters) => getters.loggedIn && state.user.pd_filled,
  cdFilled: (state, getters) => getters.loggedIn && state.user.cd_filled,
  setupComplete(state, getters) {
    if (!getters.loggedIn) {
      return true;
    }
    if (!state.user.of_agent) {
      return state.user.setup_complete;
    }
    const { property } = getters;
    if (property == null || property.id == null) {
      return true;
    }
    return property.agent_setup_complete;
  },
  setupStep(state, getters) {
    if (!getters.loggedIn) {
      return 0;
    }
    if (!state.user.of_agent) {
      return state.user.setup_step || 0;
    }
    const { property } = getters;
    if (property == null || property.id == null) {
      return 0;
    }
    return Math.max(property.agent_setup_step || 0, 2);
  },
  requiredFilled: (state, getters) => getters.pdFilled && getters.cdFilled,
  isAdmin: (state, getters) => getters.loggedIn && state.user.admin,
  hasProfile: (state, getters) => getters.loggedIn && state.user.profile != null,
  hasProperties: (state, getters) => getters.loggedIn && state.user.properties?.length > 0,
  multipleProperties: (state, getters) => getters.hasProperties && state.user.properties.length > 1,
  properties: (state, getters) => (getters.hasProperties ? state.user.properties : []),
  propertyName: (state, getters) => {
    let result;
    if (getters.hasProperties) {
      result = getters.property ? getters.property.name : '';
    } else {
      result = '';
    }
    return result;
  },
  propertyID: (state, getters) => {
    let result;
    if (getters.hasProperties) {
      result = getters.property ? getters.property.id : '';
    } else {
      result = '';
    }
    return result;
  },
  propertyPages: (state, getters) => (getters.hasProperties ? getters.property.pages : false),
  currency: (state, getters) => (getters.hasProperties && getters.property.currency_code
    ? getters.property.currency_code : {}),
  pending: (state) => state.pending,
  validationError: (state) => state.validationError,
  rateLimitError: (state) => state.rateLimitError,
  lang: (state) => {
    let l = locales.find(({ code }) => code === state.lang);
    if (l == null) {
      l = locales.find(({ code }) => code === 'en');
    }
    return l;
  },
  property: (state, getters) => {
    if (!getters.loggedIn) return null;
    if (state.property == null) return {};
    return getters.properties.find(({ id }) => id === state.property);
  },
  group: (state, getters) => {
    if (!getters.loggedIn) return null;
    if (getters.property && Object.keys(getters.property).length > 0) {
      return getters.property.group;
      /* return state.user.groups.find((g) => g.id === getters.property.group_id); */
    }
    return {};
  },
  /* defaultGroup: (state, getters) => (getters.loggedIn ? [...state.user.groups].pop() : null), */
  pageAllowed: (state, getters) => (...pages) => {
    const current = getters.property;
    if (current == null || current.perms == null) return false;
    // if (current.pages === true) return true; // user is property owner
    return Array.isArray(current.perms) && pages.some((page) => current.perms.includes(page));
  },
  userPageAllowed: (state, getters) => (...pages) => {
    const current = getters.user;
    if (current == null || current.perms == null) return false;
    // if (current.pages === true) return true; // user is property owner
    return Array.isArray(current.perms) && pages.some((page) => current.perms.includes(page));
  },
  allowedPages: (state, getters) => {
    const current = getters.property;
    if (current == null || current.perms == null) return [];
    return [...current.perms];
  },
  allowedUserPages: (state, getters) => {
    if (!getters.loggedIn) return [];
    return [...(getters.user.perms || [])];
  },
  currentLogo: (state, getters) => {
    const { group, hostInfo } = getters;
    return group?.id != null ? group.logo : hostInfo?.logo;
  },
  currentColorSchema: (state, getters) => {
    const { group, hostInfo } = getters;
    return group?.id != null ? group.style.color_schema : (hostInfo.color_schema ?? defaultBackgroundColor);
  },
  currentColorFont: (state, getters) => {
    const { group, hostInfo } = getters;
    return group?.id != null ? group.style.color_font : (hostInfo.color_font ?? defaultTextColors.white);
  },
  currentDomainConfig: (state, getters) => {
    const { group, hostInfo } = getters;
    const ret = (group?.id != null ? group.config : hostInfo.config);
    return ret != null && !Array.isArray(ret) ? ret : JSON.parse('{}');
  },
};

const mutations = {
  clearErrors(state) {
    state.validationError = null;
    state.rateLimitError = null;
  },
  user(state, user) {
    // TODO: set/update user in storage?
    state.user = user;
    state.sessionExpired = false;
    state.pending = false;
  },
  info(state, info) {
    state.hostInfo = info ?? {};
  },
  sessionExpired(state) {
    if (state.user != null) {
      state.sessionExpired = true;
    }
  },
  emailResent(state, ok) {
    state.emailResent = !!ok;
  },
  beforeRequest(state) {
    state.validationError = null;
    state.rateLimitError = null;
    state.pending = true;
  },
  requestComplete(state) {
    state.pending = false;
  },
  validationError(state, error) {
    state.validationError = error;
    state.pending = false;
  },
  rateLimitError(state, error) {
    state.pending = false;
    state.rateLimitError = error;
  },
  currency(state, currency) {
    state.user.profile.currency = currency;
  },
  setup(state, data) {
    Object.keys(data).forEach((k) => {
      Vue.set(state.user, k, data[k]);
    });
    state.pending = false;
  },
  propertySetup(state, data) {
    const property = state.user.properties.find(({ id }) => id === data.id);
    if (property != null) {
      property.agent_setup_complete = data.agent_setup_complete;
      property.agent_setup_step = data.agent_setup_step;
    }
    state.pending = false;
  },
  setLang(state, locale) {
    if (state.lang === locale) return;
    const l = locales.find(({ code }) => code === locale);
    if (l !== null) {
      StorageService.setLang(locale);
      state.lang = locale;
      ApiService.setLang(locale);
      moment.locale(locale);
      i18n.locale = locale;
      localize(locale);
    }
  },
  setProperty(state, property = null) {
    if (state.user == null) {
      state.property = null;
      ApiService.setProperty();
      return;
    }
    let h;
    if (property != null) {
      h = state.user.properties.find(({ id }) => id === property) || null;
    }
    if (property == null || h == null) {
      h = state.user.properties[0] || null;
    }
    const id = h != null ? h.id : null;
    StorageService.setProperty(id);
    state.property = id;
    ApiService.setProperty(id);
  },
  // emailVerified(state) {
  //   state.user.email_verified = true;
  // },
  // pdFilled(state) {
  //   state.user.pd_filled = true;
  // },
  // cdFilled(state) {
  //   state.user.cd_filled = true;
  // },
  beforePropertiesRequest(state, initial = false) {
    state.propertiesPending = true;
    if (initial) {
      state.propertiesLoaded = false;
    }
  },
  afterPropertiesRequest(state) {
    state.propertiesPending = false;
  },
  properties(state, properties) {
    state.user.properties = properties;
    state.propertiesPending = false;
    state.propertiesLoaded = true;
  },
  addProperty(state, property) {
    if (state.user.properties == null) {
      state.user.properties = [];
    }
    state.user.properties.push(property);
    state.propertiesPending = false;
  },
  updateProperty(state, property) {
    const idx = state.user.properties.findIndex(({ id }) => id === property.id);
    if (idx !== -1) {
      Vue.set(state.user.properties, idx, property);
    }
    state.propertiesPending = false;
  },
  patchProperty(state, property) {
    const h = state.user.properties.find(({ id }) => id === property.id);
    if (h != null) {
      const data = { ...property };
      delete data.id;
      Object.keys(data).forEach((k) => {
        h[k] = data[k];
      });
    }
    state.propertiesPending = false;
  },
  deleteProperty(state, propertyId) {
    const idx = state.user.properties.findIndex(({ id }) => id === propertyId);
    if (idx !== -1) {
      state.user.properties.splice(idx, 1);
    }
    state.propertiesPending = false;
  },
  updatePropertiesGroup(state, group) {
    const obj = JSON.parse(JSON.stringify(group));
    state.user.properties.forEach((property) => {
      if (property.group == null || property.group.id !== group.id) return;
      Vue.set(property, 'group', obj);
    });
  },
  beforeGroupRequest(state) {
    state.groupUpdatePending = true;
  },
  afterGroupRequest(state, { group = null } = {}) {
    if (group != null) {
      if (state.property && Object.keys(state.property).length > 0) state.property.group = group;
      // TODO
      // Remove it after testing it correctly or
      // removing relastionship between User and Group
      state.user.groups = state.user.groups.map((g) => {
        if (g.id === group?.id) return group;
        return g;
      });
    }
    state.groupUpdatePending = false;
  },
  propertyId(state, id) {
    state.propertyId = id;
  },
};

function handleError(commit, error) {
  if (error instanceof AuthError) {
    commit('loginAuthError', {
      code: error.errorCode,
      message: error.message,
    });
  } else if (error instanceof ValidationError) {
    commit('validationError', error);
  } else if (error instanceof TooManyAttemptsError) {
    commit('rateLimitError', error);
  } else if (error instanceof PMSError) {
    throw error;
  } else {
    throw error;
  }
}

function handleApiError(commit, error) {
  const { status, data } = error.response;
  let err = error;
  switch (status) {
    case 400: // BadRequest
      err = new HttpError(status, data.message);
      break;
    case 409: // PMSError
      err = new PMSError(status, data.message);
      break;
    case 422:
      err = new ValidationError(status, data.message, data.errors);
      commit('validationError', err);
      break;
    case 500:
      err = new Error(data.message);
      break;
    default:
      break;
  }
  // commit('update', err);
  throw err;
}

const actions = {
  async getUser({
    state, getters, dispatch, commit,
  }, { redirect = true, masterdata = false } = {}) {
    const wasLoggedIn = state.user != null;
    try {
      const user = await UserService.getUser(masterdata);
      await commit('user', user);
      const property = StorageService.getProperty();
      await commit('setProperty', property);
      if (getters.propertyID) {
        // Get all the necessary data of the new set
        // property for Extranet to work
        await dispatch('getProperty', getters.propertyID);
      }
      if (!wasLoggedIn && redirect) {
        router.push(router.history.current.query.redirect || '/');
      }
    } catch (e) {
      if (wasLoggedIn) {
        commit('user', null);
        if (redirect) {
          router.push({ name: 'login' });
        }
      }
    }
  },
  async getInfo({ commit }) {
    const info = await UserService.getInfo();
    await commit('info', info);
  },
  async resendEmail({ commit }) {
    commit('beforeRequest');
    try {
      const ok = await UserService.resendEmail();
      commit('emailResent', ok);
      commit('requestComplete');
    } catch (e) {
      commit('emailResent', false);
      handleError(commit, e);
    }
  },
  async verifyEmail({ commit }, { id, hash, query }) {
    commit('beforeRequest');
    try {
      const user = await UserService.verifyEmail(id, hash, query);
      commit('requestComplete');
      if (user != null) {
        commit('user', user);
        router.pushInitial();
      }
    } catch (e) {
      handleError(commit, e);
    }
  },
  async makeJoinProperty({ commit }, {
    id, propertyId, hash, query,
  }) {
    commit('beforeRequest');
    try {
      const user = await UserService.makeJoinProperty(id, propertyId, hash, query);
      commit('requestComplete');
      if (user != null) {
        commit('user', user);
        router.pushInitial();
      }
    } catch (e) {
      handleError(commit, e);
    }
  },
  async updateProfile({ commit, getters }, data) {
    commit('beforeRequest');
    const needRedirect = !getters.requiredFilled;
    try {
      const user = await UserService.updateProfile(data);
      commit('user', user);
      if (user != null && user.properties != null && user.properties.length) {
        commit('setProperty');
      }
      commit('requestComplete');
      if (needRedirect && getters.requiredFilled) {
        router.pushInitial();
      }
    } catch (e) {
      handleError(commit, e);
    }
  },
  async updateProfileData({ commit }, data) {
    commit('beforeRequest');
    try {
      const user = await UserService.updateProfileData(data);
      commit('user', user);
      commit('requestComplete');
    } catch (e) {
      handleError(commit, e);
    }
  },
  async updateSetup({ commit, getters }, payload) {
    commit('beforeRequest');
    const needRedirect = !getters.setupComplete;
    const agent = getters.isAgentUser;
    try {
      const data = await UserService.setupStep(payload);
      if (!agent) {
        commit('setup', data);
      } else {
        commit('propertySetup', data);
      }
      if (needRedirect && getters.setupComplete) {
        router.pushInitial();
      }
    } catch (error) {
      handleError(commit, error);
    }
  },
  async loadProperties({ commit }) {
    commit('beforePropertiesRequest', true);
    try {
      const { data: properties } = await ApiService.get(`${endpoint}/properties`);
      commit('properties', properties);
      commit('setProperty', StorageService.getProperty());
    } catch (error) {
      commit('afterPropertiesRequest');
      handleApiError(commit, error);
    }
  },
  async getProperties({ commit, getters }, payload) {
    const page = payload?.page || 1;

    try {
      commit('beforePropertiesRequest');
      const { data } = await ApiService.get(`${endpoint}/properties?page=${page}`);
      const { properties } = getters;
      commit('properties', properties);
      commit('afterPropertiesRequest');
      return data;
    } catch (error) {
      commit('afterPropertiesRequest');
      handleApiError(commit, error);
      return {};
    }
  },
  async getProperty({ commit, getters }, id) {
    commit('beforePropertiesRequest');
    try {
      const { data: { property, data } } = await ApiService.get(`${endpoint}/properties/${id || getters.property.id}`);
      commit('updateProperty', property);
      return data;
    } catch (error) {
      commit('afterPropertiesRequest');
      handleApiError(commit, error);
      return null;
    }
  },
  async createProperty({ commit }, payload) {
    commit('beforePropertiesRequest');
    try {
      const { data: property } = await ApiService.post(`${endpoint}/properties`, payload);
      commit('addProperty', property);
    } catch (error) {
      commit('afterPropertiesRequest');
      handleApiError(commit, error);
    }
  },
  async updateProperty({ commit, getters }, data) {
    commit('beforePropertiesRequest');
    try {
      const { id } = data;
      let payload;
      if (data.logo == null || data.logo.upload == null) {
        payload = { ...data };
      } else {
        payload = new FormData();
        payload.appendFromObject(data);
      }
      delete payload.id;
      const { data: property } = await ApiService.post(`${endpoint}/properties/${id || getters.property.id}`, payload);
      commit('updateProperty', property);
    } catch (error) {
      commit('afterPropertiesRequest');
      handleApiError(commit, error);
    }
  },
  async togglePropertyStatus({ commit, getters }, data) {
    commit('beforePropertiesRequest');
    try {
      const { id } = data;
      const payload = { ...data };
      delete payload.id;
      const { data: log } = await ApiService.patch(`${endpoint}/properties/${id || getters.property.id}`, payload);
      commit('patchProperty', data);
      commit('logs/insert', { key: 'booking', data: log }, { root: true });
    } catch (error) {
      commit('afterPropertiesRequest');
      handleApiError(commit, error);
    }
  },
  async refreshPagesForProperty({ commit, getters }, propertyId = null) {
    const id = propertyId != null ? propertyId : getters.propertyID;
    try {
      commit('beforePropertiesRequest');
      const { data: pages } = await ApiService.get(`${endpoint}/properties/${id}/pages`);
      if (pages === false) {
        commit('deleteProperty', id);
        commit('setProperty');
        return false;
      }
      commit('patchProperty', { id, pages });
      return true;
    } catch (error) {
      handleApiError(commit, error);
      return false;
    }
  },
  async refreshGroup({ commit }) {
    try {
      commit('beforeGroupRequest');
      const { data: group } = await ApiService.get(`${endpoint}/group`);
      commit('afterGroupRequest', { group });
      return true;
    } catch (error) {
      commit('afterGroupRequest');
      handleApiError(commit, error);
      return false;
    }
  },
  async updateGroup({ commit, getters }, data) {
    commit('beforeGroupRequest');
    try {
      let payload;
      if (data.logo == null || data.logo.upload == null) {
        payload = { ...data, _method: 'put' };
      } else {
        payload = new FormData();
        payload.append('_method', 'put');
        payload.appendFromObject(data);
      }
      const { data: group } = await ApiService.post(`${endpoint}/group/${getters.group.id}`, payload);
      commit('afterGroupRequest', { group });
      return true;
    } catch (error) {
      commit('afterGroupRequest');
      handleApiError(commit, error);
      return false;
    }
  },
  async verifyPhone({ commit }, tel) {
    commit('beforeRequest');
    try {
      const { data } = await ApiService.get(`${apiEndpoint}/telephone-verify/${tel}`);
      commit('requestComplete');
      return data;
    } catch (error) {
      commit('requestComplete');
      handleApiError(commit, error);
      return null;
    }
  },
  async getRoomDBPropertyId({ commit, getters }, id) {
    const res = await ApiService.get(`${endpoint}/properties/data/${id || getters.property.id}`);
    if (res.data.status === 'fail') {
      return null;
    }
    const propertyId = res.data.result.id;
    commit('propertyId', propertyId);
    return propertyId;
  },
  async getIdentifierSources() {
    const res = await ApiService.get(`${endpoint}/identifiers/sources`);
    return res.data.result;
  },
  async getPropertyIdentifiers({ state }, id) {
    const res = await ApiService.get(`${endpoint}/identifiers/${id || state.propertyId}`);
    return res.data.result;
  },
  async updatePropertyIdentifiers({ commit, state }, identifiers, id) {
    commit('beforeRequest');
    try {
      const req = {
        propertyId: id || state.propertyId,
        identifiers: identifiers.map((item) => (
          {
            identifier: item.value || '',
            sourceId: item.id,
          }
        )),
      };
      await ApiService.post(`${endpoint}/identifiers`, req);
    } catch (error) {
      handleApiError(commit, error);
    } finally {
      commit('requestComplete');
    }
    return null;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
