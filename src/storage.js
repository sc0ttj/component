/**
 * Enable persistant storage using localStorage
 */
const storage = {

  getItem: (c, state) => {
    if (!c.store) return state;
    // console.log('getItem:', c.store, state);
    const s = JSON.parse(localStorage.getItem(c.store))
    return s ? { ...state, ...s } : state;
  },

  setItem: (c, state) => {
    if (!c.store) return state;

    // if Component.syncTabs is available, also keep browser tabs in
    // sync - syncTabs will create an event which monitors localStorage
    // changes and re-renders the given component if it's storage changed.
    if (!c.isNode && Component.syncTabs) {
        window.syncTab  = window.syncTab || [];
        if (!window.syncTab[c.uid]) Component.syncTabs(c)
    }

    localStorage.setItem(c.store, JSON.stringify(state))
  }

};

export default storage;
