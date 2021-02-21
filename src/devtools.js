var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
  ? function JSONTreeView(obj) { return typeof obj; }
  : function JSONTreeView(obj) {
      return obj
        && typeof Symbol === "function"
        && obj.constructor === Symbol ? "symbol" : typeof obj;
    };

// from https://github.com/Olical/EventEmitter/
function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;
EventEmitter.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}


// from https://github.com/luyuan/json-tree-view
function JSONTreeView(name_, value_, parent_, isRoot_) {
	var self = this;

	if (typeof isRoot_ === 'undefined' && arguments.length < 4) {
		isRoot_ = true;
	}

  // use the event emitter above, not the node one
  var EE = new EventEmitter();
  // need to add these lines too
  EventEmitter.call(self);
  self.emit = EventEmitter.prototype.emit;
  self.on = EventEmitter.prototype.on;
  self.removeAllListeners = EventEmitter.prototype.removeAllListeners;

	if (arguments.length < 2) {
		value_ = name_;
		name_ = undefined;
	}

	var name,
	    value,
	    type,
	    oldType = null,
	    filterText = '',
	    hidden = false,
	    readonly = parent_ ? parent_.readonly : false,
	    readonlyWhenFiltering = parent_ ? parent_.readonlyWhenFiltering : false,
	    alwaysShowRoot = false,
	    showCount = parent_ ? parent_.showCountOfObjectOrArray : true,
	    includingRootName = true,
	    domEventListeners = [],
	    children = [],
	    expanded = false,
	    edittingName = false,
	    edittingValue = false,
	    nameEditable = true,
	    valueEditable = true;

	var dom = {
		container: document.createElement('div'),
		collapseExpand: document.createElement('div'),
		name: document.createElement('div'),
		separator: document.createElement('div'),
		value: document.createElement('div'),
		spacing: document.createElement('div'),
		delete: document.createElement('div'),
		children: document.createElement('div'),
		insert: document.createElement('div')
	};

	Object.defineProperties(self, {

		dom: {
			value: dom.container,
			enumerable: true
		},

		isRoot: {
			get: function get() {
				return isRoot_;
			}
		},

		parent: {
			get: function get() {
				return parent_;
			}
		},

		children: {
			get: function get() {
				var result = null;
				if (type === 'array') {
					result = children;
				} else if (type === 'object') {
					result = {};
					children.forEach(function (e) {
						result[e.name] = e;
					});
				}
				return result;
			}
		},

		readonly: {
			get: function get() {
				return !!(readonly & 1);
			},
			set: function set(ro) {
				readonly = setBit(readonly, 0, +ro);
				!!(readonly & 1) ? dom.container.classList.add('readonly') : dom.container.classList.remove('readonly');
				for (var i in children) {
					if (_typeof(children[i]) === 'object') {
						children[i].readonly = setBit(readonly, 0, +ro);
					}
				}
			}
		},

		readonlyWhenFiltering: {
			get: function get() {
				return readonlyWhenFiltering;
			},
			set: function set(rowf) {
				readonly = setBit(readonly, 1, +rowf);
				readonlyWhenFiltering = rowf;
				readonly && this.filterText || !!(readonly & 1) ? dom.container.classList.add('readonly') : dom.container.classList.remove('readonly');
				for (var i in children) {
					if (_typeof(children[i]) === 'object') {
						children[i].readonly = setBit(readonly, 1, +rowf);
						children[i].readonlyWhenFiltering = rowf;
					}
				}
			}
		},

		hidden: {
			get: function get() {
				return hidden;
			},
			set: function set(h) {
				hidden = h;
				h ? dom.container.classList.add('hidden') : dom.container.classList.remove('hidden');
				if (!h) {
					parent_ && (parent_.hidden = h);
				}
			}
		},

		showCountOfObjectOrArray: {
			get: function get() {
				return showCount;
			},
			set: function set(show) {
				showCount = show;
				for (var i in children) {
					if (_typeof(children[i]) === 'object') {
						children[i].showCountOfObjectOrArray = show;
					}
				}
				(this.type === 'object' || this.type === 'array') && this.updateCount();
			}
		},

		filterText: {
			get: function get() {
				return filterText;
			},
			set: function set(text) {
				filterText = text;
				if (text) {
					if (readonly > 0) {
						dom.container.classList.add('readonly');
					}
					var key = this.name + '';
					var value = this.value + '';
					if (this.type === 'object' || this.type === 'array') {
						value = '';
					}
					if (key.indexOf(text) > -1 || value.indexOf(text) > -1) {
						this.hidden = false;
					} else {
						if (!this.alwaysShowRoot || !isRoot_) {
							this.hidden = true;
						}
					}
				} else {
					!this.readonly && dom.container.classList.remove('readonly');
					this.hidden = false;
				}
				for (var i in children) {
					if (_typeof(children[i]) === 'object') {
						children[i].filterText = text;
					}
				}
			}
		},

		alwaysShowRoot: {
			get: function get() {
				return alwaysShowRoot;
			},
			set: function set(value) {
				if (isRoot_ && this.filterText) {
					this.hidden = !value;
				}
				alwaysShowRoot = value;
				for (var i in children) {
					if (_typeof(children[i]) === 'object') {
						children[i].alwaysShowRoot = value;
					}
				}
			}
		},

		withRootName: {
			get: function get() {
				return includingRootName;
			},
			set: function set(value) {
				includingRootName = value;
			}
		},

		name: {
			get: function get() {
				return name;
			},

			set: setName,
			enumerable: true
		},

		value: {
			get: function get() {
				return value;
			},

			set: setValue,
			enumerable: true
		},

		type: {
			get: function get() {
				return type;
			},

			enumerable: true
		},

		oldType: {
			get: function get() {
				return oldType;
			},

			enumerable: true
		},

		nameEditable: {
			get: function get() {
				return nameEditable;
			},

			set: function set(value) {
				nameEditable = !!value;
			},

			enumerable: true
		},

		valueEditable: {
			get: function get() {
				return valueEditable;
			},

			set: function set(value) {
				valueEditable = !!value;
			},

			enumerable: true
		},

		refresh: {
			value: refresh,
			enumerable: true
		},

		updateCount: {
			value: updateObjectChildCount,
			enumerable: true
		},

		collapse: {
			value: collapse,
			enumerable: true
		},

		expand: {
			value: expand,
			enumerable: true
		},

		destroy: {
			value: destroy,
			enumerable: true
		},

		editName: {
			value: editField.bind(null, 'name'),
			enumerable: true
		},

		editValue: {
			value: editField.bind(null, 'value'),
			enumerable: true
		}

	});

	Object.keys(dom).forEach(function (k) {
		if (k === 'delete' && self.isRoot) {
			return;
		}

		var element = dom[k];

		if (k == 'container') {
			return;
		}

		element.className = k;
		if (['name', 'separator', 'value', 'spacing'].indexOf(k) > -1) {
			element.className += ' item';
		}
		dom.container.appendChild(element);
	});

	dom.container.className = 'jsonView';

	addDomEventListener(dom.collapseExpand, 'click', onCollapseExpandClick);
	addDomEventListener(dom.value, 'click', expand.bind(null, false));
	addDomEventListener(dom.name, 'click', expand.bind(null, false));

	addDomEventListener(dom.name, 'dblclick', editField.bind(null, 'name'));
	addDomEventListener(dom.name, 'click', itemClicked.bind(null, 'name'));
	addDomEventListener(dom.name, 'blur', editFieldStop.bind(null, 'name'));
	addDomEventListener(dom.name, 'keypress', editFieldKeyPressed.bind(null, 'name'));
	addDomEventListener(dom.name, 'keydown', editFieldTabPressed.bind(null, 'name'));

	addDomEventListener(dom.value, 'dblclick', editField.bind(null, 'value'));
	addDomEventListener(dom.value, 'click', itemClicked.bind(null, 'value'));
	addDomEventListener(dom.value, 'blur', editFieldStop.bind(null, 'value'));
	addDomEventListener(dom.value, 'keypress', editFieldKeyPressed.bind(null, 'value'));
	addDomEventListener(dom.value, 'keydown', editFieldTabPressed.bind(null, 'value'));
	addDomEventListener(dom.value, 'keydown', numericValueKeyDown);

	addDomEventListener(dom.insert, 'click', onInsertClick);
	addDomEventListener(dom.delete, 'click', onDeleteClick);

	setName(name_);
	setValue(value_);

	function setBit(n, i, b) {
		var j = 0;
		while (n >> j << j) {
			j++;
		}
		return i >= j ? n | +b << i : n >> i + 1 << i + 1 | n % (n >> i << i) | +b << i;
	}

	function squarebracketify(exp) {
		return typeof exp === 'string' ? exp.replace(/\.([0-9]+)/g, '[$1]') : exp + '';
	}

	function refresh(silent) {
		var expandable = type == 'object' || type == 'array';

		children.forEach(function (child) {
			child.refresh(true);
		});

		dom.collapseExpand.style.display = expandable ? '' : 'none';

		if (expanded && expandable) {
			expand(false, silent);
		} else {
			collapse(false, silent);
		}
		if (!silent) {
			self.emit('refresh', self, [self.name], self.value);
		}
	}

	function collapse(recursive, silent) {
		if (recursive) {
			children.forEach(function (child) {
				child.collapse(true, true);
			});
		}

		expanded = false;

		dom.children.style.display = 'none';
		dom.collapseExpand.className = 'expand';
		dom.container.classList.add('collapsed');
		dom.container.classList.remove('expanded');
		if (!silent && (type == 'object' || type == 'array')) {
			self.emit('collapse', self, [self.name], self.value);
		}
	}

	function expand(recursive, silent) {
		var keys;

		if (type == 'object') {
			keys = Object.keys(value);
		} else if (type == 'array') {
			keys = value.map(function (v, k) {
				return k;
			});
		} else {
			keys = [];
		}

		// Remove children that no longer exist
		for (var i = children.length - 1; i >= 0; i--) {
			var child = children[i];
			if (!child) {
				break;
			}

			if (keys.indexOf(child.name) == -1) {
				children.splice(i, 1);
				removeChild(child);
			}
		}

		if (type != 'object' && type != 'array') {
			return collapse();
		}

		keys.forEach(function (key) {
			addChild(key, value[key]);
		});

		if (recursive) {
			children.forEach(function (child) {
				child.expand(true, true);
			});
		}

		expanded = true;
		dom.children.style.display = '';
		dom.collapseExpand.className = 'collapse';
		dom.container.classList.add('expanded');
		dom.container.classList.remove('collapsed');
		if (!silent && (type == 'object' || type == 'array')) {
			self.emit('expand', self, [self.name], self.value);
		}
	}

	function destroy() {
		var child, event;

		while (event = domEventListeners.pop()) {
			event.element.removeEventListener(event.name, event.fn);
		}

		while (child = children.pop()) {
			removeChild(child);
		}
	}

	function setName(newName) {
		var nameType = typeof newName === 'undefined' ? 'undefined' : _typeof(newName),
		    oldName = name;

		if (newName === name) {
			return;
		}

		if (nameType != 'string' && nameType != 'number') {
			throw new Error('Name must be either string or number, ' + newName);
		}

		dom.name.innerText = newName;
		name = newName;
		self.emit('rename', self, [name], oldName, newName, true);
	}

	function setValue(newValue) {
		var oldValue = value,
		    str,
		    len;

		if (isRoot_ && !oldValue) {
			oldValue = newValue;
		}
		type = getType(newValue);
		oldType = oldValue ? getType(oldValue) : type;

		switch (type) {
			case 'null':
				str = 'null';
				break;
			case 'undefined':
				str = 'undefined';
				break;
			case 'object':
				len = Object.keys(newValue).length;
				str = showCount ? 'Object[' + len + ']' : len < 1 ? '{}' : '';
				break;

			case 'array':
				len = newValue.length;
				str = showCount ? 'Array[' + len + ']' : len < 1 ? '[]' : '';
				break;

			default:
				str = newValue;
				break;
		}

		dom.value.innerText = str;
		dom.value.className = 'value item ' + type;

		if (newValue === value) {
			return;
		}

		value = newValue;

		if (type == 'array' || type == 'object') {
			// Cannot edit objects as string because the formatting is too messy
			// Would have to either pass as JSON and force user to wrap properties in quotes
			// Or first JSON stringify the input before passing, this could allow users to reference globals

			// Instead the user can modify individual properties, or just delete the object and start again
			valueEditable = false;

			if (type == 'array') {
				// Obviously cannot modify array keys
				nameEditable = false;
			}
		}

		self.emit('change', self, [name], oldValue, newValue);
		refresh();
	}

	function updateObjectChildCount() {
		var str = '',
		    len;
		if (type === 'object') {
			len = Object.keys(value).length;
			str = showCount ? 'Object[' + len + ']' : len < 1 ? '{}' : '';
		}
		if (type === 'array') {
			len = value.length;
			str = showCount ? 'Array[' + len + ']' : len < 1 ? '[]' : '';
		}
		dom.value.innerText = str;
	}

	function addChild(key, val) {
		var child;

		for (var i = 0, len = children.length; i < len; i++) {
			if (children[i].name == key) {
				child = children[i];
				break;
			}
		}

		if (child) {
			child.value = val;
		} else {
			child = new JSONTreeView(key, val, self, false);
			child.on('rename', onChildRename);
			child.on('delete', onChildDelete);
			child.on('change', onChildChange);
			child.on('append', onChildAppend);
			child.on('click', onChildClick);
			child.on('expand', onChildExpand);
			child.on('collapse', onChildCollapse);
			child.on('refresh', onChildRefresh);
			children.push(child);
			child.emit('append', child, [key], 'value', val, true);
		}

		dom.children.appendChild(child.dom);

		return child;
	}

	function removeChild(child) {
		if (child.dom.parentNode) {
			dom.children.removeChild(child.dom);
		}

		child.destroy();
		child.emit('delete', child, [child.name], child.value, child.parent.isRoot ? child.parent.oldType : child.parent.type, true);
		child.removeAllListeners();
	}

	function editField(field) {
		if (readonly > 0 && filterText || !!(readonly & 1)) {
			return;
		}
		if (field === 'value' && (type === 'object' || type === 'array')) {
			return;
		}
		if (parent_ && parent_.type == 'array') {
			// Obviously cannot modify array keys
			nameEditable = false;
		}
		var editable = field == 'name' ? nameEditable : valueEditable,
		    element = dom[field];

		if (!editable && parent_ && parent_.type === 'array') {
			if (!parent_.inserting) {
				// throw new Error('Cannot edit an array index.');
				return;
			}
		}

		if (field == 'value' && type == 'string') {
			element.innerText = '"' + value + '"';
		}

		if (field == 'name') {
			edittingName = true;
		}

		if (field == 'value') {
			edittingValue = true;
		}

		element.classList.add('edit');
		element.setAttribute('contenteditable', true);
		element.focus();
		document.execCommand('selectAll', false, null);
	}

	function itemClicked(field) {
		self.emit('click', self, !self.withRootName && self.isRoot ? [''] : [self.name], self.value);
	}

	function editFieldStop(field) {
		var element = dom[field];

		if (field == 'name') {
			if (!edittingName) {
				return;
			}
			edittingName = false;
		}

		if (field == 'value') {
			if (!edittingValue) {
				return;
			}
			edittingValue = false;
		}

		if (field == 'name') {
			var p = self.parent;
			var edittingNameText = element.innerText;
			if (p && p.type === 'object' && edittingNameText in p.value) {
				element.innerText = name;
				element.classList.remove('edit');
				element.removeAttribute('contenteditable');
				// throw new Error('Name exist, ' + edittingNameText);
			} else {
				setName.call(self, edittingNameText);
			}
		} else {
			var text = element.innerText;
			try {
				setValue(text === 'undefined' ? undefined : JSON.parse(text));
			} catch (err) {
				setValue(text);
			}
		}

		element.classList.remove('edit');
		element.removeAttribute('contenteditable');
	}

	function editFieldKeyPressed(field, e) {
		switch (e.key) {
			case 'Escape':
			case 'Enter':
				editFieldStop(field);
				break;
		}
	}

	function editFieldTabPressed(field, e) {
		if (e.key == 'Tab') {
			editFieldStop(field);

			if (field == 'name') {
				e.preventDefault();
				editField('value');
			} else {
				editFieldStop(field);
			}
		}
	}

	function numericValueKeyDown(e) {
		var increment = 0,
		    currentValue;

		if (type != 'number') {
			return;
		}

		switch (e.key) {
			case 'ArrowDown':
			case 'Down':
				increment = -1;
				break;

			case 'ArrowUp':
			case 'Up':
				increment = 1;
				break;
		}

		if (e.shiftKey) {
			increment *= 10;
		}

		if (e.ctrlKey || e.metaKey) {
			increment /= 10;
		}

		if (increment) {
			currentValue = parseFloat(dom.value.innerText);

			if (!isNaN(currentValue)) {
				setValue(Number((currentValue + increment).toFixed(10)));
			}
		}
	}

	function getType(value) {
		var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

		if (type == 'object') {
			if (value === null) {
				return 'null';
			}

			if (Array.isArray(value)) {
				return 'array';
			}
		}
		if (type === 'undefined') {
			return 'undefined';
		}

		return type;
	}

	function onCollapseExpandClick() {
		if (expanded) {
			collapse();
		} else {
			expand();
		}
	}

	function onInsertClick() {
		var newName = type == 'array' ? value.length : undefined,
		    child = addChild(newName, null);
		if (child.parent) {
			child.parent.inserting = true;
		}
		if (type == 'array') {
			value.push(null);
			child.editValue();
			child.emit('append', self, [value.length - 1], 'value', null, true);
			if (child.parent) {
				child.parent.inserting = false;
			}
		} else {
			child.editName();
		}
	}

	function onDeleteClick() {
		self.emit('delete', self, [self.name], self.value, self.parent.isRoot ? self.parent.oldType : self.parent.type, false);
	}

	function onChildRename(child, keyPath, oldName, newName, original) {
		var allow = newName && type != 'array' && !(newName in value) && original;
		if (allow) {
			value[newName] = child.value;
			delete value[oldName];
			if (self.inserting) {
				child.emit('append', child, [newName], 'name', newName, true);
				self.inserting = false;
				return;
			}
		} else if (oldName === undefined) {
			// A new node inserted via the UI
			original && removeChild(child);
		} else if (original) {
			// Cannot rename array keys, or duplicate object key names
			child.name = oldName;
			return;
		}
		// value[keyPath] = newName;

		// child.once('rename', onChildRename);

		if (self.withRootName || !self.isRoot) {
			keyPath.unshift(name);
		} else if (self.withRootName && self.isRoot) {
			keyPath.unshift(name);
		}
		if (oldName !== undefined) {
			self.emit('rename', child, keyPath, oldName, newName, false);
		}
	}

	function onChildAppend(child, keyPath, nameOrValue, newValue, sender) {
		if (self.withRootName || !self.isRoot) {
			keyPath.unshift(name);
		}
		self.emit('append', child, keyPath, nameOrValue, newValue, false);
		sender && updateObjectChildCount();
	}

	function onChildChange(child, keyPath, oldValue, newValue, recursed) {
		if (!recursed) {
			value[keyPath] = newValue;
		}

		if (self.withRootName || !self.isRoot) {
			keyPath.unshift(name);
		}
		self.emit('change', child, keyPath, oldValue, newValue, true);
	}

	function onChildDelete(child, keyPath, deletedValue, parentType, passive) {
		var key = child.name;

		if (passive) {
			if (self.withRootName /* || !self.isRoot*/) {
					keyPath.unshift(name);
				}
			self.emit('delete', child, keyPath, deletedValue, parentType, passive);
			updateObjectChildCount();
		} else {
			if (type == 'array') {
				value.splice(key, 1);
			} else {
				delete value[key];
			}
			refresh(true);
		}
	}

	function onChildClick(child, keyPath, value) {
		if (self.withRootName || !self.isRoot) {
			keyPath.unshift(name);
		}
		self.emit('click', child, keyPath, value);
	}

	function onChildExpand(child, keyPath, value) {
		if (self.withRootName || !self.isRoot) {
			keyPath.unshift(name);
		}
		self.emit('expand', child, keyPath, value);
	}

	function onChildCollapse(child, keyPath, value) {
		if (self.withRootName || !self.isRoot) {
			keyPath.unshift(name);
		}
		self.emit('collapse', child, keyPath, value);
	}

	function onChildRefresh(child, keyPath, value) {
		if (self.withRootName || !self.isRoot) {
			keyPath.unshift(name);
		}
		self.emit('refresh', child, keyPath, value);
	}

	function addDomEventListener(element, name, fn) {
		element.addEventListener(name, fn);
		domEventListeners.push({ element: element, name: name, fn: fn });
	}
}



