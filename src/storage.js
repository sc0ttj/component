const storage = {

  getItem: (self, state) => {
    if (!self.store) return state;
    // console.log('getItem:', self.store, state);
    const s = JSON.parse(localStorage.getItem(self.store))
    return s ? { ...state, ...s } : state;
  },

  setItem: (self, state) => {
    if (!self.store) return state;
    // console.log('setItem:', self.store, state);
    localStorage.setItem(self.store, JSON.stringify(state))
  }

};

export default storage;
