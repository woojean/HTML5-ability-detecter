

function isBlock(element) {
	return getStyle(element, 'display') == 'block';
};


function getStyle(elem, name) {
	function camelCase(str){
		return str.replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase()
		})
	}

	if (elem.style[name]) {
		return elem.style[name];
	} else if (elem.currentStyle) {
		return elem.currentStyle[camelCase(name)];
	}
	else if (document.defaultView && document.defaultView.getComputedStyle) {
		s = document.defaultView.getComputedStyle(elem, "");
		return s && s.getPropertyValue(name);
	} else {
		return null;
	}
};


function closesImplicitly(name) {
	var foo = document.createElement('div');
	foo.innerHTML = '<p><' + name + '></' + name + '>';
	return foo.childNodes.length == 2;
};

function isHidden(element) {
	return this.getStyle(element, 'display') == 'none';
}


function createInput(type) {
	var wrapper = document.createElement('div');
	document.body.appendChild(wrapper)

	var field = document.createElement('input');
	wrapper.appendChild(field);
			
	try {
		field.setAttribute('type', type);
	} catch(e) {
	}
	
	wrapper.style.position = 'absolute';
	wrapper.style.display = 'inline-block';
	wrapper.style.top = '0px';
	wrapper.style.left = '0px';
			
	return { field: field, wrapper: wrapper };
};

var getRenderedStyle = (function(){
	function getRenderedStyle(elem, name) {
		if (document.defaultView && document.defaultView.getComputedStyle) {
			s = document.defaultView.getComputedStyle(elem, "");
			r = [];
		        
			if (s.length) {
				for (var i = 0; i < s.length; i++) {
					try {
						v = s.getPropertyValue(s[i]);
						if (v != '') {
							r.push(s[i] + ': ' + v);
						}
					} catch(e) {
					};
				}
			} else {
				for (var i in s) {
					try {
						v = s.getPropertyValue(i);
						if (v != '') {
							r.push(i + ': ' + v);
						}
					} catch(e) {
					};
				}
			}
		        
			return r.join('; ') + ';';
		} else {
			return null;
		}
	}
	return getRenderedStyle;
})();


function removeInput(e) {
	document.body.removeChild(e.wrapper);
};


var isEventSupported = (function(){
	var TAGNAMES = {
		'select':'input','change':'input','input':'input','submit':'form','reset':'form','forminput':'form','formchange':'form','error':'img','load':'img','abort':'img'
	}
		
	function isEventSupported(eventName, element) {
		element = element || document.createElement(TAGNAMES[eventName] || 'div');
		eventName = 'on' + eventName;
			
		var isSupported = (eventName in element);
			
		if (!isSupported) {
			if (!element.setAttribute) {
				element = document.createElement('div');
			}
			if (element.setAttribute && element.removeAttribute) {
				element.setAttribute(eventName, '');
				isSupported = typeof element[eventName] == 'function';
				
				if (typeof element[eventName] != 'undefined') {
					element[eventName] = void 0;
				}
				element.removeAttribute(eventName);
			}
		}
				
		element = null;
		return isSupported;
	}

	return isEventSupported;
})();





function canPlayType(t) {
	/*
	There is a bug in iOS 4.1 or earlier where probably and maybe are switched around.
	This bug was reported and fixed in iOS 4.2 
	*/
				
	if (Browsers.isOs('iOS', '<', '4.2'))
		return this.element.canPlayType(t) == 'probably' || this.element.canPlayType(t) == 'maybe';
	else 
		return this.element.canPlayType(t) == 'probably';
}