/*
 * Behave.js
 *
 * Copyright 2013, Jacob Kelley - http://jakiestfu.com/
 * Released under the MIT Licence
 * http://opensource.org/licenses/MIT
 *
 * Github:  http://github.com/jakiestfu/Behave.js/
 * Version: 1.5
 */
(function(undefined){

    'use strict';

    var BehaveHooks = BehaveHooks || (function(){
		var hooks = {};

		return {
		    add: function(hookName, fn){
			    if(typeof hookName == "object"){
			    	var i;
			    	for(i=0; i<hookName.length; i++){
				    	var theHook = hookName[i];
				    	if(!hooks[theHook]){
					    	hooks[theHook] = [];
				    	}
				    	hooks[theHook].push(fn);
			    	}
			    } else {
				    if(!hooks[hookName]){
				    	hooks[hookName] = [];
			    	}
			    	hooks[hookName].push(fn);
			    }
		    },
		    get: function(hookName){
			    if(hooks[hookName]){
			    	return hooks[hookName];
		    	}
		    }
	    };

	})(),
	Behave = Behave || function (userOpts) {

        if (typeof String.prototype.repeat !== 'function') {
            String.prototype.repeat = function(times) {
                if(times < 1){
                    return '';
                }
                if(times % 2){
                    return this.repeat(times - 1) + this;
                }
                var half = this.repeat(times / 2);
                return half + half;
            };
        }

        if (typeof Array.prototype.filter !== 'function') {
            Array.prototype.filter = function(func /*, thisp */) {
                if (this === null) {
                    throw new TypeError();
                }

                var t = Object(this),
                    len = t.length >>> 0;
                if (typeof func != "function"){
                    throw new TypeError();
                }
                var res = [],
                    thisp = arguments[1];
                for (var i = 0; i < len; i++) {
                    if (i in t) {
                        var val = t[i];
                        if (func.call(thisp, val, i, t)) {
                            res.push(val);
                        }
                    }
                }
                return res;
            };
        }

        var defaults = {
            textarea: null,
            replaceTab: true,
            softTabs: true,
            tabSize: 4,
            autoOpen: true,
            overwrite: true,
            autoStrip: true,
            autoIndent: true,
            fence: false
        },
        tab,
        newLine,
        charSettings = {

            keyMap: [
                { open: "\"", close: "\"", canBreak: false },
                { open: "'", close: "'", canBreak: false },
                { open: "(", close: ")", canBreak: false },
                { open: "[", close: "]", canBreak: true },
                { open: "{", close: "}", canBreak: true }
            ]

        },
        utils = {

        	_callHook: function(hookName, passData){
    			var hooks = BehaveHooks.get(hookName);
	    		passData = typeof passData=="boolean" && passData === false ? false : true;

	    		if(hooks){
			    	if(passData){
				    	var theEditor = defaults.textarea,
				    		textVal = theEditor.value,
				    		caretPos = utils.cursor.get(),
				    		i;

				    	for(i=0; i<hooks.length; i++){
					    	hooks[i].call(undefined, {
					    		editor: {
						    		element: theEditor,
						    		text: textVal,
						    		levelsDeep: utils.levelsDeep()
					    		},
						    	caret: {
							    	pos: caretPos
						    	},
						    	lines: {
							    	current: utils.cursor.getLine(textVal, caretPos),
							    	total: utils.editor.getLines(textVal)
						    	}
					    	});
				    	}
			    	} else {
				    	for(i=0; i<hooks.length; i++){
				    		hooks[i].call(undefined);
				    	}
			    	}
		    	}
	    	},

            defineNewLine: function(){
                var ta = document.createElement('textarea');
                ta.value = "\n";

                if(ta.value.length==2){
                    newLine = "\r\n";
                } else {
                    newLine = "\n";
                }
            },
            defineTabSize: function(tabSize){
                if(typeof defaults.textarea.style.OTabSize != "undefined"){
                    defaults.textarea.style.OTabSize = tabSize; return;
                }
                if(typeof defaults.textarea.style.MozTabSize != "undefined"){
                    defaults.textarea.style.MozTabSize = tabSize; return;
                }
                if(typeof defaults.textarea.style.tabSize != "undefined"){
                    defaults.textarea.style.tabSize = tabSize; return;
                }
            },
            cursor: {
	            getLine: function(textVal, pos){
		        	return ((textVal.substring(0,pos)).split("\n")).length;
	        	},
	            get: function() {

                    if (typeof document.createElement('textarea').selectionStart==="number") {
                        return defaults.textarea.selectionStart;
                    } else if (document.selection) {
                        var caretPos = 0,
                            range = defaults.textarea.createTextRange(),
                            rangeDupe = document.selection.createRange().duplicate(),
                            rangeDupeBookmark = rangeDupe.getBookmark();
                        range.moveToBookmark(rangeDupeBookmark);

                        while (range.moveStart('character' , -1) !== 0) {
                            caretPos++;
                        }
                        return caretPos;
                    }
                },
                set: function (start, end) {
                    if(!end){
                        end = start;
                    }
                    if (defaults.textarea.setSelectionRange) {
                        defaults.textarea.focus();
                        defaults.textarea.setSelectionRange(start, end);
                    } else if (defaults.textarea.createTextRange) {
                        var range = defaults.textarea.createTextRange();
                        range.collapse(true);
                        range.moveEnd('character', end);
                        range.moveStart('character', start);
                        range.select();
                    }
                },
                selection: function(){
                    var textAreaElement = defaults.textarea,
                        start = 0,
                        end = 0,
                        normalizedValue,
                        range,
                        textInputRange,
                        len,
                        endRange;

                    if (typeof textAreaElement.selectionStart == "number" && typeof textAreaElement.selectionEnd == "number") {
                        start = textAreaElement.selectionStart;
                        end = textAreaElement.selectionEnd;
                    } else {
                        range = document.selection.createRange();

                        if (range && range.parentElement() == textAreaElement) {

                            normalizedValue = utils.editor.get();
                            len = normalizedValue.length;

                            textInputRange = textAreaElement.createTextRange();
                            textInputRange.moveToBookmark(range.getBookmark());

                            endRange = textAreaElement.createTextRange();
                            endRange.collapse(false);

                            if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                                start = end = len;
                            } else {
                                start = -textInputRange.moveStart("character", -len);
                                start += normalizedValue.slice(0, start).split(newLine).length - 1;

                                if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                                    end = len;
                                } else {
                                    end = -textInputRange.moveEnd("character", -len);
                                    end += normalizedValue.slice(0, end).split(newLine).length - 1;
                                }
                            }
                        }
                    }

                    return start==end ? false : {
                        start: start,
                        end: end
                    };
                }
            },
            editor: {
                getLines: function(textVal){
		        	return (textVal).split("\n").length;
	        	},
	            get: function(){
                    return defaults.textarea.value.replace(/\r/g,'');
                },
                set: function(data){
                    defaults.textarea.value = data;
                }
            },
            fenceRange: function(){
                if(typeof defaults.fence == "string"){

                    var data = utils.editor.get(),
                        pos = utils.cursor.get(),
                        hacked = 0,
                        matchedFence = data.indexOf(defaults.fence),
                        matchCase = 0;

                    while(matchedFence>=0){
                        matchCase++;
                        if( pos < (matchedFence+hacked) ){
                            break;
                        }

                        hacked += matchedFence+defaults.fence.length;
                        data = data.substring(matchedFence+defaults.fence.length);
                        matchedFence = data.indexOf(defaults.fence);

                    }

                    if( (hacked) < pos && ( (matchedFence+hacked) > pos ) && matchCase%2===0){
                        return true;
                    }
                    return false;
                } else {
                    return true;
                }
            },
            isEven: function(_this,i){
                return i%2;
            },
            levelsDeep: function(){
                var pos = utils.cursor.get(),
                    val = utils.editor.get();

                var left = val.substring(0, pos),
                    levels = 0,
                    i, j;

                for(i=0; i<left.length; i++){
                    for (j=0; j<charSettings.keyMap.length; j++) {
                        if(charSettings.keyMap[j].canBreak){
                            if(charSettings.keyMap[j].open == left.charAt(i)){
                                levels++;
                            }

                            if(charSettings.keyMap[j].close == left.charAt(i)){
                                levels--;
                            }
                        }
                    }
                }

                var toDecrement = 0,
                    quoteMap = ["'", "\""];
                for(i=0; i<charSettings.keyMap.length; i++) {
                    if(charSettings.keyMap[i].canBreak){
                        for(j in quoteMap){
                            toDecrement += left.split(quoteMap[j]).filter(utils.isEven).join('').split(charSettings.keyMap[i].open).length - 1;
                        }
                    }
                }

                var finalLevels = levels - toDecrement;

                return finalLevels >=0 ? finalLevels : 0;
            },
            deepExtend: function(destination, source) {
                for (var property in source) {
                    if (source[property] && source[property].constructor &&
                        source[property].constructor === Object) {
                        destination[property] = destination[property] || {};
                        utils.deepExtend(destination[property], source[property]);
                    } else {
                        destination[property] = source[property];
                    }
                }
                return destination;
            },
            addEvent: function addEvent(element, eventName, func) {
                if (element.addEventListener){
                    element.addEventListener(eventName,func,false);
                } else if (element.attachEvent) {
                    element.attachEvent("on"+eventName, func);
                }
            },
            removeEvent: function addEvent(element, eventName, func){
	            if (element.addEventListener){
	                element.removeEventListener(eventName,func,false);
	            } else if (element.attachEvent) {
	                element.detachEvent("on"+eventName, func);
	            }
	        },

            preventDefaultEvent: function(e){
                if(e.preventDefault){
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }
            }
        },
        intercept = {
            tabKey: function (e) {

                if(!utils.fenceRange()){ return; }

                if (e.keyCode == 9) {
                    utils.preventDefaultEvent(e);

                    var toReturn = true;
                    utils._callHook('tab:before');

                    var selection = utils.cursor.selection(),
                        pos = utils.cursor.get(),
                        val = utils.editor.get();

                    if(selection){

                        var tempStart = selection.start;
                        while(tempStart--){
                            if(val.charAt(tempStart)=="\n"){
                                selection.start = tempStart + 1;
                                break;
                            }
                        }

                        var toIndent = val.substring(selection.start, selection.end),
                            lines = toIndent.split("\n"),
                            i;

                        if(e.shiftKey){
                            for(i = 0; i<lines.length; i++){
                                if(lines[i].substring(0,tab.length) == tab){
                                    lines[i] = lines[i].substring(tab.length);
                                }
                            }
                            toIndent = lines.join("\n");

                            utils.editor.set( val.substring(0,selection.start) + toIndent + val.substring(selection.end) );
                            utils.cursor.set(selection.start, selection.start+toIndent.length);

                        } else {
                            for(i in lines){
                                lines[i] = tab + lines[i];
                            }
                            toIndent = lines.join("\n");

                            utils.editor.set( val.substring(0,selection.start) + toIndent + val.substring(selection.end) );
                            utils.cursor.set(selection.start, selection.start+toIndent.length);
                        }
                    } else {
                        var left = val.substring(0, pos),
                            right = val.substring(pos),
                            edited = left + tab + right;

                        if(e.shiftKey){
                            if(val.substring(pos-tab.length, pos) == tab){
                                edited = val.substring(0, pos-tab.length) + right;
                                utils.editor.set(edited);
                                utils.cursor.set(pos-tab.length);
                            }
                        } else {
                            utils.editor.set(edited);
                            utils.cursor.set(pos + tab.length);
                            toReturn = false;
                        }
                    }
                    utils._callHook('tab:after');
                }
                return toReturn;
            },
            enterKey: function (e) {

                if(!utils.fenceRange()){ return; }

                if (e.keyCode == 13) {

                    utils.preventDefaultEvent(e);
                    utils._callHook('enter:before');

                    var pos = utils.cursor.get(),
                        val = utils.editor.get(),
                        left = val.substring(0, pos),
                        right = val.substring(pos),
                        leftChar = left.charAt(left.length - 1),
                        rightChar = right.charAt(0),
                        numTabs = utils.levelsDeep(),
                        ourIndent = "",
                        closingBreak = "",
                        finalCursorPos,
                        i;
                    if(!numTabs){
                        finalCursorPos = 1;
                    } else {
                        while(numTabs--){
                            ourIndent+=tab;
                        }
                        ourIndent = ourIndent;
                        finalCursorPos = ourIndent.length + 1;

                        for(i=0; i<charSettings.keyMap.length; i++) {
                            if (charSettings.keyMap[i].open == leftChar && charSettings.keyMap[i].close == rightChar){
                                closingBreak = newLine;
                            }
                        }

                    }

                    var edited = left + newLine + ourIndent + closingBreak + (ourIndent.substring(0, ourIndent.length-tab.length) ) + right;
                    utils.editor.set(edited);
                    utils.cursor.set(pos + finalCursorPos);
                    utils._callHook('enter:after');
                }
            },
            deleteKey: function (e) {

	            if(!utils.fenceRange()){ return; }

	            if(e.keyCode == 8){
	            	utils.preventDefaultEvent(e);

	            	utils._callHook('delete:before');

	            	var pos = utils.cursor.get(),
	                    val = utils.editor.get(),
	                    left = val.substring(0, pos),
	                    right = val.substring(pos),
	                    leftChar = left.charAt(left.length - 1),
	                    rightChar = right.charAt(0),
	                    i;

	                if( utils.cursor.selection() === false ){
	                    for(i=0; i<charSettings.keyMap.length; i++) {
	                        if (charSettings.keyMap[i].open == leftChar && charSettings.keyMap[i].close == rightChar) {
	                            var edited = val.substring(0,pos-1) + val.substring(pos+1);
	                            utils.editor.set(edited);
	                            utils.cursor.set(pos - 1);
	                            return;
	                        }
	                    }
	                    var edited = val.substring(0,pos-1) + val.substring(pos);
	                    utils.editor.set(edited);
	                    utils.cursor.set(pos - 1);
	                } else {
	                	var sel = utils.cursor.selection(),
	                		edited = val.substring(0,sel.start) + val.substring(sel.end);
	                    utils.editor.set(edited);
	                    utils.cursor.set(pos);
	                }

	                utils._callHook('delete:after');

	            }
	        }
        },
        charFuncs = {
            openedChar: function (_char, e) {
                utils.preventDefaultEvent(e);
                utils._callHook('openChar:before');
                var pos = utils.cursor.get(),
                    val = utils.editor.get(),
                    left = val.substring(0, pos),
                    right = val.substring(pos),
                    edited = left + _char.open + _char.close + right;

                defaults.textarea.value = edited;
                utils.cursor.set(pos + 1);
                utils._callHook('openChar:after');
            },
            closedChar: function (_char, e) {
                var pos = utils.cursor.get(),
                    val = utils.editor.get(),
                    toOverwrite = val.substring(pos, pos + 1);
                if (toOverwrite == _char.close) {
                    utils.preventDefaultEvent(e);
                    utils._callHook('closeChar:before');
                    utils.cursor.set(utils.cursor.get() + 1);
                    utils._callHook('closeChar:after');
                    return true;
                }
                return false;
            }
        },
        action = {
            filter: function (e) {

                if(!utils.fenceRange()){ return; }

                var theCode = e.which || e.keyCode;

                if(theCode == 39 || theCode == 40 && e.which===0){ return; }

                var _char = String.fromCharCode(theCode),
                    i;

                for(i=0; i<charSettings.keyMap.length; i++) {

                    if (charSettings.keyMap[i].close == _char) {
                        var didClose = defaults.overwrite && charFuncs.closedChar(charSettings.keyMap[i], e);

                        if (!didClose && charSettings.keyMap[i].open == _char && defaults.autoOpen) {
                            charFuncs.openedChar(charSettings.keyMap[i], e);
                        }
                    } else if (charSettings.keyMap[i].open == _char && defaults.autoOpen) {
                        charFuncs.openedChar(charSettings.keyMap[i], e);
                    }
                }
            },
            listen: function () {

                if(defaults.replaceTab){ utils.addEvent(defaults.textarea, 'keydown', intercept.tabKey); }
                if(defaults.autoIndent){ utils.addEvent(defaults.textarea, 'keydown', intercept.enterKey); }
                if(defaults.autoStrip){ utils.addEvent(defaults.textarea, 'keydown', intercept.deleteKey); }

                utils.addEvent(defaults.textarea, 'keypress', action.filter);

                utils.addEvent(defaults.textarea, 'keydown', function(){ utils._callHook('keydown'); });
                utils.addEvent(defaults.textarea, 'keyup', function(){ utils._callHook('keyup'); });
            }
        },
        init = function (opts) {

            if(opts.textarea){
            	utils._callHook('init:before', false);
                utils.deepExtend(defaults, opts);
                utils.defineNewLine();

                if (defaults.softTabs) {
                    tab = " ".repeat(defaults.tabSize);
                } else {
                    tab = "\t";

                    utils.defineTabSize(defaults.tabSize);
                }

                action.listen();
                utils._callHook('init:after', false);
            }

        };

        this.destroy = function(){
            utils.removeEvent(defaults.textarea, 'keydown', intercept.tabKey);
	        utils.removeEvent(defaults.textarea, 'keydown', intercept.enterKey);
	        utils.removeEvent(defaults.textarea, 'keydown', intercept.deleteKey);
	        utils.removeEvent(defaults.textarea, 'keypress', action.filter);
        };

        init(userOpts);

    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Behave;
    }

    if (typeof ender === 'undefined') {
        this.Behave = Behave;
        this.BehaveHooks = BehaveHooks;
    }

    if (typeof define === "function" && define.amd) {
        define("behave", [], function () {
            return Behave;
        });
    }

}).call(window);


