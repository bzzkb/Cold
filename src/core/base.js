//base.js 包括ajax、browser、event、dom、anim

Cold.add('base', function(){
	Cold.add('browser', function(){
		Cold.log("browser 载入完毕。"); 
		var _ua = navigator.userAgent.toLowerCase();
		var browser = {
			platform: navigator.platform,
			features: {xpath: !!(document.evaluate), air: !!(window.runtime), query: !!(document.querySelector)},
			engine : {
				presto: function(){
					return (!window.opera) ? false : ((arguments.callee.caller) ? 960 : ((document.getElementsByClassName) ? 950 : 925));
				},
				trident: function(){
					return (!window.ActiveXObject) ? false : ((window.XMLHttpRequest) ? ((document.querySelectorAll) ? 6 : 5) : 4);
				},
				webkit: function(){
					return (navigator.taintEnabled) ? false : ((browser.features.xpath) ? ((browser.features.query) ? 525 : 420) : 419);
				},
				gecko: function(){
					return (!document.getBoxObjectFor && window.mozInnerScreenX == null) ? false : ((document.getElementsByClassName) ? 19 : 18);
				}
			},
			detect : function(){
				var info = '';
				for(var eng in this.engine){
					var e = this.engine[eng]();
					if(e !== false){
						info += 'engine:'+eng + ' ' + e;
						break;
					}
				}
				for(var b in this){
					if(this[b] === true){
						info += ' browser:' + b + ' ' + this['version'];
						break;
					}
				}
				return info;
			},
			version : (_ua.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [0, '0'])[1],
			msie	: /msie/.test(_ua),
			firefox : /firefox/.test(_ua),
			chrome	: /chrome/.test(_ua) && /webkit/.test(_ua),
			safari	: /safari/.test(_ua) && !this.chrome,
			opera	: /opera/.test(_ua)
		};
		browser.IE = browser.ie = browser.msie;
		browser.IE6 = browser.ie6 = browser.msie && parseInt(browser.version) === 6;
		browser.IE7 = browser.ie7 = browser.msie && parseInt(browser.version) === 7;
		browser.IE8 = browser.ie8 = browser.msie && parseInt(browser.version) === 8;

		browser.winSize = function(doc){
			var w, h;
			doc = doc || document;
			if(window.innerHeight){
				w = window.innerWidth;
				h = window.innerHeight;
			}
			else if(doc.documentElement && doc.documentElement.clientHeight){
				w = doc.documentElement.clientWidth;
				h = doc.documentElement.clientHeight;
			}
			else{
				w = doc.body.clientWidth;
				h = doc.body.clientHeight;
			}
			return { width:w, height:h };
		};

		browser.pageSize = function(doc){
			doc = doc || document;
			return {
				'width' : Math.max(doc.documentElement.scrollWidth, doc.body.scrollWidth),
				'height' : Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight)
			};
		};

		browser.scroll = function(doc){
			doc = doc || document;
			return {
				'left' : Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft),
				'top' : Math.max(doc.documentElement.scrollTop, doc.body.scrollTop)
			};
		};
		return browser;
	});

	Cold.add('dom', function(){

		Cold.log("dom 载入完毕。");

		var _domCache = Cold['cache']['elems'] = {};

		var id = function(str){
			if(_domCache[str]){
				return _domCache[str];
			}
			if(Cold.isString(str)){
				return ( _domCache[str] = document.getElementById(str) );
			}
			return str;
		};

		var create = function(str, property){
			var re_html = /^[\s]*<([a-zA-Z]*)[\s]*([^>]*)>(.*)<\/\1>[\s]*/i,
				temp, el;
			if(str.match(re_html)){
				temp = document.createElement('div');
				temp.innerHTML = str;
				el = temp.firstChild;
				if (temp.childNodes.length === 1) {
					return el;
				} else {
					var frag = document.createDocumentFragment();
					while (el = temp.firstChild) frag.appendChild(el);
					return frag;
				}
			}
			else{
				el = document.createElement(str);
				if (property) {
					for (var i in property) el[i] = property[i];
				}
				return el;
			}
		};

		var $CN = function(str, node, tag){
			node = node || document;
			if(node.getElementsByClassName){
				return node.getElementsByClassName(str);
			}
			else{
				tag = tag || '*';
				var returnElements = [];
				var els = (tag === '*' && node.all)? node.all : node.getElementsByTagName(tag);
				var i = -1, l = els.length;
				str = str.replace(/\-/g, '\\-');
				var pattern = new RegExp('(^|\\s)' + str + '(\\s|$)');
				while(++i < l){
					if(pattern.test(els[i].className)){
						returnElements.push(els[i]);
					}
				}
				return returnElements;
			}
		};

		var $T = function(str){
			return typeof Cold.isString(str) ? document.getElementsByTagName(str) : str;
		};

		var _camelize = function(str){
			return String(str).replace(/\-(\w)/g, function(a, b){ return b.toUpperCase(); });
		};

		var _uncamelize = function(str){
			return String(str).replace(/[A-Z]/g, '-$&').toLowerCase();
		};

		var _hasClass = function(el, className){
			var cn = el.className,
				cns = cn.split(' ');
			for(var i=0, l=cns.length; i<l; i++){
				if(cns[i] === className){
					return true;
				}
			}
			return false;
		};

		var addClass = function(el, className){
			if(!_hasClass(el, className)){
				el.className = ( el.className == null )
								? className 
								: el.className + ' ' + className;
			}
		};

		var removeClass = function(el, className){
			var cn = el.className,
				cns = cn.split(' ');
			for(var i=0, l=cns.length; i<l; i++){
				if(cns[i] === className){
					cns[i] = '';
				}
			}
			el.className = cns.join(' ');
		};

		var opacity = function(el, opacity){
			var ret;
			el = id(el);
			if(opacity != null){
				var show = (opacity !== 0 && opacity !== '');
				if(show && css(el, 'display') === 'none'){
					css(el, 'display', 'block');
				}
				if(show && css(el, 'visibility') === 'hidden'){
					css(el, 'visibility', 'visible');
				}
				el.style.opacity = opacity;
				if(Cold.browser.ie && Cold.browser.version <= 8){
					el.style.filter = (opacity === '') ? '' : 'alpha(opacity=' + opacity*100 + ')';
					el.style.zoom = 1;
					if(opacity === 1){
						el.style.filter = '';
					}
				}
			}
			else{
				if(el.style.filter){
					ret = el.style.filter.match(/alpha\(opacity=(.*)\)/);
					ret = (!!ret) ? parseInt(ret[1], 10)/100 : 1.0;
					return ret;
				}
				return el.style.opacity || 1.0;
			}
		};

		var _getCurrentStyle = function(el, style){
			el = id(el);
			var ret = '',
				d = el.ownerDocument.defaultView;
			if(d && d.getComputedStyle){
				ret = d.getComputedStyle(el, null)[_camelize(style)];
			}else if(el.currentStyle){
				ret = el.currentStyle[_camelize(style)];
			}else{
				ret = el.style[style];
			}
			if(style === 'opacity'){
				if (ret) return parseFloat(ret, 10);
				else		return opacity(el);
			}
			return (!ret || ret === 'auto') ? 0 : ret;
		};

		var isStyle = function(el, p){
			return _camelize(p) in el.style || p in el.style || p === 'opacity';
		};

		var _cssForSingle = function(el, style, value){
			el = id(el);
			if(Cold.isString(style)){
				if(value != null){
					style.toLowerCase() === 'opacity'
						? opacity(el, value)
						: ( el.style[_camelize(style)] = value );
				}
				else{
					return _getCurrentStyle(el, style);
				};
				return el;
			}
			else{
				style = style || {};
				var styleText = '';
				for(var s in style){
					if(!style[s] && s.toLowerCase() !== 'opacity'){
						el.style[_camelize(s)] = '';
						continue;
					}
					s.toLowerCase() === 'opacity'
						? opacity(el, style[s])
						: ( styleText += _uncamelize(s) + ':' + style[s] + ';');
				}
				el.style.cssText += (el.style.cssText === '' ? '' : ';') + styleText;
				return el;
			}
		};

		var css = function(el, style, value){
			if(Cold.isNumber(el.length)){
				for(var i=0, l=el.length; i<l; i++){
					_cssForSingle(el[i], style, value);
				}
			}
			else{
				return _cssForSingle(el, style, value);
			}
		};

		var val = function(el, prop, value){
			el = id(el);
			if(Cold.isString(prop)){
				if(value != null) el.setAttribute(prop, value);
				else		return el.getAttribute(prop);
			}
			else{
				prop = prop || {};
				for(var p in prop){
					el.setAttribute(p, prop[p]);
				}
			}
			return el;
		};

		var html = function(el, value){
			el = id(el);
			if(!!value){
				el.innerHTML = value;
			}
			else{
				return el.innerHTML;
			}
			return el;
		};

		var _insertHTML = function(el, html, where){
			el = id(el);
			where = where? where.toLowerCase(): "beforeend";
			if(el.insertAdjacentHTML) {
				switch(where){
					case 'beforebegin':
						el.insertAdjacentHTML('BeforeBegin', html);
						return el.previousSibling;
					case 'beforeend':
						el.insertAdjacentHTML('BeforeEnd', html);
						return el.lastChild;
					case 'afterbegin':
						el.insertAdjacentHTML('AfterBegin', html);
						return el.firstChild;
					case 'afterend':
						el.insertAdjacentHTML('AfterEnd', html);
						return el.nextSibling;
				};
				throw 'Illegal insertion position : "' + where + '"';
			}
			else{
				var range = el.ownerDocument.createRange(), frag;
				switch (where) {
					case "beforebegin":
						range.setStartBefore(el);
						frag = range.createContextualFragment(html);
						el.parentNode.insertBefore(frag, el);
						return el.previousSibling;
					case "afterbegin":
						if (el.firstChild) {
							range.setStartBefore(el.firstChild);
							frag = range.createContextualFragment(html);
							el.insertBefore(frag, el.firstChild);
							return el.firstChild;
						}
						else {
							el.innerHTML = html;
							return el.firstChild;
						}
						break;
					case "beforeend":
						if (el.lastChild) {
							range.setStartAfter(el.lastChild);
							frag = range.createContextualFragment(html);
							el.appendChild(frag);
							return el.lastChild;
						}
						else {
							el.innerHTML = html;
							return el.lastChild;
						}
						break;
					case "afterend":
						range.setStartAfter(el);
						frag = range.createContextualFragment(html);
						el.parentNode.insertBefore(frag, el.nextSibling);
						return el.nextSibling;
				}
				throw 'Illegal insertion position : "' + where + '"';
			}
		};

		var insert = function(el, target, where){
			el = id(el);
			where = where? where.toLowerCase(): "beforeend";
			if(Cold.isString(target)){
				_insertHTML(el, target, where);
			}
			else{
				switch(where){
					case 'beforebegin':
						el.parentNode.insertBefore(target, el);
						break;
					case 'afterbegin':
						el.insertBefore(target, el.firstChild);
						break;
					case 'beforeend':
						el.appendChild(target);
						break;
					case 'afterend':
						el.parentNode.insertBefore(target, el.nextSibling || null);
						break;
					default:
						throw 'Illegal insertion position : "' + where + '"';
				};
				return target;
			}
		};

		var insertBefore = function(el, html){
			return insert(el, html, 'beforebegin');
		};

		var appendFront = function(el, html){
			return insert(el, html, 'afterbegin');
		};

		var appendEnd = function(el, html){
			return insert(el, html, 'beforeend');
		};

		var insertAfter = function(el, html){
			return insert(el, html, 'afterend');
		};

		var appendBody = function(html){
			return appendEnd(document.body, html);
		};

		var remove = function(el){
			if(el){
				return el.parentNode.removeChild(el);
			}
		};

		var	_hidden = Cold.IE && css(el, 'display') === 'none', w, h;
		var width = function(el){
			el = id(el);
			w = Math.max(el.offsetWidth, _hidden ? 0 : el.clientWidth) || 0;
			return w < 0 ? 0 : w;
		};
		var height = function(el){
			el = id(el);
			h = Math.max(el.offsetHeight, _hidden ? 0 : el.clientHeight) || 0;
			return h < 0 ? 0 : h;
		};

		var getScroll = Cold.browser.scroll;

		var getXY = function(el){
			var x = 0, y = 0, doc = el.ownerDocument, docElem = doc.documentElement,
				scrolls = getScroll(doc),
				clientTop = docElem.clientTop || doc.body.clientTop || 0,
				clientLeft = docElem.clientLeft || doc.body.clientLeft || 0;
			if(el.getBoundingClientRect){
				x = el.getBoundingClientRect().left + scrolls['left'] - clientLeft;
				y = el.getBoundingClientRect().top + scrolls['top'] - clientTop;
			}
			else{
				do{
					x += el.offsetLeft;
					x += el.offsetTop;
				}while(el = el.offsetParent);
			}
			return { 'x' : x, 'y' : y };
		};

		return {
			id			: id,
			$E			: id,
			$C			: create,
			create		: create,
			$CN			: $CN,
			$T			: $T,
			isStyle		: isStyle,
			addClass	: addClass,
			removeClass	: removeClass,
			css			: css,
			opacity		: opacity,
			val			: val,
			html		: html,
			insert		: insert,
			insertBefore: insertBefore,
			insertAfter	: insertAfter,
			appendFront	: appendFront,
			appendEnd	: appendEnd,
			appendBody	: appendBody,
			remove		: remove,
			width		: width,
			height		: height,
			getXY		: getXY
		};
		
	});

	Cold.add("ajax", function(){
		var _jsonToQuery = function(data){
			if(Cold.isString(data)){
				return data;
			}
			var q = '';
			for(var p in data){
				q += (p + '=' + data[p] + '&');
			}
			if(q !== ''){
				q = q.slice(0, -1);
			}
			return q.toLowerCase();
		};

		var _addQuery = function(url, data){
			return url + ( (url.indexOf('?') != -1) ? '&' : '?' ) + _jsonToQuery(data);
		};

		var getRequest = function(){
			try{
				return new XMLHttpRequest();
			}
			catch(e){
				try{
					return new ActiveXObject('MSXML2.XMLHTTP');
				}
				catch(e){
					return new ActiveXObject('Microsoft.XMLHTTP');
				}
			}
		};

		var _defaultOption = {
			method		: 'get',
			data		: {},
			async		: true,
			contentType : 'application/x-www-form-urlencoded',
			charset		: 'utf-8',
			timeout		: 30 * 1000,
			returnType	: 'json',	// json | xml | html | text | jsonp & script is undefined
			onSuccess	: function(){},
			onError		: function(){}
		};

		var ajax = function(url, option){
			if (url == '' || url == null) {
				throw new Error('ajax need parameter url.');
			}
			var XHR = getRequest(), method;
			Cold.extend(option, _defaultOption);
			method = option.method.toLowerCase();

			XHR.onreadystatechange = function(){
				var data = '';
				if(XHR.readyState === 4){
					if(XHR.status === 200 || XHR.status === 0){
						switch(option.returnType){
							case 'text':
							case 'html':
								data = XHR.responseText;
								break;
							case 'xml':
								data = XHR.responseXML;
								break;
							case 'script':
								break;
							case 'jsonp':
								break;
							case 'json':
								data = eval('('+ XHR.responseText +')');
								break;
						}
						option.onSuccess && option.onSuccess(data);
					}
					else{
						option.onError && option.onError();
					}
				}
			};
			if(option.data && method === 'get'){
				option.data['rd'] = new Date().valueOf();
				url = _addQuery(url, option.data);
			}
			XHR.open(method, url, option.async);
			XHR.setRequestHeader('Content-Type', option.contentType + ';charset=' + option.charset.toLowerCase());
			XHR.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			XHR.send( (method === 'post') ? _jsonToQuery(data) : null);
			return XHR;
		};

		var get = function(url, option){
			option = option || {};
			option['method'] = 'get';
			return ajax(url, option);
		};

		var post = function(url, option){
			option = option || {};
			option['method'] = 'post';
			return ajax(url, option);
		};

		var getXml = function(url, option){
			option = option || {};
			option['method'] = 'get';
			option['returnType'] = 'xml';
			return ajax(url, option);
		};

		var getText = function(url, option){
			option = option || {};
			option['method'] = 'get';
			option['returnType'] = 'text';
			return ajax(url, option);
		};

		var getScript = function(url, callback){
		
		};
		
		return {
			getXHR		: getRequest,
			ajax		: ajax,
			get			: get,
			post		: post,
			getXml		: getXml,
			getText		: getText,
			getScript	: getScript
		};
	});

	Cold.add('event', function(){

		//var _eventsList = {};

		//console.info("event 载入完毕。");

		var id = function(el){
			return el = Cold.isString(el) ? document.getElementById(el) : el;
		};

		var addEvent = function(el, eventType, func){
			el = id(el);
			eventType = eventType || 'click';
			if(!el || el.nodeType === 3 || el.nodeType === 8 || !Cold.isFunction(func)){
				return false;
			}
			if(el.addEventListener){
				el.addEventListener(eventType, func, false);
			}
			else if(el.attachEvent){
				el.attachEvent('on' + eventType, function(){
					func.call(el, fixEvent(window.event));
				});
			}
			else{
				el['on' + eventType] = func;
			}
			return true;
		};

		var delEvent = function(el, eventType, func){
			el = id(el);
			eventType = eventType || 'click';
			if(!el || el.nodeType === 3 || el.nodeType === 8 || !Cold.isFunction(func)){
				return false;
			}
			if(el.removeEventListener){
				el.removeEventListener(eventType, func, false);
			}
			else if(el.detachEvent){
				el.detachEvent('on' + eventType, func);
			}
			else{
				el['on' + eventType] = null;
			}
			return true;
		};

		var fixEvent = function(e){
			e = e || window.event;
			if (!e.target) {
				e.target = e.srcElement;
				e.pageX = e.x;
				e.pageY = e.y;
				e.stopPropagation = function(){
					e.cancelBubble = true;
				};
				e.keyCode = e.keyCode || e.which;
			}
			return e;
		};

		var fireEvent = function(el, eventType){
			el = id(el);
			eventType = eventType || 'click';

			if(el.fireEvent){
				el.fireEvent('on' + eventType);  
			}
			else{  
				var evt = document.createEvent('HTMLEvents');
				evt.initEvent(eventType, true, true);
				el.dispatchEvent(evt);
			}
			return true;
		};

		var click = function(el, func){
			return addEvent(el, 'click', func);
		};

		var hover = function(el, option){
			var timeout = 100,
				timer = null,
				over = option.over || function(){},
				out = option.out || function(){},
				showElems = option.elems || [],
				overFn = function(){
					timer && clearTimeout(timer);
					timer = setTimeout(function(){
						if(el.over === true){
							over && over();
						}
					},timeout);
				},
				outFn = function(){
					timer && clearTimeout(timer);
					timer = setTimeout(function(){
						if(el.over === false){
							out && out();
						}
					},timeout);
				};

			addEvent(el, 'mouseover', function(){
				el.over = true;
				overFn();
			});
			addEvent(el, 'mouseout', function(){
				el.over = false;
				outFn();
			});

			for(var i=0, se, l=showElems.length; se = showElems[i]; i++){
				addEvent(se, 'mouseover', function(){
					el.over = true;
					overFn();
				});
				addEvent(se, 'mouseout', function(){
					el.over = false;
					outFn();
				});
			}
		};

		var toggle = function(el, click1, click2){
			var num = 0;
			click1 = click1 || function(){};
			click2 = click2 || function(){};
			click(el, function(){
				(num++)%2 === 0 ? click1() : click2();
			});
		};

		return {
			add		: addEvent,
			remove	: delEvent,
			fire	: fireEvent,
			fix		: fixEvent,
			click	: click,
			hover	: hover,
			toggle	: toggle
		};
	});

	//anim.js
	Cold.add('anim', function(){

		Cold.log("anim 载入完毕。");

		var _id = Cold.dom.$E,
			_css = Cold.dom.css,
			_create = Cold.dom.create,
			_isStyle = Cold.dom.isStyle,
			_getXY = Cold.dom.getXY,
			BACK_CONST = 1.70158,
			$void = function(){},
			$time = Date.now || function(){
				return +new Date;
			};

		var Easing = {
			'linear' : function(t){
				return t;
			},
			'easeIn' : function(t){
				return t * t;
			},
			'easeOut' : function(t) {
				return ( 2 - t) * t;
			},
			'easeBoth' : function(t){
				return (t *= 2) < 1 ?
					.5 * t * t :
					.5 * (1 - (--t) * (t - 2));
			},
			'easeInStrong' : function(t){
				return t * t * t * t;
			},
			'easeOutStrong' : function(t){
				return 1 - (--t) * t * t * t;
			},
			'easeBothStrong' : function(t){
				return (t *= 2) < 1 ?
					.5 * t * t * t * t :
					.5 * (2 - (t -= 2) * t * t * t);
			},
			'elasticIn' : function(t){
				var p = .3, s = p / 4;
				if (t === 0 || t === 1) return t;
				return -(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
			},
			'elasticOut' : function(t){
				var p = .3, s = p / 4;
				if (t === 0 || t === 1) return t;
				return Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
			},
			'elasticBoth' : function(t){
				var p = .45, s = p / 4;
				if (t === 0 || (t *= 2) === 2) return t;

				if (t < 1) {
					return -.5 * (Math.pow(2, 10 * (t -= 1)) *
						Math.sin((t - s) * (2 * Math.PI) / p));
				}
				return Math.pow(2, -10 * (t -= 1)) *
					Math.sin((t - s) * (2 * Math.PI) / p) * .5 + 1;
			},
			'backIn' : function(t){
				if (t === 1) t -= .001;
				return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
			},
			'backOut' : function(t){
				return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
			},
			'backBoth' : function(t){
				if ((t *= 2 ) < 1) {
					return .5 * (t * t * (((BACK_CONST *= (1.525)) + 1) * t - BACK_CONST));
				}
				return .5 * ((t -= 2) * t * (((BACK_CONST *= (1.525)) + 1) * t + BACK_CONST) + 2);
			},
			'bounceIn' : function(t){
				return 1 - Easing.bounceOut(1 - t);
			},
			'bounceOut' : function(t){
				var s = 7.5625, r;
				if (t < (1 / 2.75)) {
					r = s * t * t;
				}
				else if (t < (2 / 2.75)) {
					r = s * (t -= (1.5 / 2.75)) * t + .75;
				}
				else if (t < (2.5 / 2.75)) {
					r = s * (t -= (2.25 / 2.75)) * t + .9375;
				}
				else {
					r = s * (t -= (2.625 / 2.75)) * t + .984375;
				}
				return r;
			},
			'bounceBoth' : function(t){
				if (t < .5) {
					return Easing.bounceIn(t * 2) * .5;
				}
				return Easing.bounceOut(t * 2 - 1) * .5 + .5;
			}
		};

		var _color = {
			//from YUI
			re_RGB: /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,
			re_hex: /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,
			re_hex3: /^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i,
			
			getRGB : function(val){
				if(_color.re_hex.exec(val)) {
					val = 'rgb(' + [
						parseInt(RegExp.$1, 16),
						parseInt(RegExp.$2, 16),
						parseInt(RegExp.$3, 16)
					].join(', ') + ')';
				}
				else if(_color.re_hex3.exec(val)){
					val = 'rgb(' + [
						parseInt(RegExp.$1+RegExp.$1, 16),
						parseInt(RegExp.$2+RegExp.$2, 16),
						parseInt(RegExp.$3+RegExp.$3, 16)
					].join(', ') + ')';
				}
				return val;
			},
			isColorStyle : function(p){
				var re_color = /backgroundColor|borderBottomColor|borderLeftColor|borderRightColor|borderTopColor|color|outlineColor/i;
				return re_color.test(p);
			},
			init : function(el, p, prop){
				var from, to, frgb, trgb, re_rgb = _color.re_RGB;

				frgb = _color.getRGB(_css(el, p));
				frgb = frgb.match(re_rgb);
				from = [parseInt(frgb[1], 10), parseInt(frgb[2], 10), parseInt(frgb[3], 10)];

				trgb = _color.getRGB(prop);
				trgb = trgb.match(re_rgb);
				to = [parseInt(trgb[1], 10), parseInt(trgb[2], 10), parseInt(trgb[3], 10)];

				return [from, to];
			}
		};

		var _effect = function(){
			this.init.apply(this, arguments);
		};

		var _getTransitionName = function(){
			var name = 'transition', tempEl = _create('div'), prefixs = ['Webkit', 'Moz', 'O'];
			if (tempEl.style[name] === undefined) {
				for(var i=0; i<prefixs.length; i++){
					if(tempEl.style[name = prefixs[i] + 'Transition'] !== undefined){
						return name;
					}
				}
				return null;
			}
			return 'transition';
		};

		_effect.DefaultOption = {
			'fps'			: 25,
			'duration'		: 1000,
			'onStart'		: $void,
			'onComplete'	: $void,
			/*
			'onPause'		: $void,
			'onResume'		: $void,
			*/
			'easing'		: 'linear',
			'css3support'	: true
		};
		_effect.prototype = (function(){
			return {
				init : function(el, props, option){
					this.el = _id(el);
					this.props = props || {};
					this.from = {};
					this.to = {};
					this.unit = {};
					
					option = option || {};
					option = Cold.extend(option, _effect.DefaultOption);
					Cold.extend(this, option, true);
					//this.current = 0;
					if(this.css3support){
						if(/^(linear|easeIn|easeOut|easeInOut|cubic-bezier\(.*\))$/.test(this.easing)){
							this.transitionName = _getTransitionName();
						}
						//修复firefox对left,top等定位属性在css3 transition下,如果没有定义left等属性就没有动画效果的问题
						if(this.transitionName === 'MozTransition'){
							for(var p in this.props){
								if(/top|left|right|bottom/i.test(p) && !this.el.style[p]){
									_css(this.el, p, _css(this.el, p));
								}
							}
						}
						//记录有多少css动画效果
						if(this.transitionName){
							this.el.css3AnimNum || this.el.css3AnimNum === 1
											? this.el.css3AnimNum++
											: ( this.el.css3AnimNum = 1 );
						}
					}
				},
				initData : function(){
					this.begin = $time();
					this.end = this.begin + this.duration;
					for(var p in this.props){
						var prop = this.props[p],
							temp = Cold.isString(prop) ? prop.match(/^(-?\d*)(\.\d*)?(.*)$/) : prop;
						//Cold.log(temp);
						if(_color.isColorStyle(p)){
							var c = _color.init(this.el, p, prop);
							this.from[p] = c[0];
							this.to[p] = c[1];
						}
						else if(temp != null){
							this.from[p] = parseFloat(this.el[p] || _css(this.el, p));
							this.to[p] = temp[1] || temp;
							this.unit[p] = temp[3] || 'px';
						}
						else{
							throw 'anim init: Invalid arguments.';
						}
						//Cold.log(p+"| from: "+this.from[p] + " to: " + this.to[p]);
					}
				},
				step : function(){
					var now = $time();
					//Cold.log(this.begin + " " + now + " " + this.end);
					//Cold.log(this.duration);
					if(now < this.end){
						this.update((now - this.begin) / this.duration);
					}
					else{
						this.stop && this.stop();
						this.update(1);
						this.onComplete && this.onComplete();
					}
				},
				update : function(progress){
					for(var p in this.props){
						var pos = this.compute(this.from[p], this.to[p], progress);
						if(_isStyle(this.el, p)){
							if(p !== 'opacity' && !_color.isColorStyle(p)) pos = parseInt(pos, 10) + this.unit[p];
							//Cold.log(this.from[p] + " " + pos + " " + this.to[p]);
							_css(this.el, p, pos);
						}
						else{
							//Cold.log(this.el + " " + p + " " + pos);
							this.el[p] = pos;
						}
					}
				},
				compute : function(from, to, progress){
					var e = Easing[this.easing || 'linear'];
					if(Cold.isArray(from)){
						var r = parseInt(from[0] + (to[0] - from[0]) * e(progress), 10),
							b = parseInt(from[1] + (to[1] - from[1]) * e(progress), 10),
							g = parseInt(from[2] + (to[2] - from[2]) * e(progress), 10);
						return 'rgb('+ r +','+ b +','+ g +')';
					}
					return from + (to - from) * e(progress);
				},
				pause : function(){
					this.paused = true;
				},
				resume : function(){
					this.paused = false;
				},
				//无法使用在queue模式下
				repeat : function(){
					var oldComplete = this.onComplete;
					this.onComplete = (function(that){
						return function(){
							oldComplete && oldComplete();
							that.reset();
							that.start(false);
						};
					})(this);
				},
				reset : function(){
					this.update(0);
					this.stop();
				},
				start : function(inQueue){
					!this.transitionName && this.stop();

					var firstRun = false, f;
					inQueue = inQueue || false;
					var _uncamelize = function(str){
						return String(str).replace(/[A-Z]/g, '-$&').toLowerCase();
					};
					var f = (function(that){
						return function(){
								that.initData();
								var old = that.onComplete, next;
								that.onStart && that.onStart();

								that.onComplete = function(){
									old && old();
									if(firstRun || inQueue){
										if(that.el.queue !== null){
											next = that.el.queue.shift();
											next ? next() : ( that.el.queue = null );
										}
									}
								};
								//css3动画效果
								if(that.transitionName){
									Cold.log('css3 anim.');
									var transition = 'all '+ that.duration + 'ms ' + _uncamelize(that.easing);
									that.el.style[that.transitionName] = transition;
									setTimeout(function(){
										//设定css3 transition
										that.el.style[that.transitionName] = transition;
										//设定目标样式
										that.update(1);
									}, 0);
									//到时间后停止并回调
									setTimeout(function(){
										that.stop();
										that.onComplete && that.onComplete();
									}, that.duration);
								}
								//正常动画
								else{
									Cold.log('tandition anim.');
									that.timer = setInterval(function(){
										if(that.paused){
											that.end += that.fps;
											return;
										}
										that.step.call(that);
									}, that.fps || _effect.DefaultOption.fps);
								}
							};
					})(this);
					
					if(this.el.queue == null){
						firstRun = true;
						this.el.queue = [];
						//Cold.log('!!!');
						f();
						return this;
					}
					inQueue ? this.el.queue.push(f) : f();
					return this;
				},
				stop: function(){
					if(this.transitionName){
						if(Cold.isNumber(this.el.css3AnimNum) && --this.el.css3AnimNum === 0){ //当最后一个效果结束，去掉transition
							_css(this.el, this.transitionName, '');
						}
					}
					else{
						this.timer && clearInterval(this.timer);
						this.timer = null;
					}
				}
			};
		})();

		var _runBuilder = function(inQueue){
			inQueue = inQueue || false;
			return function(el, props, callback, duration, easing){
				var option = {};
				if(Cold.isFunction(callback) || callback === null){
					option.onComplete = callback;
					option.duration = duration;
					option.easing = easing;
				}
				else{
					option = callback;
				}
				var anim = new _effect(el, props, option);
				return anim.start(inQueue);
			};
		};

		/* run 和 queue的不同之处在于，run直接执行，queue会等到它前面的run和queue执行完了才执行 */
		var run = _runBuilder();

		/* queue在第一个出现时，效果和run一样 */
		var queue = _runBuilder(true);

		var move = function(el, toPos, callback, duration, easing){
			if(_css(el, 'position') !== 'static'){
				var anim = new _effect(el, { left:toPos[0], top:toPos[1] },{
					'duration' : duration,
					'onComplete' : callback,
					'easing' : easing
				});
				anim.start();
			}
			else{
				throw 'position is static, cant move!';
			}
		};

		var fade = function(el, to, callback, duration, easing){
			var anim = new _effect(el, { opacity : to },{
				'duration' : duration,
				'onComplete' : callback,
				'easing' : easing
			});
			return anim.start();
		};

		var fadeIn = function(el, callback, duration, easing){
			var anim = new _effect(el, { opacity : 1 },{
				'duration' : duration,
				'onComplete' : callback,
				'easing' : easing
			});
			return anim.start();
		};

		var fadeOut = function(el, callback, duration, easing){
			var anim = new _effect(el, { opacity : 0 },{
				'duration' : duration,
				'onComplete' : callback,
				'easing' : easing
			});
			return anim.start();
		};

		var slide = function(el, to, callback, duration, easing){
			var anim = new _effect(el, { height : to },{
				'duration' : duration,
				'onComplete' : callback,
				'easing' : easing
			});
			return anim.start();
		};

		var scrollTo = function(top, callback, duration, easing){
			if(Cold.isString(top)){
				top = _getXY(_id(top.match(/\s*#(.*)\s*/)[1]))['y'];
			}
			else{
				top = _getXY(top)['y'];
			}
			var handle = document.documentElement
				_ua = navigator.userAgent.toLowerCase();;
			//修复chrome对document.documentElement.scrollTop无法识别的bug
			if(/chrome/.test(_ua)){
				handle = document.body;
			}
			var anim = new _effect(handle, { scrollTop : top },{
				'duration' : Cold.isFunction(callback) ? duration : callback,
				'onComplete' : Cold.isFunction(callback) ? callback : $void,
				'easing' : easing,
				'css3support' : false
			});
			return anim.start();
		};

		return {
			run			: run,
			queue		: queue,
			move		: move,
			fade		: fade,
			fadeIn		: fadeIn,
			fadeOut		: fadeOut,
			slide		: slide,
			scrollTo	: scrollTo,
			Easing		: Easing
		};
	});
});