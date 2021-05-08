/**
  The useAudio() function uses lots of code and ideas from these projects:

    - https://github.com/kittykatattack/sound.js
    - https://github.com/madebywild/audioFX

  To add more features or extend useAudio, take a look at Tuna.js
*/



/**
 * useAudio - main function, creates audio objects from a library of sounds, such as mp3 files
 *
 * param sounds - an Object containing the library of sounds to create (required)
 * param c      - the Component to attach the library of sounds to (optional)
 *
 */
const useAudio = function(sounds, c) {
  // if not in browser, exit
  if (!document || !window || typeof sounds !== 'object') return;

  // a "no operation" function, used as a default setting for some callbacks
  const noop = function noop(){ return; };

  // create the global "audio context", or hook into an existing one
  window.audioCtx = window.audioCtx ? window.audioCtx : new AudioContext();

  // normalize browser syntax
  if (!audioCtx.createGain) audioCtx.createGain = audioCtx.createGainNode;
  if (!audioCtx.createDelay) audioCtx.createDelay = audioCtx.createDelayNode;
  if (!audioCtx.createScriptProcessor) audioCtx.createScriptProcessor = audioCtx.createJavaScriptNode;


  // the library of the sounds Nodes returned by this function
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
  // cache[name], then run the given callback, which is fileLoaded()
  const loadFile = (url, callback) => {
    // if we already cached it, use the cached one
    if (cache[name]) {
      callback(cache[name]);
      return;
    }
    // else, create a AJAX request
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
  };



  // the callback passed into loadFile, run once the given file has loaded,
  // receives the file as a buffer
  const fileLoaded = (buffer) => {
    // cache the buffer object
    cache[name] = cloneBuffer(buffer);
    // add the current sound to the library of sounds to be returned (namely,
    // add library[name] and populate it with all the sounds props)
    addToLibrary();
    // add to count of files now loaded and check if all done
    checkAllFilesLoaded();
    // autoplay if needed
    if (library[name].autoplay === true) library[name].play();
  };


  // count each file downloaded via AJAX, check if num loaded matches total
  const checkAllFilesLoaded = () => {
    loadedFiles += 1;
    // check if all files loaded
    if (totalFiles === loadedfiles) {
      document.dispatchEvent(new CustomEvent("audioLoaded", library));
      console.log('audioLoaded', library);
    }
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



  // create the sound Object and add it to the library that we return
  const addToLibrary = () => {
    // library is the main object returned, and "name" is the name of the current
    // sound object. The library object contains all our sounds - here, we add
    // the sound (name) as an object to the "library" of sounds to be returned
    library[name] = {
      // set some properties
      name: name,
      src: src, // should be a string, another sound object, or an array of sound objects
      // the main methods
      play: play,
      playFrom: playFrom,
      rapidFire: rapidFire,
      pause: pause,
      fadeIn: fadeIn,
      fadeOut: fadeOut,
      stop: stop,
      mute: mute,
      unmute: unmute,
      connectTo: connectTo,
      // callbacks
      onPlay: item[1].onPlay || noop,
      onPause: item[1].onPause || noop,
      onResume: item[1].onResume || noop,
      onStop: item[1].onStop || noop,
      onChange: item[1].onChange || noop,  // fired when a prop in state changes or sound is -reconnected
      // the default input and output nodes:
      // if src is an array of soundObjects, use them as inputs, else create
      // a buffer source node
      input: typeof src === 'object' ? null : audioCtx.createBufferSource(),
      output: audioCtx.destination,
      // the actual audio nodes that will be connected and form the audio graph..
      // this will be created by the play() method, and will include input/output
      // above... NOTE: if defined, equaliser nodes end up in their own array,
      // separate from this list of audio nodes, so that we can keep track of
      // which nodes are used for what, and that the equaliser can be adjusted
      // as a single "thing", via settings
      audioNodes: [],
      // audio properties - all audio nodes have these settings applied to them
      // where relevant, and the play(), pause() etc  methods check for and
      // respect these settings. All filter settings will be added to state too.
      // The state should be updated using the mySound.settings({ ... }) method.
      state: {
        isPlaying: false,                         // boolean
        volume: item[1].volume || 1,              // 0 is slient, 1 is 100%, 2 is 200%
        muted: item[1].muted || false,            // false is not muted
        autoplay: item[1].autoplay || false,      // boolean
        loop: item[1].loop || false,              // boolean
        playbackRate: item[1].playbackRate || 1,  // 1 is normal speed, 2 is double speed
        startTime: item[1].startTime || 0,        // start time of the sound, when played
        startOffset: item[1].startOffset || 0,    // used to help track pause/resume/play times
        fadeIn: item[1].fadeIn || 0,              // duration in seconds
        fadeOut: item[1].fadeOut || 0,            // duration in seconds
      },
      // this is the mySound.settings() method... it allows updating the props
      // or individual sounds with mySound.settings({ ... }) - you need pass in
      // only the options you want to change.
      settings: function(props, cb) {
        // update the state
        library[name].state = { ...library[name].state, ...props };
        // update settings of each audio node
        configureAudioNodesFor(library[name]);
        if (typeof cb === 'function') cb(library[name].state);
        // setting have changed, call the relevant callback
        library[name].onChange(library[name].state);
        // return the whole sound object
        return library[name];
      },
    };
    // create all audio nodes that we need
    library[name].audioNodes = createNodes();
  }



  // for each audio node in soundObj, apply settings from state - this function
  // is called by the setting() method and play(), etc.
  const configureAudioNodesFor = (soundObj) => {
    // s = current sound object
    const s = soundObj;
    // for each sound property in soundObject.state
    Object.keys(soundObj.state).forEach(key => {
      const nodeType = key === 'volume' ? 'gain' : key;
      // get the the audio node of type 'nodeType'
      const node = getAudioNode(library[name], nodeType);
      // get opts/values of the current prop (key) in sound objects state
      const opts = s.state[key];
      // set the value based on the property (key) in the state
      setNodesProps(node, opts);
    });
  };


  // helper func - check if an audio node is disabled in the options
  const isDisabled = n => n === undefined || n === null || n === false;

  // create all audio nodes defines in sound settings, and return them in an array
  const createNodes = () => {
    // define a list of all audio nodes needed in the chain
    const graph = [
      library[name].input, // the input node
    ];
    // get filter opts
    const filterNodes = {};
    // always create a gain node, as they're not listed with the other filters
    // in the config pass to us by user
    const allFilters = { gain: library[name].state.volume, ...filters };
    // create a filter node for each one defined
    Object.keys(allFilters).forEach(type => {
      // get the options for this filter
      const opts = allFilters[type];
      // skip filter is no valid settings given
      if (isDisabled(opts)) return;
      // create filter and add to a list of all enabled filters
      filterNodes[type] = createFilterNode(type, opts);
      // add filter settings to state
      library[name].state[type] = opts;
      // set audio nodes props to match values in the sounds state
      setNodeProps(filterNodes[type], opts);
    });
    // now sort all filterNodes into the "proper" order
    [
     'gain', 'panning', 'panning3d', 'reverb', 'equalizer', 'lowpass',
     'lowshelf', 'peaking', 'notch', 'highpass', 'highshelf', 'bandpass',
     'allpass', 'compression'
    ].forEach(type => {
      // attach the node in the list (type)
      if (filterNodes[type] && type !== 'equalizer') {
        graph.push(filterNodes[type]);
      }
      // add all the equalizer nodes, which are not in filterNodes,
      // but in the library[name].eq array
      else if (type === 'equalizer') {
        library[name].eq.forEach(node => {
          graph.push(node);
        });
      }
    });
    // add the output node to the graph
    graph.push(library[name].output)
    return graph;
  };


  // create filter nodes of given "type", with options "o"
  const createFilterNode = (type, o) => {
    let n = undefined; // the node to return
    switch (type) {
      case 'gain':
      case 'volume':
        n = audioCtx.createGain();
        break;
      case 'panning':
        n = audioCtx.createStereoPanner();
        break;
      case 'panning3d':
        n = audioCtx.createPanner();
        break;
      case 'delay':
        n = audioCtx.createDelay();
        break;
      case 'lowpass':
      case 'highpass':
      case 'bandpass':
      case 'allpass':
      case 'lowshelf':
      case 'highshelf':
      case 'peaking':
      case 'notch':
        n = audioCtx.createBiquadFilter();
        break;
      case 'equalizer':
        // we need to return an "audio node" to put into our graph array, but
        // we don't wanna create only one node for our equalizer, so
        // return a fake node into the list, of type "equalizer", and add
        // all the nodes we need to a separate array - we'll parse the fake
        // node of type "equalizer" in setNodeProps(), and access it's array
        // of nodes there
        n = {
          type: 'equalizer',
        };
        // create the array that holds each filter node (each is a eq band)
        library[name].eq = [];
        // each obj in o is a filter settings obj, so create an audio node
        // for each one, with the correct type
        let i = 1;
        o.forEach((eq) => {
          const eqNode = audioCtx.createBiquadFilter();
          if (i === 1) {
            eqNode.type = 'lowshelf';
          }
          else if (i === o.length) {
            eqNode.type = 'highshelf';
          }
          else {
            eqNode.type = 'peaking';
          }
          // add each audio node to the "equalizer" array
          library[name].eq.push(eqNode);
          i++;
        });
        break;
      case 'reverb':
        n = audioCtx.createConvolver();
        break;
      case 'compression':
        n = audioCtx.createDynamicsCompressor();
        break;
      default:
        break;
    }
    // set a type (used in createNodes() to filter node list)
    if (n) n.type = type;
    // return the audio node
    return n;
  };



  // helper functions used in setNodeProps(), to check and set filter values
  const has = prop => typeof o[prop] === 'number';
  const setVal = (prop, v) => n[prop].setValueAtTime(v, ct);
  const setFreq = () => n.frequency.setValueAtTime(o.freq, ct);
  const setGain = () => n.gain.setValueAtTime(o.gain, ct);
  const setQ = () => n.Q.setValueAtTime(o.q, ct)

  // the the props of the given audio node (n) to match the values in the
  // current sounds state options (o)
  const setNodeProps = (n, o) => {
    const type = n.type;
    const ct = audioCtx.currentTime;
    switch (type) {
      case 'volume':
      case 'gain':
        let v = typeof o === 'number' ? o : 1;
        if (library[name].state.mute) v = 0;
        setVal('gain', v);
        break;
      case 'panning':
        setVal('pan', typeof o === 'number' ? o : 0);
        break;
      case 'panning3d':
        // TODO
        break;
      case 'delay':
        setVal('delay', typeof o === 'number' ? o : 0);
        break;
      case 'lowpass':
      case 'highpass':
      case 'bandpass':
      case 'allpass':
      case 'lowshelf':
      case 'highshelf':
      case 'peaking':
      case 'notch':
      	if (has('freq')) setFreq();
      	if (has('gain')) setGain();
      	if (has('q')) setQ();
        break;
      case 'reverb':
        n.buffer = impulseResponse(
          o.duration ? o.duration : 2,
          o.decay ? o.decay : 2,
          o.reverse ? o.reverse : false
        );
        break;
      case 'equalizer':
        // Note - the equalizer is an array of nodes, so don't set props on 'n',
        // instead loop over the array and set props for each
        if (Array.isArray(library[name].eq)) {
          // get each filter in equalizer, and apply the settings in 'opts'
          o.forEach((opts, i) => {
            const node = library[name].eq[i];
            if (typeof opts.freq === 'number') node.frequency.setValueAtTime(opts.freq, ct);
            if (typeof opts.gain === 'number') node.gain.setValueAtTime(opts.gain, ct);
            if (typeof opts.q === 'number') node.Q.setValueAtTime(opts.q, ct);
          });
        }
        break;
      case 'compression':
        if (has('threshold')) setVal('threshold', o.threshold);
        if (has('knee')) setVal('knee', o.knee);
        if (has('ratio')) setVal('ratio', o.ratio);
        if (has('attack')) setVal('attack', o.attack);
        if (has('release')) setVal('release', o.release).
        break;
      default:
        break;
    }
  }



  // public method on soundObjs
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
    // now connect the audio nodes, in the proper order
    connectNodes(library[name]);
    // randomise sound if need be
    const s = typeof library[name].state.randomization === 'object'
      ? randomiseSound(library[name])
      : library[name];
    // set all properties on the relevent audio nodes to match the sounds "state"
    configureAudioNodesFor(s);
    // normalize for better browser support
    if (!input.start) input.start = input.noteOn;
    // play the sound
    input.start(s.state.startTime, s.state.startOffset % input.buffer.duration);
    // run the callbacks
    if (s.state.startOffset === 0) library[name].onPlay(s.state);
    if (s.state.startOffset > 0) library[name].onResume(s.state);
    // enable fade in if needed
    if (typeof library[name].fadeIn === 'number' && library[name].fadeIn > 0) {
      fadeIn(library[name].fadeIn);
    }
    // enabling looping on node if set in the state props
    if (library[name].state.loop) input.loop = true;
  };


  // internal method, used by play(), rapidFire(), to connect up the audio nodes
  // before playing the sound
  const connectNodes = (soundObj) => {
    // connect all enabled audio nodes
    soundObj.audioNodes.forEach((n, i) => {
      const curr = n;
      const next = soundObj.audioNodes[i + 1];
      if (curr && next && curr.connect) {
        curr.connect(next);
      }
    });
  };


  // returns a slightly randomised version of the given sound
  const randomiseSound = soundObj => {
    const s = { ...soundObj };
    const r = soundObj.state.randomization;
    s.state.volume = s.state.volume + (Math.random() * r.volume);
    s.state.playbackRate = s.state.playbackRate + (Math.random() * r.playbackRate);
    s.state.startTime = s.state.startTime + 1 * (0.01 + Math.random() * r.startTime);
    return s;
  };


  // public method on soundObjs
  // play a sound multiple times, with (slightly) randomised volume, pitch and tempo
  const rapidFire = (num) => {
    if (!num) return;
    const t = audioCtx.currentTime;
    const input = library[name].input;
    // only get buffer if input is buffer source node, else get sound objects
    // in src, and play each one of those instead
    if (!input) {
      [...src].forEach(inputSound => inputSound.rapidFire(num));
      return;
    }
    // Make multiple sources using the same buffer and play in quick succession.
    for (let i = 0; i < num; i++) {
      if (input && cache[name]) input.buffer = cloneBuffer(cache[name]);
      // now connect up the audio nodes, in the proper order
      connectNodes(library[name]);
      // set randomised volume and playback rate
      const randomisedSound = randomiseSound(library[name]);
      // set all properties on the relevent audio nodes to match the sounds "state"
      configureAudioNodesFor(randomisedSound);
      // normalize for better browser support
      if (!input.start) input.start = input.noteOn;
      // play, with randomised start point
      input.start(randomisedSound.state.startTime, sound.state.startOffset % input.buffer.duration);
      // run the callbacks
      if (library[name].state.startOffset === 0) library[name].onPlay(library[name].state);
      if (library[name].state.startOffset > 0) library[name].onResume(library[name].state);
      // enable fade in if needed
      if (typeof library[name].fadeIn === 'number' && library[name].fadeIn > 0) {
        fadeIn(library[name].fadeIn);
      }
    }
  }


  // public method on soundObjs
  const pause = () => {
      //Pause the sound if it's playing, and calculate the
      //`startOffset` to save the current position.
      if (library[name].state.isPlaying) {
        library[name].input.stop(0);
        library[name].state.startOffset += audioCtx.currentTime - library[name].state.startTime;
        library[name].state.isPlaying = false;
        // run the callback
        library[name].onPause(library[name].state);
      }
  };


  // public method on soundObjs
  const playFrom = (time) => {
      if (library[name].state.isPlaying) {
        library[name].input.stop(0);
      }
      library[name].state.startOffset = time;
      library[name].play();
  };


  // public method on soundObjs
  const stop = () => {
    //Stop the sound if it's playing, reset the start and offset times,
    //then call the `play` method again.
    if (library[name].state.isPlaying) {
      library[name].input.stop(0);
      library[name].state.isPlaying = false;
      library[name].state.startOffset = 0;
      // run the callback
      library[name].onStop(library[name].state);
    }
  };

  // public method on soundObjs
  const mute = () => {
    // set a previous volume, so we can restore it
    library[name].state.prevVol = library[name].state.volume;
    library[name].settings({
      volume: 0,
      muted: true,
    });
  }

  // public method on soundObjs
  const unmute = () => {
    library[name].settings({
      volume: library[name].state.prevVol,
      prevVol: undefined,
      muted: false,
    });
  }


  // public method on soundObjs
  // method added to sound object to let users re-connect sounds, by doing
  // soundObj.connect(otherSoundObj);
  const connectTo = (otherSound) => {
    const n = library[name].audioNodes;
    const lastNode = n[n.length - 2];
    lastNode.disconnect(audioCtx.destination);
    lastNode.connect(getAudioNode(otherSound, 'pan'));
    // setting have changed, call the relevant callback
    library[name].onChange(library[name].state);
  };


  // helper func to get an audio node by type (useAudio always add a type
  // property to audio nodes, even if they don't normally have them)
  const getAudioNode = (soundObj, type) => {
    if (!soundObj.audioNodes) return;
    return soundObj.audioNodes.filter(n => n.type === type);
  };

  // public method on soundObjs
  const fadeIn = function(durationInSeconds) {
      const gainNode = getAudioNode(input, 'gain');
      gainNode.gain.value = 0;
      if (durationInSeconds) input.state.fadeIn = durationInSeconds;
      fade(input.state.volume, input.state.fadeIn);
  };


  // public method on soundObjs
  const fadeOut = function (durationInSeconds) {
      if (durationInSeconds) input.state.fadeOut = durationInSeconds;
      fade(0, input.state.fadeOut);
  };


  // helper func called by fadeIn() and fadeOut()
  const fade = function (endValue, durationInSeconds) {
      const gainNode = getAudioNode(input, 'gain');
      if (input.state.isPlaying) {
        gainNode.gain.linearRampToValueAtTime(
          gainNode.gain.value, audioCtx.currentTime
        );
        gainNode.gain.linearRampToValueAtTime(
          endValue, audioCtx.currentTime + durationInSeconds
        );
      }
  };



  // simulate a model of sound reverberation in an acoustic space which
  // a convolver node can blend with the source sound.
  function impulseResponse(duration, decay, reverse) {
    //The length of the buffer.
    const length = audioCtx.sampleRate * duration;
    //Create an audio buffer to store the reverb effect.
    const impulse = audioCtx.createBuffer(2, length, audioCtx.sampleRate);
    //Use `getChannelData` to initialize empty arrays to store sound data for
    //the left and right channels.
    const left  = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    //Loop through each sample-frame and fill the channel
    //data with random noise.
    let n;
    if (reverse) {
      //Apply the reverse effect, if `reverse` is `true`.
      for (let i = 0; i < length; i++) {
        let multi = Math.pow(1 - n / length, decay)
        left[n] = (Math.random() * 0.5) * multi;
        right[n] = (Math.random() * 0.5) * multi;
      }
    } else {
      for (let i = 0; i < length; i++) {
        n = reverse ? length - i : i;
        let multi = Math.pow(1 - n / length, decay)
        left[i] = (Math.random() * 0.5) * multi;
        right[i] = (Math.random() * 0.5) * multi;
      }
    }
    //Return the `impulse`.
    return impulse;
  }



  // internal helper func, connect other nodes to library[name].. checks
  // library[name].src for the soundObjects to connect
  const connectSourcesTo = (soundObj) => {
    // get the gain node to connect to
    const n = getAudioNode(soundObj, 'pan');
    // if src has multiple items to connect
    if (Array.isArray(src)) {
      // the "src" variable contains one or more "other" sound objects that will
      // feed their outputs into the pan node of soundObj, which is
      soundObj.src.forEach(item => {
        item.output.disconnect(
          item.output.audioNodes[item.output.audioNodes.length - 2]
        );
        item.output.connect(n);
      });
    } else if (src.output) {
      soundObj.src.output.disconnect(
        soundObj.src.output.audioNodes[soundObj.src.output.audioNodes.length - 2]
      );
      soundObj.src.output.connect(n);
    }
  };



  //
  // main loop - parse each sound given in 'sounds' param
  //
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
    // if the src of this sound is a string, we assume it's a URL, and AJAX in
    // the file, saving it to a buffer, to be re-used by bufferSourceNodes
    if (typeof src === 'string') {
      // download audio file, save it as a buffer in the fileLoaded callback,
      // then add the sound to the library to be returned
      loadFile(src, fileLoaded);
    }
    // if the 'src' is not a string, it's not a URL to download, it'll likely
    // be another, already existing, sound object
    else {
      // so add the current sound to the library of sounds to be returned (namely,
      // add library[name] and populate it with all the sounds props)
      addToLibrary();
      // and if the input (src) is another sound object, connect it up to the
      // gain node of this one
      if (Array.isArray(src) || src.output) {
        connectSourcesTo(library[name]);
        // add to count of files now loaded and check if all done
        checkAllFilesLoaded();
        // autoplay if needed
        if (library[name].autoplay === true) library[name].play();
      }
    }
  });

  // add the .settings({ ... }) method, for updating a sounds props, to the
  // library collection itself - calling it will update all sounds in the
  // library object
  library.settings = (props, cb) => {
    // update all sounds
    Object.keys(library).forEach(audioObj => {
      if (!library[audioObj]) return;
      // update the sound object with the given properties
      library[audioObj].settings(props);
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
