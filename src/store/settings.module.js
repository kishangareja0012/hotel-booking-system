/* eslint-disable no-shadow */

import ApiService from '@/services/api.service';
import { apiEndpoint } from '@/shared';
import { ValidationError } from '@/errors';

const endpoint = `${apiEndpoint}/settings`;

const state = {
  data: null,
  update: null,
  pending: false,
  error: null,
  updatePending: false,
  updateError: null,
};

const getters = {
  loaded: (state) => !state.pending && state.data != null,
};

const mutations = {
  clearErrors(state) {
    state.error = null;
    state.updateError = null;
  },
  beforeLoading(state, initial = false) {
    if (initial) {
      state.data = null;
    }
    state.error = null;
    state.pending = true;
  },
  beforeUpdate(state) {
    state.updateError = null;
    state.updatePending = true;
  },
  error(state, error) {
    state.pending = false;
    state.error = error;
  },
  data(state, data) {
    state.pending = false;
    state.data = data;
  },
  update(state, update = {}) {
    state.update = update;
    state.updatePending = false;
    state.pending = false;
  },
};

function handleApiError(commit, error) {
  const { status, data } = error.response;
  let err = error;
  switch (status) {
    case 422:
      err = new ValidationError(status, data.message, data.errors);
      break;
    default:
      break;
  }
  commit('update', err);
  throw err;
}

const actions = {
  async fetchData({ commit }, forced = false) {
    commit('beforeLoading', forced);
    try {
      const response = await ApiService.get(`${endpoint}`);
      commit('data', response.data);
    } catch (error) {
      commit('error', error);
      throw handleApiError(commit, error);
    }
  },
  async updateData({ commit }, AutoReplenishment) {
    commit('beforeUpdate');
    try {
      const { data } = await ApiService.put(`${endpoint}`, AutoReplenishment);
      if (data.code === 200) {
        // eslint-disable-next-line no-param-reassign
        AutoReplenishment = (AutoReplenishment.AutoReplenishment === 'Activate') ? 'Activate' : 'Deactivate';
      }
      commit('update', AutoReplenishment);
    } catch (error) {
      commit('error', error);
      throw handleApiError(commit, error);
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