/**
 * Component devtools
 */


// wrapper function for JSONTreeView (json-view.js)
function createTreeView(obj, container, opts = {}) {
  var oName        = !!opts ? opts.objName : 'state';
  var shouldExpand = !!opts ? opts.expand : false;

  var view = new JSONTreeView(oName, obj);

  // Listen for change events
/*
  view.on('change', function(self, key, oldValue, newValue){
      console.log('change', key, oldValue, '=>', newValue);
  });
  view.on('rename', function(self, key, oldName, newName) {
      console.log('rename', key, oldName, '=>', newName);
  });
  view.on('delete', function(self, key) {
      console.log('delete', key);
  });
  view.on('append', function(self, key, nameOrValue, newValue) {
      console.log('append', key, nameOrValue, '=>', newValue);
  });
  view.on('click', function(self, key, value) {
      console.log('click', key, '=', value);
  });
  view.on('expand', function(self, key, value) {
      console.log('expand', key, '=', value);
  });
  view.on('collapse', function(self, key, value) {
      console.log('collapse', key, '=', value);
  });
  view.on('refresh', function(self, key, value) {
      console.log('refresh', key, '=', value);
  });
*/
  // Expand recursively
  view.expand(shouldExpand);
  view.withRootName = true;
  // Inspect window.data on the console and note that it changes with edits.
  window.data = view.value;

  // Do not hide root.
  view.alwaysShowRoot = false;
  // Set readonly when filtering words automatically.
  view.readonlyWhenFiltering = true;
  //view.filterText = 'a';
  // Remove word filter by setting a false value.
  view.filterText = null;
  // Always show count of object or array.
  view.showCountOfObjectOrArray = true;
  // Cannot change the value of JSON and remove "+" and "x" buttons.
  view.readonly = true;

  // auto-log changes in the console
  view.refresh();
  window.view = view;

  if (container) {
    container.innerHTML = '';
    container.appendChild(view.dom);
  }
}

