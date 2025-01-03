"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // ../package.json
  var version;
  var init_package = __esm({
    "../package.json"() {
      version = "3.0.2";
    }
  });

  // ../node_modules/sortablejs/modular/sortable.esm.js
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) {
        symbols = symbols.filter(function(sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      }
      keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      if (i % 2) {
        ownKeys(Object(source), true).forEach(function(key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function(key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }
    return target;
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function(obj2) {
        return typeof obj2;
      };
    } else {
      _typeof = function(obj2) {
        return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
      };
    }
    return _typeof(obj);
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _extends() {
    _extends = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends.apply(this, arguments);
  }
  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null)
      return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0)
        continue;
      target[key] = source[key];
    }
    return target;
  }
  function _objectWithoutProperties(source, excluded) {
    if (source == null)
      return {};
    var target = _objectWithoutPropertiesLoose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0)
          continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key))
          continue;
        target[key] = source[key];
      }
    }
    return target;
  }
  function userAgent(pattern) {
    if (typeof window !== "undefined" && window.navigator) {
      return !!/* @__PURE__ */ navigator.userAgent.match(pattern);
    }
  }
  function on(el, event, fn) {
    el.addEventListener(event, fn, !IE11OrLess && captureMode);
  }
  function off(el, event, fn) {
    el.removeEventListener(event, fn, !IE11OrLess && captureMode);
  }
  function matches(el, selector) {
    if (!selector)
      return;
    selector[0] === ">" && (selector = selector.substring(1));
    if (el) {
      try {
        if (el.matches) {
          return el.matches(selector);
        } else if (el.msMatchesSelector) {
          return el.msMatchesSelector(selector);
        } else if (el.webkitMatchesSelector) {
          return el.webkitMatchesSelector(selector);
        }
      } catch (_) {
        return false;
      }
    }
    return false;
  }
  function getParentOrHost(el) {
    return el.host && el !== document && el.host.nodeType ? el.host : el.parentNode;
  }
  function closest(el, selector, ctx, includeCTX) {
    if (el) {
      ctx = ctx || document;
      do {
        if (selector != null && (selector[0] === ">" ? el.parentNode === ctx && matches(el, selector) : matches(el, selector)) || includeCTX && el === ctx) {
          return el;
        }
        if (el === ctx)
          break;
      } while (el = getParentOrHost(el));
    }
    return null;
  }
  function toggleClass(el, name, state) {
    if (el && name) {
      if (el.classList) {
        el.classList[state ? "add" : "remove"](name);
      } else {
        var className = (" " + el.className + " ").replace(R_SPACE, " ").replace(" " + name + " ", " ");
        el.className = (className + (state ? " " + name : "")).replace(R_SPACE, " ");
      }
    }
  }
  function css(el, prop, val) {
    var style = el && el.style;
    if (style) {
      if (val === void 0) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
          val = document.defaultView.getComputedStyle(el, "");
        } else if (el.currentStyle) {
          val = el.currentStyle;
        }
        return prop === void 0 ? val : val[prop];
      } else {
        if (!(prop in style) && prop.indexOf("webkit") === -1) {
          prop = "-webkit-" + prop;
        }
        style[prop] = val + (typeof val === "string" ? "" : "px");
      }
    }
  }
  function matrix(el, selfOnly) {
    var appliedTransforms = "";
    if (typeof el === "string") {
      appliedTransforms = el;
    } else {
      do {
        var transform = css(el, "transform");
        if (transform && transform !== "none") {
          appliedTransforms = transform + " " + appliedTransforms;
        }
      } while (!selfOnly && (el = el.parentNode));
    }
    var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
    return matrixFn && new matrixFn(appliedTransforms);
  }
  function find(ctx, tagName, iterator) {
    if (ctx) {
      var list = ctx.getElementsByTagName(tagName), i = 0, n = list.length;
      if (iterator) {
        for (; i < n; i++) {
          iterator(list[i], i);
        }
      }
      return list;
    }
    return [];
  }
  function getWindowScrollingElement() {
    var scrollingElement = document.scrollingElement;
    if (scrollingElement) {
      return scrollingElement;
    } else {
      return document.documentElement;
    }
  }
  function getRect(el, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
    if (!el.getBoundingClientRect && el !== window)
      return;
    var elRect, top, left, bottom, right, height, width;
    if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
      elRect = el.getBoundingClientRect();
      top = elRect.top;
      left = elRect.left;
      bottom = elRect.bottom;
      right = elRect.right;
      height = elRect.height;
      width = elRect.width;
    } else {
      top = 0;
      left = 0;
      bottom = window.innerHeight;
      right = window.innerWidth;
      height = window.innerHeight;
      width = window.innerWidth;
    }
    if ((relativeToContainingBlock || relativeToNonStaticParent) && el !== window) {
      container = container || el.parentNode;
      if (!IE11OrLess) {
        do {
          if (container && container.getBoundingClientRect && (css(container, "transform") !== "none" || relativeToNonStaticParent && css(container, "position") !== "static")) {
            var containerRect = container.getBoundingClientRect();
            top -= containerRect.top + parseInt(css(container, "border-top-width"));
            left -= containerRect.left + parseInt(css(container, "border-left-width"));
            bottom = top + elRect.height;
            right = left + elRect.width;
            break;
          }
        } while (container = container.parentNode);
      }
    }
    if (undoScale && el !== window) {
      var elMatrix = matrix(container || el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d;
      if (elMatrix) {
        top /= scaleY;
        left /= scaleX;
        width /= scaleX;
        height /= scaleY;
        bottom = top + height;
        right = left + width;
      }
    }
    return {
      top,
      left,
      bottom,
      right,
      width,
      height
    };
  }
  function isScrolledPast(el, elSide, parentSide) {
    var parent = getParentAutoScrollElement(el, true), elSideVal = getRect(el)[elSide];
    while (parent) {
      var parentSideVal = getRect(parent)[parentSide], visible = void 0;
      if (parentSide === "top" || parentSide === "left") {
        visible = elSideVal >= parentSideVal;
      } else {
        visible = elSideVal <= parentSideVal;
      }
      if (!visible)
        return parent;
      if (parent === getWindowScrollingElement())
        break;
      parent = getParentAutoScrollElement(parent, false);
    }
    return false;
  }
  function getChild(el, childNum, options, includeDragEl) {
    var currentChild = 0, i = 0, children = el.children;
    while (i < children.length) {
      if (children[i].style.display !== "none" && children[i] !== Sortable.ghost && (includeDragEl || children[i] !== Sortable.dragged) && closest(children[i], options.draggable, el, false)) {
        if (currentChild === childNum) {
          return children[i];
        }
        currentChild++;
      }
      i++;
    }
    return null;
  }
  function lastChild(el, selector) {
    var last = el.lastElementChild;
    while (last && (last === Sortable.ghost || css(last, "display") === "none" || selector && !matches(last, selector))) {
      last = last.previousElementSibling;
    }
    return last || null;
  }
  function index(el, selector) {
    var index2 = 0;
    if (!el || !el.parentNode) {
      return -1;
    }
    while (el = el.previousElementSibling) {
      if (el.nodeName.toUpperCase() !== "TEMPLATE" && el !== Sortable.clone && (!selector || matches(el, selector))) {
        index2++;
      }
    }
    return index2;
  }
  function getRelativeScrollOffset(el) {
    var offsetLeft = 0, offsetTop = 0, winScroller = getWindowScrollingElement();
    if (el) {
      do {
        var elMatrix = matrix(el), scaleX = elMatrix.a, scaleY = elMatrix.d;
        offsetLeft += el.scrollLeft * scaleX;
        offsetTop += el.scrollTop * scaleY;
      } while (el !== winScroller && (el = el.parentNode));
    }
    return [offsetLeft, offsetTop];
  }
  function indexOfObject(arr, obj) {
    for (var i in arr) {
      if (!arr.hasOwnProperty(i))
        continue;
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] === arr[i][key])
          return Number(i);
      }
    }
    return -1;
  }
  function getParentAutoScrollElement(el, includeSelf) {
    if (!el || !el.getBoundingClientRect)
      return getWindowScrollingElement();
    var elem = el;
    var gotSelf = false;
    do {
      if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
        var elemCSS = css(elem);
        if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == "auto" || elemCSS.overflowX == "scroll") || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == "auto" || elemCSS.overflowY == "scroll")) {
          if (!elem.getBoundingClientRect || elem === document.body)
            return getWindowScrollingElement();
          if (gotSelf || includeSelf)
            return elem;
          gotSelf = true;
        }
      }
    } while (elem = elem.parentNode);
    return getWindowScrollingElement();
  }
  function extend(dst, src) {
    if (dst && src) {
      for (var key in src) {
        if (src.hasOwnProperty(key)) {
          dst[key] = src[key];
        }
      }
    }
    return dst;
  }
  function isRectEqual(rect1, rect2) {
    return Math.round(rect1.top) === Math.round(rect2.top) && Math.round(rect1.left) === Math.round(rect2.left) && Math.round(rect1.height) === Math.round(rect2.height) && Math.round(rect1.width) === Math.round(rect2.width);
  }
  function throttle(callback, ms) {
    return function() {
      if (!_throttleTimeout) {
        var args = arguments, _this = this;
        if (args.length === 1) {
          callback.call(_this, args[0]);
        } else {
          callback.apply(_this, args);
        }
        _throttleTimeout = setTimeout(function() {
          _throttleTimeout = void 0;
        }, ms);
      }
    };
  }
  function cancelThrottle() {
    clearTimeout(_throttleTimeout);
    _throttleTimeout = void 0;
  }
  function scrollBy(el, x, y) {
    el.scrollLeft += x;
    el.scrollTop += y;
  }
  function clone(el) {
    var Polymer = window.Polymer;
    var $2 = window.jQuery || window.Zepto;
    if (Polymer && Polymer.dom) {
      return Polymer.dom(el).cloneNode(true);
    } else if ($2) {
      return $2(el).clone(true)[0];
    } else {
      return el.cloneNode(true);
    }
  }
  function getChildContainingRectFromElement(container, options, ghostEl2) {
    var rect = {};
    Array.from(container.children).forEach(function(child) {
      var _rect$left, _rect$top, _rect$right, _rect$bottom;
      if (!closest(child, options.draggable, container, false) || child.animated || child === ghostEl2)
        return;
      var childRect = getRect(child);
      rect.left = Math.min((_rect$left = rect.left) !== null && _rect$left !== void 0 ? _rect$left : Infinity, childRect.left);
      rect.top = Math.min((_rect$top = rect.top) !== null && _rect$top !== void 0 ? _rect$top : Infinity, childRect.top);
      rect.right = Math.max((_rect$right = rect.right) !== null && _rect$right !== void 0 ? _rect$right : -Infinity, childRect.right);
      rect.bottom = Math.max((_rect$bottom = rect.bottom) !== null && _rect$bottom !== void 0 ? _rect$bottom : -Infinity, childRect.bottom);
    });
    rect.width = rect.right - rect.left;
    rect.height = rect.bottom - rect.top;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }
  function AnimationStateManager() {
    var animationStates = [], animationCallbackId;
    return {
      captureAnimationState: function captureAnimationState() {
        animationStates = [];
        if (!this.options.animation)
          return;
        var children = [].slice.call(this.el.children);
        children.forEach(function(child) {
          if (css(child, "display") === "none" || child === Sortable.ghost)
            return;
          animationStates.push({
            target: child,
            rect: getRect(child)
          });
          var fromRect = _objectSpread2({}, animationStates[animationStates.length - 1].rect);
          if (child.thisAnimationDuration) {
            var childMatrix = matrix(child, true);
            if (childMatrix) {
              fromRect.top -= childMatrix.f;
              fromRect.left -= childMatrix.e;
            }
          }
          child.fromRect = fromRect;
        });
      },
      addAnimationState: function addAnimationState(state) {
        animationStates.push(state);
      },
      removeAnimationState: function removeAnimationState(target) {
        animationStates.splice(indexOfObject(animationStates, {
          target
        }), 1);
      },
      animateAll: function animateAll(callback) {
        var _this = this;
        if (!this.options.animation) {
          clearTimeout(animationCallbackId);
          if (typeof callback === "function")
            callback();
          return;
        }
        var animating = false, animationTime = 0;
        animationStates.forEach(function(state) {
          var time = 0, target = state.target, fromRect = target.fromRect, toRect = getRect(target), prevFromRect = target.prevFromRect, prevToRect = target.prevToRect, animatingRect = state.rect, targetMatrix = matrix(target, true);
          if (targetMatrix) {
            toRect.top -= targetMatrix.f;
            toRect.left -= targetMatrix.e;
          }
          target.toRect = toRect;
          if (target.thisAnimationDuration) {
            if (isRectEqual(prevFromRect, toRect) && !isRectEqual(fromRect, toRect) && // Make sure animatingRect is on line between toRect & fromRect
            (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) === (fromRect.top - toRect.top) / (fromRect.left - toRect.left)) {
              time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
            }
          }
          if (!isRectEqual(toRect, fromRect)) {
            target.prevFromRect = fromRect;
            target.prevToRect = toRect;
            if (!time) {
              time = _this.options.animation;
            }
            _this.animate(target, animatingRect, toRect, time);
          }
          if (time) {
            animating = true;
            animationTime = Math.max(animationTime, time);
            clearTimeout(target.animationResetTimer);
            target.animationResetTimer = setTimeout(function() {
              target.animationTime = 0;
              target.prevFromRect = null;
              target.fromRect = null;
              target.prevToRect = null;
              target.thisAnimationDuration = null;
            }, time);
            target.thisAnimationDuration = time;
          }
        });
        clearTimeout(animationCallbackId);
        if (!animating) {
          if (typeof callback === "function")
            callback();
        } else {
          animationCallbackId = setTimeout(function() {
            if (typeof callback === "function")
              callback();
          }, animationTime);
        }
        animationStates = [];
      },
      animate: function animate(target, currentRect, toRect, duration) {
        if (duration) {
          css(target, "transition", "");
          css(target, "transform", "");
          var elMatrix = matrix(this.el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d, translateX = (currentRect.left - toRect.left) / (scaleX || 1), translateY = (currentRect.top - toRect.top) / (scaleY || 1);
          target.animatingX = !!translateX;
          target.animatingY = !!translateY;
          css(target, "transform", "translate3d(" + translateX + "px," + translateY + "px,0)");
          this.forRepaintDummy = repaint(target);
          css(target, "transition", "transform " + duration + "ms" + (this.options.easing ? " " + this.options.easing : ""));
          css(target, "transform", "translate3d(0,0,0)");
          typeof target.animated === "number" && clearTimeout(target.animated);
          target.animated = setTimeout(function() {
            css(target, "transition", "");
            css(target, "transform", "");
            target.animated = false;
            target.animatingX = false;
            target.animatingY = false;
          }, duration);
        }
      }
    };
  }
  function repaint(target) {
    return target.offsetWidth;
  }
  function calculateRealTime(animatingRect, fromRect, toRect, options) {
    return Math.sqrt(Math.pow(fromRect.top - animatingRect.top, 2) + Math.pow(fromRect.left - animatingRect.left, 2)) / Math.sqrt(Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2)) * options.animation;
  }
  function dispatchEvent(_ref) {
    var sortable = _ref.sortable, rootEl2 = _ref.rootEl, name = _ref.name, targetEl = _ref.targetEl, cloneEl2 = _ref.cloneEl, toEl = _ref.toEl, fromEl = _ref.fromEl, oldIndex2 = _ref.oldIndex, newIndex2 = _ref.newIndex, oldDraggableIndex2 = _ref.oldDraggableIndex, newDraggableIndex2 = _ref.newDraggableIndex, originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, extraEventProperties = _ref.extraEventProperties;
    sortable = sortable || rootEl2 && rootEl2[expando];
    if (!sortable)
      return;
    var evt, options = sortable.options, onName = "on" + name.charAt(0).toUpperCase() + name.substr(1);
    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent(name, {
        bubbles: true,
        cancelable: true
      });
    } else {
      evt = document.createEvent("Event");
      evt.initEvent(name, true, true);
    }
    evt.to = toEl || rootEl2;
    evt.from = fromEl || rootEl2;
    evt.item = targetEl || rootEl2;
    evt.clone = cloneEl2;
    evt.oldIndex = oldIndex2;
    evt.newIndex = newIndex2;
    evt.oldDraggableIndex = oldDraggableIndex2;
    evt.newDraggableIndex = newDraggableIndex2;
    evt.originalEvent = originalEvent;
    evt.pullMode = putSortable2 ? putSortable2.lastPutMode : void 0;
    var allEventProperties = _objectSpread2(_objectSpread2({}, extraEventProperties), PluginManager.getEventProperties(name, sortable));
    for (var option2 in allEventProperties) {
      evt[option2] = allEventProperties[option2];
    }
    if (rootEl2) {
      rootEl2.dispatchEvent(evt);
    }
    if (options[onName]) {
      options[onName].call(sortable, evt);
    }
  }
  function _dispatchEvent(info) {
    dispatchEvent(_objectSpread2({
      putSortable,
      cloneEl,
      targetEl: dragEl,
      rootEl,
      oldIndex,
      oldDraggableIndex,
      newIndex,
      newDraggableIndex
    }, info));
  }
  function Sortable(el, options) {
    if (!(el && el.nodeType && el.nodeType === 1)) {
      throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
    }
    this.el = el;
    this.options = options = _extends({}, options);
    el[expando] = this;
    var defaults2 = {
      group: null,
      sort: true,
      disabled: false,
      store: null,
      handle: null,
      draggable: /^[uo]l$/i.test(el.nodeName) ? ">li" : ">*",
      swapThreshold: 1,
      // percentage; 0 <= x <= 1
      invertSwap: false,
      // invert always
      invertedSwapThreshold: null,
      // will be set to same as swapThreshold if default
      removeCloneOnHide: true,
      direction: function direction() {
        return _detectDirection(el, this.options);
      },
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      dragClass: "sortable-drag",
      ignore: "a, img",
      filter: null,
      preventOnFilter: true,
      animation: 0,
      easing: null,
      setData: function setData(dataTransfer, dragEl2) {
        dataTransfer.setData("Text", dragEl2.textContent);
      },
      dropBubble: false,
      dragoverBubble: false,
      dataIdAttr: "data-id",
      delay: 0,
      delayOnTouchOnly: false,
      touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
      forceFallback: false,
      fallbackClass: "sortable-fallback",
      fallbackOnBody: false,
      fallbackTolerance: 0,
      fallbackOffset: {
        x: 0,
        y: 0
      },
      // Disabled on Safari: #1571; Enabled on Safari IOS: #2244
      supportPointer: Sortable.supportPointer !== false && "PointerEvent" in window && (!Safari || IOS),
      emptyInsertThreshold: 5
    };
    PluginManager.initializePlugins(this, el, defaults2);
    for (var name in defaults2) {
      !(name in options) && (options[name] = defaults2[name]);
    }
    _prepareGroup(options);
    for (var fn in this) {
      if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
        this[fn] = this[fn].bind(this);
      }
    }
    this.nativeDraggable = options.forceFallback ? false : supportDraggable;
    if (this.nativeDraggable) {
      this.options.touchStartThreshold = 1;
    }
    if (options.supportPointer) {
      on(el, "pointerdown", this._onTapStart);
    } else {
      on(el, "mousedown", this._onTapStart);
      on(el, "touchstart", this._onTapStart);
    }
    if (this.nativeDraggable) {
      on(el, "dragover", this);
      on(el, "dragenter", this);
    }
    sortables.push(this.el);
    options.store && options.store.get && this.sort(options.store.get(this) || []);
    _extends(this, AnimationStateManager());
  }
  function _globalDragOver(evt) {
    if (evt.dataTransfer) {
      evt.dataTransfer.dropEffect = "move";
    }
    evt.cancelable && evt.preventDefault();
  }
  function _onMove(fromEl, toEl, dragEl2, dragRect, targetEl, targetRect, originalEvent, willInsertAfter) {
    var evt, sortable = fromEl[expando], onMoveFn = sortable.options.onMove, retVal;
    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent("move", {
        bubbles: true,
        cancelable: true
      });
    } else {
      evt = document.createEvent("Event");
      evt.initEvent("move", true, true);
    }
    evt.to = toEl;
    evt.from = fromEl;
    evt.dragged = dragEl2;
    evt.draggedRect = dragRect;
    evt.related = targetEl || toEl;
    evt.relatedRect = targetRect || getRect(toEl);
    evt.willInsertAfter = willInsertAfter;
    evt.originalEvent = originalEvent;
    fromEl.dispatchEvent(evt);
    if (onMoveFn) {
      retVal = onMoveFn.call(sortable, evt, originalEvent);
    }
    return retVal;
  }
  function _disableDraggable(el) {
    el.draggable = false;
  }
  function _unsilent() {
    _silent = false;
  }
  function _ghostIsFirst(evt, vertical, sortable) {
    var firstElRect = getRect(getChild(sortable.el, 0, sortable.options, true));
    var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
    var spacer = 10;
    return vertical ? evt.clientX < childContainingRect.left - spacer || evt.clientY < firstElRect.top && evt.clientX < firstElRect.right : evt.clientY < childContainingRect.top - spacer || evt.clientY < firstElRect.bottom && evt.clientX < firstElRect.left;
  }
  function _ghostIsLast(evt, vertical, sortable) {
    var lastElRect = getRect(lastChild(sortable.el, sortable.options.draggable));
    var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
    var spacer = 10;
    return vertical ? evt.clientX > childContainingRect.right + spacer || evt.clientY > lastElRect.bottom && evt.clientX > lastElRect.left : evt.clientY > childContainingRect.bottom + spacer || evt.clientX > lastElRect.right && evt.clientY > lastElRect.top;
  }
  function _getSwapDirection(evt, target, targetRect, vertical, swapThreshold, invertedSwapThreshold, invertSwap, isLastTarget) {
    var mouseOnAxis = vertical ? evt.clientY : evt.clientX, targetLength = vertical ? targetRect.height : targetRect.width, targetS1 = vertical ? targetRect.top : targetRect.left, targetS2 = vertical ? targetRect.bottom : targetRect.right, invert = false;
    if (!invertSwap) {
      if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
        if (!pastFirstInvertThresh && (lastDirection === 1 ? mouseOnAxis > targetS1 + targetLength * invertedSwapThreshold / 2 : mouseOnAxis < targetS2 - targetLength * invertedSwapThreshold / 2)) {
          pastFirstInvertThresh = true;
        }
        if (!pastFirstInvertThresh) {
          if (lastDirection === 1 ? mouseOnAxis < targetS1 + targetMoveDistance : mouseOnAxis > targetS2 - targetMoveDistance) {
            return -lastDirection;
          }
        } else {
          invert = true;
        }
      } else {
        if (mouseOnAxis > targetS1 + targetLength * (1 - swapThreshold) / 2 && mouseOnAxis < targetS2 - targetLength * (1 - swapThreshold) / 2) {
          return _getInsertDirection(target);
        }
      }
    }
    invert = invert || invertSwap;
    if (invert) {
      if (mouseOnAxis < targetS1 + targetLength * invertedSwapThreshold / 2 || mouseOnAxis > targetS2 - targetLength * invertedSwapThreshold / 2) {
        return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
      }
    }
    return 0;
  }
  function _getInsertDirection(target) {
    if (index(dragEl) < index(target)) {
      return 1;
    } else {
      return -1;
    }
  }
  function _generateId(el) {
    var str = el.tagName + el.className + el.src + el.href + el.textContent, i = str.length, sum = 0;
    while (i--) {
      sum += str.charCodeAt(i);
    }
    return sum.toString(36);
  }
  function _saveInputCheckedState(root) {
    savedInputChecked.length = 0;
    var inputs = root.getElementsByTagName("input");
    var idx = inputs.length;
    while (idx--) {
      var el = inputs[idx];
      el.checked && savedInputChecked.push(el);
    }
  }
  function _nextTick(fn) {
    return setTimeout(fn, 0);
  }
  function _cancelNextTick(id) {
    return clearTimeout(id);
  }
  function AutoScrollPlugin() {
    function AutoScroll() {
      this.defaults = {
        scroll: true,
        forceAutoScrollFallback: false,
        scrollSensitivity: 30,
        scrollSpeed: 10,
        bubbleScroll: true
      };
      for (var fn in this) {
        if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
          this[fn] = this[fn].bind(this);
        }
      }
    }
    AutoScroll.prototype = {
      dragStarted: function dragStarted(_ref) {
        var originalEvent = _ref.originalEvent;
        if (this.sortable.nativeDraggable) {
          on(document, "dragover", this._handleAutoScroll);
        } else {
          if (this.options.supportPointer) {
            on(document, "pointermove", this._handleFallbackAutoScroll);
          } else if (originalEvent.touches) {
            on(document, "touchmove", this._handleFallbackAutoScroll);
          } else {
            on(document, "mousemove", this._handleFallbackAutoScroll);
          }
        }
      },
      dragOverCompleted: function dragOverCompleted(_ref2) {
        var originalEvent = _ref2.originalEvent;
        if (!this.options.dragOverBubble && !originalEvent.rootEl) {
          this._handleAutoScroll(originalEvent);
        }
      },
      drop: function drop3() {
        if (this.sortable.nativeDraggable) {
          off(document, "dragover", this._handleAutoScroll);
        } else {
          off(document, "pointermove", this._handleFallbackAutoScroll);
          off(document, "touchmove", this._handleFallbackAutoScroll);
          off(document, "mousemove", this._handleFallbackAutoScroll);
        }
        clearPointerElemChangedInterval();
        clearAutoScrolls();
        cancelThrottle();
      },
      nulling: function nulling() {
        touchEvt$1 = scrollRootEl = scrollEl = scrolling = pointerElemChangedInterval = lastAutoScrollX = lastAutoScrollY = null;
        autoScrolls.length = 0;
      },
      _handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
        this._handleAutoScroll(evt, true);
      },
      _handleAutoScroll: function _handleAutoScroll(evt, fallback) {
        var _this = this;
        var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, elem = document.elementFromPoint(x, y);
        touchEvt$1 = evt;
        if (fallback || this.options.forceAutoScrollFallback || Edge || IE11OrLess || Safari) {
          autoScroll(evt, this.options, elem, fallback);
          var ogElemScroller = getParentAutoScrollElement(elem, true);
          if (scrolling && (!pointerElemChangedInterval || x !== lastAutoScrollX || y !== lastAutoScrollY)) {
            pointerElemChangedInterval && clearPointerElemChangedInterval();
            pointerElemChangedInterval = setInterval(function() {
              var newElem = getParentAutoScrollElement(document.elementFromPoint(x, y), true);
              if (newElem !== ogElemScroller) {
                ogElemScroller = newElem;
                clearAutoScrolls();
              }
              autoScroll(evt, _this.options, newElem, fallback);
            }, 10);
            lastAutoScrollX = x;
            lastAutoScrollY = y;
          }
        } else {
          if (!this.options.bubbleScroll || getParentAutoScrollElement(elem, true) === getWindowScrollingElement()) {
            clearAutoScrolls();
            return;
          }
          autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
        }
      }
    };
    return _extends(AutoScroll, {
      pluginName: "scroll",
      initializeByDefault: true
    });
  }
  function clearAutoScrolls() {
    autoScrolls.forEach(function(autoScroll2) {
      clearInterval(autoScroll2.pid);
    });
    autoScrolls = [];
  }
  function clearPointerElemChangedInterval() {
    clearInterval(pointerElemChangedInterval);
  }
  function Revert() {
  }
  function Remove() {
  }
  var version2, IE11OrLess, Edge, FireFox, Safari, IOS, ChromeForAndroid, captureMode, R_SPACE, _throttleTimeout, expando, plugins, defaults, PluginManager, _excluded, pluginEvent2, dragEl, parentEl, ghostEl, rootEl, nextEl, lastDownEl, cloneEl, cloneHidden, oldIndex, newIndex, oldDraggableIndex, newDraggableIndex, activeGroup, putSortable, awaitingDragStarted, ignoreNextClick, sortables, tapEvt, touchEvt, lastDx, lastDy, tapDistanceLeft, tapDistanceTop, moved, lastTarget, lastDirection, pastFirstInvertThresh, isCircumstantialInvert, targetMoveDistance, ghostRelativeParent, ghostRelativeParentInitialScroll, _silent, savedInputChecked, documentExists, PositionGhostAbsolutely, CSSFloatProperty, supportDraggable, supportCssPointerEvents, _detectDirection, _dragElInRowColumn, _detectNearestEmptySortable, _prepareGroup, _hideGhostForTarget, _unhideGhostForTarget, nearestEmptyInsertDetectEvent, _checkOutsideTargetEl, autoScrolls, scrollEl, scrollRootEl, scrolling, lastAutoScrollX, lastAutoScrollY, touchEvt$1, pointerElemChangedInterval, autoScroll, drop, sortable_esm_default;
  var init_sortable_esm = __esm({
    "../node_modules/sortablejs/modular/sortable.esm.js"() {
      version2 = "1.15.6";
      IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
      Edge = userAgent(/Edge/i);
      FireFox = userAgent(/firefox/i);
      Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
      IOS = userAgent(/iP(ad|od|hone)/i);
      ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);
      captureMode = {
        capture: false,
        passive: false
      };
      R_SPACE = /\s+/g;
      expando = "Sortable" + (/* @__PURE__ */ new Date()).getTime();
      plugins = [];
      defaults = {
        initializeByDefault: true
      };
      PluginManager = {
        mount: function mount(plugin) {
          for (var option2 in defaults) {
            if (defaults.hasOwnProperty(option2) && !(option2 in plugin)) {
              plugin[option2] = defaults[option2];
            }
          }
          plugins.forEach(function(p) {
            if (p.pluginName === plugin.pluginName) {
              throw "Sortable: Cannot mount plugin ".concat(plugin.pluginName, " more than once");
            }
          });
          plugins.push(plugin);
        },
        pluginEvent: function pluginEvent(eventName, sortable, evt) {
          var _this = this;
          this.eventCanceled = false;
          evt.cancel = function() {
            _this.eventCanceled = true;
          };
          var eventNameGlobal = eventName + "Global";
          plugins.forEach(function(plugin) {
            if (!sortable[plugin.pluginName])
              return;
            if (sortable[plugin.pluginName][eventNameGlobal]) {
              sortable[plugin.pluginName][eventNameGlobal](_objectSpread2({
                sortable
              }, evt));
            }
            if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) {
              sortable[plugin.pluginName][eventName](_objectSpread2({
                sortable
              }, evt));
            }
          });
        },
        initializePlugins: function initializePlugins(sortable, el, defaults2, options) {
          plugins.forEach(function(plugin) {
            var pluginName = plugin.pluginName;
            if (!sortable.options[pluginName] && !plugin.initializeByDefault)
              return;
            var initialized = new plugin(sortable, el, sortable.options);
            initialized.sortable = sortable;
            initialized.options = sortable.options;
            sortable[pluginName] = initialized;
            _extends(defaults2, initialized.defaults);
          });
          for (var option2 in sortable.options) {
            if (!sortable.options.hasOwnProperty(option2))
              continue;
            var modified = this.modifyOption(sortable, option2, sortable.options[option2]);
            if (typeof modified !== "undefined") {
              sortable.options[option2] = modified;
            }
          }
        },
        getEventProperties: function getEventProperties(name, sortable) {
          var eventProperties = {};
          plugins.forEach(function(plugin) {
            if (typeof plugin.eventProperties !== "function")
              return;
            _extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name));
          });
          return eventProperties;
        },
        modifyOption: function modifyOption(sortable, name, value) {
          var modifiedValue;
          plugins.forEach(function(plugin) {
            if (!sortable[plugin.pluginName])
              return;
            if (plugin.optionListeners && typeof plugin.optionListeners[name] === "function") {
              modifiedValue = plugin.optionListeners[name].call(sortable[plugin.pluginName], value);
            }
          });
          return modifiedValue;
        }
      };
      _excluded = ["evt"];
      pluginEvent2 = function pluginEvent3(eventName, sortable) {
        var _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, originalEvent = _ref.evt, data = _objectWithoutProperties(_ref, _excluded);
        PluginManager.pluginEvent.bind(Sortable)(eventName, sortable, _objectSpread2({
          dragEl,
          parentEl,
          ghostEl,
          rootEl,
          nextEl,
          lastDownEl,
          cloneEl,
          cloneHidden,
          dragStarted: moved,
          putSortable,
          activeSortable: Sortable.active,
          originalEvent,
          oldIndex,
          oldDraggableIndex,
          newIndex,
          newDraggableIndex,
          hideGhostForTarget: _hideGhostForTarget,
          unhideGhostForTarget: _unhideGhostForTarget,
          cloneNowHidden: function cloneNowHidden() {
            cloneHidden = true;
          },
          cloneNowShown: function cloneNowShown() {
            cloneHidden = false;
          },
          dispatchSortableEvent: function dispatchSortableEvent(name) {
            _dispatchEvent({
              sortable,
              name,
              originalEvent
            });
          }
        }, data));
      };
      awaitingDragStarted = false;
      ignoreNextClick = false;
      sortables = [];
      pastFirstInvertThresh = false;
      isCircumstantialInvert = false;
      ghostRelativeParentInitialScroll = [];
      _silent = false;
      savedInputChecked = [];
      documentExists = typeof document !== "undefined";
      PositionGhostAbsolutely = IOS;
      CSSFloatProperty = Edge || IE11OrLess ? "cssFloat" : "float";
      supportDraggable = documentExists && !ChromeForAndroid && !IOS && "draggable" in document.createElement("div");
      supportCssPointerEvents = function() {
        if (!documentExists)
          return;
        if (IE11OrLess) {
          return false;
        }
        var el = document.createElement("x");
        el.style.cssText = "pointer-events:auto";
        return el.style.pointerEvents === "auto";
      }();
      _detectDirection = function _detectDirection2(el, options) {
        var elCSS = css(el), elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth), child1 = getChild(el, 0, options), child2 = getChild(el, 1, options), firstChildCSS = child1 && css(child1), secondChildCSS = child2 && css(child2), firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width, secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;
        if (elCSS.display === "flex") {
          return elCSS.flexDirection === "column" || elCSS.flexDirection === "column-reverse" ? "vertical" : "horizontal";
        }
        if (elCSS.display === "grid") {
          return elCSS.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
        }
        if (child1 && firstChildCSS["float"] && firstChildCSS["float"] !== "none") {
          var touchingSideChild2 = firstChildCSS["float"] === "left" ? "left" : "right";
          return child2 && (secondChildCSS.clear === "both" || secondChildCSS.clear === touchingSideChild2) ? "vertical" : "horizontal";
        }
        return child1 && (firstChildCSS.display === "block" || firstChildCSS.display === "flex" || firstChildCSS.display === "table" || firstChildCSS.display === "grid" || firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === "none" || child2 && elCSS[CSSFloatProperty] === "none" && firstChildWidth + secondChildWidth > elWidth) ? "vertical" : "horizontal";
      };
      _dragElInRowColumn = function _dragElInRowColumn2(dragRect, targetRect, vertical) {
        var dragElS1Opp = vertical ? dragRect.left : dragRect.top, dragElS2Opp = vertical ? dragRect.right : dragRect.bottom, dragElOppLength = vertical ? dragRect.width : dragRect.height, targetS1Opp = vertical ? targetRect.left : targetRect.top, targetS2Opp = vertical ? targetRect.right : targetRect.bottom, targetOppLength = vertical ? targetRect.width : targetRect.height;
        return dragElS1Opp === targetS1Opp || dragElS2Opp === targetS2Opp || dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2;
      };
      _detectNearestEmptySortable = function _detectNearestEmptySortable2(x, y) {
        var ret;
        sortables.some(function(sortable) {
          var threshold = sortable[expando].options.emptyInsertThreshold;
          if (!threshold || lastChild(sortable))
            return;
          var rect = getRect(sortable), insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold, insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
          if (insideHorizontally && insideVertically) {
            return ret = sortable;
          }
        });
        return ret;
      };
      _prepareGroup = function _prepareGroup2(options) {
        function toFn(value, pull) {
          return function(to, from, dragEl2, evt) {
            var sameGroup = to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;
            if (value == null && (pull || sameGroup)) {
              return true;
            } else if (value == null || value === false) {
              return false;
            } else if (pull && value === "clone") {
              return value;
            } else if (typeof value === "function") {
              return toFn(value(to, from, dragEl2, evt), pull)(to, from, dragEl2, evt);
            } else {
              var otherGroup = (pull ? to : from).options.group.name;
              return value === true || typeof value === "string" && value === otherGroup || value.join && value.indexOf(otherGroup) > -1;
            }
          };
        }
        var group = {};
        var originalGroup = options.group;
        if (!originalGroup || _typeof(originalGroup) != "object") {
          originalGroup = {
            name: originalGroup
          };
        }
        group.name = originalGroup.name;
        group.checkPull = toFn(originalGroup.pull, true);
        group.checkPut = toFn(originalGroup.put);
        group.revertClone = originalGroup.revertClone;
        options.group = group;
      };
      _hideGhostForTarget = function _hideGhostForTarget2() {
        if (!supportCssPointerEvents && ghostEl) {
          css(ghostEl, "display", "none");
        }
      };
      _unhideGhostForTarget = function _unhideGhostForTarget2() {
        if (!supportCssPointerEvents && ghostEl) {
          css(ghostEl, "display", "");
        }
      };
      if (documentExists && !ChromeForAndroid) {
        document.addEventListener("click", function(evt) {
          if (ignoreNextClick) {
            evt.preventDefault();
            evt.stopPropagation && evt.stopPropagation();
            evt.stopImmediatePropagation && evt.stopImmediatePropagation();
            ignoreNextClick = false;
            return false;
          }
        }, true);
      }
      nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent2(evt) {
        if (dragEl) {
          evt = evt.touches ? evt.touches[0] : evt;
          var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);
          if (nearest) {
            var event = {};
            for (var i in evt) {
              if (evt.hasOwnProperty(i)) {
                event[i] = evt[i];
              }
            }
            event.target = event.rootEl = nearest;
            event.preventDefault = void 0;
            event.stopPropagation = void 0;
            nearest[expando]._onDragOver(event);
          }
        }
      };
      _checkOutsideTargetEl = function _checkOutsideTargetEl2(evt) {
        if (dragEl) {
          dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
        }
      };
      Sortable.prototype = /** @lends Sortable.prototype */
      {
        constructor: Sortable,
        _isOutsideThisEl: function _isOutsideThisEl(target) {
          if (!this.el.contains(target) && target !== this.el) {
            lastTarget = null;
          }
        },
        _getDirection: function _getDirection(evt, target) {
          return typeof this.options.direction === "function" ? this.options.direction.call(this, evt, target, dragEl) : this.options.direction;
        },
        _onTapStart: function _onTapStart(evt) {
          if (!evt.cancelable)
            return;
          var _this = this, el = this.el, options = this.options, preventOnFilter = options.preventOnFilter, type = evt.type, touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === "touch" && evt, target = (touch || evt).target, originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target, filter = options.filter;
          _saveInputCheckedState(el);
          if (dragEl) {
            return;
          }
          if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
            return;
          }
          if (originalTarget.isContentEditable) {
            return;
          }
          if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === "SELECT") {
            return;
          }
          target = closest(target, options.draggable, el, false);
          if (target && target.animated) {
            return;
          }
          if (lastDownEl === target) {
            return;
          }
          oldIndex = index(target);
          oldDraggableIndex = index(target, options.draggable);
          if (typeof filter === "function") {
            if (filter.call(this, evt, target, this)) {
              _dispatchEvent({
                sortable: _this,
                rootEl: originalTarget,
                name: "filter",
                targetEl: target,
                toEl: el,
                fromEl: el
              });
              pluginEvent2("filter", _this, {
                evt
              });
              preventOnFilter && evt.preventDefault();
              return;
            }
          } else if (filter) {
            filter = filter.split(",").some(function(criteria) {
              criteria = closest(originalTarget, criteria.trim(), el, false);
              if (criteria) {
                _dispatchEvent({
                  sortable: _this,
                  rootEl: criteria,
                  name: "filter",
                  targetEl: target,
                  fromEl: el,
                  toEl: el
                });
                pluginEvent2("filter", _this, {
                  evt
                });
                return true;
              }
            });
            if (filter) {
              preventOnFilter && evt.preventDefault();
              return;
            }
          }
          if (options.handle && !closest(originalTarget, options.handle, el, false)) {
            return;
          }
          this._prepareDragStart(evt, touch, target);
        },
        _prepareDragStart: function _prepareDragStart(evt, touch, target) {
          var _this = this, el = _this.el, options = _this.options, ownerDocument = el.ownerDocument, dragStartFn;
          if (target && !dragEl && target.parentNode === el) {
            var dragRect = getRect(target);
            rootEl = el;
            dragEl = target;
            parentEl = dragEl.parentNode;
            nextEl = dragEl.nextSibling;
            lastDownEl = target;
            activeGroup = options.group;
            Sortable.dragged = dragEl;
            tapEvt = {
              target: dragEl,
              clientX: (touch || evt).clientX,
              clientY: (touch || evt).clientY
            };
            tapDistanceLeft = tapEvt.clientX - dragRect.left;
            tapDistanceTop = tapEvt.clientY - dragRect.top;
            this._lastX = (touch || evt).clientX;
            this._lastY = (touch || evt).clientY;
            dragEl.style["will-change"] = "all";
            dragStartFn = function dragStartFn2() {
              pluginEvent2("delayEnded", _this, {
                evt
              });
              if (Sortable.eventCanceled) {
                _this._onDrop();
                return;
              }
              _this._disableDelayedDragEvents();
              if (!FireFox && _this.nativeDraggable) {
                dragEl.draggable = true;
              }
              _this._triggerDragStart(evt, touch);
              _dispatchEvent({
                sortable: _this,
                name: "choose",
                originalEvent: evt
              });
              toggleClass(dragEl, options.chosenClass, true);
            };
            options.ignore.split(",").forEach(function(criteria) {
              find(dragEl, criteria.trim(), _disableDraggable);
            });
            on(ownerDocument, "dragover", nearestEmptyInsertDetectEvent);
            on(ownerDocument, "mousemove", nearestEmptyInsertDetectEvent);
            on(ownerDocument, "touchmove", nearestEmptyInsertDetectEvent);
            if (options.supportPointer) {
              on(ownerDocument, "pointerup", _this._onDrop);
              !this.nativeDraggable && on(ownerDocument, "pointercancel", _this._onDrop);
            } else {
              on(ownerDocument, "mouseup", _this._onDrop);
              on(ownerDocument, "touchend", _this._onDrop);
              on(ownerDocument, "touchcancel", _this._onDrop);
            }
            if (FireFox && this.nativeDraggable) {
              this.options.touchStartThreshold = 4;
              dragEl.draggable = true;
            }
            pluginEvent2("delayStart", this, {
              evt
            });
            if (options.delay && (!options.delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
              if (Sortable.eventCanceled) {
                this._onDrop();
                return;
              }
              if (options.supportPointer) {
                on(ownerDocument, "pointerup", _this._disableDelayedDrag);
                on(ownerDocument, "pointercancel", _this._disableDelayedDrag);
              } else {
                on(ownerDocument, "mouseup", _this._disableDelayedDrag);
                on(ownerDocument, "touchend", _this._disableDelayedDrag);
                on(ownerDocument, "touchcancel", _this._disableDelayedDrag);
              }
              on(ownerDocument, "mousemove", _this._delayedDragTouchMoveHandler);
              on(ownerDocument, "touchmove", _this._delayedDragTouchMoveHandler);
              options.supportPointer && on(ownerDocument, "pointermove", _this._delayedDragTouchMoveHandler);
              _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
            } else {
              dragStartFn();
            }
          }
        },
        _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler(e) {
          var touch = e.touches ? e.touches[0] : e;
          if (Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1))) {
            this._disableDelayedDrag();
          }
        },
        _disableDelayedDrag: function _disableDelayedDrag() {
          dragEl && _disableDraggable(dragEl);
          clearTimeout(this._dragStartTimer);
          this._disableDelayedDragEvents();
        },
        _disableDelayedDragEvents: function _disableDelayedDragEvents() {
          var ownerDocument = this.el.ownerDocument;
          off(ownerDocument, "mouseup", this._disableDelayedDrag);
          off(ownerDocument, "touchend", this._disableDelayedDrag);
          off(ownerDocument, "touchcancel", this._disableDelayedDrag);
          off(ownerDocument, "pointerup", this._disableDelayedDrag);
          off(ownerDocument, "pointercancel", this._disableDelayedDrag);
          off(ownerDocument, "mousemove", this._delayedDragTouchMoveHandler);
          off(ownerDocument, "touchmove", this._delayedDragTouchMoveHandler);
          off(ownerDocument, "pointermove", this._delayedDragTouchMoveHandler);
        },
        _triggerDragStart: function _triggerDragStart(evt, touch) {
          touch = touch || evt.pointerType == "touch" && evt;
          if (!this.nativeDraggable || touch) {
            if (this.options.supportPointer) {
              on(document, "pointermove", this._onTouchMove);
            } else if (touch) {
              on(document, "touchmove", this._onTouchMove);
            } else {
              on(document, "mousemove", this._onTouchMove);
            }
          } else {
            on(dragEl, "dragend", this);
            on(rootEl, "dragstart", this._onDragStart);
          }
          try {
            if (document.selection) {
              _nextTick(function() {
                document.selection.empty();
              });
            } else {
              window.getSelection().removeAllRanges();
            }
          } catch (err) {
          }
        },
        _dragStarted: function _dragStarted(fallback, evt) {
          awaitingDragStarted = false;
          if (rootEl && dragEl) {
            pluginEvent2("dragStarted", this, {
              evt
            });
            if (this.nativeDraggable) {
              on(document, "dragover", _checkOutsideTargetEl);
            }
            var options = this.options;
            !fallback && toggleClass(dragEl, options.dragClass, false);
            toggleClass(dragEl, options.ghostClass, true);
            Sortable.active = this;
            fallback && this._appendGhost();
            _dispatchEvent({
              sortable: this,
              name: "start",
              originalEvent: evt
            });
          } else {
            this._nulling();
          }
        },
        _emulateDragOver: function _emulateDragOver() {
          if (touchEvt) {
            this._lastX = touchEvt.clientX;
            this._lastY = touchEvt.clientY;
            _hideGhostForTarget();
            var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
            var parent = target;
            while (target && target.shadowRoot) {
              target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
              if (target === parent)
                break;
              parent = target;
            }
            dragEl.parentNode[expando]._isOutsideThisEl(target);
            if (parent) {
              do {
                if (parent[expando]) {
                  var inserted = void 0;
                  inserted = parent[expando]._onDragOver({
                    clientX: touchEvt.clientX,
                    clientY: touchEvt.clientY,
                    target,
                    rootEl: parent
                  });
                  if (inserted && !this.options.dragoverBubble) {
                    break;
                  }
                }
                target = parent;
              } while (parent = getParentOrHost(parent));
            }
            _unhideGhostForTarget();
          }
        },
        _onTouchMove: function _onTouchMove(evt) {
          if (tapEvt) {
            var options = this.options, fallbackTolerance = options.fallbackTolerance, fallbackOffset = options.fallbackOffset, touch = evt.touches ? evt.touches[0] : evt, ghostMatrix = ghostEl && matrix(ghostEl, true), scaleX = ghostEl && ghostMatrix && ghostMatrix.a, scaleY = ghostEl && ghostMatrix && ghostMatrix.d, relativeScrollOffset = PositionGhostAbsolutely && ghostRelativeParent && getRelativeScrollOffset(ghostRelativeParent), dx = (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) + (relativeScrollOffset ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0] : 0) / (scaleX || 1), dy = (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) + (relativeScrollOffset ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1] : 0) / (scaleY || 1);
            if (!Sortable.active && !awaitingDragStarted) {
              if (fallbackTolerance && Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) < fallbackTolerance) {
                return;
              }
              this._onDragStart(evt, true);
            }
            if (ghostEl) {
              if (ghostMatrix) {
                ghostMatrix.e += dx - (lastDx || 0);
                ghostMatrix.f += dy - (lastDy || 0);
              } else {
                ghostMatrix = {
                  a: 1,
                  b: 0,
                  c: 0,
                  d: 1,
                  e: dx,
                  f: dy
                };
              }
              var cssMatrix = "matrix(".concat(ghostMatrix.a, ",").concat(ghostMatrix.b, ",").concat(ghostMatrix.c, ",").concat(ghostMatrix.d, ",").concat(ghostMatrix.e, ",").concat(ghostMatrix.f, ")");
              css(ghostEl, "webkitTransform", cssMatrix);
              css(ghostEl, "mozTransform", cssMatrix);
              css(ghostEl, "msTransform", cssMatrix);
              css(ghostEl, "transform", cssMatrix);
              lastDx = dx;
              lastDy = dy;
              touchEvt = touch;
            }
            evt.cancelable && evt.preventDefault();
          }
        },
        _appendGhost: function _appendGhost() {
          if (!ghostEl) {
            var container = this.options.fallbackOnBody ? document.body : rootEl, rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container), options = this.options;
            if (PositionGhostAbsolutely) {
              ghostRelativeParent = container;
              while (css(ghostRelativeParent, "position") === "static" && css(ghostRelativeParent, "transform") === "none" && ghostRelativeParent !== document) {
                ghostRelativeParent = ghostRelativeParent.parentNode;
              }
              if (ghostRelativeParent !== document.body && ghostRelativeParent !== document.documentElement) {
                if (ghostRelativeParent === document)
                  ghostRelativeParent = getWindowScrollingElement();
                rect.top += ghostRelativeParent.scrollTop;
                rect.left += ghostRelativeParent.scrollLeft;
              } else {
                ghostRelativeParent = getWindowScrollingElement();
              }
              ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
            }
            ghostEl = dragEl.cloneNode(true);
            toggleClass(ghostEl, options.ghostClass, false);
            toggleClass(ghostEl, options.fallbackClass, true);
            toggleClass(ghostEl, options.dragClass, true);
            css(ghostEl, "transition", "");
            css(ghostEl, "transform", "");
            css(ghostEl, "box-sizing", "border-box");
            css(ghostEl, "margin", 0);
            css(ghostEl, "top", rect.top);
            css(ghostEl, "left", rect.left);
            css(ghostEl, "width", rect.width);
            css(ghostEl, "height", rect.height);
            css(ghostEl, "opacity", "0.8");
            css(ghostEl, "position", PositionGhostAbsolutely ? "absolute" : "fixed");
            css(ghostEl, "zIndex", "100000");
            css(ghostEl, "pointerEvents", "none");
            Sortable.ghost = ghostEl;
            container.appendChild(ghostEl);
            css(ghostEl, "transform-origin", tapDistanceLeft / parseInt(ghostEl.style.width) * 100 + "% " + tapDistanceTop / parseInt(ghostEl.style.height) * 100 + "%");
          }
        },
        _onDragStart: function _onDragStart(evt, fallback) {
          var _this = this;
          var dataTransfer = evt.dataTransfer;
          var options = _this.options;
          pluginEvent2("dragStart", this, {
            evt
          });
          if (Sortable.eventCanceled) {
            this._onDrop();
            return;
          }
          pluginEvent2("setupClone", this);
          if (!Sortable.eventCanceled) {
            cloneEl = clone(dragEl);
            cloneEl.removeAttribute("id");
            cloneEl.draggable = false;
            cloneEl.style["will-change"] = "";
            this._hideClone();
            toggleClass(cloneEl, this.options.chosenClass, false);
            Sortable.clone = cloneEl;
          }
          _this.cloneId = _nextTick(function() {
            pluginEvent2("clone", _this);
            if (Sortable.eventCanceled)
              return;
            if (!_this.options.removeCloneOnHide) {
              rootEl.insertBefore(cloneEl, dragEl);
            }
            _this._hideClone();
            _dispatchEvent({
              sortable: _this,
              name: "clone"
            });
          });
          !fallback && toggleClass(dragEl, options.dragClass, true);
          if (fallback) {
            ignoreNextClick = true;
            _this._loopId = setInterval(_this._emulateDragOver, 50);
          } else {
            off(document, "mouseup", _this._onDrop);
            off(document, "touchend", _this._onDrop);
            off(document, "touchcancel", _this._onDrop);
            if (dataTransfer) {
              dataTransfer.effectAllowed = "move";
              options.setData && options.setData.call(_this, dataTransfer, dragEl);
            }
            on(document, "drop", _this);
            css(dragEl, "transform", "translateZ(0)");
          }
          awaitingDragStarted = true;
          _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
          on(document, "selectstart", _this);
          moved = true;
          window.getSelection().removeAllRanges();
          if (Safari) {
            css(document.body, "user-select", "none");
          }
        },
        // Returns true - if no further action is needed (either inserted or another condition)
        _onDragOver: function _onDragOver(evt) {
          var el = this.el, target = evt.target, dragRect, targetRect, revert, options = this.options, group = options.group, activeSortable = Sortable.active, isOwner = activeGroup === group, canSort = options.sort, fromSortable = putSortable || activeSortable, vertical, _this = this, completedFired = false;
          if (_silent)
            return;
          function dragOverEvent(name, extra) {
            pluginEvent2(name, _this, _objectSpread2({
              evt,
              isOwner,
              axis: vertical ? "vertical" : "horizontal",
              revert,
              dragRect,
              targetRect,
              canSort,
              fromSortable,
              target,
              completed,
              onMove: function onMove(target2, after2) {
                return _onMove(rootEl, el, dragEl, dragRect, target2, getRect(target2), evt, after2);
              },
              changed
            }, extra));
          }
          function capture() {
            dragOverEvent("dragOverAnimationCapture");
            _this.captureAnimationState();
            if (_this !== fromSortable) {
              fromSortable.captureAnimationState();
            }
          }
          function completed(insertion) {
            dragOverEvent("dragOverCompleted", {
              insertion
            });
            if (insertion) {
              if (isOwner) {
                activeSortable._hideClone();
              } else {
                activeSortable._showClone(_this);
              }
              if (_this !== fromSortable) {
                toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass, false);
                toggleClass(dragEl, options.ghostClass, true);
              }
              if (putSortable !== _this && _this !== Sortable.active) {
                putSortable = _this;
              } else if (_this === Sortable.active && putSortable) {
                putSortable = null;
              }
              if (fromSortable === _this) {
                _this._ignoreWhileAnimating = target;
              }
              _this.animateAll(function() {
                dragOverEvent("dragOverAnimationComplete");
                _this._ignoreWhileAnimating = null;
              });
              if (_this !== fromSortable) {
                fromSortable.animateAll();
                fromSortable._ignoreWhileAnimating = null;
              }
            }
            if (target === dragEl && !dragEl.animated || target === el && !target.animated) {
              lastTarget = null;
            }
            if (!options.dragoverBubble && !evt.rootEl && target !== document) {
              dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
              !insertion && nearestEmptyInsertDetectEvent(evt);
            }
            !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
            return completedFired = true;
          }
          function changed() {
            newIndex = index(dragEl);
            newDraggableIndex = index(dragEl, options.draggable);
            _dispatchEvent({
              sortable: _this,
              name: "change",
              toEl: el,
              newIndex,
              newDraggableIndex,
              originalEvent: evt
            });
          }
          if (evt.preventDefault !== void 0) {
            evt.cancelable && evt.preventDefault();
          }
          target = closest(target, options.draggable, el, true);
          dragOverEvent("dragOver");
          if (Sortable.eventCanceled)
            return completedFired;
          if (dragEl.contains(evt.target) || target.animated && target.animatingX && target.animatingY || _this._ignoreWhileAnimating === target) {
            return completed(false);
          }
          ignoreNextClick = false;
          if (activeSortable && !options.disabled && (isOwner ? canSort || (revert = parentEl !== rootEl) : putSortable === this || (this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) && group.checkPut(this, activeSortable, dragEl, evt))) {
            vertical = this._getDirection(evt, target) === "vertical";
            dragRect = getRect(dragEl);
            dragOverEvent("dragOverValid");
            if (Sortable.eventCanceled)
              return completedFired;
            if (revert) {
              parentEl = rootEl;
              capture();
              this._hideClone();
              dragOverEvent("revert");
              if (!Sortable.eventCanceled) {
                if (nextEl) {
                  rootEl.insertBefore(dragEl, nextEl);
                } else {
                  rootEl.appendChild(dragEl);
                }
              }
              return completed(true);
            }
            var elLastChild = lastChild(el, options.draggable);
            if (!elLastChild || _ghostIsLast(evt, vertical, this) && !elLastChild.animated) {
              if (elLastChild === dragEl) {
                return completed(false);
              }
              if (elLastChild && el === evt.target) {
                target = elLastChild;
              }
              if (target) {
                targetRect = getRect(target);
              }
              if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
                capture();
                if (elLastChild && elLastChild.nextSibling) {
                  el.insertBefore(dragEl, elLastChild.nextSibling);
                } else {
                  el.appendChild(dragEl);
                }
                parentEl = el;
                changed();
                return completed(true);
              }
            } else if (elLastChild && _ghostIsFirst(evt, vertical, this)) {
              var firstChild = getChild(el, 0, options, true);
              if (firstChild === dragEl) {
                return completed(false);
              }
              target = firstChild;
              targetRect = getRect(target);
              if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, false) !== false) {
                capture();
                el.insertBefore(dragEl, firstChild);
                parentEl = el;
                changed();
                return completed(true);
              }
            } else if (target.parentNode === el) {
              targetRect = getRect(target);
              var direction = 0, targetBeforeFirstSwap, differentLevel = dragEl.parentNode !== el, differentRowCol = !_dragElInRowColumn(dragEl.animated && dragEl.toRect || dragRect, target.animated && target.toRect || targetRect, vertical), side1 = vertical ? "top" : "left", scrolledPastTop = isScrolledPast(target, "top", "top") || isScrolledPast(dragEl, "top", "top"), scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;
              if (lastTarget !== target) {
                targetBeforeFirstSwap = targetRect[side1];
                pastFirstInvertThresh = false;
                isCircumstantialInvert = !differentRowCol && options.invertSwap || differentLevel;
              }
              direction = _getSwapDirection(evt, target, targetRect, vertical, differentRowCol ? 1 : options.swapThreshold, options.invertedSwapThreshold == null ? options.swapThreshold : options.invertedSwapThreshold, isCircumstantialInvert, lastTarget === target);
              var sibling;
              if (direction !== 0) {
                var dragIndex = index(dragEl);
                do {
                  dragIndex -= direction;
                  sibling = parentEl.children[dragIndex];
                } while (sibling && (css(sibling, "display") === "none" || sibling === ghostEl));
              }
              if (direction === 0 || sibling === target) {
                return completed(false);
              }
              lastTarget = target;
              lastDirection = direction;
              var nextSibling = target.nextElementSibling, after = false;
              after = direction === 1;
              var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);
              if (moveVector !== false) {
                if (moveVector === 1 || moveVector === -1) {
                  after = moveVector === 1;
                }
                _silent = true;
                setTimeout(_unsilent, 30);
                capture();
                if (after && !nextSibling) {
                  el.appendChild(dragEl);
                } else {
                  target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
                }
                if (scrolledPastTop) {
                  scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
                }
                parentEl = dragEl.parentNode;
                if (targetBeforeFirstSwap !== void 0 && !isCircumstantialInvert) {
                  targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
                }
                changed();
                return completed(true);
              }
            }
            if (el.contains(dragEl)) {
              return completed(false);
            }
          }
          return false;
        },
        _ignoreWhileAnimating: null,
        _offMoveEvents: function _offMoveEvents() {
          off(document, "mousemove", this._onTouchMove);
          off(document, "touchmove", this._onTouchMove);
          off(document, "pointermove", this._onTouchMove);
          off(document, "dragover", nearestEmptyInsertDetectEvent);
          off(document, "mousemove", nearestEmptyInsertDetectEvent);
          off(document, "touchmove", nearestEmptyInsertDetectEvent);
        },
        _offUpEvents: function _offUpEvents() {
          var ownerDocument = this.el.ownerDocument;
          off(ownerDocument, "mouseup", this._onDrop);
          off(ownerDocument, "touchend", this._onDrop);
          off(ownerDocument, "pointerup", this._onDrop);
          off(ownerDocument, "pointercancel", this._onDrop);
          off(ownerDocument, "touchcancel", this._onDrop);
          off(document, "selectstart", this);
        },
        _onDrop: function _onDrop(evt) {
          var el = this.el, options = this.options;
          newIndex = index(dragEl);
          newDraggableIndex = index(dragEl, options.draggable);
          pluginEvent2("drop", this, {
            evt
          });
          parentEl = dragEl && dragEl.parentNode;
          newIndex = index(dragEl);
          newDraggableIndex = index(dragEl, options.draggable);
          if (Sortable.eventCanceled) {
            this._nulling();
            return;
          }
          awaitingDragStarted = false;
          isCircumstantialInvert = false;
          pastFirstInvertThresh = false;
          clearInterval(this._loopId);
          clearTimeout(this._dragStartTimer);
          _cancelNextTick(this.cloneId);
          _cancelNextTick(this._dragStartId);
          if (this.nativeDraggable) {
            off(document, "drop", this);
            off(el, "dragstart", this._onDragStart);
          }
          this._offMoveEvents();
          this._offUpEvents();
          if (Safari) {
            css(document.body, "user-select", "");
          }
          css(dragEl, "transform", "");
          if (evt) {
            if (moved) {
              evt.cancelable && evt.preventDefault();
              !options.dropBubble && evt.stopPropagation();
            }
            ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
            if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== "clone") {
              cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
            }
            if (dragEl) {
              if (this.nativeDraggable) {
                off(dragEl, "dragend", this);
              }
              _disableDraggable(dragEl);
              dragEl.style["will-change"] = "";
              if (moved && !awaitingDragStarted) {
                toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : this.options.ghostClass, false);
              }
              toggleClass(dragEl, this.options.chosenClass, false);
              _dispatchEvent({
                sortable: this,
                name: "unchoose",
                toEl: parentEl,
                newIndex: null,
                newDraggableIndex: null,
                originalEvent: evt
              });
              if (rootEl !== parentEl) {
                if (newIndex >= 0) {
                  _dispatchEvent({
                    rootEl: parentEl,
                    name: "add",
                    toEl: parentEl,
                    fromEl: rootEl,
                    originalEvent: evt
                  });
                  _dispatchEvent({
                    sortable: this,
                    name: "remove",
                    toEl: parentEl,
                    originalEvent: evt
                  });
                  _dispatchEvent({
                    rootEl: parentEl,
                    name: "sort",
                    toEl: parentEl,
                    fromEl: rootEl,
                    originalEvent: evt
                  });
                  _dispatchEvent({
                    sortable: this,
                    name: "sort",
                    toEl: parentEl,
                    originalEvent: evt
                  });
                }
                putSortable && putSortable.save();
              } else {
                if (newIndex !== oldIndex) {
                  if (newIndex >= 0) {
                    _dispatchEvent({
                      sortable: this,
                      name: "update",
                      toEl: parentEl,
                      originalEvent: evt
                    });
                    _dispatchEvent({
                      sortable: this,
                      name: "sort",
                      toEl: parentEl,
                      originalEvent: evt
                    });
                  }
                }
              }
              if (Sortable.active) {
                if (newIndex == null || newIndex === -1) {
                  newIndex = oldIndex;
                  newDraggableIndex = oldDraggableIndex;
                }
                _dispatchEvent({
                  sortable: this,
                  name: "end",
                  toEl: parentEl,
                  originalEvent: evt
                });
                this.save();
              }
            }
          }
          this._nulling();
        },
        _nulling: function _nulling() {
          pluginEvent2("nulling", this);
          rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = Sortable.dragged = Sortable.ghost = Sortable.clone = Sortable.active = null;
          savedInputChecked.forEach(function(el) {
            el.checked = true;
          });
          savedInputChecked.length = lastDx = lastDy = 0;
        },
        handleEvent: function handleEvent(evt) {
          switch (evt.type) {
            case "drop":
            case "dragend":
              this._onDrop(evt);
              break;
            case "dragenter":
            case "dragover":
              if (dragEl) {
                this._onDragOver(evt);
                _globalDragOver(evt);
              }
              break;
            case "selectstart":
              evt.preventDefault();
              break;
          }
        },
        /**
         * Serializes the item into an array of string.
         * @returns {String[]}
         */
        toArray: function toArray() {
          var order = [], el, children = this.el.children, i = 0, n = children.length, options = this.options;
          for (; i < n; i++) {
            el = children[i];
            if (closest(el, options.draggable, this.el, false)) {
              order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
            }
          }
          return order;
        },
        /**
         * Sorts the elements according to the array.
         * @param  {String[]}  order  order of the items
         */
        sort: function sort(order, useAnimation) {
          var items = {}, rootEl2 = this.el;
          this.toArray().forEach(function(id, i) {
            var el = rootEl2.children[i];
            if (closest(el, this.options.draggable, rootEl2, false)) {
              items[id] = el;
            }
          }, this);
          useAnimation && this.captureAnimationState();
          order.forEach(function(id) {
            if (items[id]) {
              rootEl2.removeChild(items[id]);
              rootEl2.appendChild(items[id]);
            }
          });
          useAnimation && this.animateAll();
        },
        /**
         * Save the current sorting
         */
        save: function save() {
          var store = this.options.store;
          store && store.set && store.set(this);
        },
        /**
         * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
         * @param   {HTMLElement}  el
         * @param   {String}       [selector]  default: `options.draggable`
         * @returns {HTMLElement|null}
         */
        closest: function closest$1(el, selector) {
          return closest(el, selector || this.options.draggable, this.el, false);
        },
        /**
         * Set/get option
         * @param   {string} name
         * @param   {*}      [value]
         * @returns {*}
         */
        option: function option(name, value) {
          var options = this.options;
          if (value === void 0) {
            return options[name];
          } else {
            var modifiedValue = PluginManager.modifyOption(this, name, value);
            if (typeof modifiedValue !== "undefined") {
              options[name] = modifiedValue;
            } else {
              options[name] = value;
            }
            if (name === "group") {
              _prepareGroup(options);
            }
          }
        },
        /**
         * Destroy
         */
        destroy: function destroy() {
          pluginEvent2("destroy", this);
          var el = this.el;
          el[expando] = null;
          off(el, "mousedown", this._onTapStart);
          off(el, "touchstart", this._onTapStart);
          off(el, "pointerdown", this._onTapStart);
          if (this.nativeDraggable) {
            off(el, "dragover", this);
            off(el, "dragenter", this);
          }
          Array.prototype.forEach.call(el.querySelectorAll("[draggable]"), function(el2) {
            el2.removeAttribute("draggable");
          });
          this._onDrop();
          this._disableDelayedDragEvents();
          sortables.splice(sortables.indexOf(this.el), 1);
          this.el = el = null;
        },
        _hideClone: function _hideClone() {
          if (!cloneHidden) {
            pluginEvent2("hideClone", this);
            if (Sortable.eventCanceled)
              return;
            css(cloneEl, "display", "none");
            if (this.options.removeCloneOnHide && cloneEl.parentNode) {
              cloneEl.parentNode.removeChild(cloneEl);
            }
            cloneHidden = true;
          }
        },
        _showClone: function _showClone(putSortable2) {
          if (putSortable2.lastPutMode !== "clone") {
            this._hideClone();
            return;
          }
          if (cloneHidden) {
            pluginEvent2("showClone", this);
            if (Sortable.eventCanceled)
              return;
            if (dragEl.parentNode == rootEl && !this.options.group.revertClone) {
              rootEl.insertBefore(cloneEl, dragEl);
            } else if (nextEl) {
              rootEl.insertBefore(cloneEl, nextEl);
            } else {
              rootEl.appendChild(cloneEl);
            }
            if (this.options.group.revertClone) {
              this.animate(dragEl, cloneEl);
            }
            css(cloneEl, "display", "");
            cloneHidden = false;
          }
        }
      };
      if (documentExists) {
        on(document, "touchmove", function(evt) {
          if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
            evt.preventDefault();
          }
        });
      }
      Sortable.utils = {
        on,
        off,
        css,
        find,
        is: function is(el, selector) {
          return !!closest(el, selector, el, false);
        },
        extend,
        throttle,
        closest,
        toggleClass,
        clone,
        index,
        nextTick: _nextTick,
        cancelNextTick: _cancelNextTick,
        detectDirection: _detectDirection,
        getChild,
        expando
      };
      Sortable.get = function(element) {
        return element[expando];
      };
      Sortable.mount = function() {
        for (var _len = arguments.length, plugins2 = new Array(_len), _key = 0; _key < _len; _key++) {
          plugins2[_key] = arguments[_key];
        }
        if (plugins2[0].constructor === Array)
          plugins2 = plugins2[0];
        plugins2.forEach(function(plugin) {
          if (!plugin.prototype || !plugin.prototype.constructor) {
            throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(plugin));
          }
          if (plugin.utils)
            Sortable.utils = _objectSpread2(_objectSpread2({}, Sortable.utils), plugin.utils);
          PluginManager.mount(plugin);
        });
      };
      Sortable.create = function(el, options) {
        return new Sortable(el, options);
      };
      Sortable.version = version2;
      autoScrolls = [];
      scrolling = false;
      autoScroll = throttle(function(evt, options, rootEl2, isFallback) {
        if (!options.scroll)
          return;
        var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, sens = options.scrollSensitivity, speed = options.scrollSpeed, winScroller = getWindowScrollingElement();
        var scrollThisInstance = false, scrollCustomFn;
        if (scrollRootEl !== rootEl2) {
          scrollRootEl = rootEl2;
          clearAutoScrolls();
          scrollEl = options.scroll;
          scrollCustomFn = options.scrollFn;
          if (scrollEl === true) {
            scrollEl = getParentAutoScrollElement(rootEl2, true);
          }
        }
        var layersOut = 0;
        var currentParent = scrollEl;
        do {
          var el = currentParent, rect = getRect(el), top = rect.top, bottom = rect.bottom, left = rect.left, right = rect.right, width = rect.width, height = rect.height, canScrollX = void 0, canScrollY = void 0, scrollWidth = el.scrollWidth, scrollHeight = el.scrollHeight, elCSS = css(el), scrollPosX = el.scrollLeft, scrollPosY = el.scrollTop;
          if (el === winScroller) {
            canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll" || elCSS.overflowX === "visible");
            canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll" || elCSS.overflowY === "visible");
          } else {
            canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll");
            canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll");
          }
          var vx = canScrollX && (Math.abs(right - x) <= sens && scrollPosX + width < scrollWidth) - (Math.abs(left - x) <= sens && !!scrollPosX);
          var vy = canScrollY && (Math.abs(bottom - y) <= sens && scrollPosY + height < scrollHeight) - (Math.abs(top - y) <= sens && !!scrollPosY);
          if (!autoScrolls[layersOut]) {
            for (var i = 0; i <= layersOut; i++) {
              if (!autoScrolls[i]) {
                autoScrolls[i] = {};
              }
            }
          }
          if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el) {
            autoScrolls[layersOut].el = el;
            autoScrolls[layersOut].vx = vx;
            autoScrolls[layersOut].vy = vy;
            clearInterval(autoScrolls[layersOut].pid);
            if (vx != 0 || vy != 0) {
              scrollThisInstance = true;
              autoScrolls[layersOut].pid = setInterval(function() {
                if (isFallback && this.layer === 0) {
                  Sortable.active._onTouchMove(touchEvt$1);
                }
                var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed : 0;
                var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed : 0;
                if (typeof scrollCustomFn === "function") {
                  if (scrollCustomFn.call(Sortable.dragged.parentNode[expando], scrollOffsetX, scrollOffsetY, evt, touchEvt$1, autoScrolls[this.layer].el) !== "continue") {
                    return;
                  }
                }
                scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
              }.bind({
                layer: layersOut
              }), 24);
            }
          }
          layersOut++;
        } while (options.bubbleScroll && currentParent !== winScroller && (currentParent = getParentAutoScrollElement(currentParent, false)));
        scrolling = scrollThisInstance;
      }, 30);
      drop = function drop2(_ref) {
        var originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, dragEl2 = _ref.dragEl, activeSortable = _ref.activeSortable, dispatchSortableEvent = _ref.dispatchSortableEvent, hideGhostForTarget = _ref.hideGhostForTarget, unhideGhostForTarget = _ref.unhideGhostForTarget;
        if (!originalEvent)
          return;
        var toSortable = putSortable2 || activeSortable;
        hideGhostForTarget();
        var touch = originalEvent.changedTouches && originalEvent.changedTouches.length ? originalEvent.changedTouches[0] : originalEvent;
        var target = document.elementFromPoint(touch.clientX, touch.clientY);
        unhideGhostForTarget();
        if (toSortable && !toSortable.el.contains(target)) {
          dispatchSortableEvent("spill");
          this.onSpill({
            dragEl: dragEl2,
            putSortable: putSortable2
          });
        }
      };
      Revert.prototype = {
        startIndex: null,
        dragStart: function dragStart(_ref2) {
          var oldDraggableIndex2 = _ref2.oldDraggableIndex;
          this.startIndex = oldDraggableIndex2;
        },
        onSpill: function onSpill(_ref3) {
          var dragEl2 = _ref3.dragEl, putSortable2 = _ref3.putSortable;
          this.sortable.captureAnimationState();
          if (putSortable2) {
            putSortable2.captureAnimationState();
          }
          var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);
          if (nextSibling) {
            this.sortable.el.insertBefore(dragEl2, nextSibling);
          } else {
            this.sortable.el.appendChild(dragEl2);
          }
          this.sortable.animateAll();
          if (putSortable2) {
            putSortable2.animateAll();
          }
        },
        drop
      };
      _extends(Revert, {
        pluginName: "revertOnSpill"
      });
      Remove.prototype = {
        onSpill: function onSpill2(_ref4) {
          var dragEl2 = _ref4.dragEl, putSortable2 = _ref4.putSortable;
          var parentSortable = putSortable2 || this.sortable;
          parentSortable.captureAnimationState();
          dragEl2.parentNode && dragEl2.parentNode.removeChild(dragEl2);
          parentSortable.animateAll();
        },
        drop
      };
      _extends(Remove, {
        pluginName: "removeOnSpill"
      });
      Sortable.mount(new AutoScrollPlugin());
      Sortable.mount(Remove, Revert);
      sortable_esm_default = Sortable;
    }
  });

  // ../node_modules/dayjs/dayjs.min.js
  var require_dayjs_min = __commonJS({
    "../node_modules/dayjs/dayjs.min.js"(exports, module) {
      !function(t, e) {
        "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).dayjs = e();
      }(exports, function() {
        "use strict";
        var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", c = "month", f = "quarter", h = "year", d = "date", l = "Invalid Date", $2 = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(t2) {
          var e2 = ["th", "st", "nd", "rd"], n2 = t2 % 100;
          return "[" + t2 + (e2[(n2 - 20) % 10] || e2[n2] || e2[0]) + "]";
        } }, m = function(t2, e2, n2) {
          var r2 = String(t2);
          return !r2 || r2.length >= e2 ? t2 : "" + Array(e2 + 1 - r2.length).join(n2) + t2;
        }, v = { s: m, z: function(t2) {
          var e2 = -t2.utcOffset(), n2 = Math.abs(e2), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
          return (e2 <= 0 ? "+" : "-") + m(r2, 2, "0") + ":" + m(i2, 2, "0");
        }, m: function t2(e2, n2) {
          if (e2.date() < n2.date())
            return -t2(n2, e2);
          var r2 = 12 * (n2.year() - e2.year()) + (n2.month() - e2.month()), i2 = e2.clone().add(r2, c), s2 = n2 - i2 < 0, u2 = e2.clone().add(r2 + (s2 ? -1 : 1), c);
          return +(-(r2 + (n2 - i2) / (s2 ? i2 - u2 : u2 - i2)) || 0);
        }, a: function(t2) {
          return t2 < 0 ? Math.ceil(t2) || 0 : Math.floor(t2);
        }, p: function(t2) {
          return { M: c, y: h, w: o, d: a, D: d, h: u, m: s, s: i, ms: r, Q: f }[t2] || String(t2 || "").toLowerCase().replace(/s$/, "");
        }, u: function(t2) {
          return void 0 === t2;
        } }, g = "en", D = {};
        D[g] = M;
        var p = "$isDayjsObject", S = function(t2) {
          return t2 instanceof _ || !(!t2 || !t2[p]);
        }, w = function t2(e2, n2, r2) {
          var i2;
          if (!e2)
            return g;
          if ("string" == typeof e2) {
            var s2 = e2.toLowerCase();
            D[s2] && (i2 = s2), n2 && (D[s2] = n2, i2 = s2);
            var u2 = e2.split("-");
            if (!i2 && u2.length > 1)
              return t2(u2[0]);
          } else {
            var a2 = e2.name;
            D[a2] = e2, i2 = a2;
          }
          return !r2 && i2 && (g = i2), i2 || !r2 && g;
        }, O = function(t2, e2) {
          if (S(t2))
            return t2.clone();
          var n2 = "object" == typeof e2 ? e2 : {};
          return n2.date = t2, n2.args = arguments, new _(n2);
        }, b = v;
        b.l = w, b.i = S, b.w = function(t2, e2) {
          return O(t2, { locale: e2.$L, utc: e2.$u, x: e2.$x, $offset: e2.$offset });
        };
        var _ = function() {
          function M2(t2) {
            this.$L = w(t2.locale, null, true), this.parse(t2), this.$x = this.$x || t2.x || {}, this[p] = true;
          }
          var m2 = M2.prototype;
          return m2.parse = function(t2) {
            this.$d = function(t3) {
              var e2 = t3.date, n2 = t3.utc;
              if (null === e2)
                return /* @__PURE__ */ new Date(NaN);
              if (b.u(e2))
                return /* @__PURE__ */ new Date();
              if (e2 instanceof Date)
                return new Date(e2);
              if ("string" == typeof e2 && !/Z$/i.test(e2)) {
                var r2 = e2.match($2);
                if (r2) {
                  var i2 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
                  return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
                }
              }
              return new Date(e2);
            }(t2), this.init();
          }, m2.init = function() {
            var t2 = this.$d;
            this.$y = t2.getFullYear(), this.$M = t2.getMonth(), this.$D = t2.getDate(), this.$W = t2.getDay(), this.$H = t2.getHours(), this.$m = t2.getMinutes(), this.$s = t2.getSeconds(), this.$ms = t2.getMilliseconds();
          }, m2.$utils = function() {
            return b;
          }, m2.isValid = function() {
            return !(this.$d.toString() === l);
          }, m2.isSame = function(t2, e2) {
            var n2 = O(t2);
            return this.startOf(e2) <= n2 && n2 <= this.endOf(e2);
          }, m2.isAfter = function(t2, e2) {
            return O(t2) < this.startOf(e2);
          }, m2.isBefore = function(t2, e2) {
            return this.endOf(e2) < O(t2);
          }, m2.$g = function(t2, e2, n2) {
            return b.u(t2) ? this[e2] : this.set(n2, t2);
          }, m2.unix = function() {
            return Math.floor(this.valueOf() / 1e3);
          }, m2.valueOf = function() {
            return this.$d.getTime();
          }, m2.startOf = function(t2, e2) {
            var n2 = this, r2 = !!b.u(e2) || e2, f2 = b.p(t2), l2 = function(t3, e3) {
              var i2 = b.w(n2.$u ? Date.UTC(n2.$y, e3, t3) : new Date(n2.$y, e3, t3), n2);
              return r2 ? i2 : i2.endOf(a);
            }, $3 = function(t3, e3) {
              return b.w(n2.toDate()[t3].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e3)), n2);
            }, y2 = this.$W, M3 = this.$M, m3 = this.$D, v2 = "set" + (this.$u ? "UTC" : "");
            switch (f2) {
              case h:
                return r2 ? l2(1, 0) : l2(31, 11);
              case c:
                return r2 ? l2(1, M3) : l2(0, M3 + 1);
              case o:
                var g2 = this.$locale().weekStart || 0, D2 = (y2 < g2 ? y2 + 7 : y2) - g2;
                return l2(r2 ? m3 - D2 : m3 + (6 - D2), M3);
              case a:
              case d:
                return $3(v2 + "Hours", 0);
              case u:
                return $3(v2 + "Minutes", 1);
              case s:
                return $3(v2 + "Seconds", 2);
              case i:
                return $3(v2 + "Milliseconds", 3);
              default:
                return this.clone();
            }
          }, m2.endOf = function(t2) {
            return this.startOf(t2, false);
          }, m2.$set = function(t2, e2) {
            var n2, o2 = b.p(t2), f2 = "set" + (this.$u ? "UTC" : ""), l2 = (n2 = {}, n2[a] = f2 + "Date", n2[d] = f2 + "Date", n2[c] = f2 + "Month", n2[h] = f2 + "FullYear", n2[u] = f2 + "Hours", n2[s] = f2 + "Minutes", n2[i] = f2 + "Seconds", n2[r] = f2 + "Milliseconds", n2)[o2], $3 = o2 === a ? this.$D + (e2 - this.$W) : e2;
            if (o2 === c || o2 === h) {
              var y2 = this.clone().set(d, 1);
              y2.$d[l2]($3), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
            } else
              l2 && this.$d[l2]($3);
            return this.init(), this;
          }, m2.set = function(t2, e2) {
            return this.clone().$set(t2, e2);
          }, m2.get = function(t2) {
            return this[b.p(t2)]();
          }, m2.add = function(r2, f2) {
            var d2, l2 = this;
            r2 = Number(r2);
            var $3 = b.p(f2), y2 = function(t2) {
              var e2 = O(l2);
              return b.w(e2.date(e2.date() + Math.round(t2 * r2)), l2);
            };
            if ($3 === c)
              return this.set(c, this.$M + r2);
            if ($3 === h)
              return this.set(h, this.$y + r2);
            if ($3 === a)
              return y2(1);
            if ($3 === o)
              return y2(7);
            var M3 = (d2 = {}, d2[s] = e, d2[u] = n, d2[i] = t, d2)[$3] || 1, m3 = this.$d.getTime() + r2 * M3;
            return b.w(m3, this);
          }, m2.subtract = function(t2, e2) {
            return this.add(-1 * t2, e2);
          }, m2.format = function(t2) {
            var e2 = this, n2 = this.$locale();
            if (!this.isValid())
              return n2.invalidDate || l;
            var r2 = t2 || "YYYY-MM-DDTHH:mm:ssZ", i2 = b.z(this), s2 = this.$H, u2 = this.$m, a2 = this.$M, o2 = n2.weekdays, c2 = n2.months, f2 = n2.meridiem, h2 = function(t3, n3, i3, s3) {
              return t3 && (t3[n3] || t3(e2, r2)) || i3[n3].slice(0, s3);
            }, d2 = function(t3) {
              return b.s(s2 % 12 || 12, t3, "0");
            }, $3 = f2 || function(t3, e3, n3) {
              var r3 = t3 < 12 ? "AM" : "PM";
              return n3 ? r3.toLowerCase() : r3;
            };
            return r2.replace(y, function(t3, r3) {
              return r3 || function(t4) {
                switch (t4) {
                  case "YY":
                    return String(e2.$y).slice(-2);
                  case "YYYY":
                    return b.s(e2.$y, 4, "0");
                  case "M":
                    return a2 + 1;
                  case "MM":
                    return b.s(a2 + 1, 2, "0");
                  case "MMM":
                    return h2(n2.monthsShort, a2, c2, 3);
                  case "MMMM":
                    return h2(c2, a2);
                  case "D":
                    return e2.$D;
                  case "DD":
                    return b.s(e2.$D, 2, "0");
                  case "d":
                    return String(e2.$W);
                  case "dd":
                    return h2(n2.weekdaysMin, e2.$W, o2, 2);
                  case "ddd":
                    return h2(n2.weekdaysShort, e2.$W, o2, 3);
                  case "dddd":
                    return o2[e2.$W];
                  case "H":
                    return String(s2);
                  case "HH":
                    return b.s(s2, 2, "0");
                  case "h":
                    return d2(1);
                  case "hh":
                    return d2(2);
                  case "a":
                    return $3(s2, u2, true);
                  case "A":
                    return $3(s2, u2, false);
                  case "m":
                    return String(u2);
                  case "mm":
                    return b.s(u2, 2, "0");
                  case "s":
                    return String(e2.$s);
                  case "ss":
                    return b.s(e2.$s, 2, "0");
                  case "SSS":
                    return b.s(e2.$ms, 3, "0");
                  case "Z":
                    return i2;
                }
                return null;
              }(t3) || i2.replace(":", "");
            });
          }, m2.utcOffset = function() {
            return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
          }, m2.diff = function(r2, d2, l2) {
            var $3, y2 = this, M3 = b.p(d2), m3 = O(r2), v2 = (m3.utcOffset() - this.utcOffset()) * e, g2 = this - m3, D2 = function() {
              return b.m(y2, m3);
            };
            switch (M3) {
              case h:
                $3 = D2() / 12;
                break;
              case c:
                $3 = D2();
                break;
              case f:
                $3 = D2() / 3;
                break;
              case o:
                $3 = (g2 - v2) / 6048e5;
                break;
              case a:
                $3 = (g2 - v2) / 864e5;
                break;
              case u:
                $3 = g2 / n;
                break;
              case s:
                $3 = g2 / e;
                break;
              case i:
                $3 = g2 / t;
                break;
              default:
                $3 = g2;
            }
            return l2 ? $3 : b.a($3);
          }, m2.daysInMonth = function() {
            return this.endOf(c).$D;
          }, m2.$locale = function() {
            return D[this.$L];
          }, m2.locale = function(t2, e2) {
            if (!t2)
              return this.$L;
            var n2 = this.clone(), r2 = w(t2, e2, true);
            return r2 && (n2.$L = r2), n2;
          }, m2.clone = function() {
            return b.w(this.$d, this);
          }, m2.toDate = function() {
            return new Date(this.valueOf());
          }, m2.toJSON = function() {
            return this.isValid() ? this.toISOString() : null;
          }, m2.toISOString = function() {
            return this.$d.toISOString();
          }, m2.toString = function() {
            return this.$d.toUTCString();
          }, M2;
        }(), k = _.prototype;
        return O.prototype = k, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", c], ["$y", h], ["$D", d]].forEach(function(t2) {
          k[t2[1]] = function(e2) {
            return this.$g(e2, t2[0], t2[1]);
          };
        }), O.extend = function(t2, e2) {
          return t2.$i || (t2(e2, _, O), t2.$i = true), O;
        }, O.locale = w, O.isDayjs = S, O.unix = function(t2) {
          return O(1e3 * t2);
        }, O.en = D[g], O.Ls = D, O.p = {}, O;
      });
    }
  });

  // tvprogram/js/tvprogram.js
  var require_tvprogram = __commonJS({
    "tvprogram/js/tvprogram.js"(exports) {
      init_package();
      init_sortable_esm();
      var dayjs = require_dayjs_min();
      fetch("widgets/tvprogram/i18n/translations.json").then((res) => __async(exports, null, function* () {
        const i18n = yield res.json();
        $.extend(true, systemDictionary, i18n);
      }));
      $.extend(true, systemDictionary, {
        // Add your translations here, e.g.:
        // "size": {
        // 	"en": "Size",
        // 	"de": "Größe",
        // 	"ru": "Размер",
        // 	"pt": "Tamanho",
        // 	"nl": "Grootte",
        // 	"fr": "Taille",
        // 	"it": "Dimensione",
        // 	"es": "Talla",
        // 	"pl": "Rozmiar",
        // 	"zh-cn": "尺寸"
        // }
      });
      vis.binds["tvprogram"] = {
        version,
        showVersion: function() {
          if (vis.binds["tvprogram"].version) {
            console.log(`Version tvprogram: ${vis.binds["tvprogram"].version}`);
            vis.binds["tvprogram"].version = null;
          }
        },
        pending: {},
        categories: null,
        channels: null,
        genres: null,
        tvprogram: [],
        infos: null,
        requests: [],
        search: {
          visTvprogram: null,
          bound: {},
          searchdata: [],
          searchresult: [],
          createWidget: function(widgetID, view, data, style) {
            return __async(this, null, function* () {
              const $div = $(`#${widgetID}`);
              if (!$div.length) {
                return setTimeout(function() {
                  vis.binds["tvprogram"].search.createWidget(widgetID, view, data, style);
                }, 100);
              }
              console.log("createWidget start");
              this.visTvprogram = vis.binds["tvprogram"];
              if (!data.tvprogram_oid || data.tvprogram_oid == "") {
                return;
              }
              let [instance, tvprogram_oid] = this.visTvprogram.getInstanceInfo(data.tvprogram_oid);
              if (!tvprogram_oid && !instance) {
                return;
              }
              const backgroundColor = this.visTvprogram.realBackgroundColor($(`#${widgetID}`)[0]);
              if (this.visTvprogram.checkStyle("background-color", $(`#${widgetID}`)[0].style.cssText) == "") {
                $(`#${widgetID}`).css("background-color", backgroundColor);
              }
              const maxresults = parseInt(data.tvprogram_maxresults) || 10;
              const heightrow = parseInt(data.tvprogram_heightRow) || 35;
              const broadcastfontpercent = parseInt(data.tvprogram_broadcastfontpercent) || 75;
              const highlightcolor = data.tvprogram_highlightcolor || "yellow";
              const showpictures = data.tvprogram_showpictures || false;
              const dialogwidthpercent = data.tvprogram_dialogwidthpercent / 100 || 0.9;
              const dialogheightpercent = data.tvprogram_dialogheightpercent / 100 || 0.9;
              if (!this.searchresult[tvprogram_oid]) {
                this.searchresult[tvprogram_oid] = {};
              }
              if (!this.searchresult[tvprogram_oid][widgetID]) {
                this.searchresult[tvprogram_oid][widgetID] = [];
              }
              if (!this.searchdata[tvprogram_oid]) {
                this.searchdata[tvprogram_oid] = {};
              }
              if (!this.searchdata[tvprogram_oid][widgetID]) {
                this.searchdata[tvprogram_oid][widgetID] = {
                  datefrom: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
                  categoryfilter: "",
                  textfilter: "",
                  maxresults: maxresults || 10
                };
              }
              if (!this.bound[tvprogram_oid]) {
                this.bound[tvprogram_oid] = {};
              }
              if (!this.bound[tvprogram_oid][widgetID]) {
                this.bound[tvprogram_oid][widgetID] = false;
              }
              if (tvprogram_oid && !this.bound[tvprogram_oid][widgetID]) {
                if (!vis.editMode) {
                  this.bound[tvprogram_oid][widgetID] = true;
                  vis.binds["tvprogram"].bindStates(
                    $div,
                    [
                      `${tvprogram_oid}.config`,
                      `${tvprogram_oid}.favorites`,
                      `${tvprogram_oid}.channelfilter`,
                      `${tvprogram_oid}.optchnlogopath`
                    ],
                    this.onChange.bind(this, widgetID, view, data, style, tvprogram_oid)
                  );
                }
              }
              if (!this.visTvprogram.infos) {
                this.visTvprogram.infos = yield this.visTvprogram.loadServerInfosAsync(instance);
              }
              if (!this.visTvprogram.categories) {
                this.visTvprogram.categories = yield this.visTvprogram.loadCategories(instance, widgetID);
              }
              if (!this.visTvprogram.channels) {
                this.visTvprogram.channels = yield this.visTvprogram.loadChannels(instance, widgetID);
              }
              if (this.visTvprogram.infos == null || !Object.prototype.hasOwnProperty.call(this.visTvprogram.infos, "tvprogram")) {
                return;
              }
              if (this.visTvprogram.categories.length == 0) {
                return;
              }
              if (this.visTvprogram.channels.length == 0) {
                return;
              }
              let categoriesoptions = this.visTvprogram.categories.map(
                (cat) => `<option value="${cat.id}" ${this.searchdata[tvprogram_oid][widgetID].categoryfilter == cat.id ? " selected" : ""}>${cat.title}</option>`
              );
              categoriesoptions = `<option value="" ${this.searchdata[tvprogram_oid][widgetID].categoryfilter == "" ? " selected" : ""}></option>${categoriesoptions}`;
              $(`#${widgetID}broadcastdlg`).data({
                dialogwidthpercent,
                dialogheightpercent
              });
              let text = "";
              text += "<style> \n";
              text += `#${widgetID} * {
`;
              text += "   box-sizing: border-box; \n";
              text += "} \n";
              text += `#${widgetID} .tv-search {
`;
              text += "   width: 100%; \n";
              text += "   height: 100%; \n";
              text += "   white-space:nowrap; \n";
              text += "   display:flex; \n";
              text += "   flex-direction: column; \n";
              text += "} \n";
              text += `#${widgetID} .tv-form {
`;
              text += "   padding: 5px 0px; \n";
              text += "} \n";
              text += `#${widgetID} .tv-result {
`;
              text += "   overflow: hidden; \n";
              text += "   overflow-y: auto; \n";
              text += "} \n";
              text += `#${widgetID} .tv-row {
`;
              text += "   margin: 0px; \n";
              text += "   padding: 0px; \n";
              text += "   width: 100%; \n";
              text += "} \n";
              text += `#${widgetID} .tv-search .tv-row:nth-child(odd) {
`;
              text += "   background-color: rgba(128,127,127,.65); \n";
              text += "   padding: 0px; \n";
              text += "} \n";
              text += `#${widgetID} .tv-search .tv-row:nth-child(even) {
`;
              text += "   background-color: rgba(128,127,127,.55); \n";
              text += "   padding: 0px; \n";
              text += "} \n";
              text += `#${widgetID} .tv-item {
`;
              text += "   display: inline-block; \n";
              text += "   vertical-align: middle; \n";
              text += "   border: solid #80808033; \n";
              text += "   border-width:1px 0px 0px 1px; \n";
              text += "} \n";
              text += `#${widgetID} .channel {
`;
              text += `   width: ${heightrow}px; 
`;
              text += `   height: ${heightrow}px; 
`;
              text += "   border-width: 0px; \n";
              text += `   background-color: ${backgroundColor}; 
`;
              text += "} \n";
              text += `#${widgetID} .broadcast {
`;
              text += `   height: ${heightrow}px; 
`;
              text += "   padding: 3px; \n";
              text += `   font-size: ${broadcastfontpercent}%; 
`;
              text += "   overflow: hidden; \n";
              text += "   width: 100%; \n";
              text += "} \n";
              text += `#${widgetID} .broadcastelement {
`;
              text += "   width: 100%; \n";
              text += "   height: 100%; \n";
              text += "   display: table-cell; \n";
              text += "} \n";
              text += `#${widgetID} .broadcastelement .star  {
`;
              text += "   display: inline-block; \n";
              text += "   margin: 0px 2px; \n";
              text += "} \n";
              text += `#${widgetID} .broadcastelement .star svg {
`;
              text += "   height: 1em; \n";
              text += "   width: 1em; \n";
              text += "   position: relative; \n";
              text += "   top: .125em; \n";
              text += "} \n";
              text += `#${widgetID} .broadcastelement.selected .star svg path {
`;
              text += `   color: ${highlightcolor}; 
`;
              text += "} \n";
              text += `#${widgetID} .broadcastelement.selected {
`;
              text += `   color: ${highlightcolor}; 
`;
              text += "} \n";
              text += `#${widgetID} .broadcastimage {
`;
              text += `   height: ${heightrow - 7}px; 
`;
              text += "   padding-right: 3px; \n";
              text += "   float: left; \n";
              text += "} \n";
              text += `.${widgetID}.no-titlebar .ui-dialog-titlebar {
`;
              text += "   display:none; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg  {
`;
              text += "   z-index:12; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-container.tv-dlg-row {
`;
              text += "   height:100%; \n";
              text += "   display:flex; \n";
              text += "   flex-direction:row; \n";
              text += "   overflow:hidden; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-container.tv-dlg-col {
`;
              text += "   height:100%; \n";
              text += "   display:flex; \n";
              text += "   flex-direction:column; \n";
              text += "   overflow:hidden; \n";
              text += "   font-size:75%; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-picture.tv-dlg-row {
`;
              text += "   width:50%; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-picture.tv-dlg-col {
`;
              text += "   height:30%; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-data {
`;
              text += "   overflow-y:auto; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-picture img {
`;
              text += "   width:auto; \n";
              text += "   height:auto; \n";
              text += "   max-width:100%; \n";
              text += "   max-height:100%; \n";
              text += "   display:block; \n";
              text += "   margin:auto; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-picture img {
`;
              text += "   width:auto; \n";
              text += "   height:auto; \n";
              text += "   max-width:100%; \n";
              text += "   max-height:100%; \n";
              text += "   display:block; \n";
              text += "   margin:auto; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .dialogcolumn.tv-dlg-row {
`;
              text += "   flex:1; \n";
              text += "   padding:5px; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .dialogcolumn.tv-dlg-col {
`;
              text += "   padding:5px; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .button {
`;
              text += "   display:inline-block; \n";
              text += "   width: 35px; \n";
              text += "   height: 35px; \n";
              text += "   vertical-align: middle; \n";
              text += "   position: relative; \n";
              text += "   float: right; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .star.selected svg  {
`;
              text += "   filter: drop-shadow( 2px 2px 2px rgba(0, 0, 0, .7))\n";
              text += "} \n";
              text += `#${widgetID} .broadcastelement.selected .star svg path, #${widgetID}broadcastdlg .star.selected {
`;
              text += `   color: ${highlightcolor}; 
`;
              text += "} \n";
              text += "</style> \n";
              text += '  <div class="svgcontainer">';
              text += '<svg style="display:none;"><symbol id="star-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" /></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="copy-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" /></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="switch-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M21,3H3C1.89,3 1,3.89 1,5V17A2,2 0 0,0 3,19H8V21H16V19H21A2,2 0 0,0 23,17V5C23,3.89 22.1,3 21,3M21,17H3V5H21M16,11L9,15V7" /></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="record-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12.5,5A7.5,7.5 0 0,0 5,12.5A7.5,7.5 0 0,0 12.5,20A7.5,7.5 0 0,0 20,12.5A7.5,7.5 0 0,0 12.5,5M7,10H9A1,1 0 0,1 10,11V12C10,12.5 9.62,12.9 9.14,12.97L10.31,15H9.15L8,13V15H7M12,10H14V11H12V12H14V13H12V14H14V15H12A1,1 0 0,1 11,14V11A1,1 0 0,1 12,10M16,10H18V11H16V14H18V15H16A1,1 0 0,1 15,14V11A1,1 0 0,1 16,10M8,11V12H9V11" /></symbol></svg>';
              text += "  </div>";
              text += `  <form data-instance="${instance}" data-dp="${tvprogram_oid}" data-widgetid="${widgetID}" data-maxresults="${maxresults}" >`;
              text += '    <label for="tvsearch">Search:';
              text += `      <input name="tvsearch" type="text" id="tvsearch" value="${this.searchdata[tvprogram_oid][widgetID].textfilter}" placeholder="Search">`;
              text += "    </label>";
              text += '    <label for="tvfrom">From:';
              text += `      <input name="tvfrom" autocomplete="off"  type="date" id="tvfrom" min="${this.visTvprogram.infos.tvprogram[0]}" max="${this.visTvprogram.infos.tvprogram[this.visTvprogram.infos.tvprogram.length - 1]}" value="${this.searchdata[tvprogram_oid][widgetID].datefrom}">`;
              text += "    </label>";
              text += '    <label for="tvcategory">Category:';
              text += '      <select name="tvcategory" id="tvcategory" >';
              text += categoriesoptions;
              text += "      </select>";
              text += "    </label>";
              text += "  <button>Search</Search>";
              text += "  </form>";
              $(`#${widgetID} .tv-form`).html(text);
              $(`#${widgetID} .tv-form form`).submit(this.onSubmitSearch.bind(this, widgetID, view, data, style));
              let favhighlight, viewdate;
              let logopath = this.visTvprogram.getOptChannelLogoPath(tvprogram_oid) || "https://tvfueralle.de/channel-logos/";
              text = "";
              const favorites = this.visTvprogram.getConfigFavorites(tvprogram_oid);
              this.searchresult[tvprogram_oid][widgetID].map((event, i) => {
                if (i + 1 > maxresults) {
                  return;
                }
                const channel = this.visTvprogram.channels.find((ch) => ch.id == event.channel);
                favhighlight = favorites.indexOf(event.title) > -1;
                viewdate = event.airDate;
                text += '    <ul class="tv-row">';
                text += '       <li class="tv-item channel">';
                text += `          <img width="100%" height="100%" 
                                        data-instance="${instance}" 
                                        data-channelid="${channel.channelId}" 
                                        data-dp="${tvprogram_oid}" 
                                        data-instance="${instance}" 
                                        src="${logopath}${channel.channelId}.png"  
                                        alt="" class="channel-logo"  
                                        onclick="vis.binds.tvprogram.onclickChannelSwitch(this,event)">`;
                text += "       </li>";
                text += '       <li class="tv-item broadcast">';
                text += `             <div class="broadcastelement ${favhighlight ? "selected" : ""}" data-widgetid="${widgetID}" data-eventid="${event.id}" data-viewdate="${viewdate}" data-instance="${instance}" data-dp="${tvprogram_oid}" data-view="" >`;
                if (event.photo.url && showpictures) {
                  text += `<div><img class="broadcastimage" src="https://tvfueralle.de${event.photo.url}"></div>`;
                }
                text += '                 <div class="broadcasttitle">';
                text += `                     ${event.title}`;
                text += `                     <div class="star" data-viewdate="${viewdate}" data-eventid="${event.id}" data-instance="${instance}" data-dp="${tvprogram_oid}" onclick="return vis.binds.tvprogram.onclickFavorite(this,event)"><svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg></div>`;
                text += "                 </div>";
                const startTime = new Date(event.startTime);
                const endTime = new Date(event.endTime);
                text += '                 <div class="broadcasttime">';
                text += `${`0${startTime.getDate()}`.slice(-2)}.${`0${parseInt(startTime.getMonth() + 1)}`.slice(
                  -2
                )}.${`0${startTime.getFullYear()}`.slice(-4)} `;
                text += `${`0${startTime.getHours()}`.slice(-2)}:${`0${startTime.getMinutes()}`.slice(-2)}`;
                text += " - ";
                text += `${`0${endTime.getHours()}`.slice(-2)}:${`0${endTime.getMinutes()}`.slice(-2)}`;
                text += "                 </div>";
                text += "             </div>";
                text += "       </li>";
                text += "    </ul>";
              });
              $(`#${widgetID} .tv-result`).html(text);
              $(`#${widgetID} .tv-result .broadcastelement`).click(
                vis.binds.tvprogram.onclickBroadcast.bind(this.visTvprogram)
              );
            });
          },
          onSubmitSearch: function(widgetID, view, data, style, evt) {
            return __async(this, null, function* () {
              const el = evt.target;
              const instance = el.dataset.instance || "";
              const tvprogram_oid = el.dataset.dp || "";
              evt.preventDefault();
              const isearch = $(el).find('[name="tvsearch"]').val();
              const icategory = $(el).find('[name="tvcategory"]').val();
              const ifrom = $(el).find('[name="tvfrom"]').val();
              if (!this.parseDatestring(ifrom)) {
                return false;
              }
              let channelfilter = this.visTvprogram.getConfigChannelfilter(tvprogram_oid);
              if (channelfilter.length == 0) {
                channelfilter = this.visTvprogram.channels.reduce((acc, el2, i) => {
                  if (i < 4) {
                    acc.push(el2.id);
                  }
                  return acc;
                }, []);
              }
              if (!this.searchdata[tvprogram_oid]) {
                this.searchdata[tvprogram_oid] = {};
              }
              this.searchdata[tvprogram_oid][widgetID] = Object.assign(this.searchdata[tvprogram_oid][widgetID], {
                datefrom: ifrom,
                categoryfilter: [icategory],
                textfilter: isearch
              });
              const today = /* @__PURE__ */ new Date();
              const dFrom = this.parseDatestring(ifrom);
              if (today.getDate() == dFrom.getDate() && today.getMonth() == dFrom.getMonth() && today.getFullYear() == dFrom.getFullYear()) {
                dFrom.setHours(today.getHours());
                dFrom.setMinutes(today.getMinutes());
                dFrom.setSeconds(today.getSeconds());
              } else {
                dFrom.setHours(0);
                dFrom.setMinutes(0);
                dFrom.setSeconds(0);
              }
              const dTill = new Date(today);
              dTill.setDate(dTill.getDate() + 10);
              const obj = {
                channelfilter,
                datefrom: dFrom,
                datetill: dTill,
                categoryfilter: icategory == "" ? [] : [parseInt(icategory)],
                textfilter: isearch,
                maxresults: this.searchdata[tvprogram_oid][widgetID].maxresults
              };
              if (isearch == "" && icategory == "") {
                return false;
              }
              this.searchresult[tvprogram_oid][widgetID] = yield this.visTvprogram.getServerBroadcastFindAsync(
                instance,
                obj
              );
              this.createWidget(widgetID, view, data, style);
            });
          },
          parseDatestring: function(datestring) {
            const b = datestring.split(/\D/);
            const d = new Date(b[0], --b[1], b[2]);
            return d && d.getMonth() == b[1] ? d : false;
          },
          onChange: function(widgetID, view, data, style, tvprogram_oid, e, newVal) {
            const dp = e.type.split(".");
            if ((dp[3] == "config" || dp[3] == "favorites" || dp[3] == "channelfilter" || dp[3] == "show") && dp[4] == "val") {
              console.log(`changed ${widgetID} type:${e.type} val:${newVal}`);
              this.createWidget(widgetID, view, data, style);
            }
          }
        },
        control: {
          visTvprogram: null,
          bound: {},
          programdata: {},
          favorites: void 0,
          timer: {},
          createWidget: function(widgetID, view, data, style) {
            return __async(this, null, function* () {
              const $div = $(`#${widgetID}`);
              if (!$div.length) {
                return setTimeout(function() {
                  vis.binds["tvprogram"].control.createWidget(widgetID, view, data, style);
                }, 100);
              }
              console.log("createWidget control start");
              this.visTvprogram = vis.binds["tvprogram"];
              if (!data.tvprogram_oid || data.tvprogram_oid == "") {
                return;
              }
              let [instance, tvprogram_oid] = this.visTvprogram.getInstanceInfo(data.tvprogram_oid);
              if (!tvprogram_oid && !instance) {
                return;
              }
              this.visTvprogram.categories = yield this.visTvprogram.loadCategories(instance, widgetID);
              this.visTvprogram.channels = yield this.visTvprogram.loadChannels(instance, widgetID);
              if (this.visTvprogram.channels.length == 0 || this.visTvprogram.categories.length == 0) {
                return;
              }
              const backgroundColor = this.visTvprogram.realBackgroundColor($(`#${widgetID}`)[0]);
              if (this.visTvprogram.checkStyle("background-color", $(`#${widgetID}`)[0].style.cssText) == "") {
                $(`#${widgetID}`).css("background-color", backgroundColor);
              }
              let channelfilter = this.visTvprogram.getConfigChannelfilter(tvprogram_oid);
              if (channelfilter.length == 0) {
                channelfilter = this.visTvprogram.channels.reduce((acc, el, i) => {
                  if (i < 4) {
                    acc.push(el.id);
                  }
                  return acc;
                }, []);
              }
              const time = data.tvprogram_time || "";
              if (!this.programdata[tvprogram_oid]) {
                this.programdata[tvprogram_oid] = {};
              }
              let startDate = this.parseTime(time);
              this.programdata[tvprogram_oid][widgetID] = yield this.visTvprogram.getServerBroadcastRangeAsync(
                instance,
                channelfilter,
                startDate,
                startDate
              );
              if (!this.bound[tvprogram_oid]) {
                this.bound[tvprogram_oid] = {};
              }
              if (!this.bound[tvprogram_oid][widgetID]) {
                this.bound[tvprogram_oid][widgetID] = false;
              }
              if (tvprogram_oid && !this.bound[tvprogram_oid][widgetID]) {
                if (!vis.editMode) {
                  this.bound[tvprogram_oid][widgetID] = true;
                  vis.binds["tvprogram"].bindStates(
                    $div,
                    [
                      `${tvprogram_oid}.config`,
                      `${tvprogram_oid}.favorites`,
                      `${tvprogram_oid}.channelfilter`,
                      `${tvprogram_oid}.optchnlogopath`
                    ],
                    this.onChange.bind(this, widgetID, view, data, style, tvprogram_oid)
                  );
                }
              }
              const heightrow = parseInt(data.tvprogram_heightRow) || 35;
              const broadcastfontpercent = parseInt(data.tvprogram_broadcastfontpercent) || 75;
              const highlightcolor = data.tvprogram_highlightcolor || "yellow";
              const showpictures = data.tvprogram_showpictures || false;
              const dialogwidthpercent = data.tvprogram_dialogwidthpercent / 100 || 0.9;
              const dialogheightpercent = data.tvprogram_dialogheightpercent / 100 || 0.9;
              $(`#${widgetID}broadcastdlg`).data({
                dialogwidthpercent,
                dialogheightpercent
              });
              let text = "";
              text += "<style> \n";
              text += `#${widgetID} * {
`;
              text += "   box-sizing: border-box; \n";
              text += "} \n";
              text += `#${widgetID} .tv-control {
`;
              text += "   width: 100%; \n";
              text += "   height: 100%; \n";
              text += "   white-space:nowrap; \n";
              text += "   display:flex; \n";
              text += "   flex-direction: column; \n";
              text += "   overflow: hidden; \n";
              text += "   overflow-y: auto; \n";
              text += "} \n";
              text += `#${widgetID} .tv-row {
`;
              text += "   margin: 0px; \n";
              text += "   padding: 0px; \n";
              text += "   width: 100%; \n";
              text += "} \n";
              text += `#${widgetID} .tv-control .tv-row:nth-child(odd) {
`;
              text += "   background-color: rgba(128,127,127,.65); \n";
              text += "   padding: 0px; \n";
              text += "} \n";
              text += `#${widgetID} .tv-control .tv-row:nth-child(even) {
`;
              text += "   background-color: rgba(128,127,127,.55); \n";
              text += "   padding: 0px; \n";
              text += "} \n";
              text += `#${widgetID} .tv-item {
`;
              text += "   display: inline-block; \n";
              text += "   vertical-align: middle; \n";
              text += "   border: solid #80808033; \n";
              text += "   border-width:1px 0px 0px 1px; \n";
              text += "} \n";
              text += `#${widgetID} .channel {
`;
              text += `   width: ${heightrow}px; 
`;
              text += `   height: ${heightrow}px; 
`;
              text += "   border-width: 0px; \n";
              text += `   background-color: ${backgroundColor}; 
`;
              text += "} \n";
              text += `#${widgetID} .broadcast {
`;
              text += `   height: ${heightrow}px; 
`;
              text += "   padding: 3px; \n";
              text += `   font-size: ${broadcastfontpercent}%; 
`;
              text += "   overflow: hidden; \n";
              text += "   width: 100%; \n";
              text += "} \n";
              text += `#${widgetID} .broadcastelement {
`;
              text += "   width: 100%; \n";
              text += "   height: 100%; \n";
              text += "   display: table-cell; \n";
              text += "} \n";
              text += `#${widgetID} .broadcastelement .star  {
`;
              text += "   display: inline-block; \n";
              text += "   margin: 0px 2px; \n";
              text += "} \n";
              text += `#${widgetID} .broadcastelement .star svg {
`;
              text += "   height: 1em; \n";
              text += "   width: 1em; \n";
              text += "   position: relative; \n";
              text += "   top: .125em; \n";
              text += "} \n";
              text += `#${widgetID} .broadcastelement.selected .star svg path {
`;
              text += `   color: ${highlightcolor}; 
`;
              text += "} \n";
              text += `#${widgetID} .broadcastelement.selected {
`;
              text += `   color: ${highlightcolor}; 
`;
              text += "} \n";
              text += `#${widgetID} .broadcastimage {
`;
              text += `   height: ${heightrow - 7}px; 
`;
              text += "   padding-right: 3px; \n";
              text += "   float: left; \n";
              text += "} \n";
              text += `.${widgetID}.no-titlebar .ui-dialog-titlebar {
`;
              text += "   display:none; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg  {
`;
              text += "   z-index:12; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-container.tv-dlg-row {
`;
              text += "   height:100%; \n";
              text += "   display:flex; \n";
              text += "   flex-direction:row; \n";
              text += "   overflow:hidden; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-container.tv-dlg-col {
`;
              text += "   height:100%; \n";
              text += "   display:flex; \n";
              text += "   flex-direction:column; \n";
              text += "   overflow:hidden; \n";
              text += "   font-size:75%; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-picture.tv-dlg-row {
`;
              text += "   width:50%; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-picture.tv-dlg-col {
`;
              text += "   height:30%; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-data {
`;
              text += "   overflow-y:auto; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-picture img {
`;
              text += "   width:auto; \n";
              text += "   height:auto; \n";
              text += "   max-width:100%; \n";
              text += "   max-height:100%; \n";
              text += "   display:block; \n";
              text += "   margin:auto; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-picture img {
`;
              text += "   width:auto; \n";
              text += "   height:auto; \n";
              text += "   max-width:100%; \n";
              text += "   max-height:100%; \n";
              text += "   display:block; \n";
              text += "   margin:auto; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .dialogcolumn.tv-dlg-row {
`;
              text += "   flex:1; \n";
              text += "   padding:5px; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .dialogcolumn.tv-dlg-col {
`;
              text += "   padding:5px; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .button {
`;
              text += "   display:inline-block; \n";
              text += "   width: 35px; \n";
              text += "   height: 35px; \n";
              text += "   vertical-align: middle; \n";
              text += "   position: relative; \n";
              text += "   float: right; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .star.selected svg  {
`;
              text += "   filter: drop-shadow( 2px 2px 2px rgba(0, 0, 0, .7))\n";
              text += "} \n";
              text += `#${widgetID} .broadcastelement.selected .star svg path, #${widgetID}broadcastdlg .star.selected {
`;
              text += `   color: ${highlightcolor}; 
`;
              text += "} \n";
              text += "</style> \n";
              text += '  <div class="svgcontainer">';
              text += '<svg style="display:none;"><symbol id="star-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" /></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="copy-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" /></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="switch-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M21,3H3C1.89,3 1,3.89 1,5V17A2,2 0 0,0 3,19H8V21H16V19H21A2,2 0 0,0 23,17V5C23,3.89 22.1,3 21,3M21,17H3V5H21M16,11L9,15V7" /></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="record-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12.5,5A7.5,7.5 0 0,0 5,12.5A7.5,7.5 0 0,0 12.5,20A7.5,7.5 0 0,0 20,12.5A7.5,7.5 0 0,0 12.5,5M7,10H9A1,1 0 0,1 10,11V12C10,12.5 9.62,12.9 9.14,12.97L10.31,15H9.15L8,13V15H7M12,10H14V11H12V12H14V13H12V14H14V15H12A1,1 0 0,1 11,14V11A1,1 0 0,1 12,10M16,10H18V11H16V14H18V15H16A1,1 0 0,1 15,14V11A1,1 0 0,1 16,10M8,11V12H9V11" /></symbol></svg>';
              text += "  </div>";
              let favhighlight;
              const favorites = this.visTvprogram.getConfigFavorites(tvprogram_oid);
              let logopath = this.visTvprogram.getOptChannelLogoPath(tvprogram_oid) || "https://tvfueralle.de/channel-logos/";
              this.programdata[tvprogram_oid][widgetID].map((ch) => {
                ch.events.map((event) => {
                  let viewdate = this.visTvprogram.getDate(event.startTime, 0);
                  const channel = this.visTvprogram.channels.find((ch2) => ch2.id == event.channel);
                  favhighlight = favorites.indexOf(event.title) > -1;
                  text += '    <ul class="tv-row">';
                  text += '       <li class="tv-item channel">';
                  text += `          <img width="100%" height="100%" 
                        data-instance="${instance}" 
                        data-channelid="${channel.channelId}" 
                        data-dp="${tvprogram_oid}" 
                        src="${logopath}${channel.channelId}.png" 
                        alt="" 
                        class="channel-logo"  
                        onclick="vis.binds.tvprogram.onclickChannelSwitch(this,event)">`;
                  text += "       </li>";
                  text += '       <li class="tv-item broadcast">';
                  text += `             <div class="broadcastelement ${favhighlight ? "selected" : ""}" data-widgetid="${widgetID}" data-eventid="${event.id}" data-viewdate="${viewdate}" data-instance="${instance}" data-dp="${tvprogram_oid}" data-view="${view}" onclick="vis.binds.tvprogram.onclickBroadcast(this)">`;
                  if (event.photo.url && showpictures) {
                    text += `<div><img class="broadcastimage" src="https://tvfueralle.de${event.photo.url}"></div>`;
                  }
                  text += '                 <div class="broadcasttitle">';
                  text += `                     ${event.title}`;
                  text += `                     <div class="star" data-viewdate="${viewdate}" data-eventid="${event.id}" data-instance="${instance}" data-dp="${tvprogram_oid}" onclick="return vis.binds.tvprogram.onclickFavorite(this,event)"><svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg></div>`;
                  text += "                 </div>";
                  const startTime = new Date(event.startTime);
                  const endTime = new Date(event.endTime);
                  text += '                 <div class="broadcasttime">';
                  text += `${`0${startTime.getHours()}`.slice(-2)}:${`0${startTime.getMinutes()}`.slice(-2)}`;
                  text += " - ";
                  text += `${`0${endTime.getHours()}`.slice(-2)}:${`0${endTime.getMinutes()}`.slice(-2)}`;
                  text += "                 </div>";
                  text += "             </div>";
                  text += "       </li>";
                  text += "    </ul>";
                });
              });
              $(`#${widgetID} .tv-control`).html(text);
              if (!this.timer[widgetID]) {
                clearInterval(this.timer[widgetID]);
              }
              this.timer[widgetID] = setTimeout(
                () => {
                  vis.binds["tvprogram"].control.createWidget(widgetID, view, data, style);
                },
                1e3 * 60 * 5
              );
            });
          },
          parseTime: function(time) {
            let startDate;
            let endDate;
            const date = new Date(time);
            if (date instanceof Date && !isNaN(date)) {
              return date;
            }
            if (time == "") {
              return /* @__PURE__ */ new Date();
            }
            let iTime = time.split("/");
            let duration = 120;
            if (iTime.length > 1 && parseInt(iTime[1].trim()) > 0) {
              duration = parseInt(iTime[1].trim());
            }
            iTime = iTime[0].split(":");
            endDate = /* @__PURE__ */ new Date();
            endDate.setHours(parseInt(iTime[0]));
            endDate.setMinutes(parseInt(iTime[1]));
            endDate.setSeconds(0);
            startDate = new Date(endDate);
            endDate.setMinutes(endDate.getMinutes() + duration);
            if (/* @__PURE__ */ new Date() < endDate) {
              return startDate;
            }
            return startDate.setDate(startDate.getDate() + 1);
          },
          onChange: function(widgetID, view, data, style, tvprogram_oid, e, newVal) {
            const dp = e.type.split(".");
            if ((dp[3] == "config" || dp[3] == "favorites" || dp[3] == "channelfilter" || dp[3] == "show") && dp[4] == "val") {
              console.log(`changed ${widgetID} type:${e.type} val:${newVal}`);
              this.tvprogram = [];
              this.createWidget(widgetID, view, data, style);
            }
          }
        },
        favorites: {
          visTvprogram: null,
          pending: {},
          bound: {},
          favorites: void 0,
          timer: {},
          createWidget: function(widgetID, view, data, style) {
            return __async(this, null, function* () {
              const $div = $(`#${widgetID}`);
              if (!$div.length) {
                return setTimeout(function() {
                  vis.binds["tvprogram"].favorites.createWidget(widgetID, view, data, style);
                }, 100);
              }
              console.log("createWidget start");
              this.visTvprogram = vis.binds["tvprogram"];
              const showweekday = data.tvprogram_showweekday || false;
              const maxfavorites = data.tvprogram_maxfavorites || 10;
              const highlightcolor = data.tvprogram_highlightcolor || "yellow";
              const channelname = data.tvprogram_channelname || false;
              let tvprogram_oid;
              let instance;
              const weekday_options = { weekday: "short" };
              const date_options = { month: "2-digit", day: "2-digit" };
              const time_options = { hour: "2-digit", minute: "2-digit" };
              if (!data.tvprogram_oid || (tvprogram_oid = vis.binds["tvprogram"].getTvprogramId(data.tvprogram_oid.trim())) == false) {
                return;
              }
              if (!data.tvprogram_oid || (instance = vis.binds["tvprogram"].getInstance(data.tvprogram_oid.trim())) == false) {
                return;
              }
              const backgroundColor = this.visTvprogram.realBackgroundColor($(`#${widgetID}`)[0]);
              if (this.visTvprogram.checkStyle("background-color", $(`#${widgetID}`)[0].style.cssText) == "") {
                $(`#${widgetID}`).css("background-color", backgroundColor);
              }
              if (!this.bound[tvprogram_oid]) {
                this.bound[tvprogram_oid] = {};
              }
              if (!this.bound[tvprogram_oid][widgetID]) {
                this.bound[tvprogram_oid][widgetID] = false;
              }
              if (tvprogram_oid && !this.bound[tvprogram_oid][widgetID]) {
                if (!vis.editMode) {
                  this.bound[tvprogram_oid][widgetID] = true;
                  vis.binds["tvprogram"].bindStates(
                    $div,
                    [`${tvprogram_oid}.config`, `${tvprogram_oid}.favorites`, `${tvprogram_oid}.optchnlogopath`],
                    this.onChange.bind(this, widgetID, view, data, style, tvprogram_oid)
                  );
                }
              }
              const favorites = this.visTvprogram.getConfigFavorites(tvprogram_oid);
              if (!this.favorites || !this.favorites[tvprogram_oid] && favorites) {
                let favoritesData = yield this.visTvprogram.getFavoritesDataAsync(instance, favorites);
                if (!this.favorites) {
                  this.favorites = [];
                }
                this.favorites[tvprogram_oid] = favoritesData;
                this.createWidget(widgetID, view, data, style);
              }
              if (!this.favorites || !this.favorites[tvprogram_oid]) {
                return;
              }
              let text = "";
              text += "<style> \n";
              text += `#${widgetID} .tv-fav {
`;
              text += "   width: 100%;\n";
              text += "} \n";
              text += `#${widgetID} .tv-fav td{
`;
              text += "   white-space: nowrap;\n";
              text += "} \n";
              text += `#${widgetID} .tv-left {
`;
              text += "   text-align: left;\n";
              text += "   width: 1%;\n";
              text += "} \n";
              text += `#${widgetID} .tv-full {
`;
              text += "   width: 50%;\n";
              text += "} \n";
              text += `#${widgetID} .tv-fav .star {
`;
              text += "   width: 1em;\n";
              text += "   height: 1em;\n";
              text += `   color: ${highlightcolor}; 
`;
              text += "} \n";
              text += `#${widgetID} .tv-center {
`;
              text += "   text-align: center;\n";
              text += "   width: 1%;\n";
              text += "} \n";
              text += `#${widgetID} .tv-icon {
`;
              text += "   height: 1em; \n";
              text += "   width: 1em; \n";
              text += "} \n";
              text += "</style> \n";
              text += '  <div class="svgcontainer">';
              text += '<svg style="display:none;"><symbol id="star-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" /></symbol></svg>';
              text += "  </div>";
              text += '<table class="tv-fav">';
              this.favorites[tvprogram_oid] = this.favorites[tvprogram_oid].filter(
                (el) => new Date(el.endTime) >= /* @__PURE__ */ new Date()
              );
              let logopath = this.visTvprogram.getOptChannelLogoPath(tvprogram_oid) || "https://tvfueralle.de/channel-logos/";
              this.favorites[tvprogram_oid].forEach(function(favorite, index2) {
                const today = /* @__PURE__ */ new Date();
                const startTime = new Date(favorite.startTime);
                const endTime = new Date(favorite.endTime);
                if (index2 < maxfavorites) {
                  vis.binds["tvprogram"].compareDate(today, startTime) ? text += '        <tr class="tv-today">' : text += "        <tr>";
                  text += `<td class="tv-left" data-viewdate="${favorite.viewdate}" data-eventid="${favorite.id}" data-instance="${instance}" data-dp="${tvprogram_oid}" onclick="return vis.binds.tvprogram.onclickFavorite(this,event)"><div class="star"><svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg></div></td>`;
                  if (showweekday) {
                    text += `           <td class="tv-left">${startTime.toLocaleString(
                      vis.language,
                      weekday_options
                    )}</td>`;
                  }
                  text += `           <td class="tv-left">${startTime.toLocaleString(
                    vis.language,
                    date_options
                  )}</td>`;
                  text += `           <td class="tv-left">${startTime.toLocaleString(
                    vis.language,
                    time_options
                  )}</td>`;
                  text += '           <td class="tv-left">-</td>';
                  text += `           <td class="tv-left">${endTime.toLocaleString(vis.language, time_options)}</td>`;
                  if (channelname) {
                    text += `           <td class="tv-left">${favorite.channelname}</td>`;
                  } else {
                    text += '           <td class="tv-center tv-tdicon">';
                    text += `              <img width="100%" height="100%" src="${logopath}${favorite.channelId}.png" alt="" class="tv-icon">`;
                    text += "           </td>";
                  }
                  text += `           <td class="tv-full">${favorite.title}</td>`;
                  text += "        </tr>";
                }
              });
              text += "</table>            ";
              $(`#${widgetID}`).html(text);
              if (!this.timer[widgetID]) {
                this.timer[widgetID] = setInterval(
                  vis.binds["tvprogram"].favorites.createWidget.bind(this, widgetID, view, data, style),
                  1e3 * 60
                );
              } else {
                clearInterval(this.timer[widgetID]);
                this.timer[widgetID] = setInterval(
                  vis.binds["tvprogram"].favorites.createWidget.bind(this, widgetID, view, data, style),
                  1e3 * 60
                );
              }
            });
          },
          onChange: function(widgetID, view, data, style, tvprogram_oid, e, newVal) {
            const dp = e.type.split(".");
            if ((dp[3] == "config" || dp[3] == "favorites" || dp[3] == "channelfilter" || dp[3] == "show") && dp[4] == "val") {
              console.log(`changed ${widgetID} type:${e.type} val:${newVal}`);
              this.favorites = [];
              this.createWidget(widgetID, view, data, style);
            }
          }
        },
        time1: {
          visTvprogram: null,
          tvprogram: {},
          bound: {},
          timer: {},
          pending: {},
          measures: {},
          scroll: {},
          today: {},
          viewday: {},
          olddata: {},
          createWidget: function(widgetID, view, data, style) {
            return __async(this, null, function* () {
              const $div = $(`#${widgetID}`);
              if (!$div.length) {
                return setTimeout(function() {
                  vis.binds["tvprogram"].time1.createWidget(widgetID, view, data, style);
                }, 100);
              }
              console.log(`createWidget start ${widgetID}`);
              this.visTvprogram = vis.binds["tvprogram"];
              if (!data.tvprogram_oid || data.tvprogram_oid == "") {
                return;
              }
              let [instance, tvprogram_oid] = this.visTvprogram.getInstanceInfo(data.tvprogram_oid);
              if (!tvprogram_oid && !instance) {
                return;
              }
              const highlightcolor = data.tvprogram_highlightcolor || "yellow";
              if (!this.olddata[widgetID]) {
                this.olddata[widgetID] = data;
              }
              if (!this.measures[widgetID] || JSON.stringify(this.olddata[widgetID]) != JSON.stringify(data)) {
                this.measures[widgetID] = {
                  origwidthItem: parseInt(data.tvprogram_widthItem) || 120,
                  timeItem: 30,
                  heightRow: parseInt(data.tvprogram_heightRow) || 35,
                  scrollbarWidth: this.getScrollbarWidth(),
                  markerpositionpercent: data.tvprogram_markerpositionpercent / 100 || 0.25,
                  dialogwidthpercent: data.tvprogram_dialogwidthpercent / 100 || 0.9,
                  dialogheightpercent: data.tvprogram_dialogheightpercent / 100 || 0.9,
                  showpictures: data.tvprogram_showpictures || false
                };
              }
              $(`#${widgetID}broadcastdlg`).data({
                dialogwidthpercent: this.measures[widgetID].dialogwidthpercent,
                dialogheightpercent: this.measures[widgetID].dialogheightpercent
              });
              if (!this.measures[widgetID].widthItem) {
                this.measures[widgetID].widthItem = this.measures[widgetID].origwidthItem;
              }
              if (!((this.today || {})[widgetID] || {}).prevday) {
                $(`#${widgetID} .tv-container`).html("Datapoints loading...");
              }
              console.log("Load Data");
              if (!this.visTvprogram.categories) {
                this.visTvprogram.categories = yield this.visTvprogram.loadCategories(instance, widgetID);
              }
              if (!this.visTvprogram.channels) {
                this.visTvprogram.channels = yield this.visTvprogram.loadChannels(instance, widgetID);
              }
              if (!this.visTvprogram.genres) {
                this.visTvprogram.genres = yield this.visTvprogram.loadGenres(instance, widgetID);
              }
              function check(prop) {
                if (!prop) {
                  return true;
                }
                if (Object.keys(prop) == 0) {
                  return true;
                }
                return false;
              }
              if (!this.today[widgetID]) {
                this.today[widgetID] = { today: /* @__PURE__ */ new Date(), prevday: null };
              }
              if (!this.scroll[widgetID]) {
                this.scroll[widgetID] = { time: /* @__PURE__ */ new Date(0), position: 0, marker: 0, timeout: null, automatic: 0 };
              }
              console.log("Calc Date");
              const d = this.visTvprogram.calcDate(this.today[widgetID].today);
              const datestring = this.visTvprogram.getDate(d, 0);
              if (!this.viewday[widgetID]) {
                this.viewday[widgetID] = { viewday: datestring, prevday: null };
              }
              this.viewday[widgetID].viewday = datestring;
              const viewdate = this.visTvprogram.getDate(d, 0);
              if (check(this.tvprogram[datestring])) {
                this.tvprogram[datestring] = yield this.visTvprogram.loadProgram(instance, widgetID, datestring);
              }
              if (this.visTvprogram.categories.length == 0 || this.visTvprogram.categories[0] === "request") {
                return;
              }
              if (this.visTvprogram.channels.length == 0 || this.visTvprogram.channels[0] === "request") {
                return;
              }
              if (this.visTvprogram.genres.length == 0 || this.visTvprogram.genres[0] === "request") {
                return;
              }
              if (check(this.tvprogram[datestring])) {
                return;
              }
              if (this.viewday[widgetID]["viewday"] != this.viewday[widgetID]["prevday"]) {
                this.viewday[widgetID]["prevday"] = this.viewday[widgetID]["viewday"];
              }
              if (!this.bound[tvprogram_oid]) {
                this.bound[tvprogram_oid] = {};
              }
              if (!this.bound[tvprogram_oid][widgetID]) {
                this.bound[tvprogram_oid][widgetID] = false;
              }
              if (tvprogram_oid && !this.bound[tvprogram_oid][widgetID]) {
                if (!vis.editMode) {
                  this.bound[tvprogram_oid][widgetID] = true;
                  vis.binds["tvprogram"].bindStates(
                    $div,
                    [
                      `${tvprogram_oid}.config`,
                      `${tvprogram_oid}.cmd`,
                      `${tvprogram_oid}.favorites`,
                      `${tvprogram_oid}.channelfilter`,
                      `${tvprogram_oid}.show`,
                      `${tvprogram_oid}.optchnlogopath`
                    ],
                    this.onChange.bind(this, widgetID, view, data, style, instance)
                  );
                }
              }
              if (this.onclickChannelSave.name == "onclickChannelSave") {
                this.onclickChannelSave = this.onclickChannelSave.bind(this);
              }
              console.log("Calc Channels");
              let channelfilter = this.visTvprogram.getConfigChannelfilter(tvprogram_oid);
              if (channelfilter.length == 0) {
                channelfilter = this.visTvprogram.channels.reduce((acc, el, i) => {
                  if (i < 4) {
                    acc.push(el.id);
                  }
                  return acc;
                }, []);
              }
              console.log("Calc styles");
              const widthitem = this.measures[widgetID].widthItem;
              const widthchannel = this.measures[widgetID].heightRow;
              const heightrow = this.measures[widgetID].heightRow;
              const backgroundColor = this.visTvprogram.realBackgroundColor($(`#${widgetID}`)[0]);
              if (this.visTvprogram.checkStyle("background-color", $(`#${widgetID}`)[0].style.cssText) == "") {
                $(`#${widgetID}`).css("background-color", backgroundColor);
              }
              const widthtvrow = 48 * widthitem + widthchannel;
              const headerfontpercent = data.tvprogram_headerfontpercent || 125;
              const broadcastfontpercent = data.tvprogram_broadcastfontpercent || 75;
              let lineheight = 0;
              const widgetheight = $(`#${widgetID}`).height() - heightrow;
              const contentheight = (channelfilter.length + 1) * heightrow;
              if (contentheight < widgetheight) {
                lineheight = contentheight;
              } else {
                lineheight = widgetheight - this.measures[widgetID].scrollbarWidth;
              }
              console.log(`Display day:${datestring}`);
              console.log("Output CSS");
              let text = "";
              text += "<style> \n";
              text += `#${widgetID} * {
`;
              text += "   box-sizing: border-box; \n";
              text += "} \n";
              text += `#${widgetID} .tv-container {
`;
              text += "   width: 100%; \n";
              text += "   height: 100%; \n";
              text += "   white-space:nowrap; \n";
              text += "   display:flex; \n";
              text += "   flex-direction: column; \n";
              text += "} \n";
              text += `#${widgetID} .navcontainer {
`;
              text += "   width: 100%; \n";
              text += "} \n";
              text += `#${widgetID} .scrollcontainer {
`;
              text += "   flex-grow: 1; \n";
              text += "   overflow:auto; \n";
              text += "   width:100%; \n";
              text += "} \n";
              text += `#${widgetID} .tv-row {
`;
              text += "   margin: 0px; \n";
              text += "   padding: 0px; \n";
              text += `   width: ${widthtvrow}px; 
`;
              text += "} \n";
              text += `#${widgetID} .tv-item {
`;
              text += "   display: inline-block; \n";
              text += "   vertical-align: middle; \n";
              text += "   border: solid #80808033; \n";
              text += "   border-width:1px 0px 0px 1px; \n";
              text += "} \n";
              text += `#${widgetID} .tv-head-time {
`;
              text += "   position:sticky; \n";
              text += "   position: -webkit-sticky; \n";
              text += "   top:0px; \n";
              text += "   z-index:12; \n";
              text += `   background-color: ${backgroundColor}; 
`;
              text += "} \n";
              text += `#${widgetID} .tv-head-left {
`;
              text += "   position:sticky; \n";
              text += "   position: -webkit-sticky; \n";
              text += "   left:0; \n";
              text += "   z-index:11; \n";
              text += "} \n";
              text += `#${widgetID} .tv-head-background {
`;
              text += `   background-color: ${backgroundColor}; 
`;
              text += "} \n";
              text += `#${widgetID} svg rect {
`;
              text += `   fill: ${$(`#${widgetID}`).css("color")}; 
`;
              text += "} \n";
              text += `#${widgetID} .channel {
`;
              text += `   width: ${heightrow}px; 
`;
              text += `   height: ${heightrow}px; 
`;
              text += "   border-width: 0px; \n";
              text += "} \n";
              text += `#${widgetID} .time {
`;
              text += `   width: ${widthitem}px; 
`;
              text += `   height: ${heightrow}px; 
`;
              text += "   font-weight: 700; \n";
              text += `   font-size: ${headerfontpercent}%; 
`;
              text += "   padding: 5px 5px; \n";
              text += "} \n";
              text += `#${widgetID} .time:after {
`;
              text += '   content:""; \n';
              text += "   display: inline-block; \n";
              text += "   vertical-align:middle; \n";
              text += "   height: 100%; \n";
              text += "} \n";
              text += `#${widgetID} .time span {
`;
              text += "   vertical-align:middle; \n";
              text += "} \n";
              text += `#${widgetID} .broadcast {
`;
              text += `   height: ${heightrow}px; 
`;
              text += "   padding: 3px; \n";
              text += `   font-size: ${broadcastfontpercent}%; 
`;
              text += "   overflow: hidden; \n";
              text += "} \n";
              text += `#${widgetID} .broadcastelement {
`;
              text += "   width: 100%; \n";
              text += "   height: 100%; \n";
              text += "   display: table-cell; \n";
              text += "} \n";
              text += `#${widgetID} .broadcastelement.hide {
`;
              text += "   display: none; \n";
              text += "} \n";
              text += `#${widgetID} .broadcastelement .star  {
`;
              text += "   display: inline-block; \n";
              text += "   margin: 0px 2px; \n";
              text += "} \n";
              text += `#${widgetID} .broadcastelement .star svg {
`;
              text += "   height: 1em; \n";
              text += "   width: 1em; \n";
              text += "   position: relative; \n";
              text += "   top: .125em; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .star.selected svg  {
`;
              text += "   filter: drop-shadow( 2px 2px 2px rgba(0, 0, 0, .7))\n";
              text += "} \n";
              text += `#${widgetID} .broadcastelement.selected .star svg path, #${widgetID}broadcastdlg .star.selected {
`;
              text += `   color: ${highlightcolor}; 
`;
              text += "} \n";
              text += `#${widgetID} .broadcastelement.selected {
`;
              text += `   color: ${highlightcolor}; 
`;
              text += `   background-color: ${this.visTvprogram.colorToRGBA(highlightcolor, ".1")}; 
`;
              text += "} \n";
              text += `#${widgetID} .broadcastimage {
`;
              text += `   height: ${heightrow - 7}px; 
`;
              text += "   padding-right: 3px; \n";
              text += "   float: left; \n";
              text += "} \n";
              text += `#${widgetID} .button {
`;
              text += "   display:inline-block; \n";
              text += `   width: ${heightrow}px; 
`;
              text += `   height: ${heightrow}px; 
`;
              text += `   background-color: ${backgroundColor}; 
`;
              text += "   vertical-align: middle; \n";
              text += "   padding: 5px 5px; \n";
              text += "} \n";
              text += `#${widgetID} .dateinfo {
`;
              text += `   height: ${heightrow}px; 
`;
              text += "   padding: 5px 5px; \n";
              text += "   position: absolute; \n";
              text += "   right: 0px; \n";
              text += "   border: 0px; \n";
              text += "} \n";
              text += `#${widgetID} .dateinfo:after {
`;
              text += '   content:""; \n';
              text += "   display: inline-block; \n";
              text += "   vertical-align:middle; \n";
              text += "   height: 100%; \n";
              text += "} \n";
              text += `#${widgetID} .dateinfo span {
`;
              text += "   vertical-align:middle; \n";
              text += "} \n";
              text += `.ui-dialog.${widgetID} {
`;
              text += "   z-index:12; \n";
              text += "} \n";
              text += ".clearfix {\n";
              text += "   clear:both; \n";
              text += '   content:""; \n';
              text += "   display:table; \n";
              text += "} \n";
              text += `#${widgetID}channeldlg .chselect-container {
`;
              text += "} \n";
              text += `#${widgetID}channeldlg .chselect-container .channel[selected]{
`;
              text += "   opacity: 1; \n";
              text += "} \n";
              text += `#${widgetID}channeldlg .chselect-container .channel{
`;
              text += "   opacity: 0.5; \n";
              text += "} \n";
              text += `#${widgetID}channeldlg .chselect-container .channel .btn {
`;
              text += "   opacity: 1; \n";
              text += "} \n";
              text += `#${widgetID}channeldlg ul.channel {
`;
              text += "   margin:0px; \n";
              text += "   padding:0px; \n";
              text += "} \n";
              text += `#${widgetID}channeldlg .listitem  {
`;
              text += "   float: left; \n";
              text += "} \n";
              text += `#${widgetID}channeldlg .listitem .channel {
`;
              text += "   list-style: none; \n";
              text += "} \n";
              text += `#${widgetID}channeldlg .items  {
`;
              text += "   list-style: none; \n";
              text += "   margin:0px; \n";
              text += "   padding:0px; \n";
              text += "} \n";
              text += `#${widgetID}channeldlg .channel {
`;
              text += "   margin:5px; \n";
              text += `   width: ${heightrow * 1.5}px; 
`;
              text += `   height: ${heightrow * 1.5}px; 
`;
              text += "   list-style: none; \n";
              text += "} \n";
              text += `#${widgetID}channeldlg .items .channel[selected] {
`;
              text += "   background-color:lightgray; \n";
              text += "} \n";
              text += `.${widgetID}.no-titlebar .ui-dialog-titlebar {
`;
              text += "   display:none; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg  {
`;
              text += "   z-index:12; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-container.tv-dlg-row {
`;
              text += "   height:100%; \n";
              text += "   display:flex; \n";
              text += "   flex-direction:row; \n";
              text += "   overflow:hidden; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-container.tv-dlg-col {
`;
              text += "   height:100%; \n";
              text += "   display:flex; \n";
              text += "   flex-direction:column; \n";
              text += "   overflow:hidden; \n";
              text += "   font-size:75%; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-picture.tv-dlg-row {
`;
              text += "   width:50%; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-picture.tv-dlg-col {
`;
              text += "   height:30%; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-data {
`;
              text += "   overflow-y:auto; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-picture img {
`;
              text += "   width:auto; \n";
              text += "   height:auto; \n";
              text += "   max-width:100%; \n";
              text += "   max-height:100%; \n";
              text += "   display:block; \n";
              text += "   margin:auto; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .event-picture img {
`;
              text += "   width:auto; \n";
              text += "   height:auto; \n";
              text += "   max-width:100%; \n";
              text += "   max-height:100%; \n";
              text += "   display:block; \n";
              text += "   margin:auto; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .dialogcolumn.tv-dlg-row {
`;
              text += "   flex:1; \n";
              text += "   padding:5px; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .dialogcolumn.tv-dlg-col {
`;
              text += "   padding:5px; \n";
              text += "} \n";
              text += `#${widgetID}broadcastdlg .button {
`;
              text += "   display:inline-block; \n";
              text += "   width: 35px; \n";
              text += "   height: 35px; \n";
              text += "   vertical-align: middle; \n";
              text += "   position: relative; \n";
              text += "   float: right; \n";
              text += "} \n";
              text += `#${widgetID} .tooltip {
`;
              text += "   position: relative; \n";
              text += "} \n";
              text += `#${widgetID} .tooltip span[role=tooltip] {
`;
              text += "   display: none; \n";
              text += "} \n";
              text += `#${widgetID} .tooltip:hover span[role=tooltip] {
`;
              text += "   display: block; \n";
              text += "   position: absolute; \n";
              text += "   left: 3em; \n";
              text += "   border: 1px solid; \n";
              text += "   font-size: 75%; \n";
              text += "   padding: 0.2em; \n";
              text += "   z-index: 100; \n";
              text += `   background-color: ${backgroundColor}; 
`;
              text += "} \n";
              text += `#${widgetID} .scrollcontainer ul.tv-row:nth-child(odd)> li.broadcast:nth-child(odd),#${widgetID} ul.tv-row:nth-child(odd)> li.time:nth-child(odd) {
`;
              text += "   background-color: rgba(128, 128, 128, 0.65); \n";
              text += "} \n";
              text += `#${widgetID} .scrollcontainer ul.tv-row:nth-child(odd)> li.broadcast:nth-child(even),#${widgetID} ul.tv-row:nth-child(odd)> li.time:nth-child(even) {
`;
              text += "   background-color: rgba(128, 128, 128, 0.55); \n";
              text += "} \n";
              text += `#${widgetID} .scrollcontainer ul.tv-row:nth-child(even)> li.broadcast:nth-child(odd) {
`;
              text += "   background-color: rgba(128, 128, 128, 0.45); \n";
              text += "} \n";
              text += `#${widgetID} .scrollcontainer ul.tv-row:nth-child(even)> li.broadcast:nth-child(even) {
`;
              text += "   background-color: rgba(128, 128, 128, 0.35); \n";
              text += "} \n";
              text += `#${widgetID} .line {
`;
              text += "   position: absolute; \n";
              text += "   top: 0; \n";
              text += "   width: 2px; \n";
              text += "   background-color: red; \n";
              text += "   opacity: 0.8; \n";
              text += "   z-index: 10; \n";
              text += `   height: ${lineheight}px; 
`;
              text += "   float: left; \n";
              text += "} \n";
              text += `#${widgetID} .disable-select {
`;
              text += "   -webkit-user-select: none; \n";
              text += "   -moz-user-select: none; \n";
              text += "   -ms-user-select: none; \n";
              text += "   -user-select: none; \n";
              text += "} \n";
              text += `#${widgetID} .staricon {
`;
              text += `     background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 24 24'><path fill='currentColor' d='M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z' /></svg>"); 
`;
              text += "} \n";
              text += "</style> \n";
              console.log("Output SVG");
              text += '  <div class="svgcontainer">';
              text += '<svg style="display:none;"><symbol id="star-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" /></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="check-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="cancel-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="copy-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" /></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="switch-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M21,3H3C1.89,3 1,3.89 1,5V17A2,2 0 0,0 3,19H8V21H16V19H21A2,2 0 0,0 23,17V5C23,3.89 22.1,3 21,3M21,17H3V5H21M16,11L9,15V7" /></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="burger-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"></path></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="nav-prevD-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M20,9V15H12V19.84L4.16,12L12,4.16V9H20Z" /></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="nav-center-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" /></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="nav-nextD-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z" /></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="zoom-minus-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5,14H14.71L14.43,13.73C15.41,12.59 16,11.11 16,9.5A6.5,6.5 0 0,0 9.5,3A6.5,6.5 0 0,0 3,9.5A6.5,6.5 0 0,0 9.5,16C11.11,16 12.59,15.41 13.73,14.43L14,14.71V15.5L19,20.5L20.5,19L15.5,14M9.5,14C7,14 5,12 5,9.5C5,7 7,5 9.5,5C12,5 14,7 14,9.5C14,12 12,14 9.5,14M7,9H12V10H7V9Z" /></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="zoom-center-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M19,19H15V21H19A2,2 0 0,0 21,19V15H19M19,3H15V5H19V9H21V5A2,2 0 0,0 19,3M5,5H9V3H5A2,2 0 0,0 3,5V9H5M5,15H3V19A2,2 0 0,0 5,21H9V19H5V15Z" /></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="zoom-plus-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z" /></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="record-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12.5,5A7.5,7.5 0 0,0 5,12.5A7.5,7.5 0 0,0 12.5,20A7.5,7.5 0 0,0 20,12.5A7.5,7.5 0 0,0 12.5,5M7,10H9A1,1 0 0,1 10,11V12C10,12.5 9.62,12.9 9.14,12.97L10.31,15H9.15L8,13V15H7M12,10H14V11H12V12H14V13H12V14H14V15H12A1,1 0 0,1 11,14V11A1,1 0 0,1 12,10M16,10H18V11H16V14H18V15H16A1,1 0 0,1 15,14V11A1,1 0 0,1 16,10M8,11V12H9V11" /></symbol></svg>';
              text += '<svg style="display:none;"><symbol id="hide-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z" /></symbol></svg>';
              text += "  </div>";
              console.log("Output Navigation");
              text += '  <div class="navcontainer">';
              text += '    <ul class="tv-row tv-head-top">';
              text += this.getButtonHeader(datestring).join("");
              text += "    </ul>";
              text += "  </div>";
              console.log("Output tvprogram");
              text += '  <div class="scrollcontainer">';
              text += '    <ul class="tv-row tv-head-time">';
              text += '      <div class="line"></div>';
              text += '      <li class="tv-item tv-head-left channel">';
              text += "      </li>";
              text += this.getTimetable().join("");
              text += "    </ul>";
              const events = this.getEvents(this.tvprogram[viewdate], channelfilter);
              events.map((el) => {
                text += '    <ul class="tv-row">';
                text += this.getBroadcasts4Channel(el, widgetID, view, viewdate, tvprogram_oid, instance).join("");
                text += "    </ul>";
              });
              $(`#${widgetID} .tv-container`).html(text);
              if (this.visTvprogram.getConfigShow(tvprogram_oid) == 1) {
                $(`#${widgetID} .broadcastelement:not(".selected") > *`).show();
              } else {
                $(`#${widgetID} .broadcastelement:not(".selected") > *`).hide();
              }
              console.log("Connect Buttone events");
              $(`#${widgetID} .burger`).click(
                function(widgetID2, tvprogram_oid2, instance2, el) {
                  vis.binds.tvprogram.time1.onclickChannel(widgetID2, instance2, tvprogram_oid2, el);
                }.bind(this, widgetID, tvprogram_oid, instance)
              );
              $(`#${widgetID} .button.nav.prevD`).off("click.onClickDay").on("click.onClickDay", this.onClickDay.bind(this, widgetID, view, data, style));
              $(`#${widgetID} .button.nav.nextD`).off("click.onClickDay").on("click.onClickDay", this.onClickDay.bind(this, widgetID, view, data, style));
              $(`#${widgetID} .button.nav.center`).off("click.onClickDay").on("click.onClickDay", this.onClickDay.bind(this, widgetID, view, data, style));
              $(`#${widgetID} .button.zoom.minus`).off("click.onClickZoom").on("click.onClickZoom", this.onClickZoom.bind(this, widgetID, view, data, style));
              $(`#${widgetID} .button.zoom.plus`).off("click.onClickZoom").on("click.onClickZoom", this.onClickZoom.bind(this, widgetID, view, data, style));
              $(`#${widgetID} .button.zoom.center`).off("click.onClickZoom").on("click.onClickZoom", this.onClickZoom.bind(this, widgetID, view, data, style));
              $(`#${widgetID} .button.hide`).off("click.onClickHide").on("click.onClickHide", this.onClickHide.bind(this, instance, tvprogram_oid, widgetID));
              $(`#${widgetID} .scrollcontainer`).scroll(
                function(widgetID2) {
                  if (this.scroll[widgetID2].automatic == 0) {
                    this.scroll[widgetID2].automatic = 2;
                  }
                  this.scroll[widgetID2].time = /* @__PURE__ */ new Date();
                  this.calcScroll(widgetID2);
                }.bind(this, widgetID)
              );
              this.visTvprogram.copyStyles("font", $(`#${widgetID}`).get(0), $(`#${widgetID}broadcastdlg`).get(0));
              this.visTvprogram.copyStyles("color", $(`#${widgetID}`).get(0), $(`#${widgetID}broadcastdlg`).get(0));
              this.visTvprogram.copyStyles(
                "background-color",
                $(`#${widgetID}`).get(0),
                $(`#${widgetID}broadcastdlg`).get(0)
              );
              this.updateMarker(widgetID, this.today[widgetID].today);
              if (!this.timer[widgetID]) {
                this.timer[widgetID] = setInterval(
                  this.updateMarker.bind(this, widgetID, this.today[widgetID].today),
                  15e3
                );
              } else {
                clearInterval(this.timer[widgetID]);
                this.timer[widgetID] = setInterval(
                  this.updateMarker.bind(this, widgetID, this.today[widgetID].today),
                  15e3
                );
              }
              if (this.scroll[widgetID].position == 0) {
                this.calcScroll(widgetID);
                this.setScroll(widgetID);
              } else {
                this.setScroll(widgetID);
              }
              console.log("Output done");
            });
          },
          onClickHide: function(instance, tvprogram) {
            this.visTvprogram.toggleShow(instance, tvprogram);
          },
          onClickZoom: function(widgetID, view, data, style, el) {
            if ($(el.currentTarget).hasClass("plus")) {
              this.measures[widgetID].widthItem = this.measures[widgetID].widthItem + this.measures[widgetID].origwidthItem / 4;
              console.log("Click Zoom plus");
            }
            if ($(el.currentTarget).hasClass("minus")) {
              this.measures[widgetID].widthItem = this.measures[widgetID].widthItem - this.measures[widgetID].origwidthItem / 4;
              console.log("Click Zoom minus");
            }
            if ($(el.currentTarget).hasClass("center")) {
              this.measures[widgetID].widthItem = this.measures[widgetID].origwidthItem;
              console.log("Click Zoom center");
            }
            if (this.measures[widgetID].widthItem < 20) {
              this.measures[widgetID].widthItem = this.measures[widgetID].origwidthItem;
              console.log("Click Zoom Max zoom reached, reset");
            }
            this.calcScroll(widgetID);
            this.createWidget(widgetID, view, data, style);
          },
          onClickDay: function(widgetID, view, data, style, el) {
            console.log(`ClickNav:${$(el.currentTarget).attr("class")}`);
            let day = 0;
            if ($(el.currentTarget).hasClass("prevD")) {
              day = -1;
            }
            if ($(el.currentTarget).hasClass("nextD")) {
              day = 1;
            }
            let newDate = dayjs(this.today[widgetID]["today"]).add(day, "day");
            let diffDate = dayjs(newDate).diff(dayjs(), "day");
            if (!$(el.currentTarget).hasClass("center")) {
              if (diffDate > -5 && diffDate < 5) {
                this.today[widgetID]["prevday"] = new Date(this.today[widgetID]["today"]);
                this.today[widgetID]["today"] = newDate.toDate();
                console.log(`Navigate to date: ${dayjs(newDate).format()}`);
              }
            } else {
              this.today[widgetID]["today"] = /* @__PURE__ */ new Date();
              this.scroll[widgetID].position = 0;
            }
            this.scroll[widgetID].time = /* @__PURE__ */ new Date(0);
            this.createWidget(widgetID, view, data, style);
          },
          calcScroll: function(widgetID) {
            const el = $(`#${widgetID} .scrollcontainer`).get(0);
            if (!el) {
              return;
            }
            if (el.scrollLeft == 0 || this.scroll[widgetID].position == 0) {
              this.scroll[widgetID].position = this.scroll[widgetID].marker / el.scrollWidth;
            } else {
              this.scroll[widgetID].position = (el.scrollLeft + el.clientWidth * this.measures[widgetID].markerpositionpercent) / el.scrollWidth;
            }
          },
          setScroll: function(widgetID) {
            try {
              const el = $(`#${widgetID} .scrollcontainer`).get(0);
              if (!el.scrollWidth) {
                return;
              }
              el.scrollLeft = this.scroll[widgetID].position * el.scrollWidth - el.clientWidth * this.measures[widgetID].markerpositionpercent;
            } catch (e) {
              console.log(e);
            }
          },
          updateMarker: function(widgetID, today) {
            if (this.scroll[widgetID].automatic == 2 && /* @__PURE__ */ new Date() - this.scroll[widgetID].time < 90 * 1e3) {
              return;
            }
            this.scroll[widgetID].automatic = 0;
            if (this.visTvprogram.calcDate(today).toLocaleDateString() != this.visTvprogram.calcDate(/* @__PURE__ */ new Date()).toLocaleDateString()) {
              $(`#${widgetID} .line`).hide();
            } else {
              $(`#${widgetID} .line`).show();
            }
            const wItem = this.measures[widgetID].widthItem;
            const tItem = this.measures[widgetID].timeItem;
            const wChannel = this.measures[widgetID].heightRow;
            const sTime = new Date(this.visTvprogram.calcDate(/* @__PURE__ */ new Date()));
            sTime.setHours(5);
            sTime.setMinutes(0);
            sTime.setSeconds(0);
            const eTime = new Date(sTime);
            eTime.setDate(eTime.getDate() + 1);
            const startTime = /* @__PURE__ */ new Date();
            const left = wChannel + Math.floor((startTime - sTime) / 6e4 / tItem * wItem * 10) / 10;
            $(`#${widgetID} .line`).css("left", `${left}px`);
            this.scroll[widgetID].marker = left;
            this.scroll[widgetID].position = 0;
            this.calcScroll(widgetID);
            if (this.scroll[widgetID].timeout) {
              clearTimeout(this.scroll[widgetID].timeout);
            }
            this.scroll[widgetID].automatic = 1;
            this.scroll[widgetID].timeout = window.setTimeout(
              function() {
                this.scroll[widgetID].automatic = 0;
                clearTimeout(this.scroll[widgetID].timeout);
                this.scroll[widgetID].timeout = null;
              }.bind(this),
              500
            );
            this.setScroll(widgetID);
          },
          getScrollbarWidth: function() {
            const scrollDiv = document.createElement("div");
            scrollDiv.className = "scrollbar-measure";
            scrollDiv.style.cssText = "width: 100px;height: 100px;overflow: scroll;position: absolute;top: -9999px;";
            document.body.appendChild(scrollDiv);
            const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            document.body.removeChild(scrollDiv);
            return scrollbarWidth;
          },
          getChannels: function(channels, filter = [], tvprogram_oid) {
            const cc = [];
            let logopath = vis.binds["tvprogram"].getOptChannelLogoPath(tvprogram_oid) || "https://tvfueralle.de/channel-logos/";
            filter.map((el) => {
              const ch = channels.find((el1) => el1.id == el);
              cc.push(
                `<li class="listitem channel" data-order="${ch.order}" data-id="${ch.id}" selected><img width="100%" height="100%" src="${logopath}${ch.channelId}.png" alt="" class="channel-logo"></li>`
              );
            });
            channels.sort(
              (a, b) => a.order + (filter.indexOf(a.id) == -1) * 1e5 - (b.order + (filter.indexOf(b.id) == -1) * 1e5)
            ).map((el) => {
              if (filter.findIndex((el1) => el1 == el.id) == -1) {
                cc.push(
                  `<li class="listitem channel" data-order="${el.order}" data-id="${el.id}"><img width="100%" height="100%" src="${logopath}${el.channelId}.png" alt="" class="channel-logo"></li>`
                );
              }
            });
            return cc;
          },
          onclickChannelSave: function(el, save2) {
            const widgetID = el.dataset.widgetid;
            if (save2) {
              const tvprogram_oid = el.dataset.dp || "";
              const instance = el.dataset.instance || "";
              this.visTvprogram.setConfigChannelfilter(
                instance,
                tvprogram_oid,
                $(`#${widgetID}channeldlg .chselect-container .channel[selected]`).toArray().map((el2) => parseInt(el2.dataset.id))
              );
            }
            let dialog = document.querySelector(`#${widgetID}channeldlg dialog`);
            dialog.close();
          },
          onclickChannel: function(widgetID, instance, tvprogram_oid) {
            let isSorting = false;
            const channels = this.visTvprogram.channels;
            let channelfilter = this.visTvprogram.getConfigChannelfilter(tvprogram_oid);
            if (channelfilter.length == 0) {
              channelfilter = channels.reduce((acc, el, i) => {
                if (i < 4) {
                  acc.push(el.id);
                }
                return acc;
              }, []);
            }
            let width = $(`#${widgetID}`).width() * this.measures[widgetID].dialogwidthpercent;
            let height = $(`#${widgetID}`).height() * this.measures[widgetID].dialogheightpercent;
            let { top: elTop, left: elLeft } = $(`#${widgetID}`).position();
            let top = elTop + ($(`#${widgetID}`).height() - height) / 2;
            let left = elLeft + ($(`#${widgetID}`).width() - width) / 2;
            let text = "";
            text += `<dialog class="${widgetID}broadcastdialog" style="margin:0;width:${width}px;height:${height}px;top:${top}px;left:${left}px">`;
            text += '  <div class="chselect-container clearfix">';
            text += `    <ul class="listitem channel" data-instance="${instance}" data-dp="${tvprogram_oid}" data-widgetid="${widgetID}" onclick="vis.binds.tvprogram.time1.onclickChannelSave(this,true)" ><li class="channel btn"><svg width="100%" height="100%" ><use xlink:href="#check-icon"></use></svg></li></ul>`;
            text += `    <ul class="listitem channel" data-widgetid="${widgetID}" onclick="vis.binds.tvprogram.time1.onclickChannelSave(this,false)"><li class="channel btn"><svg width="100%" height="100%" ><use xlink:href="#cancel-icon"></use></svg></li></ul>`;
            text += "  </div>";
            text += '  <div class="chselect-container clearfix sortable">';
            text += '  <ul class="items">';
            text += this.getChannels(channels, channelfilter, tvprogram_oid).join("\n");
            text += "  </ul>";
            text += "  </div>";
            $(`#${widgetID}channeldlg`).html(text);
            $(".chselect-container .items .channel").click(function() {
              console.log("channel click");
              if (isSorting) {
                return;
              }
              const target = $(this).parent().find("[selected]").last();
              if (this.dataset.id) {
                $(this).attr("selected") ? $(this).removeAttr("selected") : $(this).attr("selected", "");
              }
              if ($(this).attr("selected")) {
                $(this).insertAfter(target);
              } else {
                $(this).parent().children().sort(function(a, b) {
                  return a.dataset.order + ($(a).attr("selected") != "selected") * 1e5 - (b.dataset.order + ($(b).attr("selected") != "selected") * 1e5);
                }).appendTo($(this).parent());
              }
            });
            let grid = document.querySelector(".chselect-container.sortable .items");
            new sortable_esm_default(grid, {
              animation: 150,
              filter: "li:not([selected])",
              onMove: function(evt) {
                if (!evt.related.hasAttribute("selected")) {
                  return false;
                }
              }
            });
            this.visTvprogram.copyStyles("font", $(`#${widgetID}`).get(0), $(`#${widgetID}channeldlg`).get(0));
            this.visTvprogram.copyStyles("color", $(`#${widgetID}`).get(0), $(`#${widgetID}channeldlg`).get(0));
            this.visTvprogram.copyStyles(
              "background-color",
              $(`#${widgetID}`).get(0),
              $(`#${widgetID}channeldlg`).get(0)
            );
            let dialog = document.querySelector(`#${widgetID}channeldlg dialog`);
            dialog.showModal();
          },
          getBroadcasts4Channel: function(el, widgetID, view, viewdate, tvprogram_oid, instance) {
            const wItem = this.measures[widgetID].widthItem;
            const tItem = this.measures[widgetID].timeItem;
            const favorites = this.visTvprogram.getConfigFavorites(tvprogram_oid);
            let favhighlight;
            const sTime = new Date(el.events[0].airDate);
            sTime.setHours(5);
            sTime.setMinutes(0);
            const eTime = new Date(sTime);
            eTime.setDate(eTime.getDate() + 1);
            const channel = this.visTvprogram.channels.find((ch) => ch.id == el.channel);
            let logopath = this.visTvprogram.getOptChannelLogoPath(tvprogram_oid) || "https://tvfueralle.de/channel-logos/";
            const aa = [];
            let text = "";
            text += '    <li class="tv-item tv-head-left tv-head-background channel">';
            text += `      <img width="100%" height="100%" 
                data-instance="${instance}" 
                data-channelid="${channel.channelId}" 
                data-dp="${tvprogram_oid}" 
                src="${logopath}${channel.channelId}.png" 
                alt="" class="channel-logo"
                onclick="vis.binds.tvprogram.onclickChannelSwitch(this,event)">`;
            text += "    </li>";
            aa.push(text);
            for (let i = 0; i < el.events.length; i++) {
              const event = el.events[i];
              let startTime2 = new Date(event.startTime);
              let endTime2 = new Date(event.endTime);
              if (startTime2 >= eTime) {
                continue;
              }
              if (endTime2 <= sTime) {
                continue;
              }
              if (i == 0 && startTime2 > sTime) {
                aa.push(
                  `<li class="tv-item broadcast" style="left:0px; width:${Math.floor((startTime2 - sTime) / 6e4 / tItem * wItem * 10) / 10}px;"></li>`
                );
              }
              if (startTime2 < sTime) {
                startTime2 = sTime;
              }
              if (endTime2 > eTime) {
                endTime2 = eTime;
              }
              favhighlight = favorites.indexOf(event.title) > -1;
              text = "";
              text += '<li class="tv-item broadcast" style="';
              text += `left:${Math.floor((startTime2 - sTime) / 6e4 / tItem * wItem * 10) / 10}px;`;
              text += `width:${Math.floor((endTime2 - startTime2) / 6e4 / tItem * wItem * 10) / 10}px;">`;
              text += `<div class="broadcastelement ${favhighlight ? "selected" : ""}" data-widgetid="${widgetID}" data-eventid="${event.id}" data-viewdate="${viewdate}" data-instance="${instance}" data-dp="${tvprogram_oid}" data-view="${view}" onclick="vis.binds.tvprogram.onclickBroadcast(this)">`;
              if (event.photo.url && this.measures[widgetID].showpictures) {
                text += `<div><img class="broadcastimage" src="https://tvfueralle.de${event.photo.url}"></div>`;
              }
              text += `<div class="broadcasttitle">${event.title}`;
              text += `<div class="star" data-viewdate="${viewdate}" data-eventid="${event.id}" data-dp="${tvprogram_oid}" data-instance="${instance}" onclick="return vis.binds.tvprogram.onclickFavorite(this,event)"><svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg></div>`;
              text += "</div>";
              text += '<div class="broadcasttime">';
              text += `${`0${startTime2.getHours()}`.slice(-2)}:${`0${startTime2.getMinutes()}`.slice(-2)}`;
              text += " - ";
              text += `${`0${endTime2.getHours()}`.slice(-2)}:${`0${endTime2.getMinutes()}`.slice(-2)}`;
              text += "</div></div></li>";
              aa.push(text);
            }
            let startTime = new Date(el.events[el.events.length - 1].startTime);
            let endTime = new Date(el.events[el.events.length - 1].endTime);
            if (startTime < eTime && endTime < eTime) {
              startTime = endTime;
              endTime = eTime;
              text = "";
              text += '<li class="tv-item broadcast" style="';
              text += `left:${Math.floor((startTime - sTime) / 6e4 / tItem * wItem * 10) / 10}px;`;
              text += `width:${Math.floor((endTime - startTime) / 6e4 / tItem * wItem * 10) / 10}px;">`;
              text += "</li>";
              aa.push(text);
            }
            return aa;
          },
          getEvents: function(tvprogram, filter) {
            const tv = [];
            let i;
            tvprogram.map((el) => {
              if ((i = filter.indexOf(el.channel)) > -1) {
                if (!tv[i]) {
                  tv[i] = {};
                }
                if (!tv[i].events) {
                  tv[i].events = [];
                }
                tv[i].channel = el.channel;
                tv[i].events.push(el);
              }
            });
            return tv;
          },
          getTimetable: function() {
            const tt = [];
            for (let i = 0; i < 24; i++) {
              tt.push(`<li class="tv-item time"><span>${`0${i}`.slice(-2)}:00</span></li>`);
              tt.push(`<li class="tv-item time"><span>${`0${i}`.slice(-2)}:30</span></li>`);
            }
            return [].concat(tt.slice(10), tt.slice(0, 10));
          },
          getButtonHeader: function(datestring) {
            const hh = [];
            hh.push(
              '<li class="tv-item tv-head-topleft tv-head-left button burger tooltip"><span role="tooltip">Menu</span><svg width="100%" height="100%" ><use xlink:href="#burger-icon"></use></svg></li>'
            );
            hh.push(
              '<li class="tv-item button nav prevD tooltip"><span role="tooltip">Previous day</span><svg width="100%" height="100%" ><use xlink:href="#nav-prevD-icon"></use></svg></li>'
            );
            hh.push(
              '<li class="tv-item button nav center tooltip"><span role="tooltip">Today</span><svg width="100%" height="100%" ><use xlink:href="#nav-center-icon"></use></svg></li>'
            );
            hh.push(
              '<li class="tv-item button nav nextD tooltip"><span role="tooltip">Next day</span><svg width="100%" height="100%" ><use xlink:href="#nav-nextD-icon"></use></svg></li>'
            );
            hh.push(
              '<li class="tv-item button zoom minus tooltip"><span role="tooltip">Zoom in</span><svg width="100%" height="100%" ><use xlink:href="#zoom-minus-icon"></use></svg></li>'
            );
            hh.push(
              '<li class="tv-item button zoom center tooltip"><span role="tooltip">Zoom normal</span><svg width="100%" height="100%" ><use xlink:href="#zoom-center-icon"></use></svg></li>'
            );
            hh.push(
              '<li class="tv-item button zoom plus tooltip"><span role="tooltip">Zoom out</span><svg width="100%" height="100%" ><use xlink:href="#zoom-plus-icon"></use></svg></li>'
            );
            hh.push(
              '<li class="tv-item button hide tooltip"><span role="tooltip">Hide Non-Favorites</span><svg width="100%" height="100%" ><use xlink:href="#hide-icon"></use></svg></li>'
            );
            hh.push(
              `<li class="tv-item dateinfo">${new Date(datestring).toLocaleDateString(navigator.language, {
                weekday: "short"
              })}, ${new Date(datestring).toLocaleDateString()}</li>`
            );
            return hh;
          },
          onChange: function(widgetID, view, data, style, instance, e, newVal) {
            return __async(this, null, function* () {
              const dp = e.type.split(".");
              if ((dp[3] == "config" || dp[3] == "favorites" || dp[3] == "channelfilter" || dp[3] == "show") && dp[4] == "val") {
                console.log(`changed ${widgetID} type:${e.type} val:${newVal}`);
                this.createWidget(widgetID, view, data, style);
              }
              if (dp[3] == "cmd" && dp[4] == "val") {
                if (newVal && newVal != "") {
                  console.log(`changed ${widgetID} type:${e.type} val:${newVal}`);
                  const obj = newVal.split("|");
                  if (obj[0] == "new") {
                    if (obj[1] != "program") {
                      this[obj[1]] = yield this.visTvprogram.getServerDataAsync(instance, widgetID, obj[1]);
                      this.createWidget(widgetID, view, data, style);
                      return;
                    }
                    if (obj[1] == "program") {
                      if (this.tvprogram[obj[2]]) {
                        this.visTvprogram.loadProgram(
                          instance,
                          widgetID,
                          obj[2],
                          function(widgetID2, view2, data2, style2, datestring, serverdata) {
                            if (serverdata != "error" && serverdata != "nodata") {
                              this.tvprogram[datestring] = serverdata;
                              this.createWidget(widgetID2, view2, data2, style2);
                              return;
                            }
                          }.bind(this, widgetID, view, data, style, obj[2])
                        );
                      }
                    }
                  }
                }
              }
            });
          }
        },
        checkStyle: function(attr, str) {
          return str.split(";").reduce((acc, el) => el.split(":")[0].trim() == attr ? el.split(":")[1].trim() : acc, "");
        },
        realBackgroundColor: function(elem) {
          const transparent = "rgba(0, 0, 0, 0)";
          const transparentIE11 = "transparent";
          if (!elem) {
            return transparent;
          }
          const bg = window.getComputedStyle(elem).backgroundColor;
          if (bg === transparent || bg === transparentIE11) {
            return this.realBackgroundColor(elem.parentElement);
          }
          return bg;
        },
        onclickBroadcast: function(evt) {
          return __async(this, null, function* () {
            const el = evt.currentTarget ? evt.currentTarget : evt;
            const eventid = el.dataset.eventid || 0;
            const widgetID = el.dataset.widgetid || 0;
            const viewdate = el.dataset.viewdate || 0;
            const instance = el.dataset.instance || "";
            const tvprogram_oid = el.dataset.dp || "";
            if (eventid == 0 || widgetID == 0) {
              return;
            }
            const event = yield this.getServerBroadcastAsync(instance, eventid, viewdate);
            const measures = $(`#${widgetID}broadcastdlg`).data();
            const startTime = new Date(event.startTime);
            const endTime = new Date(event.endTime);
            const category = event.content.category ? this.categories.find((el2) => el2.id == event.content.category) : null;
            const channel = event.channel ? this.channels.find((el2) => el2.id == event.channel) : null;
            let channeltime = "";
            channeltime += channel ? `${channel.name} ` : "";
            channeltime += `${`0${startTime.getHours()}`.slice(-2)}:${`0${startTime.getMinutes()}`.slice(-2)}`;
            channeltime += " - ";
            channeltime += `${`0${endTime.getHours()}`.slice(-2)}:${`0${endTime.getMinutes()}`.slice(-2)}`;
            let meta = "";
            meta += event.content.country ? `${event.content.country} ` : "";
            meta += event.content.year ? `${event.content.year} ` : "";
            meta += category ? `${category.title} ` : "";
            let season = "", episode = "";
            if (event.content.seasonNumber) {
              season = event.content.seasonNumber;
              season = season < 100 ? `S${`0${season}`.slice(-2)}` : `S${season}`;
            }
            if (event.content.episodeNumber) {
              episode = event.content.episodeNumber;
              episode = episode < 100 ? `E${`0${episode}`.slice(-2)}` : `E${episode}`;
            }
            meta += season || episode ? `${season + episode} ` : "";
            const content = event.content.texts.Long.value ? event.content.texts.Long.value : event.content.texts.VeryShort.value ? event.content.texts.VeryShort.value : "";
            const photourl = event.photo.url ? `https://tvfueralle.de${event.photo.url}` : "https://tvfueralle.de/tv-logo-no-image.svg";
            const favorites = this.getConfigFavorites(tvprogram_oid);
            const favhighlight = favorites.indexOf(event.title) > -1;
            const layout = $(`#${widgetID}`).width() * measures.dialogwidthpercent > $(`#${widgetID}`).height() * measures.dialogheightpercent ? " tv-dlg-row" : " tv-dlg-col";
            let width = $(`#${widgetID}`).width() * measures.dialogwidthpercent;
            let height = $(`#${widgetID}`).height() * measures.dialogheightpercent;
            let { top: elTop, left: elLeft } = $(`#${widgetID}`).position();
            let top = elTop + ($(`#${widgetID}`).height() - height) / 2;
            let left = elLeft + ($(`#${widgetID}`).width() - width) / 2;
            let text = "";
            text += `<dialog class="${widgetID}broadcastdialog" style="margin:0;width:${width}px;height:${height}px;top:${top}px;left:${left}px">`;
            text += `  <div class="event-container${layout}" data-eventid="${event.id}">`;
            text += `    <div class="event-picture dialogcolumn${layout}">`;
            text += `    <img src="${photourl}">`;
            text += "    </div>";
            text += `    <div class="event-data dialogcolumn${layout}">`;
            text += '      <div class="buttoncontainer">';
            text += `          <div class="record button" 
                                data-viewdate="${viewdate}" 
                                data-eventid="${event.id}" 
                                data-instance="${instance}" 
                                data-dp="${tvprogram_oid}" 
                                onclick="return vis.binds.tvprogram.onclickRecord(this,event)">
                                <svg width="100%" height="100%" ><use xlink:href="#record-icon"></use></svg></div>`;
            text += `          <div class="copy button" 
                                data-widgetid="${widgetID}" 
                                onclick="return vis.binds.tvprogram.onclickCopy(this,event)">
                            <svg width="100%" height="100%" ><use xlink:href="#copy-icon"></use></svg></div>`;
            text += `          <div class="star button ${favhighlight ? "selected" : ""}" 
                                data-viewdate="${viewdate}" 
                                data-eventid="${event.id}" 
                                data-instance="${instance}" 
                                data-dp="${tvprogram_oid}" 
                                onclick="return vis.binds.tvprogram.onclickFavorite(this,event)">
                            <svg width="100%" height="100%" ><use xlink:href="#star-icon"></use></svg></div>`;
            if (startTime < /* @__PURE__ */ new Date() && /* @__PURE__ */ new Date() < endTime) {
              text += `        <div class="channelselect button" 
                                data-instance="${instance}" 
                                data-dp="${tvprogram_oid}" 
                                data-channelid="${channel.channelId}"
                                onclick="vis.binds.tvprogram.onclickChannelSwitch(this,event)">
                            <svg width="100%" height="100%" ><use xlink:href="#switch-icon"></use></svg></div>`;
            }
            text += "      </div>";
            text += `      <div style="padding: 0px 0px 5px;">${channeltime}</div>`;
            text += `      <div style="font-weight: bold;padding: 0px 0px 5px;">${event.title}</div>`;
            text += `      <div style="padding: 0px 0px 5px;">${meta}</div>`;
            text += `      <div>${content}</div>`;
            text += "    </div>";
            text += "  </div>";
            text += "  </div>";
            text += `</dialog">`;
            $(`#${widgetID}broadcastdlg`).html(text);
            this.copyStyles("font", $(`#${widgetID}`).get(0), $(`#${widgetID}broadcastdlg dialog`).get(0));
            this.copyStyles("color", $(`#${widgetID}`).get(0), $(`#${widgetID}broadcastdlg dialog`).get(0));
            this.copyStyles("background-color", $(`#${widgetID}`).get(0), $(`#${widgetID}broadcastdlg dialog`).get(0));
            let dialog = document.querySelector(`#${widgetID}broadcastdlg dialog`);
            $(`#${widgetID}broadcastdlg`).click(function() {
              dialog.close();
            });
            dialog.showModal();
          });
        },
        onclickRecord: function(el, evt) {
          return __async(this, null, function* () {
            const instance = el.dataset.instance || "";
            const tvprogram_oid = el.dataset.dp || "";
            const eventid = el.dataset.eventid || 0;
            const viewdate = el.dataset.viewdate || 0;
            if (eventid == 0 || viewdate == 0) {
              return;
            }
            evt.stopPropagation();
            const event = yield this.getServerBroadcastAsync(instance, eventid, viewdate);
            const channel = event.channel ? this.channels.find((el2) => el2.id == event.channel) : null;
            const record = {
              startTime: event.startTime,
              endTime: event.endTime,
              title: event.title,
              channel: event.channel,
              channelid: channel.channelId,
              channelname: channel.name,
              eventid: event.id
            };
            this.setValueAckAsync(instance, `${tvprogram_oid}.record`, JSON.stringify(record));
          });
        },
        onclickCopy: function(el, evt) {
          const widgetID = el.dataset.widgetid || "";
          const aux = document.createElement("textarea");
          aux.value = $(`#${widgetID}broadcastdlg .event-data`).get(0).outerText;
          document.body.appendChild(aux);
          aux.focus();
          aux.select();
          document.execCommand("copy");
          document.body.removeChild(aux);
          evt.stopPropagation();
        },
        copyStyles: function(startsWith, from, to) {
          const cssFrom = window.getComputedStyle(from);
          const cssTo = window.getComputedStyle(to);
          for (let i = cssFrom.length; i--; ) {
            if (cssFrom[i].startsWith(startsWith)) {
              if (cssFrom.getPropertyValue(cssFrom[i]) != cssTo.getPropertyValue(cssFrom[i])) {
                to.style.setProperty(cssFrom[i], cssFrom.getPropertyValue(cssFrom[i]));
              }
            }
          }
        },
        colorToRGBA: function(color, alpha = 1) {
          const cvs = document.createElement("canvas");
          cvs.height = 1;
          cvs.width = 1;
          const ctx = cvs.getContext("2d");
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, 1, 1);
          const carr = ctx.getImageData(0, 0, 1, 1).data;
          return `rgba(${carr[0]},${carr[1]},${carr[2]},${alpha})`;
        },
        onclickChannelSwitch: function(el, evt) {
          const channelid = el.dataset.channelid || "";
          const tvprogram_oid = el.dataset.dp || "";
          const instance = el.dataset.instance || "";
          this.setValueAckAsync(instance, `${tvprogram_oid}.selectchannel`, channelid);
          evt.stopPropagation();
        },
        onclickFavorite: function(el, evt) {
          return __async(this, null, function* () {
            const tvprogram_oid = el.dataset.dp || "";
            const instance = el.dataset.instance || "";
            const eventid = el.dataset.eventid || 0;
            const viewdate = el.dataset.viewdate || 0;
            evt.stopPropagation();
            if (eventid == 0 || viewdate == 0) {
              return;
            }
            const event = yield this.getServerBroadcastAsync(instance, eventid, viewdate);
            const favorites = this.getConfigFavorites(tvprogram_oid);
            const index2 = favorites.indexOf(event.title);
            if (index2 > -1) {
              favorites.splice(index2, 1);
              if ($(el).hasClass("button")) {
                $(el).removeClass("selected");
              }
            } else {
              favorites.push(event.title);
              if ($(el).hasClass("button")) {
                $(el).addClass("selected");
              }
            }
            this.setConfigFavorites(instance, tvprogram_oid, favorites);
          });
        },
        getConfig: function(tvprogram_oid) {
          let config;
          const attr = vis.states.attr(`${tvprogram_oid}.config.val`);
          if (typeof attr !== "undefined" && attr !== "null" && attr !== "") {
            config = JSON.parse(attr);
          } else {
            config = {};
          }
          return config;
        },
        getConfigFavorites: function(tvprogram_oid) {
          let favorites;
          const attr = vis.states.attr(`${tvprogram_oid}.favorites.val`);
          if (typeof attr !== "undefined" && attr !== "null" && attr !== "") {
            favorites = JSON.parse(attr);
          } else {
            favorites = [];
          }
          return favorites;
        },
        getOptChannelLogoPath: function(tvprogram_oid) {
          let logopath;
          const attr = vis.states.attr(`${tvprogram_oid}.optchnlogopath.val`);
          if (typeof attr !== "undefined" && attr !== "null" && attr !== "") {
            logopath = attr;
          } else {
            logopath = "";
          }
          return logopath;
        },
        setConfigFavorites: function(instance, tvprogram_oid, favorites) {
          this.setValueAckAsync(instance, `${tvprogram_oid}.favorites`, JSON.stringify(favorites));
        },
        getConfigChannelfilter: function(tvprogram_oid) {
          let channelfilter;
          const attr = vis.states.attr(`${tvprogram_oid}.channelfilter.val`);
          if (typeof attr !== "undefined" && attr !== "null" && attr !== "") {
            channelfilter = JSON.parse(attr);
          } else {
            channelfilter = [];
          }
          return channelfilter;
        },
        setConfigChannelfilter: function(instance, tvprogram_oid, channelfilter) {
          this.setValueAckAsync(instance, `${tvprogram_oid}.channelfilter`, JSON.stringify(channelfilter));
        },
        getConfigShow: function(tvprogram_oid) {
          let show;
          const attr = vis.states.attr(`${tvprogram_oid}.show.val`);
          if (typeof attr !== "undefined" && attr !== "null" && attr !== "") {
            show = JSON.parse(attr);
          } else {
            show = 1;
          }
          return show;
        },
        setConfigShow: function(instance, tvprogram_oid, show) {
          this.setValueAckAsync(instance, `${tvprogram_oid}.show`, JSON.stringify(show));
        },
        toggleShow: function(instance, tvprogram_oid) {
          let show = this.getConfigShow(tvprogram_oid);
          if (show == void 0) {
            show = 0;
          }
          show = show == 1 ? 0 : 1;
          this.setConfigShow(instance, tvprogram_oid, show);
        },
        getServerBroadcast: function(instance, eventid, viewdate, callback) {
          console.log(`getServerBroadcast request ${eventid}.${viewdate}`);
          vis.conn.sendTo(
            instance,
            "getServerBroadcast",
            { eventid, viewdate },
            function(data) {
              if (data != "error" && data != "nodata") {
                console.log(`getServerBroadcast received ok ${instance}.${viewdate}.${eventid}`);
              } else {
                console.log(`getServerBroadcast received ${data}`);
              }
              if (callback) {
                callback(data);
              }
            }.bind(this)
          );
        },
        getServerBroadcastAsync: function(instance, eventid, viewdate) {
          return __async(this, null, function* () {
            console.log(`getServerBroadcast request ${eventid}.${viewdate}`);
            return yield this.sendToAsync(instance, "getServerBroadcast", { eventid, viewdate });
          });
        },
        events: {},
        serverdata: {},
        getServerData: function(instance, widgetID, dataname, callback) {
          const dataid = instance + dataname;
          if (Object.prototype.hasOwnProperty.call(this.serverdata, dataid)) {
            callback(this.serverdata[dataid]);
          }
          if (!Object.prototype.hasOwnProperty.call(this.events, dataid)) {
            this.events[dataid] = [];
          }
          const obj = this.events[dataid];
          if (!obj.find((el) => el.key == widgetID)) {
            obj.push({ key: widgetID, cb: callback });
          }
          vis.conn.sendTo(instance, "getServerData", dataname, (data) => {
            if (data != "error" && data != "nodata") {
              console.log(`getServerData received ${instance}.${dataname} ${JSON.stringify(data).substring(0, 100)}`);
            } else {
              console.log(`getServerData received err ${data}`);
            }
            this.serverdata[dataid] = data;
            if (!Object.prototype.hasOwnProperty.call(this.events, dataid)) {
              return;
            }
            const obj2 = this.events[dataid];
            for (let i = 0; i < obj2.length; i++) {
              obj2[i].cb(data);
            }
            delete this.events[dataid];
          });
        },
        getServerDataAsync: function(instance, widgetID, dataname) {
          return __async(this, null, function* () {
            console.log(`getServerData ${dataname}`);
            const dataid = instance + dataname;
            if (!Object.prototype.hasOwnProperty.call(this.events, dataid)) {
              this.events[dataid] = [];
            }
            return yield this.sendToAsync(instance, "getServerData", dataname);
          });
        },
        getServerTVProgram: function(instance, widgetID, dataname, callback) {
          const name = `${instance}program.${dataname}`;
          if (Object.prototype.hasOwnProperty.call(this.serverdata, name)) {
            callback(this.serverdata[name]);
          }
          if (Object.prototype.hasOwnProperty.call(this.events, name)) {
            if (!this.events[name].find((el) => el.key == widgetID)) {
              this.events[name].push({ key: widgetID, cb: callback });
            }
            return;
          }
          this.events[name] = [{ key: widgetID, cb: callback }];
          vis.conn.sendTo(
            instance,
            "getServerTVProgram",
            dataname,
            function(data) {
              if (data != "error" && data != "nodata") {
                console.log(`getServerTVProgram received ${instance}.${dataname}nodata`);
              } else {
                console.log(`getServerTVProgram received ${instance}.${dataname} ok`);
                this.serverdata[name] = data;
              }
              if (!Object.prototype.hasOwnProperty.call(this.events, name)) {
                return;
              }
              for (let i = 0; i < this.events[name].length; i++) {
                this.events[name][i].cb(data);
              }
              delete this.events[name];
            }.bind(this)
          );
        },
        getServerTVProgramAsync: function(instance, widgetID, dataname) {
          return __async(this, null, function* () {
            console.log(`getServerTVProgram ${dataname}`);
            return yield this.sendToAsync(instance, "getServerTVProgram", dataname);
          });
        },
        getFavoritesData: function(instance, favorites = [], callback) {
          console.log(`getFavoritesData request ${instance}.favorites`);
          vis.conn.sendTo(instance, "getFavoritesData", favorites, (data) => {
            if (data != "error" && data != "nodata") {
              console.log(`getFavoritesData received ok ${data.length}`);
            } else {
              console.log(`getFavoritesData received ${instance}.favorites`);
            }
            if (callback) {
              callback(data);
            }
          });
        },
        getFavoritesDataAsync: function(_0) {
          return __async(this, arguments, function* (instance, favorites = []) {
            console.log(`getFavoritesData request ${instance}.favorites`);
            return yield this.sendToAsync(instance, "getFavoritesData", favorites);
          });
        },
        getServerInfo: function(instance, callback) {
          console.log("getServerInfo request ");
          vis.conn.sendTo(instance, "getServerInfo", {}, (data) => {
            console.log("getServerInfo received ok ");
            if (callback) {
              callback(data);
            }
          });
        },
        getServerInfoAsync: function(instance) {
          return __async(this, null, function* () {
            console.log("getServerInfo request ");
            return yield this.sendToAsync(instance, "getServerInfo", {});
          });
        },
        getServerBroadcastNow: function(instance, channelfilter, callback) {
          console.log("getServerBroadcastNow request ");
          vis.conn.sendTo(
            instance,
            "getServerBroadcastNow",
            channelfilter,
            function(data) {
              if (data != "error" && data != "nodata") {
                console.log(`getServerBroadcastNow received ok ${data.length}`);
              } else {
                console.log("getServerBroadcastNow received ");
              }
              if (callback) {
                callback(data);
              }
            }.bind(this)
          );
        },
        getServerBroadcastNowAsync: function(instance, channelfilter) {
          return __async(this, null, function* () {
            console.log("getServerBroadcastNow request ");
            return yield this.sendToAsync(instance, "getServerBroadcastNow", channelfilter);
          });
        },
        getServerBroadcastRangeAsync: function(instance, channelfilter, startdate, enddate) {
          return __async(this, null, function* () {
            console.log("getServerBroadcastRange request ");
            return yield this.sendToAsync(instance, "getServerBroadcastRange", { channelfilter, startdate, enddate });
          });
        },
        getServerBroadcastDate: function(instance, channelfilter, date, callback) {
          console.log("getServerBroadcastDate request ");
          vis.conn.sendTo(
            instance,
            "getServerBroadcastDate",
            { channelfilter, date },
            function(data) {
              if (data != "error" && data != "nodata") {
                console.log(`getServerBroadcastDate received ok ${data.length}`);
              } else {
                console.error(`getServerBroadcastDate received ${data}`);
              }
              if (callback) {
                callback(data);
              }
            }.bind(this)
          );
        },
        getServerBroadcastDateAsync: function(instance, channelfilter, date) {
          return __async(this, null, function* () {
            console.log("getServerBroadcastDate request ");
            return yield this.sendToAsync(instance, "getServerBroadcastDate", { channelfilter, date });
          });
        },
        getServerBroadcastFind: function(instance, obj, callback) {
          console.log("getServerBroadcastFind request ");
          vis.conn.sendTo(
            instance,
            "getServerBroadcastFind",
            obj,
            function(data) {
              if (data != "error" && data != "nodata") {
                console.log(`getServerBroadcastFind received ok ${data.length}`);
              } else {
                console.log("getServerBroadcastFind received ");
              }
              const serverdata = [];
              data.map((ch) => {
                ch.events.map((event) => serverdata.push(event));
              });
              data = serverdata.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
              if (callback) {
                callback(data);
              }
            }.bind(this)
          );
        },
        getServerBroadcastFindAsync: function(instance, obj) {
          return __async(this, null, function* () {
            console.log("getServerBroadcastFind request ");
            let data = yield this.sendToAsync(instance, "getServerBroadcastFind", obj);
            const serverdata = [];
            data.map((ch) => {
              ch.events.map((event) => serverdata.push(event));
            });
            data = serverdata.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            return data;
          });
        },
        setValueAck: function(instance, id, value) {
          console.log("setValueAck request ");
          vis.conn.sendTo(instance, "setValueAck", { id, value });
        },
        setValueAckAsync: function(instance, id, value) {
          return __async(this, null, function* () {
            console.log("setValueAck request ");
            return yield this.sendToAsync(instance, "setValueAck", { id, value });
          });
        },
        sendToAsync: function(instance, command, sendData) {
          return __async(this, null, function* () {
            console.log(`sendToAsync ${command} ${sendData}`);
            return new Promise((resolve, reject) => {
              try {
                vis.conn.sendTo(instance, command, sendData, function(receiveData) {
                  resolve(receiveData);
                });
              } catch (error) {
                reject(error);
              }
            });
          });
        },
        loadServerInfosAsync: function(instance) {
          return __async(this, null, function* () {
            this.infos = [];
            return yield this.getServerInfoAsync(instance);
          });
        },
        loadCategories: function(instance, widgetID) {
          return __async(this, null, function* () {
            console.log("loadCategories");
            return yield this.getServerDataAsync(instance, widgetID, "categories");
          });
        },
        loadChannels: function(instance, widgetID) {
          return __async(this, null, function* () {
            console.log("loadChannels");
            return yield this.getServerDataAsync(instance, widgetID, "channels");
          });
        },
        loadGenres: function(instance, widgetID) {
          return __async(this, null, function* () {
            console.log("loadGenres");
            return yield this.getServerDataAsync(instance, widgetID, "genres");
          });
        },
        loadProgram: function(instance, widgetID, datestring) {
          return __async(this, null, function* () {
            console.log(`loadProgram ${datestring}`);
            return yield this.getServerTVProgramAsync(instance, widgetID, datestring);
          });
        },
        calcDate: function(datum) {
          const d = new Date(datum);
          const time = d.getHours() + d.getMinutes() / 60;
          if (time >= 0 && time < 5) {
            d.setDate(d.getDate() - 1);
          }
          return d;
        },
        getDate: function(d, add) {
          const d1 = new Date(d);
          d1.setDate(d1.getDate() + add);
          return `${d1.getFullYear()}-${`0${d1.getMonth() + 1}`.slice(-2)}-${`0${d1.getDate()}`.slice(-2)}`;
        },
        compareDate: function(adate, bdate) {
          return adate.getDate() == bdate.getDate() && adate.getMonth() == bdate.getMonth() && adate.getYear() == bdate.getYear();
        },
        getTvprogramId: function(tvprogram_oid) {
          let idParts = tvprogram_oid.split(".");
          if (idParts.length < 2) {
            return "";
          }
          idParts = idParts.slice(0, 3);
          return idParts.join(".");
        },
        getInstance: function(tvprogram_oid) {
          let idParts = tvprogram_oid.split(".");
          if (idParts.length < 2) {
            return "";
          }
          idParts = idParts.slice(0, 2);
          return idParts.join(".");
        },
        getInstanceInfo: function(tvprogram_oid) {
          console.log("getInstanceInfo");
          let idParts = tvprogram_oid.trim().split(".");
          if (idParts.length < 2) {
            return [null, null];
          }
          return [
            idParts.slice(0, 2).join("."),
            // instance
            idParts.slice(0, 3).join(".")
            // tvprogram id
          ];
        },
        bindStates: function(elem, bound, change_callback) {
          console.log("bindStates");
          const $div = $(elem);
          const boundstates = $div.data("bound");
          if (boundstates) {
            for (let i = 0; i < boundstates.length; i++) {
              vis.states.unbind(boundstates[i], change_callback);
            }
          }
          $div.data("bound", null);
          $div.data("bindHandler", null);
          vis.conn.gettingStates = 0;
          vis.conn.getStates(
            bound,
            function(error, states) {
              vis.conn.subscribe(bound);
              for (let i = 0; i < bound.length; i++) {
                bound[i] = `${bound[i]}.val`;
                vis.states.bind(bound[i], change_callback);
              }
              vis.binds["tvprogram"].updateStates(states);
              $div.data("bound", bound);
              $div.data("bindHandler", change_callback);
            }.bind({ change_callback })
          );
        },
        updateStates: function(states) {
          for (const id in states) {
            if (!Object.prototype.hasOwnProperty.call(states, id)) {
              continue;
            }
            const obj = states[id];
            try {
              if (vis.editMode) {
                vis.states[`${id}.val`] = obj.val;
                vis.states[`${id}.ts`] = obj.ts;
                vis.states[`${id}.ack`] = obj.ack;
                vis.states[`${id}.lc`] = obj.lc;
                if (obj.q !== void 0 && obj.q !== null) {
                  vis.states[`${id}.q`] = obj.q;
                }
              } else {
                const oo = {};
                oo[`${id}.val`] = obj.val;
                oo[`${id}.ts`] = obj.ts;
                oo[`${id}.ack`] = obj.ack;
                oo[`${id}.lc`] = obj.lc;
                if (obj.q !== void 0 && obj.q !== null) {
                  oo[`${id}.q`] = obj.q;
                }
                vis.states.attr(oo);
              }
            } catch (e) {
              console.error(`Error: can't create states object for ${id}(${e})`);
            }
          }
        }
      };
      vis.binds["tvprogram"].showVersion();
      jQuery.fn.mydelay = function(time, type) {
        time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
        type = type || "fx";
        return this.queue(type, function(next, hooks) {
          const timeout = window.setTimeout(next, time);
          hooks.stop = function() {
            window.clearTimeout(timeout);
          };
        });
      };
    }
  });
  require_tvprogram();
})();
/*! Bundled license information:

sortablejs/modular/sortable.esm.js:
  (**!
   * Sortable 1.15.6
   * @author	RubaXa   <trash@rubaxa.org>
   * @author	owenm    <owen23355@gmail.com>
   * @license MIT
   *)
*/
//# sourceMappingURL=tvprogram-dist.js.map
