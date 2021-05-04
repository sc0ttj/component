/**
 * Main function - Create audio objects from a library of sounds, such as mp3 files
 *
 * sounds - an object containing the library sounds to create (required)
 * c      - the component to attach the library of sounds to (optional)
 *
 */
const useAudio = function(sounds, c) {
  if (!document || !window || typeof sounds !== 'object') return;

  // a "no operation" function, use as a default setting for some callbacks
  const noop = function noop(){ return; };

  // create the global audio "context" - in which we can create sounds, buffers,
  // filters, then chain them, and send them to the "destination" (audio out)
  window.audioCtx = window.audioCtx ? window.audioCtx : new AudioContext();

  // normalize browser syntax
  if (!audioCtx.createGain) audioCtx.createGain = audioCtx.createGainNode;
  if (!audioCtx.createDelay) audioCtx.createDelay = audioCtx.createDelayNode;
  if (!audioCtx.createScriptProcessor) audioCtx.createScriptProcessor = audioCtx.createJavaScriptNode;

  // the library of the sounds Nodes returned by the main function
  const library = {};

  // store audio buffer objects in here, ready to be put into bufferSourceNodes,
  // which are high performance "fire and forget" audio nodes with a start()
  // method called by play() method
  const cache = {};

  // set the number of files that need to be loaded
  const totalFiles = Object.keys(sounds).length;
  // set the number of files loaded so far
  let loadedFiles = 0;


  // download the given audio file, decode it, save it as a buffer into
  // cache[name], then run the given callback, which fileLoaded()
  const loadFile = (url, callback) => {
    if (cache[name]) return cache[name];
    // else, create a request
    const req = new XMLHttpRequest();
    req.open("GET", url);
    req.responseType = "arraybuffer";
    // once req is completed, run this func
    req.onload = function() {
      // decode the response data into a buffer object, and pass it to callback
      let d = req.response;
      audioCtx.decodeAudioData(d, function(buffer) {
        if (typeof callback === 'function') callback(buffer);
      });
    };
    // send the request
    req.send();
    callback();
  };



  // the callback passed into loadFile, run once the given file has loaded,
  // receives the file as a buffer
  const fileLoaded = (buffer) => {
    // cache the buffer object
    cache[name] = cloneBuffer(buffer);
    // add the current sound to the library of sounds to be returned (namely,
    // add library[name] and populate it with all the sounds props)
    addToLibrary();
    // add to count of files now loaded
    loadedFiles += 1;
    // autoplay if needed
    if (library[name].autoplay === true) library[name].play();
  };



  // clone a buffer object, so we can save it to the cache before playing it
  // (after which the buffer normally disappears and is garbage collected)
  const cloneBuffer = inBuffer => {
    let outBuffer = audioCtx.createBuffer(
      inBuffer ? inBuffer.numberOfChannels : 2,
      inBuffer ? inBuffer.length : 0,
      inBuffer ? inBuffer.sampleRate : audioCtx.sampleRate
    );
    for (var i = 0, c = inBuffer.numberOfChannels; i < c; ++i) {
      let od = outBuffer.getChannelData(i),
        id = inBuffer.getChannelData(i);
      od.set(id, 0);
    }
    return outBuffer;
  }



  // create the wrapper sound object that is added to the returned library of sounds
  const addToLibrary = () => {
    // add the audio as an object, to the "library" of sounds
    library[name] = {
      // set some properties
      name: name,
      src: src,
      // TODO: the main methods
      play: play,
      rapidFire: rapidFire,
      pause: noop,
      stop: noop,
      mute: noop,
      connectTo: noop,  // for changing the output of the sound (audioCtx.destination, etc)
      remove: noop,
      // TODO: callbacks
      onPlay: item[1].onPlay || noop,
      onPause: item[1].onPause || noop,
      onResume: item[1].onResume || noop,
      onStop: item[1].onStop || noop,
      onEnd: item[1].onEnd || noop,
      onChange: item[1].onChange || noop,  // fired when a prop in state changes
      onRemove: item[1].onRemove || noop,
      // the default inputs and outputs
      // if src is an array of soundObjects, use them as inputs, else create
      // a buffer source node
      input: typeof src === 'object' ? null : audioCtx.createBufferSource(),
      output: audioCtx.destination,
      // the actual audio nodes that will be connected and form the audio graph..
      // this will be created by the play() method, will include the input/output
      audioNodes: [],
      // audio properties
      state: {
        isPlaying: false,                         // boolean
        volume: item[1].volume || 1,              // 0 is slient, 1 is 100%, 2 is 200%
        autoplay: item[1].autoplay || false,      // boolean
        loop: item[1].loop || false,              // boolean
        playbackRate: item[1].playbackRate || 1,  // 1 is normal speed, 2 is double speed
        startTime: item[1].startTime || 0,        // start time of the sound, when played
        solo: item[1].solo || false,              // boolean
        fadeIn: item[1].fadeIn || 0,              // duration in seconds
        fadeOut: item[1].fadeOut || 0,            // duration in seconds
      },
      // allow updating individual sounds with mySound.settings({ ... })
      settings: function(props, cb) {
        // update the state
        library[name].state = { ...library[name].state, ...props };
        // update settings of each audio node
        configureAudioNodesFor(library[name]);
        if (typeof cb === 'function') cb(library[name].state);
        return library[name];
      },
    };
    // add filter settings to state
    if (filters) {
      Object.keys(filters).forEach(filterName => {
        // add filter settings to state
        library[name].state[filterName] = filters[filterName];
      });
    }
  }



  // play the sound
  const play = () => {
    // get the input node
    const input = library[name].input;
    // only get buffer if input is buffer source node, else get sound objects
    // in src, and play each one of those instead
    if (!input) {
      [...src].forEach(inputSound => inputSound.play());
      return;
    }
    // set the sound nodes buffer property to the (down)loaded sound
    if (input && cache[name]) input.buffer = cloneBuffer(cache[name]);
    // create all audio nodes that we need
    library[name].audioNodes = createNodes();
    // now connect them up, in the proper order
    connectNodes();
    // randomise sound if need be
    const sound = library[name].state.randomization
      ? randomiseSound(library[name])
      : library[name];
    // set all properties on the relevent audio nodes to match the sounds "state"
    configureAudioNodesFor(sound);
    // normalize for better browser support
    if (!input.start) input.start = input.noteOn;
    // play the sound
    input.start(sound.startTime);
    // enable fade in if needed
    if (typeof library[name].fadeIn === 'number' && library[name].fadeIn > 0) {
      fadeIn(library[name].fadeIn);
    }
    // enabling looping on node if set in the state props
    if (library[name].state.loop) input.loop = true;
  };


  // returns a slightly randomised version of the given sound
  const randomiseSound = soundObj => {
    const s = { ...soundObj };
    const r = soundObj.state.randomization;
    s.state.volume = 1 + Math.random() * r.volume;
    s.state.playbackRate = 1 + Math.random() * r.playbackRate;
    s.state.startTime = t + i * 0.01 + Math.random() * r.startTime;
    return s;
  };

  // play a sound multiple times, with (slightly) randomised volume, pitch and tempo
  const rapidFire = (num) => {
    if (!num) return;
    const t = audioCtx.currentTime;
    const input = library[name].input;
    // Make multiple sources using the same buffer and play in quick succession.
    for (let i = 0; i < num; i++) {
      // get the input node
      const input = library[name].input;
      // only get buffer if input is buffer source node, else get sound objects
      // in src, and play each one of those instead
      if (!input) {
        [...src].forEach(inputSound => inputSound.rapidFire(num));
        return;
      }
      if (input && cache[name]) input.buffer = cloneBuffer(cache[name]);
      // create all audio nodes that we need
      library[name].audioNodes = createNodes();
      // now connect them up, in the proper order
      connectNodes();
      // set randomised volume and playback rate
      const randomisedSound = randomiseSound(library[name]);
      // set all properties on the relevent audio nodes to match the sounds "state"
      configureAudioNodesFor(randomisedSound);
      // normalize for better browser support
      if (!input.start) input.start = input.noteOn;
      // play, with randomised start point
      input.start(randomisedSound.startTime);
      // enable fade in if needed
      if (typeof library[name].fadeIn === 'number' && library[name].fadeIn > 0) {
        fadeIn(library[name].fadeIn);
      }
    }
  }


  // check if an audio node is disabled in the options
  const isDisabled = n => n === undefined || n === null || n === false;

  const createNodes = () => {
    // define a list of all audio nodes needed in the chain
    const graph = [
      library[name].input,
    ];
    if (hasFilters) {
      // get filter opts
      const filters = item[1].filters; // from given user opts
      const filterNodes = {};
      // create a filter node for each one that given
      Object.keys(filters).forEach(type => {
        const opts = filters[type];
        // skip filter is no valid settings given
        if (isDisabled(opts)) return;
        // create filter and add to a list of all enabled filters
        filterNodes[type] = createFilterNode(type, opts);
      });
      // now sort all filterNodes into the "proper" order
      [
       'gain', 'panning', 'panning3d', 'lowpass', 'lowshelf',
       'peaking', 'notch', 'highpass', 'highshelf', 'equalizer',
       'reverb', 'randomization', 'compression'
      ].forEach(filterName => {
        if (filterNodes[filterName]) graph.push(filterNodes[filterName]);
      });
    }
    // add the output to the graph
    graph.push(library[name].output)
    return graph;
  };



  // create filter nodes of given "type", with options "o"
  const createFilterNode = (type, o) => {
    let n = undefined; // the node to return
    switch (type) {
      case 'panning':
        n = audioCtx.createStereoPanner();
  	    n.type = type;
        n.pan.value = typeof o === 'number' ? o : 0;
        break;
      case 'panning3d':
        n = audioCtx.createPanner();
  	    n.type = type;
        // TODO
        break;
      case 'delay':
        n = audioCtx.createDelay();
  	    n.type = type;
        n.delayTime.value = typeof o === 'number' ? o : 0;
        break;
      case 'lowpass':
      	n = audioCtx.createBiquadFilter();
  	    n.type = type;
      	n.frequency.value = o.freq ? o.freq : 320.0;
      	n.Q.value = o.q ? o.q : 0.0;
        break;
      case 'highpass':
      	n = audioCtx.createBiquadFilter();
  	    n.type = type;
      	n.frequency.value = o.freq ? o.freq : 1000.0;
      	n.Q.value = o.q ? o.q : 0.0;
        break;
      case 'bandpass':
        const from = o.from ? o.from : 300.0;
        const to = o.to ? o.to : audioCtx.sampleRate;
        const geometricMean = Math.sqrt(from * to);
      	n = audioCtx.createBiquadFilter();
  	    n.type = type;
        n.frequency.value = o.freq ? o.freq : 320.0;
        n.Q.value = geometricMean / (to - from);
        break;
      case 'lowshelf':
      	n = audioCtx.createBiquadFilter();
  	    n.type = type;
      	n.frequency.value = o.freq ? o.freq : 320.0;
      	n.gain.value = o.gain ? o.gain : 0.0;
        break;
      case 'highshelf':
      	n = audioCtx.createBiquadFilter();
  	    n.type = type;
      	n.frequency.value = o.freq ? o.freq : 1000.0;
      	n.gain.value = o.gain ? o.gain : 0.0;
        break;
      case 'peaking':
      	n = audioCtx.createBiquadFilter();
  	    n.type = type;
      	n.frequency.value = o.freq ? o.freq : 1000.0;
      	n.gain.value = o.gain ? o.gain : 0.0;
      	n.Q.value = o.q ? o.q : 0.1; // "width" of freqs covered, 0.1 is 1/10th ??
        break;
      case 'notch':
      	n = audioCtx.createBiquadFilter();
  	    n.type = type;
      	n.frequency.value = o.freq ? o.freq : 1000.0;
      	n.Q.value = o.q ? o.q : 0.0;
        break;
      case 'equalizer':
        // TODO
        break;
      case 'reverb':
        n = audioCtx.createConvolver();
  	    n.type = type;
        // TODO
        break;
      case 'randomization':
        // TODO
        break;
      case 'compression':
        n = audioCtx.createDynamicsCompressor();
  	    n.type = type;
        n.threshold = o.threshold ? o.threshold : n.threshold;
        n.knee = o.knee ? o.knee : n.knee;
        n.ratio = o.ratio ? o.ratio : n.ratio;
        n.attack = o.attack ? o.attack : n.attack;
        n.release = o.release ? o.release : n.release;
        break;
      default:
        break;
    }
    return n;
  };



  const connectNodes = () => {
    // connect all enabled audio nodes
    library[name].audioNodes.forEach((n, i) => {
      const curr = n;
      const next = library[name].audioNodes[i + 1];
      if (curr && next) {
        curr.connect(next);
      }
    });
  };



  // apply the properties in soundObj.state to its relevant audio nodes and filters
  const configureAudioNodesFor = (soundObj) => {
    // s = current sound object
    const s = soundObj;
    const ct = audioCtx.currentTime;
    // for each sound property in soundObject.state
    Object.keys(soundObj.state).forEach(key => {
      const nodeType = key === 'volume' ? 'gain' : key;
      // n = the audio node of type 'key' (if any)
      const n = library[name].audioNodes.filter(n => n.type === nodeType);
      const val = s.state[key];
      switch (key) {
        case 'volume':
        case 'gain':
          n.gain.setValueAtTime(s.mute ? 0 : val, ct);
          break;
        case 'loop':
          s.loop = val;
          break;
        case 'playbackRate':
          s.playbackRate.value = val;
          break;
        case 'solo':
          if (p === true) {
            const otherSounds = Object.keys(library).filter(key !== s.name);
            otherSounds.forEach(sound => library[sound].mute());
          }
          break;
        case 'fadeIn':
        case 'fadeOut':
          // not set in audio nodes props, set in s.state, checked in play()
          break;
        // filters
        case 'panning':
          n.pan.setValueAtTime(o, ct);
          break;
        case 'panning3d':
          // TODO
          break;
        case 'delay':
          n.delayTime.setValueAtTime(o, ct);
          break;
        case 'lowpass':
        case 'highpass':
        case 'bandpass':
          n.frequency.setValueAtTime(o.freq, ct);
          n.Q.setValueAtTime(o.q, ct);
          break;
        case 'lowshelf':
        case 'highshelf':
          n.frequency.setValueAtTime(o.freq, ct);
          n.gain.setValueAtTime(o.gain, ct);
          break;
        case 'peaking':
          n.frequency.setValueAtTime(o.freq, ct);
          n.gain.setValueAtTime(o.gain, ct);
          n.Q.setValueAtTime(o.q, ct);
          break;
        case 'notch':
          n.frequency.setValueAtTime(o.freq, ct);
          n.gain.setValueAtTime(o.gain, ct);
          break;
        case 'reverb':
          // TODO
          break;
        case 'equalizer':
          // TODO
          break;
        case 'randomization':
          // not set in audio nodes props, set in state, checked in play()
          break;
        case 'compression':
          n.threshold.setValueAtTime(o.threshold, ct);
          n.knee.setValueAtTime(o.knee, ct);
          n.ratio.setValueAtTime(o.ratio, ct);
          n.attack.setValueAtTime(o.attack, ct);
          n.release.setValueAtTime(o.release, ct);
          break;
        default:
          break;
      }
    });
  };


  const fadeIn = function(durationInSeconds) {
      const gainNode = input.audioNodes[1];
      gainNode.gain.value = 0;
      if (durationInSeconds) input.state.fadeIn = durationInSeconds;
      fade(input.state.volume, input.state.fadeIn);
  };

  const fadeOut = function (durationInSeconds) {
      if (durationInSeconds) input.state.fadeOut = durationInSeconds;
      fade(0, input.state.fadeOut);
  };

  const fade = function (endValue, durationInSeconds) {
      const gainNode = input.audioNodes[1];
      if (input.state.isPlaying) {
        gainNode.gain.linearRampToValueAtTime(
          gainNode.gain.value, audioCtx.currentTime
        );
        gainNode.gain.linearRampToValueAtTime(
          endValue, audioCtx.currentTime + durationInSeconds
        );
      }
  };


  //
  // main function body
  //

  // process each sound given
  Object.entries(sounds).forEach(item => {
    // work out some info about the sound
    const name = item[1].name || item[0];
    const src = item[1].src || item[1];
    const hasFilters = typeof item[1] === 'object' && typeof item[1].filters === 'object';
    const filters = hasFilters ? item[1].filters : undefined;
    library[name] = null;
    // create an item in cache that will hold a  buffer, in which we will store
    // the audio data returned from an AJAX request
    cache[name] = null;
    if (typeof src === 'string') {
      // download audio file, save it as a buffer, in the fileLoaded callback
      loadFile(src, fileLoaded);
    }
    else {
      // add the current sound to the library of sounds to be returned (namely,
      // add library[name] and populate it with all the sounds props)
      addToLibrary();
      // update other song objects if they're names as src inputs to this one
      if (Array.isArray(src)) {
        // for each item in array, set the output to the gain node of this sound
        src.forEach(item => item.output = library[name].audioNodes[1]);
      } else if (src.output) {
        // set the output to the gain node of this sound
        src.output = library[name].audioNodes[1];
      }
      // add to count of files now loaded
      loadedFiles += 1;
      // autoplay if needed
      if (library[name].autoplay === true) library[name].play();
    }
  });

  // allow updating all sounds at once via audio.settings({ ... })
  library.settings = (props, cb) => {
    // update all sounds
    Object.keys(library).forEach(audioObj => {
      if (!library[audioObj]) return;
      // update the state
      library[audioObj].state = { ...library[audioObj].state, ...props };
      // update settings of each audio node
      configureAudioNodesFor(library[audioObj]);
    });
    // then run the callback, if any
    if (typeof cb === 'function') cb(library[audioObj].state);
    // make it chainable
    return library;
  };

  // attach all our sounds to the given component, if any
  if (c) c.audio = library;

  // return all the sounds
  return library;
};


// finally, export the main function
//
export default useAudio;