// used by devtools to safely print HTML in its panels
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;'); //"
}

const devtools = {};

devtools.style = `
body {
  padding: 0;
  margin: 0;
}
body, body * {
  box-sizing: border-box;
}
.jsonView{
    margin-left: 20px;
    font-family: Consolas, "Lucida Console", Menlo, "dejavu sans mono", monospace;
    font-size: 16px;
    line-height: 16px;
    padding: 2px;
    cursor: default;
    color: rgb(66, 66, 66);
    white-space: nowrap;
    -webkit-user-select: none;
}

.jsonView>div{
    display: inline-block;
}

.jsonView.hidden{
    display: none;
}

.jsonView>.children, .jsonView.insert{
    display: block;
}

.jsonView>.name{
    color: rgb(136, 19, 145);
}

.jsonView>.separator:before{
    content: ":";
}

.jsonView>.separator{
    padding-right: 5px;
}

.jsonView>.spacing{
    display:inline-block;
    width:15px;
}
.jsonView>.spacing::before{
    content: '1';
    visibility:hidden;
}

.jsonView>.value.null, .jsonView>.value.undefined{
    color: rgb(128, 128, 128);
}

.jsonView>.value.boolean, .jsonView>.value.number{
    color: rgb(28, 0, 207);
}

.jsonView>.value.string:not(.edit):before, .jsonView>.value.string:not(.edit):after{
    content: '"';
}

.jsonView>.value.string {
    color: rgb(196, 26, 22);
}

.jsonView>.name:hover, .jsonView>.value:hover{
    background-color: rgba(56, 121, 217, 0.1);
}

.jsonView>.expand, .jsonView>.collapse{
    min-width: 20px;
    margin-left: -20px;
    cursor: pointer;
}

.jsonView>.expand:before{
    content: '▶';
}

.jsonView>.collapse:before{
    content: '▼';
}

.jsonView>.edit{
    padding: 0px 5px 0px 5px;
    white-space: nowrap;
    overflow: hidden;
    background-color: transparent;
}

.jsonView>.edit br{
    display: none;
}

.jsonView>.edit *{
    display: inline;
    white-space: nowrap;
}

.jsonView>.value.edit{
    color: rgb(0, 0, 0);
}

.jsonView>.delete:before{
    content: '+';
    transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
    -o-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    display: inline-block;
}

.jsonView>.delete{
    opacity: 0;
    display: inline;
    padding: 3px;
    cursor: pointer;
    color: rgb(150, 150, 150);
}

.jsonView>.item:hover~.delete{
    opacity: 1;
    color: rgb(150, 150, 150);
}
.jsonView>.delete:hover{
    opacity: 1;
    color: rgb(0, 0, 0);
    background: rgb(220, 220, 220);
}

.jsonView.readonly>.insert,.jsonView.readonly>.delete{
    display: none !important;
}
.jsonView>.insert:before{
    content: '+';
}

.jsonView>.insert{
    display: none;
    color: rgb(150, 150, 150);
    cursor: pointer;
}

.jsonView.expanded>.insert, .jsonView.expanded>.insert{
    display: inline-block;
    margin-left: 20px;
    padding: 3px;
}

.jsonView>.insert:hover{
    color: rgb(0, 0, 0);
    background: rgb(220, 220, 220);
}

.devtools {
  background-color: #EDEDED;
  border: 1px solid #ccc;
  display: none;
  font-family: sans, sans-serif;
  padding: 0;
  position: fixed;
  bottom: 0;
  height: 345px;
  width: 100%;
}
.toolbar {
  border-bottom: 1px solid #ccc;
  padding: 8px;
  width: 100%;
}
.toolbar button {
  display: inline-block;
  border: 1px solid #ccc;
  height: 24px;
  padding: 2px 2px;
  vertical-align: bottom;
}
.btn-selected {
  border: 1px solid #444;
  background-color: #eeeeff;
}
.tab {
  display: none;
}
.overview-tab {
  display: block;
}
.column {
  display: inline-block;
  height: 100%;
  min-height: 300px;
  padding: 0 4px 8px;
  vertical-align: top;
  width: calc(100% / 4.05);
}
.overview-tab .column {
  width: calc((100% / 2) - 4px);
}
.details-tab .column {
  width: calc((100% / 1) - 4px);
}
.console-tab .column {
  width: calc((100% / 1) - 4px);
}
.editor-tab .column {
  width: calc((100% / 2) - 4px);
}

.column p {
  color: #222;
  display: inline-block;
  font-weight: bold;
  margin: 0;
  padding: 0.5em 0 0.5em 0;
  vertical-align: top;
  width: 80%;
}
.panel {
  background-color: #fff;
  border-top: 1.5px solid #ccc;
  border-left: 1.5px solid #ccc;
  color: #222;
  font-size: 0.9em;
  min-height: 250px;
  max-height: 250px;
  height: 100%;
  overflow: auto;
  min-width: 100%;
}
textarea.panel {
  font-size: 1.2em;
}
.panel pre {
  font-family: Consolas, "Lucida Console", Menlo, "dejavu sans mono", monospace;
  font-size: 1em;
  padding: 1px 8px;
  margin: 0;
}
.details-panel > div {
  border-bottom: 1px solid #ccc;
}
.panel div span {
  line-height: 2.5em;
}
.panel div span:first-child {
  border-right: 1px solid #eee;
  border-bottom: 0;
  display: inline-block;
  font-weight: bold;
  padding-right: 8px;
  text-align: right;
  vertical-align: top;
  width: 124px;
}
.panel div span:nth-child(2) {
  display: inline-block;
  font-family: Consolas, "Lucida Console", Menlo, "dejavu sans mono", monospace;
  max-width: 100%;
  padding-left: 8px;
}

.history-column {}
.history-column p {
  display: inline-block;
}
.history-toolbar {
  border-bottom: 0;
  float: right;
  text-align: right;
  width: 20%;
}
.history-toolbar button:nth-child(3) {
  margin-right: 0;
}

.elemOverlay {
  position: relative;
}
.elemOverlay:after {
  content: '';
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  background-color: #f11;
  opacity: 0.3;
}

.no-scroll {
   min-height: 100%;
   overflow-y: hidden;
   width: calc(100% - 6px);
}
.no-scroll .devtools {
   width: calc(100% - 12px);
}


.devtools-vertical {
  top: 0;
  right: 0;
  bottom: 0;
  width: 40%;
  min-width: 300px;
  max-width: 800px;
  min-height: 100%;
  max-height: 100%;
}

.devtools-vertical .column {
  display: inline-block;
  height: 100%;
  min-height: 300px;
  padding: 0 4px 8px;
  overflow: hidden;
  vertical-align: top;
  width: 100%;
}
.devtools-vertical .column p,
.devtools-vertical .history-toolbar {
  width: 50%;
}

.devtools-vertical .details-column,
.devtools-vertical .details-panel,
.devtools-vertical .history-column,
.devtools-vertical .history-panel {
  padding-bottom: 0;
  max-height: 600px;
  max-height: 92vh;
  height: 92%;
}

#devtools-right,
#devtools-bottom {
  margin-right: 4px;
}
`;

