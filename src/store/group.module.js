/* eslint-disable no-shadow */

// import Vue from 'vue';
import ApiService from '@/services/api.service';
import { apiEndpoint } from '@/shared';
import { HttpError, PMSError, ValidationError } from '@/errors';
import Vue from 'vue';

const endpoint = `${apiEndpoint}/admin/groups`;

const state = {
  group: null,
  pending: false,
  error: null,
  updatePending: false,
  updateError: null,
  propertiesPending: false,
};

const getters = {
  loaded: (state) => state.group != null,
  group: (state, getters) => (getters.loaded ? state.group : {}),
  properties: (state, getters) => (getters.group.properties || []),
  hasProperties: (state, getters) => (getters.properties.length > 0),
};

// function updatePropertiesCount(commit, { id, data }) {
//   commit('groups/modified', { id, data }, { root: true });
// }

const mutations = {
  clearErrors(state) {
    state.error = null;
    state.updateError = null;
  },
  beforeLoading(state, initial = false) {
    if (initial) {
      state.group = null;
    }
    state.error = null;
    state.pending = true;
    state.invalid = false;
  },
  beforeUpdate(state) {
    state.updateError = null;
    state.updatePending = true;
  },
  afterUpdate(state) {
    state.updatePending = false;
  },
  data(state, { data = null, error = null, update = false } = {}) {
    if (!update) {
      state.pending = false;
    } else {
      state.updatePending = false;
    }
    state.group = data;
    state.error = error;
  },
  beforePropertiesRequest(state) {
    state.propertiesPending = true;
  },
  afterPropertiesRequest(state) {
    state.propertiesPending = false;
  },
  addProperty(state, property) {
    if (state.group.properties == null) {
      state.group.properties = [];
    }
    state.group.properties.push(property);
    state.propertiesPending = false;
  },
  updateProperty(state, property) {
    const idx = state.group.properties.findIndex(({ id }) => id === property.id);
    if (idx !== -1) {
      Vue.set(state.group.properties, idx, property);
    }
    state.propertiesPending = false;
  },
  patchProperty(state, property) {
    const h = state.group.properties.find(({ id }) => id === property.id);
    if (h != null) {
      const data = { ...property };
      delete data.id;
      Object.keys(data).forEach((k) => {
        h[k] = data[k];
      });
    }
    state.propertiesPending = false;
  },
};

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
  async fetchData({ commit }, { id, force = false } = {}) {
    commit('beforeLoading', force);
    try {
      const { data } = await ApiService.get(`${endpoint}/${id}`);
      commit('data', { data });
      return data;
    } catch (error) {
      commit('data', { error });
      throw handleApiError(commit, error);
    }
  },
  async getProperty({ commit, state }, id) {
    commit('beforePropertiesRequest');
    const gid = state.group.id;
    try {
      const { data: { property, data } } = await ApiService.get(`${endpoint}/${gid}/properties/${id}`);
      commit('updateProperty', property);
      return data;
    } catch (error) {
      commit('afterPropertiesRequest');
      handleApiError(commit, error);
      return null;
    }
  },
  async createProperty({ commit, state }, payload) {
    commit('beforePropertiesRequest');
    const gid = state.group.id;
    try {
      const { data: property } = await ApiService.post(`${endpoint}/${gid}/properties`, payload);
      commit('addProperty', property);
    } catch (error) {
      commit('afterPropertiesRequest');
      handleApiError(commit, error);
    }
  },
  async updateProperty({ commit, state }, data) {
    commit('beforePropertiesRequest');
    const gid = state.group.id;
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
      const { data: property } = await ApiService.post(`${endpoint}/${gid}/properties/${id}`, payload);
      commit('updateProperty', property);
    } catch (error) {
      commit('afterPropertiesRequest');
      handleApiError(commit, error);
    }
  },
  async togglePropertyStatus({ commit, state }, data) {
    commit('beforePropertiesRequest');
    const gid = state.group.id;
    try {
      const { id } = data;
      const payload = { ...data };
      delete payload.id;
      await ApiService.patch(`${endpoint}/${gid}/properties/${id}`, payload);
      commit('patchProperty', data);
    } catch (error) {
      commit('afterPropertiesRequest');
      handleApiError(commit, error);
    }
  },
  async importProperty({ commit, state }, id) {
    commit('beforePropertiesRequest');
    const gid = state.group.id;
    try {
      const { data: property } = await ApiService.post(`${endpoint}/${gid}/properties/import/${id}`);
      commit('addProperty', property);
    } catch (error) {
      commit('afterPropertiesRequest');
      handleApiError(commit, error);
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
