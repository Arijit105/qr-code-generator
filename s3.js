! function(global, factory) {
	"use strict";
	"object" != typeof module || "object" != typeof module.exports ? factory(global) : module.exports = global.document ? factory(global) : function(win) {
		if (!win.document) throw new Error("jscolor needs a window with document");
		return factory(win)
	}
}("undefined" != typeof window ? window : this, (function(window) {
	"use strict";
	var jscolor = ((jsc = {
			initialized: !1,
			instances: [],
			triggerQueue: [],
			register: function() {
				void 0 !== window && window.document && window.document.addEventListener("DOMContentLoaded", jsc.pub.init, !1)
			},
			installBySelector: function(selector, rootNode) {
				if (!(rootNode = rootNode ? jsc.node(rootNode) : window.document)) throw new Error("Missing root node");
				for (var elms = rootNode.querySelectorAll(selector), matchClass = new RegExp("(^|\\s)(" + jsc.pub.lookupClass + ")(\\s*(\\{[^}]*\\})|\\s|$)", "i"), i = 0; i < elms.length; i += 1) {
					var dataOpts, m;
					if (!(elms[i].jscolor && elms[i].jscolor instanceof jsc.pub) && (void 0 === elms[i].type || "color" != elms[i].type.toLowerCase() || !jsc.isColorAttrSupported) && (null !== (dataOpts = jsc.getDataAttr(elms[i], "jscolor")) || elms[i].className && (m = elms[i].className.match(matchClass)))) {
						var targetElm = elms[i],
							optsStr = "";
						null !== dataOpts ? optsStr = dataOpts : m && (console.warn('Installation using class name is DEPRECATED. Use data-jscolor="" attribute instead.' + jsc.docsRef), m[4] && (optsStr = m[4]));
						var opts = null;
						if (optsStr.trim()) try {
							opts = jsc.parseOptionsStr(optsStr)
						} catch (e) {
							console.warn(e + "\n" + optsStr)
						}
						try {
							new jsc.pub(targetElm, opts)
						} catch (e) {
							console.warn(e)
						}
					}
				}
			},
			parseOptionsStr: function(str) {
				var opts = null;
				try {
					opts = JSON.parse(str)
				} catch (eParse) {
					if (!jsc.pub.looseJSON) throw new Error("Could not parse jscolor options as JSON: " + eParse);
					try {
						opts = new Function("var opts = (" + str + '); return typeof opts === "object" ? opts : {};')()
					} catch (eEval) {
						throw new Error("Could not evaluate jscolor options: " + eEval)
					}
				}
				return opts
			},
			getInstances: function() {
				for (var inst = [], i = 0; i < jsc.instances.length; i += 1) jsc.instances[i] && jsc.instances[i].targetElement && inst.push(jsc.instances[i]);
				return inst
			},
			createEl: function(tagName) {
				var el = window.document.createElement(tagName);
				return jsc.setData(el, "gui", !0), el
			},
			node: function(nodeOrSelector) {
				if (!nodeOrSelector) return null;
				if ("string" == typeof nodeOrSelector) {
					var sel = nodeOrSelector,
						el = null;
					try {
						el = window.document.querySelector(sel)
					} catch (e) {
						return console.warn(e), null
					}
					return el || console.warn("No element matches the selector: %s", sel), el
				}
				return jsc.isNode(nodeOrSelector) ? nodeOrSelector : (console.warn("Invalid node of type %s: %s", typeof nodeOrSelector, nodeOrSelector), null)
			},
			isNode: function(val) {
				return "object" == typeof Node ? val instanceof Node : val && "object" == typeof val && "number" == typeof val.nodeType && "string" == typeof val.nodeName
			},
			nodeName: function(node) {
				return !(!node || !node.nodeName) && node.nodeName.toLowerCase()
			},
			removeChildren: function(node) {
				for (; node.firstChild;) node.removeChild(node.firstChild)
			},
			isTextInput: function(el) {
				return el && "input" === jsc.nodeName(el) && "text" === el.type.toLowerCase()
			},
			isButton: function(el) {
				if (!el) return !1;
				var n = jsc.nodeName(el);
				return "button" === n || "input" === n && ["button", "submit", "reset"].indexOf(el.type.toLowerCase()) > -1
			},
			isButtonEmpty: function(el) {
				switch (jsc.nodeName(el)) {
					case "input":
						return !el.value || "" === el.value.trim();
					case "button":
						return "" === el.textContent.trim()
				}
				return null
			},
			isPassiveEventSupported: function() {
				var supported = !1;
				try {
					var opts = Object.defineProperty({}, "passive", {
						get: function() {
							supported = !0
						}
					});
					window.addEventListener("testPassive", null, opts), window.removeEventListener("testPassive", null, opts)
				} catch (e) {}
				return supported
			}(),
			isColorAttrSupported: (elm = window.document.createElement("input"), !(!elm.setAttribute || (elm.setAttribute("type", "color"), "color" != elm.type.toLowerCase()))),
			dataProp: "_data_jscolor",
			setData: function() {
				var obj = arguments[0];
				if (3 === arguments.length) {
					var data = obj.hasOwnProperty(jsc.dataProp) ? obj[jsc.dataProp] : obj[jsc.dataProp] = {},
						prop = arguments[1],
						value = arguments[2];
					return data[prop] = value, !0
				}
				if (2 === arguments.length && "object" == typeof arguments[1]) {
					var data = obj.hasOwnProperty(jsc.dataProp) ? obj[jsc.dataProp] : obj[jsc.dataProp] = {},
						map = arguments[1];
					for (var prop in map) map.hasOwnProperty(prop) && (data[prop] = map[prop]);
					return !0
				}
				throw new Error("Invalid arguments")
			},
			removeData: function() {
				var obj = arguments[0];
				if (!obj.hasOwnProperty(jsc.dataProp)) return !0;
				for (var i = 1; i < arguments.length; i += 1) {
					var prop = arguments[i];
					delete obj[jsc.dataProp][prop]
				}
				return !0
			},
			getData: function(obj, prop, setDefault) {
				if (!obj.hasOwnProperty(jsc.dataProp)) {
					if (void 0 === setDefault) return;
					obj[jsc.dataProp] = {}
				}
				var data = obj[jsc.dataProp];
				return data.hasOwnProperty(prop) || void 0 === setDefault || (data[prop] = setDefault), data[prop]
			},
			getDataAttr: function(el, name) {
				var attrName = "data-" + name,
					attrValue;
				return el.getAttribute(attrName)
			},
			_attachedGroupEvents: {},
			attachGroupEvent: function(groupName, el, evnt, func) {
				jsc._attachedGroupEvents.hasOwnProperty(groupName) || (jsc._attachedGroupEvents[groupName] = []), jsc._attachedGroupEvents[groupName].push([el, evnt, func]), el.addEventListener(evnt, func, !1)
			},
			detachGroupEvents: function(groupName) {
				if (jsc._attachedGroupEvents.hasOwnProperty(groupName)) {
					for (var i = 0; i < jsc._attachedGroupEvents[groupName].length; i += 1) {
						var evt = jsc._attachedGroupEvents[groupName][i];
						evt[0].removeEventListener(evt[1], evt[2], !1)
					}
					delete jsc._attachedGroupEvents[groupName]
				}
			},
			preventDefault: function(e) {
				e.preventDefault && e.preventDefault(), e.returnValue = !1
			},
			captureTarget: function(target) {
				target.setCapture && (jsc._capturedTarget = target, jsc._capturedTarget.setCapture())
			},
			releaseTarget: function() {
				jsc._capturedTarget && (jsc._capturedTarget.releaseCapture(), jsc._capturedTarget = null)
			},
			triggerEvent: function(el, eventName, bubbles, cancelable) {
				if (el) {
					var ev = null;
					return "function" == typeof Event ? ev = new Event(eventName, {
						bubbles: bubbles,
						cancelable: cancelable
					}) : (ev = window.document.createEvent("Event")).initEvent(eventName, bubbles, cancelable), !!ev && (jsc.setData(ev, "internal", !0), el.dispatchEvent(ev), !0)
				}
			},
			triggerInputEvent: function(el, eventName, bubbles, cancelable) {
				el && jsc.isTextInput(el) && jsc.triggerEvent(el, eventName, bubbles, cancelable)
			},
			eventKey: function(ev) {
				var keys = {
					9: "Tab",
					13: "Enter",
					27: "Escape"
				};
				return "string" == typeof ev.code ? ev.code : void 0 !== ev.keyCode && keys.hasOwnProperty(ev.keyCode) ? keys[ev.keyCode] : null
			},
			strList: function(str) {
				return str ? str.replace(/^\s+|\s+$/g, "").split(/\s+/) : []
			},
			hasClass: function(elm, className) {
				return !!className && (void 0 !== elm.classList ? elm.classList.contains(className) : -1 != (" " + elm.className.replace(/\s+/g, " ") + " ").indexOf(" " + className + " "))
			},
			addClass: function(elm, className) {
				var classNames = jsc.strList(className);
				if (void 0 === elm.classList)
					for (var i = 0; i < classNames.length; i += 1) jsc.hasClass(elm, classNames[i]) || (elm.className += (elm.className ? " " : "") + classNames[i]);
				else
					for (var i = 0; i < classNames.length; i += 1) elm.classList.add(classNames[i])
			},
			removeClass: function(elm, className) {
				var classNames = jsc.strList(className);
				if (void 0 === elm.classList)
					for (var i = 0; i < classNames.length; i += 1) {
						var repl = new RegExp("^\\s*" + classNames[i] + "\\s*|\\s*" + classNames[i] + "\\s*$|\\s+" + classNames[i] + "(\\s+)", "g");
						elm.className = elm.className.replace(repl, "$1")
					} else
						for (var i = 0; i < classNames.length; i += 1) elm.classList.remove(classNames[i])
			},
			getCompStyle: function(elm) {
				var compStyle = window.getComputedStyle ? window.getComputedStyle(elm) : elm.currentStyle;
				return compStyle || {}
			},
			setStyle: function(elm, styles, important, reversible) {
				var priority = important ? "important" : "",
					origStyle = null;
				for (var prop in styles)
					if (styles.hasOwnProperty(prop)) {
						var setVal = null;
						null === styles[prop] ? (origStyle || (origStyle = jsc.getData(elm, "origStyle")), origStyle && origStyle.hasOwnProperty(prop) && (setVal = origStyle[prop])) : (reversible && (origStyle || (origStyle = jsc.getData(elm, "origStyle", {})), origStyle.hasOwnProperty(prop) || (origStyle[prop] = elm.style[prop])), setVal = styles[prop]), null !== setVal && elm.style.setProperty(prop, setVal, priority)
					}
			},
			linearGradient: function() {
				function getFuncName() {
					for (var stdName = "linear-gradient", prefixes = ["", "-webkit-", "-moz-", "-o-", "-ms-"], helper = window.document.createElement("div"), i = 0; i < prefixes.length; i += 1) {
						var tryFunc = prefixes[i] + stdName,
							tryVal = tryFunc + "(to right, rgba(0,0,0,0), rgba(0,0,0,0))";
						if (helper.style.background = tryVal, helper.style.background) return tryFunc
					}
					return stdName
				}
				var funcName = getFuncName();
				return function() {
					return funcName + "(" + Array.prototype.join.call(arguments, ", ") + ")"
				}
			}(),
			setBorderRadius: function(elm, value) {
				jsc.setStyle(elm, {
					"border-radius": value || "0"
				})
			},
			setBoxShadow: function(elm, value) {
				jsc.setStyle(elm, {
					"box-shadow": value || "none"
				})
			},
			getElementPos: function(e, relativeToViewport) {
				var x = 0,
					y = 0,
					rect = e.getBoundingClientRect();
				if (x = rect.left, y = rect.top, !relativeToViewport) {
					var viewPos = jsc.getViewPos();
					x += viewPos[0], y += viewPos[1]
				}
				return [x, y]
			},
			getElementSize: function(e) {
				return [e.offsetWidth, e.offsetHeight]
			},
			getAbsPointerPos: function(e) {
				var x = 0,
					y = 0;
				return void 0 !== e.changedTouches && e.changedTouches.length ? (x = e.changedTouches[0].clientX, y = e.changedTouches[0].clientY) : "number" == typeof e.clientX && (x = e.clientX, y = e.clientY), {
					x: x,
					y: y
				}
			},
			getRelPointerPos: function(e) {
				var target, targetRect = (e.target || e.srcElement).getBoundingClientRect(),
					x = 0,
					y = 0,
					clientX = 0,
					clientY = 0;
				return void 0 !== e.changedTouches && e.changedTouches.length ? (clientX = e.changedTouches[0].clientX, clientY = e.changedTouches[0].clientY) : "number" == typeof e.clientX && (clientX = e.clientX, clientY = e.clientY), {
					x: x = clientX - targetRect.left,
					y: y = clientY - targetRect.top
				}
			},
			getViewPos: function() {
				var doc = window.document.documentElement;
				return [(window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0), (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)]
			},
			getViewSize: function() {
				var doc = window.document.documentElement;
				return [window.innerWidth || doc.clientWidth, window.innerHeight || doc.clientHeight]
			},
			RGB_HSV: function(r, g, b) {
				r /= 255, g /= 255, b /= 255;
				var n = Math.min(Math.min(r, g), b),
					v = Math.max(Math.max(r, g), b),
					m = v - n;
				if (0 === m) return [null, 0, 100 * v];
				var h = r === n ? 3 + (b - g) / m : g === n ? 5 + (r - b) / m : 1 + (g - r) / m;
				return [60 * (6 === h ? 0 : h), m / v * 100, 100 * v]
			},
			HSV_RGB: function(h, s, v) {
				var u = v / 100 * 255;
				if (null === h) return [u, u, u];
				h /= 60, s /= 100;
				var i = Math.floor(h),
					f, m = u * (1 - s),
					n = u * (1 - s * (i % 2 ? h - i : 1 - (h - i)));
				switch (i) {
					case 6:
					case 0:
						return [u, n, m];
					case 1:
						return [n, u, m];
					case 2:
						return [m, u, n];
					case 3:
						return [m, n, u];
					case 4:
						return [n, m, u];
					case 5:
						return [u, m, n]
				}
			},
			parseColorString: function(str) {
				var ret = {
						rgba: null,
						format: null
					},
					m;
				if (m = str.match(/^\W*([0-9A-F]{3}([0-9A-F]{3})?)\W*$/i)) return ret.format = "hex", 6 === m[1].length ? ret.rgba = [parseInt(m[1].substr(0, 2), 16), parseInt(m[1].substr(2, 2), 16), parseInt(m[1].substr(4, 2), 16), null] : ret.rgba = [parseInt(m[1].charAt(0) + m[1].charAt(0), 16), parseInt(m[1].charAt(1) + m[1].charAt(1), 16), parseInt(m[1].charAt(2) + m[1].charAt(2), 16), null], ret;
				if (m = str.match(/^\W*rgba?\(([^)]*)\)\W*$/i)) {
					var params = m[1].split(","),
						re = /^\s*(\d+|\d*\.\d+|\d+\.\d*)\s*$/,
						mR, mG, mB, mA;
					if (params.length >= 3 && (mR = params[0].match(re)) && (mG = params[1].match(re)) && (mB = params[2].match(re))) return ret.format = "rgb", ret.rgba = [parseFloat(mR[1]) || 0, parseFloat(mG[1]) || 0, parseFloat(mB[1]) || 0, null], params.length >= 4 && (mA = params[3].match(re)) && (ret.format = "rgba", ret.rgba[3] = parseFloat(mA[1]) || 0), ret
				}
				return !1
			},
			scaleCanvasForHighDPR: function(canvas) {
				var dpr = window.devicePixelRatio || 1,
					ctx;
				canvas.width *= dpr, canvas.height *= dpr, canvas.getContext("2d").scale(dpr, dpr)
			},
			genColorPreviewCanvas: function(color, separatorPos, specWidth, scaleForHighDPR) {
				var sepW = Math.round(jsc.pub.previewSeparator.length),
					sqSize = jsc.pub.chessboardSize,
					sqColor1 = jsc.pub.chessboardColor1,
					sqColor2 = jsc.pub.chessboardColor2,
					cWidth = specWidth || 2 * sqSize,
					cHeight = 2 * sqSize,
					canvas = jsc.createEl("canvas"),
					ctx = canvas.getContext("2d");
				canvas.width = cWidth, canvas.height = cHeight, scaleForHighDPR && jsc.scaleCanvasForHighDPR(canvas), ctx.fillStyle = sqColor1, ctx.fillRect(0, 0, cWidth, cHeight), ctx.fillStyle = sqColor2;
				for (var x = 0; x < cWidth; x += 2 * sqSize) ctx.fillRect(x, 0, sqSize, sqSize), ctx.fillRect(x + sqSize, sqSize, sqSize, sqSize);
				color && (ctx.fillStyle = color, ctx.fillRect(0, 0, cWidth, cHeight));
				var start = null;
				switch (separatorPos) {
					case "left":
						start = 0, ctx.clearRect(0, 0, sepW / 2, cHeight);
						break;
					case "right":
						start = cWidth - sepW, ctx.clearRect(cWidth - sepW / 2, 0, sepW / 2, cHeight)
				}
				if (null !== start) {
					ctx.lineWidth = 1;
					for (var i = 0; i < jsc.pub.previewSeparator.length; i += 1) ctx.beginPath(), ctx.strokeStyle = jsc.pub.previewSeparator[i], ctx.moveTo(.5 + start + i, 0), ctx.lineTo(.5 + start + i, cHeight), ctx.stroke()
				}
				return {
					canvas: canvas,
					width: cWidth,
					height: cHeight
				}
			},
			genColorPreviewGradient: function(color, position, width) {
				var params = [];
				return params = position && width ? ["to " + {
					left: "right",
					right: "left"
				} [position], color + " 0%", color + " " + width + "px", "rgba(0,0,0,0) " + (width + 1) + "px", "rgba(0,0,0,0) 100%"] : ["to right", color + " 0%", color + " 100%"], jsc.linearGradient.apply(this, params)
			},
			redrawPosition: function() {
				if (jsc.picker && jsc.picker.owner) {
					var thisObj = jsc.picker.owner,
						tp, vp;
					thisObj.fixed ? (tp = jsc.getElementPos(thisObj.targetElement, !0), vp = [0, 0]) : (tp = jsc.getElementPos(thisObj.targetElement), vp = jsc.getViewPos());
					var ts = jsc.getElementSize(thisObj.targetElement),
						vs = jsc.getViewSize(),
						ps = jsc.getPickerOuterDims(thisObj),
						a, b, c;
					switch (thisObj.position.toLowerCase()) {
						case "left":
							a = 1, b = 0, c = -1;
							break;
						case "right":
							a = 1, b = 0, c = 1;
							break;
						case "top":
							a = 0, b = 1, c = -1;
							break;
						default:
							a = 0, b = 1, c = 1
					}
					var l = (ts[b] + ps[b]) / 2;
					if (thisObj.smartPosition) var pp = [-vp[a] + tp[a] + ps[a] > vs[a] && -vp[a] + tp[a] + ts[a] / 2 > vs[a] / 2 && tp[a] + ts[a] - ps[a] >= 0 ? tp[a] + ts[a] - ps[a] : tp[a], -vp[b] + tp[b] + ts[b] + ps[b] - l + l * c > vs[b] ? -vp[b] + tp[b] + ts[b] / 2 > vs[b] / 2 && tp[b] + ts[b] - l - l * c >= 0 ? tp[b] + ts[b] - l - l * c : tp[b] + ts[b] - l + l * c : tp[b] + ts[b] - l + l * c >= 0 ? tp[b] + ts[b] - l + l * c : tp[b] + ts[b] - l - l * c];
					else var pp = [tp[a], tp[b] + ts[b] - l + l * c];
					var x = pp[a],
						y = pp[b],
						positionValue = thisObj.fixed ? "fixed" : "absolute",
						contractShadow = (pp[0] + ps[0] > tp[0] || pp[0] < tp[0] + ts[0]) && pp[1] + ps[1] < tp[1] + ts[1];
					jsc._drawPosition(thisObj, x, y, positionValue, contractShadow)
				}
			},
			_drawPosition: function(thisObj, x, y, positionValue, contractShadow) {
				var vShadow = contractShadow ? 0 : thisObj.shadowBlur;
				jsc.picker.wrap.style.position = positionValue, jsc.picker.wrap.style.left = x + "px", jsc.picker.wrap.style.top = y + "px", jsc.setBoxShadow(jsc.picker.boxS, thisObj.shadow ? new jsc.BoxShadow(0, vShadow, thisObj.shadowBlur, 0, thisObj.shadowColor) : null)
			},
			getPickerDims: function(thisObj) {
				var dims = [2 * thisObj.controlBorderWidth + 2 * thisObj.padding + thisObj.width, 2 * thisObj.controlBorderWidth + 2 * thisObj.padding + thisObj.height],
					sliderSpace = 2 * thisObj.controlBorderWidth + 2 * jsc.getControlPadding(thisObj) + thisObj.sliderSize;
				return jsc.getSliderChannel(thisObj) && (dims[0] += sliderSpace), thisObj.hasAlphaChannel() && (dims[0] += sliderSpace), thisObj.closeButton && (dims[1] += 2 * thisObj.controlBorderWidth + thisObj.padding + thisObj.buttonHeight), dims
			},
			getPickerOuterDims: function(thisObj) {
				var dims = jsc.getPickerDims(thisObj);
				return [dims[0] + 2 * thisObj.borderWidth, dims[1] + 2 * thisObj.borderWidth]
			},
			getControlPadding: function(thisObj) {
				return Math.max(thisObj.padding / 2, 2 * thisObj.pointerBorderWidth + thisObj.pointerThickness - thisObj.controlBorderWidth)
			},
			getPadYChannel: function(thisObj) {
				switch (thisObj.mode.charAt(1).toLowerCase()) {
					case "v":
						return "v"
				}
				return "s"
			},
			getSliderChannel: function(thisObj) {
				if (thisObj.mode.length > 2) switch (thisObj.mode.charAt(2).toLowerCase()) {
					case "s":
						return "s";
					case "v":
						return "v"
				}
				return null
			},
			onDocumentMouseDown: function(e) {
				var target = e.target || e.srcElement;
				if (target.jscolor && target.jscolor instanceof jsc.pub) target.jscolor.showOnClick && !target.disabled && target.jscolor.show();
				else if (jsc.getData(target, "gui")) {
					var control;
					jsc.getData(target, "control") && jsc.onControlPointerStart(e, target, jsc.getData(target, "control"), "mouse")
				} else jsc.picker && jsc.picker.owner && jsc.picker.owner.tryHide()
			},
			onDocumentKeyUp: function(e) {
				-1 !== ["Tab", "Escape"].indexOf(jsc.eventKey(e)) && jsc.picker && jsc.picker.owner && jsc.picker.owner.tryHide()
			},
			onWindowResize: function(e) {
				jsc.redrawPosition()
			},
			onParentScroll: function(e) {
				jsc.picker && jsc.picker.owner && jsc.picker.owner.tryHide()
			},
			onPickerTouchStart: function(e) {
				var target = e.target || e.srcElement;
				jsc.getData(target, "control") && jsc.onControlPointerStart(e, target, jsc.getData(target, "control"), "touch")
			},
			triggerCallback: function(thisObj, prop) {
				if (thisObj[prop]) {
					var callback = null;
					if ("string" == typeof thisObj[prop]) try {
						callback = new Function(thisObj[prop])
					} catch (e) {
						console.error(e)
					} else callback = thisObj[prop];
					callback && callback.call(thisObj)
				}
			},
			triggerGlobal: function(eventNames) {
				for (var inst = jsc.getInstances(), i = 0; i < inst.length; i += 1) inst[i].trigger(eventNames)
			},
			_pointerMoveEvent: {
				mouse: "mousemove",
				touch: "touchmove"
			},
			_pointerEndEvent: {
				mouse: "mouseup",
				touch: "touchend"
			},
			_pointerOrigin: null,
			_capturedTarget: null,
			onControlPointerStart: function(e, target, controlName, pointerType) {
				var thisObj = jsc.getData(target, "instance");
				jsc.preventDefault(e), jsc.captureTarget(target);
				var registerDragEvents = function(doc, offset) {
					jsc.attachGroupEvent("drag", doc, jsc._pointerMoveEvent[pointerType], jsc.onDocumentPointerMove(e, target, controlName, pointerType, offset)), jsc.attachGroupEvent("drag", doc, jsc._pointerEndEvent[pointerType], jsc.onDocumentPointerEnd(e, target, controlName, pointerType))
				};
				if (registerDragEvents(window.document, [0, 0]), window.parent && window.frameElement) {
					var rect = window.frameElement.getBoundingClientRect(),
						ofs = [-rect.left, -rect.top];
					registerDragEvents(window.parent.window.document, ofs)
				}
				var abs = jsc.getAbsPointerPos(e),
					rel = jsc.getRelPointerPos(e);
				switch (jsc._pointerOrigin = {
						x: abs.x - rel.x,
						y: abs.y - rel.y
					}, controlName) {
					case "pad":
						"v" === jsc.getSliderChannel(thisObj) && 0 === thisObj.channels.v && thisObj.fromHSVA(null, null, 100, null), jsc.setPad(thisObj, e, 0, 0);
						break;
					case "sld":
						jsc.setSld(thisObj, e, 0);
						break;
					case "asld":
						jsc.setASld(thisObj, e, 0)
				}
				thisObj.trigger("input")
			},
			onDocumentPointerMove: function(e, target, controlName, pointerType, offset) {
				return function(e) {
					var thisObj = jsc.getData(target, "instance");
					switch (controlName) {
						case "pad":
							jsc.setPad(thisObj, e, offset[0], offset[1]);
							break;
						case "sld":
							jsc.setSld(thisObj, e, offset[1]);
							break;
						case "asld":
							jsc.setASld(thisObj, e, offset[1])
					}
					thisObj.trigger("input")
				}
			},
			onDocumentPointerEnd: function(e, target, controlName, pointerType) {
				return function(e) {
					var thisObj = jsc.getData(target, "instance");
					jsc.detachGroupEvents("drag"), jsc.releaseTarget(), thisObj.trigger("input"), thisObj.trigger("change")
				}
			},
			setPad: function(thisObj, e, ofsX, ofsY) {
				var pointerAbs = jsc.getAbsPointerPos(e),
					x = ofsX + pointerAbs.x - jsc._pointerOrigin.x - thisObj.padding - thisObj.controlBorderWidth,
					y = ofsY + pointerAbs.y - jsc._pointerOrigin.y - thisObj.padding - thisObj.controlBorderWidth,
					xVal = x * (360 / (thisObj.width - 1)),
					yVal = 100 - y * (100 / (thisObj.height - 1));
				switch (jsc.getPadYChannel(thisObj)) {
					case "s":
						thisObj.fromHSVA(xVal, yVal, null, null);
						break;
					case "v":
						thisObj.fromHSVA(xVal, null, yVal, null)
				}
			},
			setSld: function(thisObj, e, ofsY) {
				var pointerAbs, y, yVal = 100 - (ofsY + jsc.getAbsPointerPos(e).y - jsc._pointerOrigin.y - thisObj.padding - thisObj.controlBorderWidth) * (100 / (thisObj.height - 1));
				switch (jsc.getSliderChannel(thisObj)) {
					case "s":
						thisObj.fromHSVA(null, yVal, null, null);
						break;
					case "v":
						thisObj.fromHSVA(null, null, yVal, null)
				}
			},
			setASld: function(thisObj, e, ofsY) {
				var pointerAbs, y, yVal = 1 - (ofsY + jsc.getAbsPointerPos(e).y - jsc._pointerOrigin.y - thisObj.padding - thisObj.controlBorderWidth) * (1 / (thisObj.height - 1));
				yVal < 1 && "any" === thisObj.format.toLowerCase() && "rgba" !== thisObj.getFormat() && (thisObj._currentFormat = "rgba"), thisObj.fromHSVA(null, null, null, yVal)
			},
			createPalette: function() {
				var paletteObj = {
						elm: null,
						draw: null
					},
					canvas = jsc.createEl("canvas"),
					ctx = canvas.getContext("2d"),
					drawFunc = function(width, height, type) {
						canvas.width = width, canvas.height = height, ctx.clearRect(0, 0, canvas.width, canvas.height);
						var hGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
						hGrad.addColorStop(0, "#F00"), hGrad.addColorStop(1 / 6, "#FF0"), hGrad.addColorStop(2 / 6, "#0F0"), hGrad.addColorStop(.5, "#0FF"), hGrad.addColorStop(4 / 6, "#00F"), hGrad.addColorStop(5 / 6, "#F0F"), hGrad.addColorStop(1, "#F00"), ctx.fillStyle = hGrad, ctx.fillRect(0, 0, canvas.width, canvas.height);
						var vGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
						switch (type.toLowerCase()) {
							case "s":
								vGrad.addColorStop(0, "rgba(255,255,255,0)"), vGrad.addColorStop(1, "rgba(255,255,255,1)");
								break;
							case "v":
								vGrad.addColorStop(0, "rgba(0,0,0,0)"), vGrad.addColorStop(1, "rgba(0,0,0,1)")
						}
						ctx.fillStyle = vGrad, ctx.fillRect(0, 0, canvas.width, canvas.height)
					};
				return paletteObj.elm = canvas, paletteObj.draw = drawFunc, paletteObj
			},
			createSliderGradient: function() {
				var sliderObj = {
						elm: null,
						draw: null
					},
					canvas = jsc.createEl("canvas"),
					ctx = canvas.getContext("2d"),
					drawFunc = function(width, height, color1, color2) {
						canvas.width = width, canvas.height = height, ctx.clearRect(0, 0, canvas.width, canvas.height);
						var grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
						grad.addColorStop(0, color1), grad.addColorStop(1, color2), ctx.fillStyle = grad, ctx.fillRect(0, 0, canvas.width, canvas.height)
					};
				return sliderObj.elm = canvas, sliderObj.draw = drawFunc, sliderObj
			},
			createASliderGradient: function() {
				var sliderObj = {
						elm: null,
						draw: null
					},
					canvas = jsc.createEl("canvas"),
					ctx = canvas.getContext("2d"),
					drawFunc = function(width, height, color) {
						canvas.width = width, canvas.height = height, ctx.clearRect(0, 0, canvas.width, canvas.height);
						var sqSize = canvas.width / 2,
							sqColor1 = jsc.pub.chessboardColor1,
							sqColor2 = jsc.pub.chessboardColor2;
						ctx.fillStyle = sqColor1, ctx.fillRect(0, 0, canvas.width, canvas.height);
						for (var y = 0; y < canvas.height; y += 2 * sqSize) ctx.fillStyle = sqColor2, ctx.fillRect(0, y, sqSize, sqSize), ctx.fillRect(sqSize, y + sqSize, sqSize, sqSize);
						var grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
						grad.addColorStop(0, color), grad.addColorStop(1, "rgba(0,0,0,0)"), ctx.fillStyle = grad, ctx.fillRect(0, 0, canvas.width, canvas.height)
					};
				return sliderObj.elm = canvas, sliderObj.draw = drawFunc, sliderObj
			},
			BoxShadow: (BoxShadow = function(hShadow, vShadow, blur, spread, color, inset) {
				this.hShadow = hShadow, this.vShadow = vShadow, this.blur = blur, this.spread = spread, this.color = color, this.inset = !!inset
			}, BoxShadow.prototype.toString = function() {
				var vals = [Math.round(this.hShadow) + "px", Math.round(this.vShadow) + "px", Math.round(this.blur) + "px", Math.round(this.spread) + "px", this.color];
				return this.inset && vals.push("inset"), vals.join(" ")
			}, BoxShadow),
			flags: {
				leaveValue: 1,
				leaveAlpha: 2,
				leavePreview: 4
			},
			enumOpts: {
				format: ["auto", "any", "hex", "rgb", "rgba"],
				previewPosition: ["left", "right"],
				mode: ["hsv", "hvs", "hs", "hv"],
				position: ["left", "right", "top", "bottom"],
				alphaChannel: ["auto", !0, !1]
			},
			deprecatedOpts: {
				styleElement: "previewElement",
				onFineChange: "onInput",
				overwriteImportant: "forceStyle",
				closable: "closeButton",
				insetWidth: "controlBorderWidth",
				insetColor: "controlBorderColor",
				refine: null
			},
			docsRef: " See https://jscolor.com/docs/",
			pub: function(targetElement, opts) {
				var THIS = this;
				if (opts || (opts = {}), this.channels = {
						r: 255,
						g: 255,
						b: 255,
						h: 0,
						s: 0,
						v: 100,
						a: 1
					}, this.format = "auto", this.value = void 0, this.alpha = void 0, this.onChange = void 0, this.onInput = void 0, this.valueElement = void 0, this.alphaElement = void 0, this.previewElement = void 0, this.previewPosition = "left", this.previewSize = 32, this.previewPadding = 8, this.required = !0, this.hash = !0, this.uppercase = !0, this.forceStyle = !0, this.width = 181, this.height = 101, this.mode = "HSV", this.alphaChannel = "auto", this.position = "bottom", this.smartPosition = !0, this.showOnClick = !0, this.hideOnLeave = !0, this.sliderSize = 16, this.crossSize = 8, this.closeButton = !1, this.closeText = "Close", this.buttonColor = "rgba(0,0,0,1)", this.buttonHeight = 18, this.padding = 12, this.backgroundColor = "rgba(255,255,255,1)", this.borderWidth = 1, this.borderColor = "rgba(187,187,187,1)", this.borderRadius = 8, this.controlBorderWidth = 1, this.controlBorderColor = "rgba(187,187,187,1)", this.shadow = !0, this.shadowBlur = 15, this.shadowColor = "rgba(0,0,0,0.2)", this.pointerColor = "rgba(76,76,76,1)", this.pointerBorderWidth = 1, this.pointerBorderColor = "rgba(255,255,255,1)", this.pointerThickness = 2, this.zIndex = 5e3, this.container = void 0, this.minS = 0, this.maxS = 100, this.minV = 0, this.maxV = 100, this.minA = 0, this.maxA = 1, jsc.pub.options)
					for (var opt in jsc.pub.options)
						if (jsc.pub.options.hasOwnProperty(opt)) try {
							setOption(opt, jsc.pub.options[opt])
						} catch (e) {
							console.warn(e)
						}
				var presetsArr = [];
				opts.preset && ("string" == typeof opts.preset ? presetsArr = opts.preset.split(/\s+/) : Array.isArray(opts.preset) ? presetsArr = opts.preset.slice() : console.warn("Unrecognized preset value")), -1 === presetsArr.indexOf("default") && presetsArr.push("default");
				for (var i = presetsArr.length - 1; i >= 0; i -= 1) {
					var pres = presetsArr[i];
					if (pres)
						if (jsc.pub.presets.hasOwnProperty(pres)) {
							for (var opt in jsc.pub.presets[pres])
								if (jsc.pub.presets[pres].hasOwnProperty(opt)) try {
									setOption(opt, jsc.pub.presets[pres][opt])
								} catch (e) {
									console.warn(e)
								}
						} else console.warn("Unknown preset: %s", pres)
				}
				var nonProperties = ["preset"];
				for (var opt in opts)
					if (opts.hasOwnProperty(opt) && -1 === nonProperties.indexOf(opt)) try {
						setOption(opt, opts[opt])
					} catch (e) {
						console.warn(e)
					}

				function setOption(option, value) {
					if ("string" != typeof option) throw new Error("Invalid value for option name: " + option);
					if (jsc.enumOpts.hasOwnProperty(option) && ("string" == typeof value && (value = value.toLowerCase()), -1 === jsc.enumOpts[option].indexOf(value))) throw new Error("Option '" + option + "' has invalid value: " + value);
					if (jsc.deprecatedOpts.hasOwnProperty(option)) {
						var oldOpt = option,
							newOpt = jsc.deprecatedOpts[option];
						if (!newOpt) throw new Error("Option '" + option + "' is DEPRECATED");
						console.warn("Option '%s' is DEPRECATED, using '%s' instead." + jsc.docsRef, oldOpt, newOpt), option = newOpt
					}
					if (!(option in THIS)) throw new Error("Unrecognized configuration option: " + option);
					return THIS[option] = value, !0
				}

				function getOption(option) {
					if (jsc.deprecatedOpts.hasOwnProperty(option)) {
						var oldOpt = option,
							newOpt = jsc.deprecatedOpts[option];
						if (!newOpt) throw new Error("Option '" + option + "' is DEPRECATED");
						console.warn("Option '%s' is DEPRECATED, using '%s' instead." + jsc.docsRef, oldOpt, newOpt), option = newOpt
					}
					if (!(option in THIS)) throw new Error("Unrecognized configuration option: " + option);
					return THIS[option]
				}

				function detachPicker() {
					jsc.removeClass(THIS.targetElement, jsc.pub.activeClassName), jsc.picker.wrap.parentNode.removeChild(jsc.picker.wrap), delete jsc.picker.owner
				}

				function drawPicker() {
					THIS._processParentElementsInDOM(), jsc.picker || (jsc.picker = {
						owner: null,
						wrap: jsc.createEl("div"),
						box: jsc.createEl("div"),
						boxS: jsc.createEl("div"),
						boxB: jsc.createEl("div"),
						pad: jsc.createEl("div"),
						padB: jsc.createEl("div"),
						padM: jsc.createEl("div"),
						padPal: jsc.createPalette(),
						cross: jsc.createEl("div"),
						crossBY: jsc.createEl("div"),
						crossBX: jsc.createEl("div"),
						crossLY: jsc.createEl("div"),
						crossLX: jsc.createEl("div"),
						sld: jsc.createEl("div"),
						sldB: jsc.createEl("div"),
						sldM: jsc.createEl("div"),
						sldGrad: jsc.createSliderGradient(),
						sldPtrS: jsc.createEl("div"),
						sldPtrIB: jsc.createEl("div"),
						sldPtrMB: jsc.createEl("div"),
						sldPtrOB: jsc.createEl("div"),
						asld: jsc.createEl("div"),
						asldB: jsc.createEl("div"),
						asldM: jsc.createEl("div"),
						asldGrad: jsc.createASliderGradient(),
						asldPtrS: jsc.createEl("div"),
						asldPtrIB: jsc.createEl("div"),
						asldPtrMB: jsc.createEl("div"),
						asldPtrOB: jsc.createEl("div"),
						btn: jsc.createEl("div"),
						btnT: jsc.createEl("span")
					}, jsc.picker.pad.appendChild(jsc.picker.padPal.elm), jsc.picker.padB.appendChild(jsc.picker.pad), jsc.picker.cross.appendChild(jsc.picker.crossBY), jsc.picker.cross.appendChild(jsc.picker.crossBX), jsc.picker.cross.appendChild(jsc.picker.crossLY), jsc.picker.cross.appendChild(jsc.picker.crossLX), jsc.picker.padB.appendChild(jsc.picker.cross), jsc.picker.box.appendChild(jsc.picker.padB), jsc.picker.box.appendChild(jsc.picker.padM), jsc.picker.sld.appendChild(jsc.picker.sldGrad.elm), jsc.picker.sldB.appendChild(jsc.picker.sld), jsc.picker.sldB.appendChild(jsc.picker.sldPtrOB), jsc.picker.sldPtrOB.appendChild(jsc.picker.sldPtrMB), jsc.picker.sldPtrMB.appendChild(jsc.picker.sldPtrIB), jsc.picker.sldPtrIB.appendChild(jsc.picker.sldPtrS), jsc.picker.box.appendChild(jsc.picker.sldB), jsc.picker.box.appendChild(jsc.picker.sldM), jsc.picker.asld.appendChild(jsc.picker.asldGrad.elm), jsc.picker.asldB.appendChild(jsc.picker.asld), jsc.picker.asldB.appendChild(jsc.picker.asldPtrOB), jsc.picker.asldPtrOB.appendChild(jsc.picker.asldPtrMB), jsc.picker.asldPtrMB.appendChild(jsc.picker.asldPtrIB), jsc.picker.asldPtrIB.appendChild(jsc.picker.asldPtrS), jsc.picker.box.appendChild(jsc.picker.asldB), jsc.picker.box.appendChild(jsc.picker.asldM), jsc.picker.btn.appendChild(jsc.picker.btnT), jsc.picker.box.appendChild(jsc.picker.btn), jsc.picker.boxB.appendChild(jsc.picker.box), jsc.picker.wrap.appendChild(jsc.picker.boxS), jsc.picker.wrap.appendChild(jsc.picker.boxB), jsc.picker.wrap.addEventListener("touchstart", jsc.onPickerTouchStart, !!jsc.isPassiveEventSupported && {
						passive: !1
					}));
					var p = jsc.picker,
						displaySlider = !!jsc.getSliderChannel(THIS),
						displayAlphaSlider = THIS.hasAlphaChannel(),
						dims = jsc.getPickerDims(THIS),
						crossOuterSize = 2 * THIS.pointerBorderWidth + THIS.pointerThickness + 2 * THIS.crossSize,
						controlPadding = jsc.getControlPadding(THIS),
						borderRadius = Math.min(THIS.borderRadius, Math.round(THIS.padding * Math.PI)),
						padCursor = "crosshair";

					function setBtnBorder() {
						var insetColors = THIS.controlBorderColor.split(/\s+/),
							outsetColor = insetColors.length < 2 ? insetColors[0] : insetColors[1] + " " + insetColors[0] + " " + insetColors[0] + " " + insetColors[1];
						p.btn.style.borderColor = outsetColor
					}
					p.wrap.className = "jscolor-picker-wrap", p.wrap.style.clear = "both", p.wrap.style.width = dims[0] + 2 * THIS.borderWidth + "px", p.wrap.style.height = dims[1] + 2 * THIS.borderWidth + "px", p.wrap.style.zIndex = THIS.zIndex, p.box.className = "jscolor-picker", p.box.style.width = dims[0] + "px", p.box.style.height = dims[1] + "px", p.box.style.position = "relative", p.boxS.className = "jscolor-picker-shadow", p.boxS.style.position = "absolute", p.boxS.style.left = "0", p.boxS.style.top = "0", p.boxS.style.width = "100%", p.boxS.style.height = "100%", jsc.setBorderRadius(p.boxS, borderRadius + "px"), p.boxB.className = "jscolor-picker-border", p.boxB.style.position = "relative", p.boxB.style.border = THIS.borderWidth + "px solid", p.boxB.style.borderColor = THIS.borderColor, p.boxB.style.background = THIS.backgroundColor, jsc.setBorderRadius(p.boxB, borderRadius + "px"), p.padM.style.background = "rgba(255,0,0,.2)", p.sldM.style.background = "rgba(0,255,0,.2)", p.asldM.style.background = "rgba(0,0,255,.2)", p.padM.style.opacity = p.sldM.style.opacity = p.asldM.style.opacity = "0", p.pad.style.position = "relative", p.pad.style.width = THIS.width + "px", p.pad.style.height = THIS.height + "px", p.padPal.draw(THIS.width, THIS.height, jsc.getPadYChannel(THIS)), p.padB.style.position = "absolute", p.padB.style.left = THIS.padding + "px", p.padB.style.top = THIS.padding + "px", p.padB.style.border = THIS.controlBorderWidth + "px solid", p.padB.style.borderColor = THIS.controlBorderColor, p.padM.style.position = "absolute", p.padM.style.left = "0px", p.padM.style.top = "0px", p.padM.style.width = THIS.padding + 2 * THIS.controlBorderWidth + THIS.width + controlPadding + "px", p.padM.style.height = 2 * THIS.controlBorderWidth + 2 * THIS.padding + THIS.height + "px", p.padM.style.cursor = padCursor, jsc.setData(p.padM, {
						instance: THIS,
						control: "pad"
					}), p.cross.style.position = "absolute", p.cross.style.left = p.cross.style.top = "0", p.cross.style.width = p.cross.style.height = crossOuterSize + "px", p.crossBY.style.position = p.crossBX.style.position = "absolute", p.crossBY.style.background = p.crossBX.style.background = THIS.pointerBorderColor, p.crossBY.style.width = p.crossBX.style.height = 2 * THIS.pointerBorderWidth + THIS.pointerThickness + "px", p.crossBY.style.height = p.crossBX.style.width = crossOuterSize + "px", p.crossBY.style.left = p.crossBX.style.top = Math.floor(crossOuterSize / 2) - Math.floor(THIS.pointerThickness / 2) - THIS.pointerBorderWidth + "px", p.crossBY.style.top = p.crossBX.style.left = "0", p.crossLY.style.position = p.crossLX.style.position = "absolute", p.crossLY.style.background = p.crossLX.style.background = THIS.pointerColor, p.crossLY.style.height = p.crossLX.style.width = crossOuterSize - 2 * THIS.pointerBorderWidth + "px", p.crossLY.style.width = p.crossLX.style.height = THIS.pointerThickness + "px", p.crossLY.style.left = p.crossLX.style.top = Math.floor(crossOuterSize / 2) - Math.floor(THIS.pointerThickness / 2) + "px", p.crossLY.style.top = p.crossLX.style.left = THIS.pointerBorderWidth + "px", p.sld.style.overflow = "hidden", p.sld.style.width = THIS.sliderSize + "px", p.sld.style.height = THIS.height + "px", p.sldGrad.draw(THIS.sliderSize, THIS.height, "#000", "#000"), p.sldB.style.display = displaySlider ? "block" : "none", p.sldB.style.position = "absolute", p.sldB.style.left = THIS.padding + THIS.width + 2 * THIS.controlBorderWidth + 2 * controlPadding + "px", p.sldB.style.top = THIS.padding + "px", p.sldB.style.border = THIS.controlBorderWidth + "px solid", p.sldB.style.borderColor = THIS.controlBorderColor, p.sldM.style.display = displaySlider ? "block" : "none", p.sldM.style.position = "absolute", p.sldM.style.left = THIS.padding + THIS.width + 2 * THIS.controlBorderWidth + controlPadding + "px", p.sldM.style.top = "0px", p.sldM.style.width = THIS.sliderSize + 2 * controlPadding + 2 * THIS.controlBorderWidth + (displayAlphaSlider ? 0 : Math.max(0, THIS.padding - controlPadding)) + "px", p.sldM.style.height = 2 * THIS.controlBorderWidth + 2 * THIS.padding + THIS.height + "px", p.sldM.style.cursor = "default", jsc.setData(p.sldM, {
						instance: THIS,
						control: "sld"
					}), p.sldPtrIB.style.border = p.sldPtrOB.style.border = THIS.pointerBorderWidth + "px solid " + THIS.pointerBorderColor, p.sldPtrOB.style.position = "absolute", p.sldPtrOB.style.left = -(2 * THIS.pointerBorderWidth + THIS.pointerThickness) + "px", p.sldPtrOB.style.top = "0", p.sldPtrMB.style.border = THIS.pointerThickness + "px solid " + THIS.pointerColor, p.sldPtrS.style.width = THIS.sliderSize + "px", p.sldPtrS.style.height = jsc.pub.sliderInnerSpace + "px", p.asld.style.overflow = "hidden", p.asld.style.width = THIS.sliderSize + "px", p.asld.style.height = THIS.height + "px", p.asldGrad.draw(THIS.sliderSize, THIS.height, "#000"), p.asldB.style.display = displayAlphaSlider ? "block" : "none", p.asldB.style.position = "absolute", p.asldB.style.left = THIS.padding + THIS.width + 2 * THIS.controlBorderWidth + controlPadding + (displaySlider ? THIS.sliderSize + 3 * controlPadding + 2 * THIS.controlBorderWidth : 0) + "px", p.asldB.style.top = THIS.padding + "px", p.asldB.style.border = THIS.controlBorderWidth + "px solid", p.asldB.style.borderColor = THIS.controlBorderColor, p.asldM.style.display = displayAlphaSlider ? "block" : "none", p.asldM.style.position = "absolute", p.asldM.style.left = THIS.padding + THIS.width + 2 * THIS.controlBorderWidth + controlPadding + (displaySlider ? THIS.sliderSize + 2 * controlPadding + 2 * THIS.controlBorderWidth : 0) + "px", p.asldM.style.top = "0px", p.asldM.style.width = THIS.sliderSize + 2 * controlPadding + 2 * THIS.controlBorderWidth + Math.max(0, THIS.padding - controlPadding) + "px", p.asldM.style.height = 2 * THIS.controlBorderWidth + 2 * THIS.padding + THIS.height + "px", p.asldM.style.cursor = "default", jsc.setData(p.asldM, {
						instance: THIS,
						control: "asld"
					}), p.asldPtrIB.style.border = p.asldPtrOB.style.border = THIS.pointerBorderWidth + "px solid " + THIS.pointerBorderColor, p.asldPtrOB.style.position = "absolute", p.asldPtrOB.style.left = -(2 * THIS.pointerBorderWidth + THIS.pointerThickness) + "px", p.asldPtrOB.style.top = "0", p.asldPtrMB.style.border = THIS.pointerThickness + "px solid " + THIS.pointerColor, p.asldPtrS.style.width = THIS.sliderSize + "px", p.asldPtrS.style.height = jsc.pub.sliderInnerSpace + "px";
					var btnPadding = 15;
					p.btn.className = "jscolor-btn-close", p.btn.style.display = THIS.closeButton ? "block" : "none", p.btn.style.position = "absolute", p.btn.style.left = THIS.padding + "px", p.btn.style.bottom = THIS.padding + "px", p.btn.style.padding = "0 15px", p.btn.style.maxWidth = dims[0] - 2 * THIS.padding - 2 * THIS.controlBorderWidth - 30 + "px", p.btn.style.overflow = "hidden", p.btn.style.height = THIS.buttonHeight + "px", p.btn.style.whiteSpace = "nowrap", p.btn.style.border = THIS.controlBorderWidth + "px solid", setBtnBorder(), p.btn.style.color = THIS.buttonColor, p.btn.style.font = "12px sans-serif", p.btn.style.textAlign = "center", p.btn.style.cursor = "pointer", p.btn.onmousedown = function() {
						THIS.hide()
					}, p.btnT.style.lineHeight = THIS.buttonHeight + "px", p.btnT.innerHTML = "", p.btnT.appendChild(window.document.createTextNode(THIS.closeText)), redrawPad(), redrawSld(), redrawASld(), jsc.picker.owner && jsc.picker.owner !== THIS && jsc.removeClass(jsc.picker.owner.targetElement, jsc.pub.activeClassName), jsc.picker.owner = THIS, THIS.container === window.document.body ? jsc.redrawPosition() : jsc._drawPosition(THIS, 0, 0, "relative", !1), p.wrap.parentNode !== THIS.container && THIS.container.appendChild(p.wrap), jsc.addClass(THIS.targetElement, jsc.pub.activeClassName)
				}

				function redrawPad() {
					var yChannel = jsc.getPadYChannel(THIS),
						x = Math.round(THIS.channels.h / 360 * (THIS.width - 1)),
						y = Math.round((1 - THIS.channels[yChannel] / 100) * (THIS.height - 1)),
						crossOuterSize = 2 * THIS.pointerBorderWidth + THIS.pointerThickness + 2 * THIS.crossSize,
						ofs = -Math.floor(crossOuterSize / 2);
					switch (jsc.picker.cross.style.left = x + ofs + "px", jsc.picker.cross.style.top = y + ofs + "px", jsc.getSliderChannel(THIS)) {
						case "s":
							var rgb1 = jsc.HSV_RGB(THIS.channels.h, 100, THIS.channels.v),
								rgb2 = jsc.HSV_RGB(THIS.channels.h, 0, THIS.channels.v),
								color1 = "rgb(" + Math.round(rgb1[0]) + "," + Math.round(rgb1[1]) + "," + Math.round(rgb1[2]) + ")",
								color2 = "rgb(" + Math.round(rgb2[0]) + "," + Math.round(rgb2[1]) + "," + Math.round(rgb2[2]) + ")";
							jsc.picker.sldGrad.draw(THIS.sliderSize, THIS.height, color1, color2);
							break;
						case "v":
							var rgb = jsc.HSV_RGB(THIS.channels.h, THIS.channels.s, 100),
								color1 = "rgb(" + Math.round(rgb[0]) + "," + Math.round(rgb[1]) + "," + Math.round(rgb[2]) + ")",
								color2 = "#000";
							jsc.picker.sldGrad.draw(THIS.sliderSize, THIS.height, color1, color2)
					}
					jsc.picker.asldGrad.draw(THIS.sliderSize, THIS.height, THIS.toHEXString())
				}

				function redrawSld() {
					var sldChannel = jsc.getSliderChannel(THIS);
					if (sldChannel) {
						var y = Math.round((1 - THIS.channels[sldChannel] / 100) * (THIS.height - 1));
						jsc.picker.sldPtrOB.style.top = y - (2 * THIS.pointerBorderWidth + THIS.pointerThickness) - Math.floor(jsc.pub.sliderInnerSpace / 2) + "px"
					}
					jsc.picker.asldGrad.draw(THIS.sliderSize, THIS.height, THIS.toHEXString())
				}

				function redrawASld() {
					var y = Math.round((1 - THIS.channels.a) * (THIS.height - 1));
					jsc.picker.asldPtrOB.style.top = y - (2 * THIS.pointerBorderWidth + THIS.pointerThickness) - Math.floor(jsc.pub.sliderInnerSpace / 2) + "px"
				}

				function isPickerOwner() {
					return jsc.picker && jsc.picker.owner === THIS
				}

				function onValueKeyDown(ev) {
					"Enter" === jsc.eventKey(ev) && (THIS.valueElement && THIS.processValueInput(THIS.valueElement.value), THIS.tryHide())
				}

				function onAlphaKeyDown(ev) {
					"Enter" === jsc.eventKey(ev) && (THIS.alphaElement && THIS.processAlphaInput(THIS.alphaElement.value), THIS.tryHide())
				}

				function onValueChange(ev) {
					if (!jsc.getData(ev, "internal")) {
						var oldVal = THIS.valueElement.value;
						THIS.processValueInput(THIS.valueElement.value), jsc.triggerCallback(THIS, "onChange"), THIS.valueElement.value !== oldVal && jsc.triggerInputEvent(THIS.valueElement, "change", !0, !0)
					}
				}

				function onAlphaChange(ev) {
					if (!jsc.getData(ev, "internal")) {
						var oldVal = THIS.alphaElement.value;
						THIS.processAlphaInput(THIS.alphaElement.value), jsc.triggerCallback(THIS, "onChange"), jsc.triggerInputEvent(THIS.valueElement, "change", !0, !0), THIS.alphaElement.value !== oldVal && jsc.triggerInputEvent(THIS.alphaElement, "change", !0, !0)
					}
				}

				function onValueInput(ev) {
					jsc.getData(ev, "internal") || (THIS.valueElement && THIS.fromString(THIS.valueElement.value, jsc.flags.leaveValue), jsc.triggerCallback(THIS, "onInput"))
				}

				function onAlphaInput(ev) {
					jsc.getData(ev, "internal") || (THIS.alphaElement && THIS.fromHSVA(null, null, null, parseFloat(THIS.alphaElement.value), jsc.flags.leaveAlpha), jsc.triggerCallback(THIS, "onInput"), jsc.triggerInputEvent(THIS.valueElement, "input", !0, !0))
				}
				if (this.option = function() {
						if (!arguments.length) throw new Error("No option specified");
						if (1 === arguments.length && "string" == typeof arguments[0]) {
							try {
								return getOption(arguments[0])
							} catch (e) {
								console.warn(e)
							}
							return !1
						}
						if (arguments.length >= 2 && "string" == typeof arguments[0]) {
							try {
								if (!setOption(arguments[0], arguments[1])) return !1
							} catch (e) {
								return console.warn(e), !1
							}
							return this.redraw(), this.exposeColor(), !0
						}
						if (1 === arguments.length && "object" == typeof arguments[0]) {
							var opts = arguments[0],
								success = !0;
							for (var opt in opts)
								if (opts.hasOwnProperty(opt)) try {
									setOption(opt, opts[opt]) || (success = !1)
								} catch (e) {
									console.warn(e), success = !1
								}
							return this.redraw(), this.exposeColor(), success
						}
						throw new Error("Invalid arguments")
					}, this.channel = function(name, value) {
						if ("string" != typeof name) throw new Error("Invalid value for channel name: " + name);
						if (void 0 === value) return this.channels.hasOwnProperty(name.toLowerCase()) ? this.channels[name.toLowerCase()] : (console.warn("Getting unknown channel: " + name), !1);
						var res = !1;
						switch (name.toLowerCase()) {
							case "r":
								res = this.fromRGBA(value, null, null, null);
								break;
							case "g":
								res = this.fromRGBA(null, value, null, null);
								break;
							case "b":
								res = this.fromRGBA(null, null, value, null);
								break;
							case "h":
								res = this.fromHSVA(value, null, null, null);
								break;
							case "s":
								res = this.fromHSVA(null, value, null, null);
								break;
							case "v":
								res = this.fromHSVA(null, null, value, null);
								break;
							case "a":
								res = this.fromHSVA(null, null, null, value);
								break;
							default:
								return console.warn("Setting unknown channel: " + name), !1
						}
						return !!res && (this.redraw(), !0)
					}, this.trigger = function(eventNames) {
						for (var evs = jsc.strList(eventNames), i = 0; i < evs.length; i += 1) {
							var ev = evs[i].toLowerCase(),
								callbackProp = null;
							switch (ev) {
								case "input":
									callbackProp = "onInput";
									break;
								case "change":
									callbackProp = "onChange"
							}
							callbackProp && jsc.triggerCallback(this, callbackProp), jsc.triggerInputEvent(this.valueElement, ev, !0, !0)
						}
					}, this.fromHSVA = function(h, s, v, a, flags) {
						if (void 0 === h && (h = null), void 0 === s && (s = null), void 0 === v && (v = null), void 0 === a && (a = null), null !== h) {
							if (isNaN(h)) return !1;
							this.channels.h = Math.max(0, Math.min(360, h))
						}
						if (null !== s) {
							if (isNaN(s)) return !1;
							this.channels.s = Math.max(0, Math.min(100, this.maxS, s), this.minS)
						}
						if (null !== v) {
							if (isNaN(v)) return !1;
							this.channels.v = Math.max(0, Math.min(100, this.maxV, v), this.minV)
						}
						if (null !== a) {
							if (isNaN(a)) return !1;
							this.channels.a = this.hasAlphaChannel() ? Math.max(0, Math.min(1, this.maxA, a), this.minA) : 1
						}
						var rgb = jsc.HSV_RGB(this.channels.h, this.channels.s, this.channels.v);
						return this.channels.r = rgb[0], this.channels.g = rgb[1], this.channels.b = rgb[2], this.exposeColor(flags), !0
					}, this.fromRGBA = function(r, g, b, a, flags) {
						if (void 0 === r && (r = null), void 0 === g && (g = null), void 0 === b && (b = null), void 0 === a && (a = null), null !== r) {
							if (isNaN(r)) return !1;
							r = Math.max(0, Math.min(255, r))
						}
						if (null !== g) {
							if (isNaN(g)) return !1;
							g = Math.max(0, Math.min(255, g))
						}
						if (null !== b) {
							if (isNaN(b)) return !1;
							b = Math.max(0, Math.min(255, b))
						}
						if (null !== a) {
							if (isNaN(a)) return !1;
							this.channels.a = this.hasAlphaChannel() ? Math.max(0, Math.min(1, this.maxA, a), this.minA) : 1
						}
						var hsv = jsc.RGB_HSV(null === r ? this.channels.r : r, null === g ? this.channels.g : g, null === b ? this.channels.b : b);
						null !== hsv[0] && (this.channels.h = Math.max(0, Math.min(360, hsv[0]))), 0 !== hsv[2] && (this.channels.s = Math.max(0, this.minS, Math.min(100, this.maxS, hsv[1]))), this.channels.v = Math.max(0, this.minV, Math.min(100, this.maxV, hsv[2]));
						var rgb = jsc.HSV_RGB(this.channels.h, this.channels.s, this.channels.v);
						return this.channels.r = rgb[0], this.channels.g = rgb[1], this.channels.b = rgb[2], this.exposeColor(flags), !0
					}, this.fromHSV = function(h, s, v, flags) {
						return console.warn("fromHSV() method is DEPRECATED. Using fromHSVA() instead." + jsc.docsRef), this.fromHSVA(h, s, v, null, flags)
					}, this.fromRGB = function(r, g, b, flags) {
						return console.warn("fromRGB() method is DEPRECATED. Using fromRGBA() instead." + jsc.docsRef), this.fromRGBA(r, g, b, null, flags)
					}, this.fromString = function(str, flags) {
						if (!this.required && "" === str.trim()) return this.setPreviewElementBg(null), this.setValueElementValue(""), !0;
						var color = jsc.parseColorString(str);
						return !!color && ("any" === this.format.toLowerCase() && (this._currentFormat = color.format, "rgba" !== this.getFormat() && (color.rgba[3] = 1), this.redraw()), this.fromRGBA(color.rgba[0], color.rgba[1], color.rgba[2], color.rgba[3], flags), !0)
					}, this.toString = function(format) {
						switch (void 0 === format && (format = this.getFormat()), format.toLowerCase()) {
							case "hex":
								return this.toHEXString();
							case "rgb":
								return this.toRGBString();
							case "rgba":
								return this.toRGBAString()
						}
						return !1
					}, this.toHEXString = function() {
						return "#" + (("0" + Math.round(this.channels.r).toString(16)).substr(-2) + ("0" + Math.round(this.channels.g).toString(16)).substr(-2) + ("0" + Math.round(this.channels.b).toString(16)).substr(-2)).toUpperCase()
					}, this.toRGBString = function() {
						return "rgb(" + Math.round(this.channels.r) + "," + Math.round(this.channels.g) + "," + Math.round(this.channels.b) + ")"
					}, this.toRGBAString = function() {
						return "rgba(" + Math.round(this.channels.r) + "," + Math.round(this.channels.g) + "," + Math.round(this.channels.b) + "," + Math.round(100 * this.channels.a) / 100 + ")"
					}, this.toGrayscale = function() {
						return .213 * this.channels.r + .715 * this.channels.g + .072 * this.channels.b
					}, this.toCanvas = function() {
						return jsc.genColorPreviewCanvas(this.toRGBAString()).canvas
					}, this.toDataURL = function() {
						return this.toCanvas().toDataURL()
					}, this.toBackground = function() {
						return jsc.pub.background(this.toRGBAString())
					}, this.isLight = function() {
						return this.toGrayscale() > 127.5
					}, this.hide = function() {
						isPickerOwner() && detachPicker()
					}, this.show = function() {
						drawPicker()
					}, this.redraw = function() {
						isPickerOwner() && drawPicker()
					}, this.getFormat = function() {
						return this._currentFormat
					}, this.hasAlphaChannel = function() {
						return "auto" === this.alphaChannel ? "any" === this.format.toLowerCase() || "rgba" === this.getFormat() || void 0 !== this.alpha || void 0 !== this.alphaElement : this.alphaChannel
					}, this.processValueInput = function(str) {
						this.fromString(str) || this.exposeColor()
					}, this.processAlphaInput = function(str) {
						this.fromHSVA(null, null, null, parseFloat(str)) || this.exposeColor()
					}, this.exposeColor = function(flags) {
						if (!(flags & jsc.flags.leaveValue) && this.valueElement) {
							var value = this.toString();
							"hex" === this.getFormat() && (this.uppercase || (value = value.toLowerCase()), this.hash || (value = value.replace(/^#/, ""))), this.setValueElementValue(value)
						}
						if (!(flags & jsc.flags.leaveAlpha) && this.alphaElement) {
							var value = Math.round(100 * this.channels.a) / 100;
							this.setAlphaElementValue(value)
						}
						if (!(flags & jsc.flags.leavePreview) && this.previewElement) {
							var previewPos = null;
							(jsc.isTextInput(this.previewElement) || jsc.isButton(this.previewElement) && !jsc.isButtonEmpty(this.previewElement)) && (previewPos = this.previewPosition), this.setPreviewElementBg(this.toRGBAString())
						}
						isPickerOwner() && (redrawPad(), redrawSld(), redrawASld())
					}, this.setPreviewElementBg = function(color) {
						if (this.previewElement) {
							var position = null,
								width = null;
							(jsc.isTextInput(this.previewElement) || jsc.isButton(this.previewElement) && !jsc.isButtonEmpty(this.previewElement)) && (position = this.previewPosition, width = this.previewSize);
							var backgrounds = [];
							if (color) {
								backgrounds.push({
									image: jsc.genColorPreviewGradient(color, position, width ? width - jsc.pub.previewSeparator.length : null),
									position: "left top",
									size: "auto",
									repeat: position ? "repeat-y" : "repeat",
									origin: "padding-box"
								});
								var preview = jsc.genColorPreviewCanvas("rgba(0,0,0,0)", position ? {
									left: "right",
									right: "left"
								} [position] : null, width, !0);
								backgrounds.push({
									image: "url('" + preview.canvas.toDataURL() + "')",
									position: (position || "left") + " top",
									size: preview.width + "px " + preview.height + "px",
									repeat: position ? "repeat-y" : "repeat",
									origin: "padding-box"
								})
							} else backgrounds.push({
								image: "none",
								position: "left top",
								size: "auto",
								repeat: "no-repeat",
								origin: "padding-box"
							});
							for (var bg = {
									image: [],
									position: [],
									size: [],
									repeat: [],
									origin: []
								}, i = 0; i < backgrounds.length; i += 1) bg.image.push(backgrounds[i].image), bg.position.push(backgrounds[i].position), bg.size.push(backgrounds[i].size), bg.repeat.push(backgrounds[i].repeat), bg.origin.push(backgrounds[i].origin);
							var sty = {
								"background-image": bg.image.join(", "),
								"background-position": bg.position.join(", "),
								"background-size": bg.size.join(", "),
								"background-repeat": bg.repeat.join(", "),
								"background-origin": bg.origin.join(", ")
							};
							jsc.setStyle(this.previewElement, sty, this.forceStyle);
							var padding = {
								left: null,
								right: null
							};
							position && (padding[position] = this.previewSize + this.previewPadding + "px");
							var sty = {
								"padding-left": padding.left,
								"padding-right": padding.right
							};
							jsc.setStyle(this.previewElement, sty, this.forceStyle, !0)
						}
					}, this.setValueElementValue = function(str) {
						this.valueElement && ("input" === jsc.nodeName(this.valueElement) ? this.valueElement.value = str : this.valueElement.innerHTML = str)
					}, this.setAlphaElementValue = function(str) {
						this.alphaElement && ("input" === jsc.nodeName(this.alphaElement) ? this.alphaElement.value = str : this.alphaElement.innerHTML = str)
					}, this._processParentElementsInDOM = function() {
						if (!this._linkedElementsProcessed) {
							this._linkedElementsProcessed = !0;
							var elm = this.targetElement;
							do {
								var compStyle = jsc.getCompStyle(elm);
								compStyle.position && "fixed" === compStyle.position.toLowerCase() && (this.fixed = !0), elm !== this.targetElement && (jsc.getData(elm, "hasScrollListener") || (elm.addEventListener("scroll", jsc.onParentScroll, !1), jsc.setData(elm, "hasScrollListener", !0)))
							} while ((elm = elm.parentNode) && "body" !== jsc.nodeName(elm))
						}
					}, this.tryHide = function() {
						this.hideOnLeave && this.hide()
					}, void 0 === this.container ? this.container = window.document.body : this.container = jsc.node(this.container), !this.container) throw new Error("Cannot instantiate color picker without a container element");
				if (this.targetElement = jsc.node(targetElement), !this.targetElement) {
					if ("string" == typeof targetElement && /^[a-zA-Z][\w:.-]*$/.test(targetElement)) {
						var possiblyId = targetElement;
						throw new Error("If '" + targetElement + "' is supposed to be an ID, please use '#" + targetElement + "' or any valid CSS selector.")
					}
					throw new Error("Cannot instantiate color picker without a target element")
				}
				if (this.targetElement.jscolor && this.targetElement.jscolor instanceof jsc.pub) throw new Error("Color picker already installed on this element");
				if (this.targetElement.jscolor = this, jsc.addClass(this.targetElement, jsc.pub.className), jsc.instances.push(this), jsc.isButton(this.targetElement) && ("button" !== this.targetElement.type.toLowerCase() && (this.targetElement.type = "button"), jsc.isButtonEmpty(this.targetElement))) {
					jsc.removeChildren(this.targetElement), this.targetElement.appendChild(window.document.createTextNode(" "));
					var compStyle = jsc.getCompStyle(this.targetElement),
						currMinWidth;
					(parseFloat(compStyle["min-width"]) || 0) < this.previewSize && jsc.setStyle(this.targetElement, {
						"min-width": this.previewSize + "px"
					}, this.forceStyle)
				}
				if (void 0 === this.valueElement ? jsc.isTextInput(this.targetElement) && (this.valueElement = this.targetElement) : null === this.valueElement || (this.valueElement = jsc.node(this.valueElement)), this.alphaElement && (this.alphaElement = jsc.node(this.alphaElement)), void 0 === this.previewElement ? this.previewElement = this.targetElement : null === this.previewElement || (this.previewElement = jsc.node(this.previewElement)), this.valueElement && jsc.isTextInput(this.valueElement)) {
					var valueElementOrigEvents = {
						onInput: this.valueElement.oninput
					};
					this.valueElement.oninput = null, this.valueElement.addEventListener("keydown", onValueKeyDown, !1), this.valueElement.addEventListener("change", onValueChange, !1), this.valueElement.addEventListener("input", onValueInput, !1), valueElementOrigEvents.onInput && this.valueElement.addEventListener("input", valueElementOrigEvents.onInput, !1), this.valueElement.setAttribute("autocomplete", "off"), this.valueElement.setAttribute("autocorrect", "off"), this.valueElement.setAttribute("autocapitalize", "off"), this.valueElement.setAttribute("spellcheck", !1)
				}
				this.alphaElement && jsc.isTextInput(this.alphaElement) && (this.alphaElement.addEventListener("keydown", onAlphaKeyDown, !1), this.alphaElement.addEventListener("change", onAlphaChange, !1), this.alphaElement.addEventListener("input", onAlphaInput, !1), this.alphaElement.setAttribute("autocomplete", "off"), this.alphaElement.setAttribute("autocorrect", "off"), this.alphaElement.setAttribute("autocapitalize", "off"), this.alphaElement.setAttribute("spellcheck", !1));
				var initValue = "FFFFFF";
				void 0 !== this.value ? initValue = this.value : this.valueElement && void 0 !== this.valueElement.value && (initValue = this.valueElement.value);
				var initAlpha = void 0;
				if (void 0 !== this.alpha ? initAlpha = "" + this.alpha : this.alphaElement && void 0 !== this.alphaElement.value && (initAlpha = this.alphaElement.value), this._currentFormat = null, ["auto", "any"].indexOf(this.format.toLowerCase()) > -1) {
					var color = jsc.parseColorString(initValue);
					this._currentFormat = color ? color.format : "hex"
				} else this._currentFormat = this.format.toLowerCase();
				this.processValueInput(initValue), void 0 !== initAlpha && this.processAlphaInput(initAlpha)
			}
		}).pub.className = "jscolor", jsc.pub.activeClassName = "jscolor-active", jsc.pub.looseJSON = !0, jsc.pub.presets = {}, jsc.pub.presets.default = {}, jsc.pub.presets.light = {
			backgroundColor: "rgba(255,255,255,1)",
			controlBorderColor: "rgba(187,187,187,1)",
			buttonColor: "rgba(0,0,0,1)"
		}, jsc.pub.presets.dark = {
			backgroundColor: "rgba(51,51,51,1)",
			controlBorderColor: "rgba(153,153,153,1)",
			buttonColor: "rgba(240,240,240,1)"
		}, jsc.pub.presets.small = {
			width: 101,
			height: 101,
			padding: 10,
			sliderSize: 14
		}, jsc.pub.presets.medium = {
			width: 181,
			height: 101,
			padding: 12,
			sliderSize: 16
		}, jsc.pub.presets.large = {
			width: 271,
			height: 151,
			padding: 12,
			sliderSize: 24
		}, jsc.pub.presets.thin = {
			borderWidth: 1,
			controlBorderWidth: 1,
			pointerBorderWidth: 1
		}, jsc.pub.presets.thick = {
			borderWidth: 2,
			controlBorderWidth: 2,
			pointerBorderWidth: 2
		}, jsc.pub.sliderInnerSpace = 3, jsc.pub.chessboardSize = 8, jsc.pub.chessboardColor1 = "#666666", jsc.pub.chessboardColor2 = "#999999", jsc.pub.previewSeparator = ["rgba(255,255,255,.65)", "rgba(128,128,128,.65)"], jsc.pub.init = function() {
			if (!jsc.initialized)
				for (window.document.addEventListener("mousedown", jsc.onDocumentMouseDown, !1), window.document.addEventListener("keyup", jsc.onDocumentKeyUp, !1), window.addEventListener("resize", jsc.onWindowResize, !1), jsc.pub.install(), jsc.initialized = !0; jsc.triggerQueue.length;) {
					var ev = jsc.triggerQueue.shift();
					jsc.triggerGlobal(ev)
				}
		}, jsc.pub.install = function(rootNode) {
			var success = !0;
			try {
				jsc.installBySelector("[data-jscolor]", rootNode)
			} catch (e) {
				success = !1, console.warn(e)
			}
			if (jsc.pub.lookupClass) try {
				jsc.installBySelector("input." + jsc.pub.lookupClass + ", button." + jsc.pub.lookupClass, rootNode)
			} catch (e) {}
			return success
		}, jsc.pub.trigger = function(eventNames) {
			jsc.initialized ? jsc.triggerGlobal(eventNames) : jsc.triggerQueue.push(eventNames)
		}, jsc.pub.hide = function() {
			jsc.picker && jsc.picker.owner && jsc.picker.owner.hide()
		}, jsc.pub.chessboard = function(color) {
			var preview;
			return color || (color = "rgba(0,0,0,0)"), jsc.genColorPreviewCanvas(color).canvas.toDataURL()
		}, jsc.pub.background = function(color) {
			var backgrounds = [];
			backgrounds.push(jsc.genColorPreviewGradient(color));
			var preview = jsc.genColorPreviewCanvas();
			return backgrounds.push(["url('" + preview.canvas.toDataURL() + "')", "left top", "repeat"].join(" ")), backgrounds.join(", ")
		}, jsc.pub.options = {}, jsc.pub.lookupClass = "jscolor", jsc.pub.installByClassName = function() {
			return console.error('jscolor.installByClassName() is DEPRECATED. Use data-jscolor="" attribute instead of a class name.' + jsc.docsRef), !1
		}, jsc.register(), jsc.pub),
		jsc, BoxShadow, elm;
	return void 0 === window.jscolor && (window.jscolor = window.JSColor = jscolor), jscolor
}));