devtools.view = `<div id="component-devtools" class="devtools devtools-vertical">
  <div class="toolbar">
    <button id="devtools-selectBtn" title="Select a component from the page" style="padding-top:2px;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 511.997 511.997" width="16" height="16">
        <path d="M444.92 365.778L231.587 152.445c-3.051-3.051-7.637-3.947-11.627-2.304a10.67 10.67 0 0 0-6.592 9.856v295.381c0 4.075 2.325 7.808 5.995 9.579 3.691 1.813 8.021 1.344 11.243-1.173l54.144-42.347 47.275 85.077c1.941 3.499 5.589 5.483 9.344 5.483 1.621 0 3.243-.363 4.779-1.131l64-32c2.603-1.301 4.565-3.605 5.419-6.379a10.73 10.73 0 0 0-.875-8.341l-44.523-80.149h67.2a10.67 10.67 0 0 0 9.856-6.592c1.663-3.989.746-8.576-2.305-11.627zm-92.885-3.114c-3.776 0-7.275 1.984-9.195 5.291-1.92 3.243-1.963 7.275-.128 10.581l47.915 86.251-44.885 22.464-48.384-87.083c-1.515-2.731-4.139-4.672-7.211-5.291a10.16 10.16 0 0 0-2.112-.213c-2.368 0-4.672.768-6.571 2.261l-46.763 36.565V185.746l176.917 176.917h-59.583zm21.418-259.883c-15.296-39.915-45.184-71.488-84.224-88.896-80.533-35.947-175.339.32-211.307 80.896-17.408 39.019-18.581 82.496-3.328 122.432 15.296 39.915 45.184 71.488 84.224 88.896 1.408.619 2.88.917 4.331.917 4.096 0 7.979-2.368 9.749-6.336 2.411-5.376-.021-11.691-5.397-14.08C97.699 255.442 66.232 173.288 97.4 103.464 128.589 33.661 210.765 2.258 280.547 33.362c69.803 31.168 101.269 113.323 70.101 183.147-2.411 5.376.021 11.691 5.397 14.08 5.376 2.432 11.669-.043 14.08-5.397 17.43-39.019 18.603-82.496 3.328-122.411z" fill="#2E3A59"/>
      </svg>
    </button>
    <button id="devtools-tab1" title="Component overview">Overview</button>
    <button id="devtools-tab2" title="Component properties">Details</button>
    <button id="devtools-tab3" title="State history">History</button>
    <button id="devtools-tab4" title="Component editor">Editor</button>

    <button id="devtools-closeBtn" title="Close this panel" style="float:right;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.59 7L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7Z" fill="#2E3A59"/>
      </svg>
    </button>
    <button id="devtools-right" title="Move panel to right-side of viewport" style="float:right;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21ZM16 5V19H19V5H16ZM5 5V19H14V5H5Z" fill="#2E3A59"/>
      </svg>
    </button>
    <button id="devtools-bottom" title="Move panel to bottom of viewport" style="float:right;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21ZM5 16V19H19V16H5ZM5 5V14H19V5H5Z" fill="#2E3A59"/>
      </svg>
    </button>

  </div>

  <div class="tab overview-tab">
    <div class="column dom-tree-column">
      <p>Current View</p>
      <div class="panel dom-tree-panel"></div>
    </div>
    <div class="column properties-column">
      <p>Current State</p>
      <div class="panel properties-panel"></div>
    </div>
  </div>

  <div class="tab details-tab">
    <div class="column details-column">
      <p>Details</p>
      <div class="panel details-panel"></div>
    </div>
  </div>

  <div class="tab console-tab">
    <div class="column history-column">
      <p>State History</p>
      <span class="toolbar history-toolbar">
        <button id="btn-state-rewind" title="Rewind to start">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 18L11.5 12L20 6V18ZM11 18L2.5 12L11 6V18Z" fill="#2E3A59"/>
          </svg>
        </button>
        <button id="btn-state-back" title="Go back">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path
               d="M 8 19 L 19 12 L 8 5 L 8 19 z "
               transform="matrix(-1.000000,1.224647e-16,-1.224647e-16,-1.000000,27.00000,24.00000)"
               style="fill:#2E3A59;" />
          </svg>
        </button>
        <button id="btn-state-forward" title="Go forward">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 19L19 12L8 5V19Z" fill="#2E3A59"/>
          </svg>
        </button>
        <button id="btn-state-fast-forward" title="Fast-forward to latest">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 18V6L21.5 12L13 18ZM4 18V6L12.5 12L4 18Z" fill="#2E3A59"/>
          </svg>
        </button>
      </span>
      <div class="panel history-panel"></div>
    </div>
  </div>

  <div class="tab editor-tab">
    <div class="column editor-column">
      <p>View</p>
      <button id="devtools-view-saveBtn" title="Save changes to view" style="font-size:1em;float:right;margin-top:4px;padding:0;padding-top:2px;">
        <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 512 512" width="18" height="16">
          <path d="M86.273,482H425.727C452.194,482,474,460.813,474,434.346V103.626a8.138,8.138,0,0,0-1.968-5.094l-54.548-65.8A7.983,7.983,0,0,0,411.247,30H86.273C59.806,30,38,51.187,38,77.654V434.346C38,460.813,59.806,482,86.273,482ZM354,359H146V322H354ZM146,375H354v91H146Zm0-329H354V165H146ZM54,77.654C54,60.009,68.628,46,86.273,46H130V172.684A8.455,8.455,0,0,0,138.208,181H362.3c4.418,0,7.7-3.9,7.7-8.316V46h37.478L458,106.5V434.346C458,451.991,443.372,466,425.727,466H370V313.907A7.67,7.67,0,0,0,362.3,306H138.208A8.1,8.1,0,0,0,130,313.907V466H86.273C68.628,466,54,451.991,54,434.346Z"/>
          <path d="M308,73a8,8,0,0,0-8-8H268a8,8,0,0,0-8,8v67a8,8,0,0,0,8,8h32a8,8,0,0,0,8-8Zm-16,58H276V81h16Z"/>
        </svg>
      </button>
      <textarea class="panel view-panel" spellcheck="false"></textarea>
    </div>
    <div class="column editor-column">
      <p>Style</p>
      <button id="devtools-style-saveBtn" title="Save changes to styles" style="font-size:1em;float:right;margin-top:4px;padding:0;padding-top:2px;">
        <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 512 512" width="18" height="16">
          <path d="M86.273,482H425.727C452.194,482,474,460.813,474,434.346V103.626a8.138,8.138,0,0,0-1.968-5.094l-54.548-65.8A7.983,7.983,0,0,0,411.247,30H86.273C59.806,30,38,51.187,38,77.654V434.346C38,460.813,59.806,482,86.273,482ZM354,359H146V322H354ZM146,375H354v91H146Zm0-329H354V165H146ZM54,77.654C54,60.009,68.628,46,86.273,46H130V172.684A8.455,8.455,0,0,0,138.208,181H362.3c4.418,0,7.7-3.9,7.7-8.316V46h37.478L458,106.5V434.346C458,451.991,443.372,466,425.727,466H370V313.907A7.67,7.67,0,0,0,362.3,306H138.208A8.1,8.1,0,0,0,130,313.907V466H86.273C68.628,466,54,451.991,54,434.346Z"/>
          <path d="M308,73a8,8,0,0,0-8-8H268a8,8,0,0,0-8,8v67a8,8,0,0,0,8,8h32a8,8,0,0,0,8-8Zm-16,58H276V81h16Z"/>
        </svg>
      </button>
      <textarea class="panel style-panel" spellcheck="false"></textarea>
    </div>
  </div>
</div>`

