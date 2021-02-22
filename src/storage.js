/**
 * Enable persistant storage using localStorage
 */
const storage = {

  getItem: (self, state) => {
    if (!self.store) return state;
    // console.log('getItem:', self.store, state);
    const s = JSON.parse(localStorage.getItem(self.store))
    return s ? { ...state, ...s } : state;
  },

  setItem: (self, state) => {
    if (!self.store) return state;

    // if Component.syncTabs is available, also keep browser tabs in
    // sync - syncTabs will create an event which monitors localStorage
    // changes and re-renders the given component if it's storage changed.
    if (self.syncTabs) {
        window.syncTab  = window.syncTab || [];
        if (!window.syncTab[c.uid]) self.syncTabs(c)
    }

    localStorage.setItem(self.store, JSON.stringify(state))
  }

};

export default storage;
