const onScroll = (fn, c) => {
  if (!document) return;

  const cb = function() {
    // get document bounds
    const pageBounds = document.body.getBoundingClientRect();
    // get guideline (marker) position
    const offset = c.onScroll.offset || 35;
    const guideline = document.documentElement.clientHeight / 100 * offset; // 50% of page height
    // debounce scroll updates to 60fps
    requestAnimationFrame(totalFrames => {
      // get component position, relative to guideline (marker)
      const bounds = c.html.getBoundingClientRect();
      const outside = bounds.top > guideline || bounds.bottom < guideline;
      let progress = (guideline - bounds.top) / bounds.height;
      if (bounds.top >= guideline) progress = 0;
      if (bounds.bottom <= guideline) progress = 1;
      c.onScroll.frame = !outside ? (c.onScroll.frame || 0) + 1 : 0;
      // setup the props to return
      const scrollProps = {
        frame: c.onScroll.frame,
        totalFrames: +totalFrames.toFixed(0),
        progress: +progress.toFixed(2),
      };
      // run the given function, pass in current scroll props
      fn(scrollProps)
    });
  };

  if (!c.onScroll.ready) {
    window.addEventListener('scroll', cb);
    c.onScroll.ready = true;
    console.log('added SCROLL event');
  }
}

export default onScroll;