devtools.toggleBtn = `
<button
  title="Open Component devtools"
  id="devtools-toggleBtn"
  style="position:fixed;top:8px;right:8px;font-size:1.2em;padding:4px;">
    🗗
</button>`;

devtools.layout = 'right';

devtools.init = function(){        // main function to load devtools, adds button to page to hide/show devtools UI
  document.addEventListener('DOMContentLoaded', (event) => {
    // add the devtools stylesheet to the page
    const devtoolsCss = document.createElement("style")
    devtoolsCss.innerHTML = devtools.style;
    document.head.appendChild(devtoolsCss)

    // add the devtools HTML to the page
    const devtoolsView = document.createElement("div")
    devtoolsView.innerHTML = devtools.view + devtools.toggleBtn;
    document.body.append(devtoolsView);

    const devtoolsToggleBtn = document.querySelector('#devtools-toggleBtn');
    const mainUI = document.querySelector('.devtools');

    this.toolbarBtns = mainUI.querySelectorAll('.devtools .toolbar button');
    devtools.toolbarBtns.forEach(el => {
      el.addEventListener('click', e => {
        devtools.rmBtnHighlights();
      });
    });

    this.tabs = mainUI.querySelectorAll('.devtools .tab');
    this.oTab = mainUI.querySelector('.overview-tab');
    this.dTab = mainUI.querySelector('.details-tab');
    this.cTab = mainUI.querySelector('.console-tab');
    this.eTab = mainUI.querySelector('.editor-tab');

    this.openBtn  = mainUI.querySelector('#devtools-toggleBtn');
    this.toRightBtn = mainUI.querySelector('#devtools-right');
    this.toBottomBtn = mainUI.querySelector('#devtools-bottom');
    this.closeBtn = mainUI.querySelector('#devtools-closeBtn');

    devtools.toRightBtn.style.display = 'none';

    devtoolsToggleBtn.addEventListener('click', function(e) {
        mainUI.style.display = 'block';
        this.style.display = 'none';
        if (devtools.layout === 'bottom') document.body.style.marginBottom = "350px";
        if (devtools.layout === 'right') document.body.style.marginRight = "40%";
        /*
        mainUI.addEventListener('mouseover', function(e) {
            document.querySelector('html').classList.add("no-scroll");
            document.body.classList.add("no-scroll");
        });
        mainUI.addEventListener('mouseout', function(e) {
            document.querySelector('html').classList.remove("no-scroll");
            document.body.classList.remove("no-scroll");
        });
        */
    });
    this.toBottomBtn.addEventListener('click', function(e) {
        this.style.display = 'none';
        devtools.toRightBtn.style.display = 'block';
        devtools.layout = 'bottom';
        mainUI.style.display = 'block';
        mainUI.classList.remove('devtools-vertical')
        document.body.style.marginBottom = "350px";
        document.body.style.marginRight = "0";
    });
    this.toRightBtn.addEventListener('click', function(e) {
        this.style.display = 'none';
        devtools.toBottomBtn.style.display = 'block';
        devtools.layout = 'right';
        mainUI.style.display = 'block';
        mainUI.classList.add('devtools-vertical')
        document.body.style.marginBottom = "0";
        document.body.style.marginRight = "40%";
    });
    this.closeBtn.addEventListener('click', function(e) {
        mainUI.style.display = 'none';
        devtoolsToggleBtn.style.display = 'block';
        document.body.style.marginBottom = "0";
        document.body.style.marginRight = "0";
    });

    this.selectBtn = mainUI.querySelector('#devtools-selectBtn');
    this.overviewBtn = mainUI.querySelector('#devtools-tab1');
    this.detailsBtn = mainUI.querySelector('#devtools-tab2');
    this.consoleBtn = mainUI.querySelector('#devtools-tab3');
    this.editorBtn = mainUI.querySelector('#devtools-tab4');

    this.overviewBtn.addEventListener('click', function(e) {
        devtools.hideTabs()
        devtools.oTab.style.display = 'block';
        devtools.overviewBtn.classList.add('btn-selected')
    });
    this.detailsBtn.addEventListener('click', function(e) {
        devtools.hideTabs()
        devtools.dTab.style.display = 'block';
        devtools.detailsBtn.classList.add('btn-selected')
    });
    this.consoleBtn.addEventListener('click', function(e) {
        devtools.hideTabs()
        devtools.cTab.style.display = 'block';
        devtools.consoleBtn.classList.add('btn-selected')
    });
    this.editorBtn.addEventListener('click', function(e) {
        devtools.hideTabs()
        devtools.eTab.style.display = 'block';
        devtools.editorBtn.classList.add('btn-selected')
    });
    this.selectBtn.addEventListener('click', devtools.getComponent);

    this.rwStateBtn = mainUI.querySelector('#btn-state-rewind');
    this.backStateBtn = mainUI.querySelector('#btn-state-back');
    this.forwardStateBtn = mainUI.querySelector('#btn-state-forward');
    this.ffStateBtn = mainUI.querySelector('#btn-state-fast-forward');

    this.rwStateBtn.addEventListener('click', e => devtools.currentComponent.rw());
    this.backStateBtn.addEventListener('click', e => devtools.currentComponent.rw(1));
    this.forwardStateBtn.addEventListener('click', e => devtools.currentComponent.ff(1));
    this.ffStateBtn.addEventListener('click', e => devtools.currentComponent.ff());

    this.viewSaveBtn = mainUI.querySelector('#devtools-view-saveBtn');
    this.styleSaveBtn = mainUI.querySelector('#devtools-style-saveBtn');

    this.viewSaveBtn.addEventListener('click', e => {
      const txt = document.querySelector('.view-panel').value;
      const eval2 = eval;
      sjComponents[devtools.uid].view = eval2(txt)
    });
    this.styleSaveBtn.addEventListener('click', e => {
      const txt = document.querySelector('.style-panel').value;
      const eval2 = eval;
      sjComponents[devtools.uid].style = eval2(txt)
    });

    var viewEditor = new Behave({
        textarea: document.querySelector('.view-panel')
    });
    var styleEditor = new Behave({
        textarea: document.querySelector('.style-panel')
    });

  });

};

