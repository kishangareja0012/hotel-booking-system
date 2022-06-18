/* eslint-disable no-shadow */

import ApiService from '@/services/api.service';
import { apiEndpoint } from '@/shared';
import moment from 'moment';
import { HttpError, PMSError, ValidationError } from '@/errors';

const endpoint = `${apiEndpoint}/calendar`;

const state = {
  rooms: null,
  roomsPending: false,
  roomsError: null,
  data: null,
  dataPending: false,
  dataError: null,
  pmsError: null,
  dataUpdating: false,
  dataUpdateError: null,
  updatingDay: '',
  updatedDay: '',
  roomdbIsMaster: null,
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
  return err;
}
const getters = {
  rooms: (state) => state.rooms,
  data: (state) => state.data,
  roomsLoaded: (state) => state.rooms != null,
  dataLoaded: (state) => state.data != null,
  roomsPending: (state) => state.roomsPending,
  dataPending: (state) => state.dataPending,
  roomsError: (state) => state.roomsError,
  dataError: (state) => state.dataError,
  roomdb: (state) => (state.roomdbIsMaster ? '/roomdb' : ''),
};

const mutations = {
  clearErrors(state) {
    state.roomsError = null;
    state.dataError = null;
    state.dataUpdateError = null;
    state.pmsError = null;
  },
  beforeRooms(state, initial = false) {
    if (initial) {
      state.rooms = null;
    }
    state.roomsError = null;
    state.roomsPending = true;
  },
  beforeData(state) {
    state.data = null;
    state.dataError = null;
    state.dataPending = true;
  },
  beforeDataUpdate(state) {
    state.dataUpdateError = null;
    state.dataUpdating = true;
  },
  roomsError(state, error) {
    state.roomsPending = false;
    state.roomsError = error;
    state.pmsError = error;
  },
  dataError(state, error) {
    state.dataPending = false;
    state.dataError = error;
    state.pmsError = error;
  },
  rooms(state, rooms) {
    state.roomsPending = false;
    state.rooms = rooms;
  },
  data(state, data) {
    state.dataPending = false;
    state.data = data;
  },
  dataUpdated(state, error = null) {
    state.dataUpdating = false;
    state.dataUpdateError = error;
  },
  update(state, [id, day, field, val]) {
    const obj = (state.data[id] || []).find((d) => d.i === day);
    if (obj == null) return;
    obj[field] = val;
  },
  updatingDay(state, payload = null) {
    if (payload != null) {
      const [id, day, field] = payload;
      state.updatingDay = `${field} ${id} ${day}`;
    } else {
      state.updatingDay = '';
    }
  },
  updatedDay(state, payload = null) {
    if (payload != null) {
      const [id, day, field] = payload;
      state.updatedDay = `${field} ${id} ${day}`;
    } else {
      state.updatedDay = '';
    }
  },
  batchUpdate(state, payload) {
    const dates = [];
    const start = moment(payload.from).locale('en');
    do {
      if (payload.days.length === 7 || payload.days.includes(start.format('ddd'))) {
        dates.push(start.format('YYYY-MM-DD'));
      }
      start.add(1, 'day');
    } while (start.isSameOrBefore(payload.until));
    const updates = { ...payload.fields };
    if (updates.osale != null) {
      updates.csale = !updates.osale;
      delete updates.osale;
    }
    if (updates.price != null) {
      updates.price = parseFloat(updates.price).toFixed(2).replace('.00', '');
    }
    payload.rooms.forEach((r) => {
      state.data[r].forEach((d) => {
        if (!dates.includes(d.i)) return;
        Object.keys(updates).forEach((k) => {
          // eslint-disable-next-line no-param-reassign
          d[k] = updates[k];
        });
      });
    });
  },
  roomdbIsMaster(state, value) {
    state.roomdbIsMaster = value;
  },
};

const actions = {
  async fetchRooms({ commit, getters }, forced = false) {
    commit('beforeRooms', forced);
    try {
      const response = await ApiService.get(`${endpoint + getters.roomdb}/rooms`);
      commit('rooms', response.data);
    } catch (error) {
      commit('roomsError', error);
    }
  },
  async fetchData({ commit, getters }, payload) {
    commit('beforeData');
    try {
      const { data: { rooms, currency } } = await ApiService.post(`${endpoint + getters.roomdb}/rooms`, payload);
      commit('data', rooms);
      if (currency) {
        commit('user/currency', currency, { root: true });
      }
    } catch (error) {
      commit('dataError', error);
    }
  },
  async updateData({
    state,
    commit,
    dispatch,
  }, payload) {
    const {
      mode, id, day, field, data,
    } = payload;
    const val = data[field];
    const obj = (state.data[id] || []).find((d) => d.i === day);
    if (obj == null) return;
    // const old = obj[field];
    commit('beforeDataUpdate');
    commit('updatingDay', [id, day, field]);
    try {
      await ApiService.put(`${endpoint}/roomdb/rooms/${mode}`, { day, id, data });
      await ApiService.put(`${endpoint}/rooms/${mode}`, { day, id, data });
      commit('dataUpdated');
      commit('update', [id, day, field, val]);
      dispatch('updatedDay', [id, day, field]);
    } catch (error) {
      commit('dataUpdated', error);
      commit('updatingDay');
      throw handleApiError(commit, error);
      // commit('update', [id, day, field, old]);
    }
  },
  updatedDay({ commit }, payload) {
    commit('updatedDay', payload);
    commit('updatingDay');
    setTimeout(() => {
      commit('updatedDay');
    }, 1000);
  },
  async batchUpdateData({ commit }, payload) {
    commit('beforeDataUpdate');
    try {
      await ApiService.put(`${endpoint}/roomdb/rooms/batch`, payload);
      await ApiService.put(`${endpoint}/rooms/batch`, payload);
      commit('batchUpdate', payload);
      commit('dataUpdated');
      return true;
    } catch (error) {
      commit('dataUpdated', error);
      return false;
    }
  },
  async setRoomdbIsMaster({ commit }, value) {
    commit('roomdbIsMaster', value);
  },
  async syncRoomsWithRoomDB({ state, commit }) {
    if (state.roomdbIsMaster) {
      return;
    }
    commit('beforeData');
    try {
      await ApiService.post(`${apiEndpoint}/rooms/roomdb/sync`);
    } catch (error) {
      commit('dataError', error);
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
