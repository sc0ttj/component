/**
 * Synchronize state updates and page renders between browser tabs
 * @param {func} c - the component to re-render when it's storage updates/changes
 */
const syncTabs = function(c) {
  if (!window) return;
  // the "storage" event fires when localStorage is updated
  window.addEventListener('storage', function (event) {
    // if the storage obj that changed is the given components "store",
    // then add the new "store" data to the latest state
    if (event.key === c.store) {
      let newState = JSON.parse(event.newValue);
      c.setState({ ...c.state, ...newState })
    }
  });
  window.syncTab[c.uid] = true
};

export default syncTabs;