devtools.rmBtnHighlights = function () {
  devtools.toolbarBtns.forEach(el => {
    el.classList.remove('btn-selected')
  });
};

devtools.hideTabs = function() {
  devtools.tabs.forEach(el => {
    el.style.display = "none";
  });
}

devtools.getComponents = function(){ // get all components on page
  return document.querySelectorAll('[data-uid]');
}

devtools.getComponent = function(){ // get component info, to populate UI
  devtools.selectBtn.classList.add('btn-selected')
  const components = document.querySelectorAll('[data-uid]');

  // funcs to update elems in the page, for highlighting purposes
  const addOverlay = elem => elem.classList.add("elemOverlay");
  const rmOverlay = elem => elem.classList.remove("elemOverlay");

  const self = this
  // create named callbacks, so we can cancel them
  function highlight(e){ addOverlay(this); }
  function rmHighlight(e){ rmOverlay(this); }

  function addToPanel(e) {
    // remove highlighting and events listeners from all components
    components.forEach(elem => {
      elem.classList.remove("elemOverlay")
      elem.removeEventListener('mouseover', highlight);
      elem.removeEventListener('mouseout', rmHighlight);
      elem.removeEventListener('click', addToPanel);
    });
    devtools.populateUI(e.target.parentNode);
    devtools.rmBtnHighlights();
    devtools.overviewBtn.classList.add('btn-selected')
    devtools.oTab.style.display = 'block';
  }

  components.forEach(el => {
    // highlight each component on the page
    el.addEventListener('mouseover', highlight);
    el.addEventListener('mouseout', rmHighlight);
    // if user clicks a component, load it in the devtools
    el.addEventListener('click', addToPanel);
  });
}

devtools.populateUI = function(el) {
  if (!el) return;
  //console.log('el = ', el);

  const container = devtools.getUidFromChildren(el)
    || devtools.getUidFromParents(el);

  const uid = container.dataset.uid;
  devtools.uid = uid;

  devtools.currentComponent = sjComponents[uid];

  devtools.populateOverviewPanel(sjComponents[uid]);
  devtools.populateDetailsPanel(sjComponents[uid]);
  devtools.populateStateHistoryPanel(sjComponents[uid]);
  devtools.populateViewPanel(sjComponents[uid]);
  devtools.populateStylePanel(sjComponents[uid]);
  // set current component as $c (can be accessed in the "real" dev tools console)
  $c = sjComponents[uid];
}

devtools.getUidFromParents = function(el) {
  if(el && el.getAttribute('data-uid')) {
      return el
  } else if (el.parentElement) {
      return devtools.getUidFromParents(el.parentElement)
  }
}

devtools.getUidFromChildren = function(el) {
  if(el && el.getAttribute('data-uid')) {
      return el
  } else if (el.firstElementChild) {
      return devtools.getUidFromChildren(el.firstElementChild)
  }
}

devtools.populateOverviewPanel = function(comp) {
  const treePanel = document.querySelector('.dom-tree-panel')
  if (treePanel) {
    treePanel.innerHTML = '';
    treePanel.innerHTML = `<pre>${htmlEntities(comp+"".replace(/^$/, ''))}</pre>`;
    createTreeView(comp.state, document.querySelector('.properties-panel'))
  }
}

devtools.populateDetailsPanel = function(comp) {
  const detailsPanel = document.querySelector('.details-panel');
  if (detailsPanel) {
    const panelContents = `
      <div><span>UID</span><span>${comp.uid}</span></div>
      <div><span>Container</span><span>${comp.container.className.replace(/^/, '.').replace(' ', ' .')}</span></div>
      <div><span>Reactive</span><span>${comp.reactive || 'false'}</span></div>
      <div><span>Scoped CSS</span><span>${comp.scopedCss || 'false'}</span></div>
      <div><span>Debug</span><span>${comp.debug || 'false'}</span></div>
      <div><span>Schema</span><span class="schema-row">None</span></div>
      <div><span>Actions</span><span class="actions-row">None</span></div>
      <div><span>Middleware</span><span class="middleware-row">None</span></div>
    `;
    document.querySelector('.details-panel').innerHTML = panelContents;
    if (comp.schema) createTreeView(comp.schema, document.querySelector('.schema-row'), { objName: 'schema' })
    createTreeView(comp.middleware, document.querySelector('.middleware-row'), { objName: 'middleware' })
    createTreeView(comp.actionsList, document.querySelector('.actions-row'), { objName: 'actions' })
  }
}

devtools.populateStateHistoryPanel = function(comp) {
  const historyPanel = document.querySelector('.history-panel');
  if (historyPanel) {
    createTreeView(comp.log, historyPanel, { objName: 'log' });
  }
}

devtools.populateViewPanel = function(comp) {
  const viewPanel = document.querySelector('.view-panel');
  if (viewPanel) {
    const panelContents = comp.view+"";
    viewPanel.value = `${panelContents}`;
  }
}

devtools.populateStylePanel = function(comp) {
  const stylePanel = document.querySelector('.style-panel');
  if (stylePanel) {
    const panelContents = comp.style ? comp.style+"" : '';
    stylePanel.value = panelContents;
  }
}

export default devtools;
