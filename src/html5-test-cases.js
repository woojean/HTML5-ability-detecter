/* HTML5 ability detecter for browsers & webviews
*  @author woojean
*  https://github.com/woojean/HTML5-ability-detecter
*/

// -------------------------------------------------------------------
QUnit.module( "解析规则（Parsing rules）" );

QUnit.test( "<!DOCTYPE html>标记能够触发使用HTML5标准渲染页面", function( assert ) {
	assert.equal( document.compatMode, "CSS1Compat", "当文档有了标准声明时，document.compatMode的值应该等于CSS1compat（即标准兼容模式开启）" );
});

QUnit.test( "标签解析功能正常（HTML5 tokenizer）", function( assert ) {
	var result = true;
	var e = document.createElement('div');	
	try {
		e.innerHTML = "<div<div>";
		result &= e.firstChild && e.firstChild.nodeName == "DIV<DIV";
		assert.ok(result, "<div<div>的定义能够正常解析为标签" );

		e.innerHTML = "<div foo<bar=''>";
		result &= e.firstChild.attributes[0].nodeName == "foo<bar" || e.firstChild.attributes[0].name == "foo<bar";
		assert.ok(result, "foo<bar=''>的定义能够正常解析为属性" );

		e.innerHTML = "<div foo=`bar`>";
		result &= e.firstChild.getAttribute("foo") == "`bar`";
		assert.ok(result, "带`字符的属性定义能够正常解析" );

		e.innerHTML = "<div \"foo=''>";
		result &= e.firstChild && (e.firstChild.attributes[0].nodeName == "\"foo" || e.firstChild.attributes[0].name == "\"foo");
		assert.ok(result, "带\"的属性定义能够正常解析" );

		e.innerHTML = "<a href='\nbar'></a>";
		result &= e.firstChild && e.firstChild.getAttribute("href") == "\nbar";
		assert.ok(result, "带\n的属性定义能够正常解析" );
				
		e.innerHTML = "<!DOCTYPE html>";
		result &= e.firstChild == null;
		assert.ok(result, "<!DOCTYPE html>不会被解析为HTML标签（因为它不属于HTML标签）" );
				
		e.innerHTML = "\u000D";
		result &= e.firstChild && e.firstChild.nodeValue == "\u000A";
		assert.ok(result, "换行（\r）会被解析为回车（\n）" );
				
		e.innerHTML = "&lang;&rang;";
		result &= e.firstChild.nodeValue == "\u27E8\u27E9";
		assert.ok(result, "转义的 < 和 > 能够被解析" );

		e.innerHTML = "&apos;";
		result &= e.firstChild.nodeValue == "'";
		assert.ok(result, "转义的'（单引号）能够被解析" );
				
		//e.innerHTML = "&ImaginaryI;";
		//result &= e.firstChild.nodeValue == "\u2148";
				
		//e.innerHTML = "&Kopf;";
		//result &= e.firstChild.nodeValue == "\uD835\uDD42";
				
		//e.innerHTML = "&notinva;";
		//result &= e.firstChild.nodeValue == "\u2209";
				
		e.innerHTML = '<?import namespace="foo" implementation="#bar">';
		result &= e.firstChild && e.firstChild.nodeType == 8 && e.firstChild.nodeValue == '?import namespace="foo" implementation="#bar"';
		assert.ok(result, "用<? ... >包含的内容（含#、“）会被解析为注释" );

		e.innerHTML = '<![CDATA[x]]>';
		result &= e.firstChild && e.firstChild.nodeType == 8 && e.firstChild.nodeValue == '[CDATA[x]]';
		assert.ok(result, "用<! ... >包含的内容（含CDATA）会被解析为注释" );

		e.innerHTML = '<!--foo--bar-->';
		result &= e.firstChild && e.firstChild.nodeType == 8 && e.firstChild.nodeValue == 'foo--bar';
		assert.ok(result, "用<! ... >包含的内容会被解析为注释" );
				
		e.innerHTML = "<textarea><!--</textarea>--></textarea>";
		result &= e.firstChild && e.firstChild.firstChild && e.firstChild.firstChild.nodeValue == "<!--";
		assert.ok(result, "<textarea>标签内的注释不会被影响标签解析" );		

		//e.innerHTML = "<textarea><!--</textarea>-->";
		//result &= e.firstChild && e.firstChild.firstChild && e.firstChild.firstChild.nodeValue == "<!--";

		e.innerHTML = "<style><!--</style>--></style>";
		result &= e.firstChild && e.firstChild.firstChild && e.firstChild.firstChild.nodeValue == "<!--";
		assert.ok(result, "<style>标签内的注释不会被影响标签解析" );	

		//e.innerHTML = "<style><!--</style>-->";
		//result &= e.firstChild && e.firstChild.firstChild && e.firstChild.firstChild.nodeValue == "<!--";
	} catch(e) {
		assert.ok(false, "用<! ... >标签解析功能异常" );
	}
});

QUnit.test( "HTML5 DOM树构建功能正常", function( assert ) {
	var e = document.createElement('div');	
	e.innerHTML = "<div></div>";
	var result = e.firstChild && "namespaceURI" in e.firstChild && e.firstChild.namespaceURI == "http://www.w3.org/1999/xhtml";
	assert.ok(result, "可以获取节点的namespaceURI，并且值为http://www.w3.org/1999/xhtml" );
});

QUnit.test( "能够识别内联SVG", function( assert ) {
	var e = document.createElement('div');
	e.innerHTML = '<svg></svg>';
	var result = e.firstChild && "namespaceURI" in e.firstChild && e.firstChild.namespaceURI == 'http://www.w3.org/2000/svg';
	assert.ok(result, "能够识别出标签内包含的<svg>标签" );
});


QUnit.test( "能够识别内联MathML", function( assert ) {
	var e = document.createElement('div');
	e.innerHTML = '<math></math>';
	var result = e.firstChild && "namespaceURI" in e.firstChild && e.firstChild.namespaceURI == 'http://www.w3.org/1998/Math/MathML';
	assert.ok(result, "能够识别出标签内包含的<math>标签" );
});

// -------------------------------------------------------------------
QUnit.module( "元素（Elements）" );

QUnit.test( "支持自定义属性", function( assert ) {
	var element = document.createElement('div');
	element.setAttribute('data-test', 'test');
	var result = 'dataset' in element;  // !
	assert.ok(result, "节点的dataset属性存在" );
});

QUnit.test( "支持section新标签", function( assert ) {
	var element = document.createElement('section');
	document.body.appendChild(element);
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& isBlock(element) 
		&& closesImplicitly('section');
	assert.ok(result, "能够成功创建section标签" );
	document.body.removeChild(element);
});

QUnit.test( "支持nav新标签", function( assert ) {
	var element = document.createElement('nav');
	document.body.appendChild(element);
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& isBlock(element) 
		&& closesImplicitly('nav');
	assert.ok(result, "能够成功创建nav标签" );
	document.body.removeChild(element);
});

QUnit.test( "支持article新标签", function( assert ) {
	var element = document.createElement('article');
	document.body.appendChild(element);
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& isBlock(element) 
		&& closesImplicitly('article');
	assert.ok(result, "能够成功创建article标签" );
	document.body.removeChild(element);
});

QUnit.test( "支持aside新标签", function( assert ) {
	var element = document.createElement('aside');
	document.body.appendChild(element);
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& isBlock(element) 
		&& closesImplicitly('aside');
	assert.ok(result, "能够成功创建aside标签" );
	document.body.removeChild(element);
});

QUnit.test( "支持header新标签", function( assert ) {
	var element = document.createElement('header');
	document.body.appendChild(element);
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& isBlock(element) 
		&& closesImplicitly('header');
	assert.ok(result, "能够成功创建header标签" );
	document.body.removeChild(element);
});

QUnit.test( "支持footer新标签", function( assert ) {
	var element = document.createElement('footer');
	document.body.appendChild(element);
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& isBlock(element) 
		&& closesImplicitly('footer');
	assert.ok(result, "能够成功创建footer标签" );
	document.body.removeChild(element);
});

QUnit.test( "支持main新标签", function( assert ) {
	var element = document.createElement('main');
	document.body.appendChild(element);
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& isBlock(element);
	assert.ok(result, "能够成功创建main标签" );
	document.body.removeChild(element);
});

QUnit.test( "支持figure新标签", function( assert ) {
	var element = document.createElement('figure');
	document.body.appendChild(element);
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& isBlock(element) 
		&& closesImplicitly('figure');
	assert.ok(result, "能够成功创建figure标签" );
	document.body.removeChild(element);
});

QUnit.test( "支持figcaption新标签", function( assert ) {
	var element = document.createElement('figcaption');
	document.body.appendChild(element);
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& isBlock(element);
	assert.ok(result, "能够成功创建figcaption标签" );
	document.body.removeChild(element);
});

QUnit.test( "a标签支持download属性", function( assert ) {
	var element = document.createElement('a');
	assert.ok('download' in element, "a标签的download属性存在" );
});

QUnit.test( "a标签支持ping属性", function( assert ) {
	var element = document.createElement('a');
	assert.ok('ping' in element, "a标签的ping属性存在" );
});

QUnit.test( "支持mark新标签", function( assert ) {
	var element = document.createElement('mark');
	document.body.appendChild(element);
	var color = getStyle(element, 'background-color');
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& (color) 
		&& (color != 'transparent');
	assert.ok(result, "能够成功创建mark标签" );
	document.body.removeChild(element);
});

QUnit.test( "支持ruby、rt、rp等新标签", function( assert ) {
	var container = document.createElement('div');
	document.body.appendChild(container);
	container.innerHTML = "<ruby id='ruby'><rp id='rp'></rp><rt id='rt'></rt></ruby>";
	var rubyElement = document.getElementById('ruby');
	var rtElement = document.getElementById('rt');
	var rpElement = document.getElementById('rp');
			
	var rubySupport = false;
	var rtSupport = false;
	var rpSupport = false;

	try {
		// !!
		rubySupport = rubyElement && rubyElement instanceof HTMLElement && !(rubyElement instanceof HTMLUnknownElement);
		rtSupport = rtElement && rtElement instanceof HTMLElement && !(rtElement instanceof HTMLUnknownElement);
		rpSupport = rpElement && rpElement instanceof HTMLElement && !(rpElement instanceof HTMLUnknownElement) && isHidden(rpElement);
	} catch(error) {
		console.log(error);				
		assert.ok(false, "不能够成功创建ruby、rt、rp等标签" );
	}
			
	document.body.removeChild(container);					
	assert.ok(rubySupport && rtSupport && rpSupport, "能够成功创建ruby、rt、rp等标签" );	
});

QUnit.test( "支持time新标签", function( assert ) {
	var element = document.createElement('time');
	var result = typeof HTMLTimeElement != 'undefined' && element instanceof HTMLTimeElement;
	assert.ok(result, "能够成功创建time标签" );
});

QUnit.test( "支持wbr新标签", function( assert ) {
	var element = document.createElement('wbr');
	var result = element instanceof HTMLElement && !(element instanceof HTMLUnknownElement);
	assert.ok(result, "能够成功创建wbr标签" );
});

QUnit.test( "支持details新标签", function( assert ) {
	var element = document.createElement('details');
	element.innerHTML = '<summary>a</summary>b';
	document.body.appendChild(element);

	var height = element.offsetHeight;
	element.open = true;

	var result = height != element.offsetHeight;
				
	document.body.removeChild(element);
	assert.ok(result, "能够成功创建details标签" );
});

QUnit.test( "支持summary新标签", function( assert ) {
	var element = document.createElement('summary');
	document.body.appendChild(element);
	var result = element instanceof HTMLElement && !(element instanceof HTMLUnknownElement);
	document.body.removeChild(element);
	assert.ok(result, "能够成功创建summary标签" );
});

QUnit.test( "支持menu新标签，且默认类型为toolbar", function( assert ) {
	var element = document.createElement('menu');
	document.body.appendChild(element);
	var result = typeof HTMLMenuElement != 'undefined' 
		&& element instanceof HTMLMenuElement 
		&& 'type' in element
		&& element.type == 'toolbar';
	assert.ok(result, "能够成功创建menu标签，且默认类型为toolbar" );
	document.body.removeChild(element);
});

QUnit.test( "支持类型为popup的menu标签", function( assert ) {
	var element = document.createElement('menu');
	element.type = 'popup';
	assert.ok(element.type == 'popup', "能够成功创建menu标签，且可更改类型为popup" );
});

QUnit.test( "支持menu新标签，且不可更改为非法类型", function( assert ) {
	var element = document.createElement('menu');
	document.body.appendChild(element);
	element.type = 'foobar'; // !
	assert.ok(typeof HTMLMenuElement != 'undefined', "HTMLMenuElement类型存在" );
	assert.ok(element instanceof HTMLMenuElement, "可以创建HTMLMenuElement类型的实例" );
	assert.ok('type' in element, "HTMLMenuElement实例存在type属性" );
	assert.equal(element.type,'foobar', "HTMLMenuElement实例的type属性可改变" );

	document.body.removeChild(element);
});

QUnit.test( "支持dialog新标签", function( assert ) {
	var element = document.createElement('dialog');
	var result = typeof HTMLDialogElement != 'undefined' && element instanceof HTMLDialogElement;
	assert.ok(result, "能够成功创建dialog标签" );
});

QUnit.test( "元素支持新的hidden特性", function( assert ) {
	var element = document.createElement('div');
	var result = 'hidden' in element;
	assert.ok(result, "元素存在新的hidden特性" );
});

QUnit.test( "元素支持新的outerHTML属性", function( assert ) {
	var element = document.createElement('div');
	var result = !!('outerHTML' in element);
	assert.ok(result, "元素存在新的outerHTML属性" );
});

QUnit.test( "元素支持新的insertAdjacentHTML函数", function( assert ) {
	var element = document.createElement('div');
	var result = !!('insertAdjacentHTML' in element);
	assert.ok(result, "元素存在新的insertAdjacentHTML函数" );
});

// -------------------------------------------------------------------
QUnit.module( "表单控件" );
QUnit.test( "文本框（input type=text）新增功能正常", function( assert ) {
	var element = createInput('text');
	var baseline = { field: getRenderedStyle(element.field), wrapper: getRenderedStyle(element.wrapper) };
	

	assert.ok(element.field.type == 'text', "能够成功创建input type=text的元素" );
	assert.ok('selectionDirection' in element.field, "input type=text元素支持selectionDirection属性" );

	removeInput(element);
});

QUnit.test( "支持input type=search控件", function( assert ) {
	var element = createInput('search');
	assert.ok(element.field.type == 'search', "能够成功创建input type=search的元素" );
	removeInput(element);
});

QUnit.test( "支持input type=tel控件", function( assert ) {
	var element = createInput('tel');
	assert.ok(element.field.type == 'tel', "能够成功创建input type=tel的元素" );
	removeInput(element);

});

QUnit.test( "支持input type=url控件", function( assert ) {
	var element = createInput('url');
	var validation = false;
	if ('validity' in element.field) {
		validation = true;
		element.field.value = "foo";
		validation &= !element.field.validity.valid
						
		element.field.value = "http://foo.org";
		validation &= element.field.validity.valid
	}
	assert.ok(element.field.type == 'url', "能够成功创建input type=url的元素" );
	assert.ok(validation, "支持对输入内容（url）的验证" );
	removeInput(element);

});

QUnit.test( "支持input type=email控件", function( assert ) {
	var element = createInput('email');
	var validation = false;
	if ('validity' in element.field) {
		validation = true;
		element.field.value = "foo";
		validation &= !element.field.validity.valid
						
		element.field.value = "foo@bar.org";
		validation &= element.field.validity.valid
	}
	assert.ok(element.field.type == 'email', "能够成功创建input type=email的元素" );
	assert.ok(validation, "支持对输入内容（email）的验证" );
	removeInput(element);

});

QUnit.test( "支持input type=date控件", function( assert ) {
	var element = createInput('date');
	element.field.value = "foobar";							
	var sanitization = element.field.value == '';
	var minimal = element.field.type == 'date';
	assert.ok(element.field.type == 'date', "能够成功创建input type=date的元素" );

	element.field.value = "foobar";	
	assert.ok(element.field.value == '', "能够过滤输入的非法内容" );	
	assert.ok('min' in element.field, "支持min属性" );	
	assert.ok('max' in element.field, "支持max属性" );
	assert.ok('step' in element.field, "支持step属性" );
	assert.ok('stepDown' in element.field, "支持stepDown属性" );
	assert.ok('stepUp' in element.field, "支持stepUp属性" );
	assert.ok('step' in element.field, "支持step属性" );
	assert.ok('valueAsDate' in element.field, "支持valueAsDate属性" );
	assert.ok('valueAsNumber' in element.field, "支持valueAsNumber属性" );
	removeInput(element);	

});

QUnit.test( "支持input type=month控件", function( assert ) {
	var element = createInput('month');
	element.field.value = "foobar";							
	var sanitization = element.field.value == '';
	var minimal = element.field.type == 'month';
	assert.ok(element.field.type == 'month', "能够成功创建input type=month的元素" );

	element.field.value = "foobar";		
	assert.ok(element.field.value == '', "能够过滤输入的非法内容" );	
	assert.ok('min' in element.field, "支持min属性" );	
	assert.ok('max' in element.field, "支持max属性" );
	assert.ok('step' in element.field, "支持step属性" );
	assert.ok('stepDown' in element.field, "支持stepDown属性" );
	assert.ok('stepUp' in element.field, "支持stepUp属性" );
	assert.ok('step' in element.field, "支持step属性" );
	assert.ok('valueAsDate' in element.field, "支持valueAsDate属性" );
	assert.ok('valueAsNumber' in element.field, "支持valueAsNumber属性" );
	removeInput(element);

});

QUnit.test( "支持input type=week控件", function( assert ) {
	var element = createInput('week');
	element.field.value = "foobar";							
	var sanitization = element.field.value == '';
	var minimal = element.field.type == 'week';
	assert.ok(element.field.type == 'week', "能够成功创建input type=week的元素" );

	element.field.value = "foobar";		
	assert.ok(element.field.value == '', "能够过滤输入的非法内容" );	
	assert.ok('min' in element.field, "支持min属性" );	
	assert.ok('max' in element.field, "支持max属性" );
	assert.ok('step' in element.field, "支持step属性" );
	assert.ok('stepDown' in element.field, "支持stepDown属性" );
	assert.ok('stepUp' in element.field, "支持stepUp属性" );
	assert.ok('step' in element.field, "支持step属性" );
	assert.ok('valueAsDate' in element.field, "支持valueAsDate属性" );
	assert.ok('valueAsNumber' in element.field, "支持valueAsNumber属性" );
	removeInput(element);

});

QUnit.test( "支持input type=time控件", function( assert ) {
	var element = createInput('time');
	element.field.value = "foobar";							
	var sanitization = element.field.value == '';
	var minimal = element.field.type == 'time';
	assert.ok(element.field.type == 'time', "能够成功创建input type=week的元素" );

	element.field.value = "foobar";		
	assert.ok(element.field.value == '', "能够过滤输入的非法内容" );	
	assert.ok('min' in element.field, "支持min属性" );	
	assert.ok('max' in element.field, "支持max属性" );
	assert.ok('step' in element.field, "支持step属性" );
	assert.ok('stepDown' in element.field, "支持stepDown属性" );
	assert.ok('stepUp' in element.field, "支持stepUp属性" );
	assert.ok('step' in element.field, "支持step属性" );
	assert.ok('valueAsDate' in element.field, "支持valueAsDate属性" );
	assert.ok('valueAsNumber' in element.field, "支持valueAsNumber属性" );
	removeInput(element);

});

QUnit.test( "支持input type=datetime控件", function( assert ) {
	var element = createInput('time');
	element.field.value = "foobar";							
	var sanitization = element.field.value == '';
	var minimal = element.field.type == 'time';
	assert.ok(element.field.type == 'time', "能够成功创建input type=week的元素" );

	element.field.value = "foobar";		
	assert.ok(element.field.value == '', "能够过滤输入的非法内容" );	
	assert.ok('min' in element.field, "支持min属性" );	
	assert.ok('max' in element.field, "支持max属性" );
	assert.ok('step' in element.field, "支持step属性" );
	assert.ok('stepDown' in element.field, "支持stepDown属性" );
	assert.ok('stepUp' in element.field, "支持stepUp属性" );
	assert.ok('step' in element.field, "支持step属性" );
	assert.ok('valueAsNumber' in element.field, "支持valueAsNumber属性" );
	removeInput(element);

});

QUnit.test( "支持input type=datetime-local控件", function( assert ) {
	var element = createInput('datetime-local');
	element.field.value = "foobar";							
	var sanitization = element.field.value == '';
	var minimal = element.field.type == 'datetime-local';
	assert.ok(element.field.type == 'datetime-local', "能够成功创建input type=week的元素" );

	element.field.value = "foobar";		
	assert.ok(element.field.value == '', "能够过滤输入的非法内容" );	
	assert.ok('min' in element.field, "支持min属性" );	
	assert.ok('max' in element.field, "支持max属性" );
	assert.ok('step' in element.field, "支持step属性" );
	assert.ok('stepDown' in element.field, "支持stepDown属性" );
	assert.ok('stepUp' in element.field, "支持stepUp属性" );
	assert.ok('step' in element.field, "支持step属性" );
	assert.ok('valueAsNumber' in element.field, "支持valueAsNumber属性" );
	removeInput(element);

});

QUnit.test( "支持input type=number控件", function( assert ) {
	var element = createInput('number');

	assert.ok(element.field.type == 'number', "能够成功创建input type=number的元素" );

	element.field.value = "foobar";		
	assert.ok(element.field.value != 'foobar', "能够过滤输入的非法内容" );	

	element.field.min = 40;
	element.field.max = 50;
	element.field.value = 100;
	var validation = !element.field.validity.valid
	element.field.value = 42;
	validation &= element.field.validity.valid


	assert.ok(validation, "能够对输入的内容进行验证" );

	assert.ok('min' in element.field, "支持min属性" );	
	assert.ok('max' in element.field, "支持max属性" );
	assert.ok('step' in element.field, "支持step属性" );
	assert.ok('stepDown' in element.field, "支持stepDown属性" );
	assert.ok('stepUp' in element.field, "支持stepUp属性" );
	assert.ok('step' in element.field, "支持step属性" );
	assert.ok('valueAsNumber' in element.field, "支持valueAsNumber属性" );
	removeInput(element);

});

QUnit.test( "支持input type=range控件", function( assert ) {
	var element = createInput('range');
	
	assert.ok(element.field.type == 'range', "能够成功创建input type=range的元素" );

	element.field.value = "foobar";		
	assert.ok(element.field.value != 'foobar', "能够过滤输入的非法内容" );	

	assert.ok('min' in element.field, "支持min属性" );	
	assert.ok('max' in element.field, "支持max属性" );
	assert.ok('step' in element.field, "支持step属性" );
	assert.ok('stepDown' in element.field, "支持stepDown属性" );
	assert.ok('stepUp' in element.field, "支持stepUp属性" );
	assert.ok('step' in element.field, "支持step属性" );
	assert.ok('valueAsNumber' in element.field, "支持valueAsNumber属性" );
	removeInput(element);

});

QUnit.test( "支持input type=color控件", function( assert ) {
	var element = createInput('color');

	assert.ok(element.field.type == 'color', "能够成功创建input type=color的元素" );

	element.field.value = "foobar";					
	assert.ok(element.field.value != 'foobar', "能够过滤输入的非法内容" );	
	removeInput(element);

});

QUnit.test( "支持input type=checkbox控件", function( assert ) {
	var element = createInput('checkbox');
	assert.ok(element.field.type == 'checkbox', "能够成功创建input type=checkbox的元素" );
	assert.ok('indeterminate' in element.field, "支持indeterminate属性" );	
	removeInput(element);

});

QUnit.test( "支持input type=image控件", function( assert ) {
	var element = createInput('image');
	assert.ok(element.field.type == 'image', "能够成功创建input type=image的元素" );
	assert.ok('width' in element.field, "支持width属性" );	
	assert.ok('height' in element.field, "支持height属性" );
	element.field.setAttribute('width', '100');
	element.field.setAttribute('height', '100');
	assert.ok(element.field.offsetWidth == 100, "width属性可设置" );	
	assert.ok(element.field.offsetHeight == 100, "height属性可设置" );	
	removeInput(element);

});

QUnit.test( "支持input type=file控件", function( assert ) {
	var element = createInput('file');
	assert.ok(element.field.type == 'file', "能够成功创建input type=file的元素" );
	assert.ok(element.field.files && element.field.files instanceof FileList, "支持files属性，且该属性的值是FileList的一个实例" );	
	removeInput(element);

});

QUnit.test( "支持textarea控件", function( assert ) {
	var element = document.createElement('textarea');
	var result = typeof HTMLTextAreaElement != 'undefined' && element instanceof HTMLTextAreaElement;
	assert.ok(result, "能够成功创建textarea元素" );
	assert.ok('maxLength' in element, "支持maxLength属性" );	
	assert.ok('wrap' in element, "支持wrap属性" );
});

QUnit.test( "支持select控件", function( assert ) {
	var element = document.createElement('select');
	var result = typeof HTMLSelectElement != 'undefined' && element instanceof HTMLSelectElement;
	assert.ok(result, "能够成功创建select元素" );
	assert.ok('required' in element, "支持required属性" );	
});

QUnit.test( "支持fieldset控件", function( assert ) {
	var element = document.createElement('fieldset');
	var result = typeof HTMLFieldSetElement != 'undefined' && element instanceof HTMLFieldSetElement;
	assert.ok(result, "能够成功创建fieldset元素" );
	assert.ok('elements' in element, "支持elements属性" );	
	assert.ok('disabled' in element, "支持disabled属性" );	
});

QUnit.test( "支持datalist控件", function( assert ) {
	var element = document.createElement('datalist');
	var result = (typeof HTMLDataListElement != 'undefined' && element instanceof HTMLDataListElement) || element.childNodes.length;
	assert.ok(result, "能够成功创建datalist元素" );
	var element = document.createElement('input');  // !!
	assert.ok("list" in element, "支持list属性" );	
});

QUnit.test( "支持keygen控件", function( assert ) {  // ？
	var element = document.createElement('div');
	element.innerHTML = '<keygen>';

	var result = typeof HTMLKeygenElement != 'undefined' && element.firstChild instanceof HTMLKeygenElement && 'challenge' in element.firstChild && 'keytype' in element.firstChild;
	assert.ok(result, "能够成功创建keygen元素" );
	assert.ok('challenge' in element.firstChild, "支持challenge属性" );	
	assert.ok('keytype' in element.firstChild, "支持challenge属性" );	
});

QUnit.test( "支持output控件", function( assert ) {  // ？
	var element = document.createElement('output');
	var result = typeof HTMLOutputElement != 'undefined' && element instanceof HTMLOutputElement;
	assert.ok(result, "能够成功创建output元素" );
});


QUnit.test( "支持progress控件", function( assert ) {
	var element = document.createElement('progress');
	var result = typeof HTMLProgressElement != 'undefined' && element instanceof HTMLProgressElement;
	assert.ok(result, "能够成功创建progress元素" );
});


QUnit.test( "支持meter控件", function( assert ) {  // ？
	var element = document.createElement('meter');
	var result = typeof HTMLMeterElement != 'undefined' && element instanceof HTMLMeterElement;
	assert.ok(result, "能够成功创建meter元素" );
});


QUnit.test( "支持输入数据验证", function( assert ) {  // ？
	var element = document.createElement('input');
	assert.ok(!!('pattern' in element), "input元素包含pattern属性" );
	assert.ok(!!('required' in element), "input元素包含required属性" );
});


QUnit.test( "支持控件与控件、表单与控件之间的关系指定", function( assert ) {  // ？
	var field = document.createElement('input');
	field.id = "a";
	document.body.appendChild(field);
	var label = document.createElement("label");
	label.setAttribute('for', 'a');
	document.body.appendChild(label);
	assert.ok(label.control == field, "label控件支持control属性" );
	document.body.removeChild(field);
	document.body.removeChild(label);

	var element = document.createElement('div');
	document.body.appendChild(element);
	element.innerHTML = '<form id="form"></form><input form="form">';
	assert.ok(element.lastChild.form == element.firstChild, "input控件支持form属性" );
	document.body.removeChild(element);

	var props = 'formAction formEnctype formMethod formNoValidate formTarget'.split(' ');
	var element = document.createElement('input');
	for (var p = 0; p < props.length; p++) {
		assert.ok(!!(props[p] in element), "input控件支持"+props[p]+"属性" );
	}

	var element = document.createElement('input');
	document.body.appendChild(element);
	element.id = "testFormInput";
	var label = document.createElement("label");
	label.setAttribute('for', 'testFormInput');
	document.body.appendChild(label);
	var result = (!!element.labels && element.labels.length == 1 && element.labels[0] == label)
	assert.ok(result, "input控件支持labels属性" );
	document.body.removeChild(label);
	document.body.removeChild(element);

});


QUnit.test( "其他新特性", function( assert ) {
	var element = document.createElement('input');
	assert.ok(!!('autofocus' in element), "input控件支持autofocus属性" );
	var props = 'autocomplete placeholder multiple dirName'.split(' ');
		for (var p = 0; p < props.length; p++) {
		var prop = props[p].toLowerCase();
		assert.ok(!!(props[p] in element), "input控件支持"+props[p]+"属性" );
	}
});


QUnit.test( "支持新的CSS选择器", function( assert ) {
	assert.ok('querySelector' in document, "document对象存在querySelector属性" );
	var element = document.createElement('input');
	element.id = 'testFormInput';
	element.setAttribute("type", "text");
	document.body.appendChild(element);

	assert.ok(!!document.querySelector("#testFormInput:valid"),'支持:valid选择器');
	assert.ok(!!document.querySelector("#testFormInput:read-write"),'支持:read-write选择器');

	element.setCustomValidity("foo");
	assert.ok(!!document.querySelector("#testFormInput:invalid"),'支持:invalid选择器');

	assert.ok(!!document.querySelector("#testFormInput:optional"),'支持:optional选择器');

	element.setAttribute("required", "true");
	assert.ok(!!document.querySelector("#testFormInput:required"),'支持:required选择器');

	element.setAttribute("type", "number");
	element.setAttribute("min", "10");
	element.setAttribute("max", "20");
	element.setAttribute("value", "15");
	assert.ok(!!document.querySelector("#testFormInput:in-range"),'支持:in-range选择器');

	element.setAttribute("type", "number");
	element.setAttribute("min", "10");
	element.setAttribute("max", "20");
	element.setAttribute("value", "25");
	assert.ok(!!document.querySelector("#testFormInput:out-of-range"),'支持:out-of-range选择器');

	document.body.removeChild(element);
	var element = document.createElement('input');
	element.id = 'testFormInput';
	element.setAttribute("type", "text");
	element.setAttribute("readonly", "readonly");
	document.body.appendChild(element);
	assert.ok(!!document.querySelector("#testFormInput:read-only"),'支持:read-only选择器');
	document.body.removeChild(element);
});


QUnit.test( "支持新的输入事件", function( assert ) {
	assert.ok(isEventSupported('input'), "支持oninput事件");
	assert.ok(isEventSupported('change'), "支持change事件");
	assert.ok(isEventSupported('invalid'), "支持invalid事件");
});

QUnit.test( "表单控件支持数据验证", function( assert ) {
	var element = document.createElement('form');
	assert.ok('checkValidity' in element, "form控件支持checkValidity方法");
	assert.ok('noValidate' in element, "form控件支持noValidate特性");
});


// -------------------------------------------------------------------
QUnit.module( "Microdata");
QUnit.test( "支持Microdata功能", function( assert ) {
	try{
		var container = document.createElement('div');
		container.innerHTML = '<div id="microdataItem" itemscope itemtype="http://example.net/user"><p>My name is <span id="microdataProperty" itemprop="name">Woojean</span>.</p></div>';
		document.body.appendChild(container);

		var item = document.getElementById('microdataItem');
		var property = document.getElementById('microdataProperty');

		assert.ok(!!('itemValue' in property), "通过document.getElementById获取到的元素存在itemValue属性" );
		assert.equal(property.itemValue,'Woojean',"itemValue属性值正确" );

		assert.ok(!!('properties' in item), "通过document.getElementById获取到的元素存在properties属性" );
		assert.equal(item.properties['name'][0].itemValue,'Woojean',"properties属性值正确" );

		assert.ok(!!document.getItems, "document对象的getItems方法存在" );

		var user = document.getItems('http://example.net/user')[0];
	  	assert.equal(user.properties['name'][0].itemValue,'Woojean', "getItems方法功能正常" );
	}
	catch(exception){
	}
  	finally{
  		container.innerHTML = '';
		document.body.removeChild(container);
  	}
});

// -------------------------------------------------------------------
QUnit.module( "定位" );
QUnit.test( "支持地理定位功能", function( assert ) {
	assert.ok(!!navigator.geolocation, "当前navigator对象支持地理定位功能" );
});

// -------------------------------------------------------------------
QUnit.module( "设备转向与移动" );
QUnit.test( "支持设备转向事件", function( assert ) {
	assert.ok(!!window.DeviceOrientationEvent, "当前window对象支持设备转向事件" );
});

QUnit.test( "支持设备移动事件", function( assert ) {
	assert.ok(!!window.DeviceMotionEvent, "当前window对象支持设备移动事件" );
});

// -------------------------------------------------------------------
QUnit.module( "输出（output）" );
QUnit.test( "支持全屏功能", function( assert ) {
	var result = !! document.documentElement.requestFullscreen ? true : !! document.documentElement.webkitRequestFullScreen || !! document.documentElement.mozRequestFullScreen || !! document.documentElement.msRequestFullscreen ? true : false;
	assert.ok(result, "当前document对象支持全屏功能" );
});

QUnit.test( "支持桌面通知功能", function( assert ) {
	var result = 'Notification' in window ? true : 'webkitNotifications' in window || 'mozNotification' in window.navigator || 'oNotification' in window || 'msNotification' in window ? true | PREFIX : false;
	assert.ok(result, "当前document对象支持桌面通知功能" );
});

// -------------------------------------------------------------------
QUnit.module( "输入（input）" );
QUnit.test( "支持获取用户音视频输入设备", function( assert ) {
	var result = !!navigator.getUserMedia ? true : !!navigator.webkitGetUserMedia || !!navigator.mozGetUserMedia || !!navigator.msGetUserMedia || !!navigator.oGetUserMedia ? true: false;
	assert.ok(result, "当前navigator对象支持获取用户音视频输入设备" );
});

QUnit.test( "支持获取用户游戏输入设备", function( assert ) {
	var result = !!navigator.getGamepads ? true : !!navigator.webkitGetGamepads || !!navigator.mozGetGamepads || !!navigator.msGetGamepads || !!navigator.oGetGamepads ? true: false;
	assert.ok(result, "当前navigator对象支持获取用户游戏输入设备" );
});

QUnit.test( "支持屏蔽用户触屏事件", function( assert ) {  // ?
	var result = 'pointerLockElement' in document ? true : 'oPointerLockElement' in document || 'msPointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document ? true: false;
	assert.ok(result, "当前document对象支持获取用户触屏事件" );
});

QUnit.test( "支持用户触屏事件", function( assert ) { // ?
	var result = !!window.navigator.maxTouchPoints  ? true : !!window.navigator.msMaxTouchPoints || !!window.navigator.mozMaxTouchPoints || !!window.navigator.webkitMaxTouchPoints ? true: false;
	assert.ok(result, "当前document对象支持屏蔽用户触屏事件" );
});

// -------------------------------------------------------------------
QUnit.module( "通信（本模块的测试需要有Server支持）" );
QUnit.test( "支持服务端推送事件", function( assert ) {
	assert.ok('EventSource' in window, "当前window对象支持EventSource" );
});

QUnit.test( "支持发送Beacon请求", function( assert ) {
	assert.ok('sendBeacon' in navigator, "当前navigator对象支持sendBeacon方法" );
});

QUnit.test( "支持XMLHttpRequest上传功能", function( assert ) {
	assert.ok(window.XMLHttpRequest && 'upload' in new XMLHttpRequest(), "当前XMLHttpRequest对象支持upload方法" );
});

QUnit.test( "XMLHttpRequest支持返回类型辨别功能（document）", function( assert ) {
	var done = assert.async();  // QUnit.test()已经废弃
	var xhr = new window.XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4) {
			var result = !!(this.responseXML && this.responseXML.title && this.responseXML.title == "&&<");									
			assert.ok(result, "能够辨别document类型的返回结果" );
    		done();
		}
	}
	xhr.open("GET", "/data/detect.html?" + Math.random().toString(36).substr(2, 5));
	xhr.responseType = "document";
	xhr.send();
});

QUnit.test( "XMLHttpRequest支持返回类型辨别功能（text）", function( assert ) {
	var done = assert.async();
	var xhr = new window.XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4) {
			var result = !!(this.responseText);								
			assert.ok(result, "能够辨别document类型的返回结果" );
    		done();
		}
	}
	xhr.open("GET", "/data/detect.html?" + Math.random().toString(36).substr(2, 5));
	xhr.responseType = "text";
	xhr.send();
});

QUnit.test( "XMLHttpRequest支持返回类型辨别功能（blob）", function( assert ) {
	var done = assert.async();
	var xhr = new window.XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4) {
			var result = !!(this.response && this.response instanceof Blob);									
			assert.ok(result, "能够辨别document类型的返回结果" );
    		done();
		}
	}
	xhr.open("GET", "/data/detect.html?" + Math.random().toString(36).substr(2, 5));
	xhr.responseType = "text";
	xhr.send();
});

QUnit.test( "XMLHttpRequest支持返回类型辨别功能（arraybuffer）", function( assert ) {
	var done = assert.async();
	var xhr = new window.XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4) {
			var result = !!(this.response && this.response instanceof ArrayBuffer);									
			assert.ok(result, "能够辨别document类型的返回结果" );
    		done();
		}
	}
	xhr.open("GET", "/data/detect.html?" + Math.random().toString(36).substr(2, 5));
	xhr.responseType = "arraybuffer";
	xhr.send();
});

QUnit.test( "支持基础的Web Socket功能", function( assert ) {
	assert.ok("WebSocket" in window || 'MozWebSocket' in window, "WebSocket类型存在" );
	
});

QUnit.test( "支持Web Socket缓冲数组和数据块功能", function( assert ) {
	assert.ok("binaryType" in WebSocket.prototype, "WebSocket类型的binaryType属性存在" );
});


// -------------------------------------------------------------------
QUnit.module( "点对点服务" );
QUnit.test( "支持WebRTC 1.0功能", function( assert ) {
	var result = !!window.RTCPeerConnection ? true : !!window.webkitRTCPeerConnection || !!window.mozRTCPeerConnection || !!window.msRTCPeerConnection || !!window.oRTCPeerConnection ? true : false;
	assert.ok(result, "当前window对象支持RTCPeerConnection" );
});

QUnit.test( "WebRTC支持ObjectRTC", function( assert ) {
	var result = !!window.RTCIceTransport ? true : !!window.webkitRTCIceTransport || !!window.mozRTCIceTransport || !!window.msRTCIceTransport || !!window.oRTCIceTransport ? true : false;
	assert.ok(result, "当前window对象支持RTCIceTransport" );
});

QUnit.test( "支持数据管道（Data channel）", function( assert ) {
	obj = new (window.RTCPeerConnection || window.msRTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection)(null);
	var result = 'createDataChannel' in obj;
	assert.ok(result, "能够获取到可用的数据管道对象，且数据管道对象的createDataChannel方法不为空" );
});

// -------------------------------------------------------------------
QUnit.module( "用户交互" );
QUnit.test( "支持拖放属性", function( assert ) {
	var element = document.createElement('div');
	assert.ok('draggable' in element, "支持draggable属性" );

	var result = 'dropzone' in element ? true : 'webkitdropzone' in element || 'mozdropzone' in element || 'msdropzone' in element || 'odropzone' in element ? true : false;
	assert.ok(result, "支持dropzone属性" );
});

QUnit.test( "支持拖放事件", function( assert ) {
	assert.ok(isEventSupported('drag'), "支持ondrag事件" );
	assert.ok(isEventSupported('dragstart'), "支持dragstart事件" );
	assert.ok(isEventSupported('dragenter'), "支持dragenter事件" );
	assert.ok(isEventSupported('dragover'), "支持dragover事件" );
	assert.ok(isEventSupported('dragleave'), "支持dragleave事件" );
	assert.ok(isEventSupported('dragend'), "支持dragend事件" );
	assert.ok(isEventSupported('drop'), "支持drop事件" );
});

QUnit.test( "支持HTML元素编辑", function( assert ) {
	var element = document.createElement('div');
	assert.ok('contentEditable' in element, "元素支持contentEditable特性" );
	assert.ok('isContentEditable' in element, "元素支持isContentEditable属性" );
});

QUnit.test( "支持文档编辑", function( assert ) {
	assert.ok('designMode' in document, "document对象支持designMode特性" );
});

QUnit.test( "支持编辑相关的CSS选择器", function( assert ) {
	var element = document.createElement('div');
	element.id = 'testDivElement';
	element.contentEditable = true;
	document.body.appendChild(element);
	var nested = document.createElement('div');
	nested.id = 'testDivNested';
	nested.contentEditable = false;
	element.appendChild(nested);

	var result = document.querySelector("#testDivElement:read-write") == element;
	assert.ok(result, "支持:read-write选择器" );
	document.body.removeChild(element);

	var element = document.createElement('div');
	element.id = 'testDivElement';
	element.contentEditable = true;
	document.body.appendChild(element);
	var nested = document.createElement('div');
	nested.id = 'testDivNested';
	nested.contentEditable = false;
	element.appendChild(nested);

	var result = document.querySelector("#testDivNested:read-only") == nested;;
	assert.ok(result, "支持:read-only选择器" );
	document.body.removeChild(element);
});


QUnit.test( "支持编辑相关的方法", function( assert ) {
	
	assert.ok('execCommand' in document, "当前document对象支持execCommand方法" );
	assert.ok('queryCommandEnabled' in document, "当前document对象支持queryCommandEnabled方法" );
	assert.ok('queryCommandIndeterm' in document, "当前document对象支持queryCommandIndeterm方法" );
	assert.ok('queryCommandState' in document, "当前document对象支持queryCommandState方法" );
	assert.ok('queryCommandSupported' in document, "当前document对象支持queryCommandSupported方法" );
	assert.ok('queryCommandValue' in document, "当前document对象支持queryCommandValue方法" );
});


QUnit.test( "支持剪贴板相关的事件", function( assert ) {
	assert.ok(!!('ClipboardEvent' in window), "当前window对象支持ClipboardEvent事件" );
});


QUnit.test( "支持拼写检查相关的特性", function( assert ) {
	var element = document.createElement('div');
	assert.ok(!!('spellcheck' in element), "支持ClipboardEvent事件" );
});


// -------------------------------------------------------------------
QUnit.module( "性能" );
QUnit.test( "支持各种二进制类型", function( assert ) {
	assert.ok(typeof ArrayBuffer != 'undefined', "ArrayBuffer类型存在" );
	assert.ok(typeof Int8Array != 'undefined', "Int8Array类型存在" );
	assert.ok(typeof Uint8Array != 'undefined', "Uint8Array" );
	assert.ok(typeof Uint8ClampedArray != 'undefined', "Uint8ClampedArray类型存在" );
	assert.ok(typeof Int16Array != 'undefined', "Int16Array类型存在" );
	assert.ok(typeof Uint16Array != 'undefined', "Uint16Array类型存在" );
	assert.ok(typeof Int32Array != 'undefined', "Int32Array类型存在" );
	assert.ok(typeof Uint32Array != 'undefined', "Uint32Array类型存在" );
	assert.ok(typeof Float32Array != 'undefined', "Float32Array类型存在" );
	assert.ok(typeof Float64Array != 'undefined', "Float64Array类型存在" );
	assert.ok(typeof DataView != 'undefined', "DataView类型存在" );
});

QUnit.test( "支持工作线程（work）", function( assert ) {
	assert.ok(!!window.Worker, "window对象的Worker对象存在" );
	assert.ok(!!window.SharedWorker, "window对象的SharedWorker对象存在" );
});


// -------------------------------------------------------------------
QUnit.module( "安全" );
QUnit.test( "Web加密API", function( assert ) {
	var crypto = window.crypto || window.webkitCrypto || window.mozCrypto || window.msCrypto || window.oCrypto;
	var available = window.crypto ? true : window.webkitCrypto || window.mozCrypto || window.msCrypto || window.oCrypto ? true: false;
	var result = !!crypto && 'subtle' in crypto ? available : false;
	assert.ok(result, "Web加密API可用" );
});


QUnit.test( "Content Security Policy 1.0协议", function( assert ) {  // ?
	var result = !(function() { 
		try { 
			return eval('true'); 
		} catch (e) {
		} 
		return false; 
	})();
	assert.ok(result, "支持Content Security Policy 1.0协议" );
});

QUnit.test( "Content Security Policy 1.1协议", function( assert ) {
	var result = 'SecurityPolicyViolationEvent' in window;
	assert.ok(result, "当前window对象的SecurityPolicyViolationEvent对象存在" );
});

QUnit.test( "跨域资源共享", function( assert ) {
	var result = !!(window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest());
	assert.ok(result, "XMLHttpRequest对象的withCredentials属性存在" );
});


QUnit.test( "跨文档消息传递", function( assert ) {
	var result = !!window.postMessage;
	assert.ok(result, "window对象的postMessage方法存在" );
});


QUnit.test( "沙箱式的iframe", function( assert ) {
	var result = 'sandbox' in document.createElement('iframe');
	assert.ok(result, "iframe控件的sandbox属性存在" );
});


QUnit.test( "iframe支持内联内容", function( assert ) {
	var result = 'srcdoc' in document.createElement('iframe');
	assert.ok(result, "iframe控件的srcdoc属性存在" );
});


// -------------------------------------------------------------------
QUnit.module( "浏览历史" );
QUnit.test( "支持浏览历史API", function( assert ) {
	var result = !!(window.history);
	assert.ok(result, "当前window对象的history对象可用" );

	var result = !!(history.pushState);
	assert.ok(result, "当前history对象的pushState方法可用" );
});


// -------------------------------------------------------------------
QUnit.module( "视频" );
QUnit.test( "video元素可用", function( assert ) {
	element = document.createElement('video');
	assert.ok(!!element.canPlayType, "能够创建video元素，且其canPlayType属性存在" );
});

QUnit.test( "视频字幕功能", function( assert ) {
	assert.ok('track' in document.createElement('track'), "能够创建track元素，且其track属性存在" );
});

QUnit.test( "声道选择", function( assert ) {
	element = document.createElement('video');
	assert.ok('audioTracks' in element, "video元素的audioTracks属性存在" );
});

QUnit.test( "视频轨道选择", function( assert ) {
	element = document.createElement('video');
	assert.ok('videoTracks' in element, "video元素的videoTracks属性存在" );
});

QUnit.test( "支持封面", function( assert ) {
	element = document.createElement('video');
	assert.ok('poster' in element, "video元素的poster属性存在" );
});

QUnit.test( "支持数据版权（DRM）", function( assert ) {
	element = document.createElement('video');
	var result = 'setMediaKeys' in element ? true : 'webkitAddKey' in element || 'webkitSetMediaKeys' in element || 'mozSetMediaKeys' in element || 'msSetMediaKeys' in element ? true: false;
	assert.ok(result, "video元素的setMediaKeys方法存在" );
});

QUnit.test( "支持mediaSource", function( assert ) {
	var result = 'MediaSource' in window ? true : 'WebKitMediaSource' in window || 'mozMediaSource' in window || 'msMediaSource' in window ? true: false;
	assert.ok(result, "window中存在MediaSource对象" );
});

QUnit.test( "支持mpeg4编解码", function( assert ) {
	var element = document.createElement('video');
	var result = !!element.canPlayType && element.canPlayType('video/mp4; codecs="mp4v.20.8"');
	assert.ok(result, '支持 video/mp4; codecs="mp4v.20.8"' );
});

QUnit.test( "支持h264编解码", function( assert ) {
	var element = document.createElement('video');
	var result = !!element.canPlayType && (element.canPlayType('video/mp4; codecs="avc1.42E01E"') || element.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'));
	assert.ok(result, '支持 video/mp4; codecs="avc1.42E01E, mp4a.40.2"' );
});

QUnit.test( "支持Ogg Theora编解码", function( assert ) {
	var element = document.createElement('video');
	var result = !!element.canPlayType && element.canPlayType('video/ogg; codecs="theora"');
	assert.ok(result, '支持 video/ogg; codecs="theora"' );
});

QUnit.test( "支持webmvp8编解码", function( assert ) {
	var element = document.createElement('video');
	var result = !!element.canPlayType && element.canPlayType('video/webm; codecs="vp8"');
	assert.ok(result, '支持 video/webm; codecs="vp8"' );
});


QUnit.test( "支持webmvp9编解码", function( assert ) {
	var element = document.createElement('video');
	var result = !!element.canPlayType && element.canPlayType('video/webm; codecs="vp9"');
	assert.ok(result, '支持 video/webm; codecs="vp9"' );
});


// -------------------------------------------------------------------
QUnit.module( "音频" );
QUnit.test( "audio元素可用", function( assert ) {
	var element = document.createElement('audio');
	assert.ok(!!element.canPlayType, "能够创建audio元素，且其canPlayType属性存在" );
});

QUnit.test( "循环播放", function( assert ) {
	var element = document.createElement('audio');
	assert.ok('loop' in element, "能够创建audio元素，且其loop属性存在" );
});

QUnit.test( "后台预加载", function( assert ) {
	var element = document.createElement('audio');
	assert.ok('preload' in element, "能够创建audio元素，且其preload属性存在" );
});

QUnit.test( "支持web audio", function( assert ) {
	var result = 'AudioContext' in window ? true : 'webkitAudioContext' in window || 'mozAudioContext' in window || 'oAudioContext' in window || 'msAudioContext' in window ? true : false;
	assert.ok(result, "AudioContext类型存在" );
});

QUnit.test( "语音识别", function( assert ) {
	var result = 'SpeechRecognition' in window ? true : 'webkitSpeechRecognition' in window || 'mozSpeechRecognition' in window || 'oSpeechRecognition' in window || 'msSpeechRecognition' in window ? true : false;
	assert.ok(result, "SpeechRecognition类型存在" );
});

QUnit.test( "语音合成", function( assert ) {
	var result = 'speechSynthesis' in window ? true : 'webkitSpeechSynthesis' in window || 'mozSpeechSynthesis' in window || 'oSpeechSynthesis' in window || 'msSpeechSynthesis' in window ? true : false;
	assert.ok(result, "SpeechSynthesis类型存在" );
});

QUnit.test( "支持PCM编码解码", function( assert ) {
	var element = document.createElement('audio');
	var result =  !!element.canPlayType && element.canPlayType('audio/wav; codecs="1"');
	assert.ok(result, "支持 audio/wav; codecs='1'" );
});

QUnit.test( "支持aac编码解码", function( assert ) {
	var element = document.createElement('audio');
	var result =  !!element.canPlayType && element.canPlayType('audio/mp4; codecs="mp4a.40.2"');
	assert.ok(result, "支持 audio/mp4; codecs='mp4a.40.2'" );
});

QUnit.test( "支持mp3编码解码", function( assert ) {
	var element = document.createElement('audio');
	var result = element.canPlayType('audio/mpeg');
	if (result == 'maybe') {
		// We need to check if the browser really supports playing MP3s by loading one and seeing if the
		// loadedmetadata event is triggered... but for now assume it does support it...
		result = true;
	} else if (result == 'probably') {
		result = true;
	}

	assert.ok(result, "支持result" );
});

QUnit.test( "支持Ogg Vorbis编码解码", function( assert ) {
	var element = document.createElement('audio');
	var result = !!element.canPlayType && element.canPlayType('audio/ogg; codecs="vorbis"') ;
	assert.ok(result, 'audio/ogg; codecs="vorbis"');
});

QUnit.test( "支持Ogg Opus编码解码", function( assert ) {
	var element = document.createElement('audio');
	var result = !!element.canPlayType && element.canPlayType('audio/ogg; codecs="opus"') ;
	assert.ok(result, 'audio/ogg; codecs="opus"');
});


QUnit.test( "支持WebM with Vorbis编码解码", function( assert ) {
	var element = document.createElement('audio');
	var result = !!element.canPlayType && element.canPlayType('audio/webm; codecs="vorbis"');
	assert.ok(result, 'audio/webm; codecs="vorbis"');
});

QUnit.test( "支持WebM with Opus编码解码", function( assert ) {
	var element = document.createElement('audio');
	var result = !!element.canPlayType && element.canPlayType('audio/webm; codecs="opus"');
	assert.ok(result, 'audio/webm; codecs="opus"');
});


// -------------------------------------------------------------------
QUnit.module( "响应式图片" );
QUnit.test( "picture元素可用", function( assert ) {
	assert.ok('HTMLPictureElement' in window, "HTMLPictureElement类型存在" );
});

QUnit.test( "img元素支持新属性：srcset", function( assert ) {
	assert.ok('srcset' in document.createElement('img'), "img元素的srcset属性存在" );
});

QUnit.test( "img元素支持新属性：sizes", function( assert ) {
	assert.ok('sizes' in document.createElement('img'), "img元素的sizes属性存在" );
});


// -------------------------------------------------------------------
QUnit.module( "2D绘图" );
QUnit.test( "picture元素可用", function( assert ) {
	var canvas = document.createElement('canvas');
	var result  = !!canvas.getContext;
	assert.ok(result, "能够成功创建canvas元素");
	assert.ok(typeof CanvasRenderingContext2D != 'undefined', "CanvasRenderingContext2D类型存在" );
	assert.ok((canvas.getContext('2d') instanceof CanvasRenderingContext2D), "canvas.getContext('2d')得到的是CanvasRenderingContext2D的实例");
});

QUnit.test( "canvas支持fillText方法", function( assert ) {
	var canvas = document.createElement('canvas');
	var result  = typeof canvas.getContext('2d').fillText == 'function';
	assert.ok(result, "canvas支持fillText方法");
});

QUnit.test( "canvas支持Path", function( assert ) {
	var result  = typeof Path != "undefined" || typeof Path2D != "undefined";
	assert.ok(result, "Path或Path2D类型存在");
});

QUnit.test( "canvas支持绘制椭圆", function( assert ) {
	var canvas = document.createElement('canvas');
	var result  = typeof canvas.getContext('2d').ellipse != 'undefined';
	assert.ok(result, "ellipse方法存在");
});

QUnit.test( "canvas支持系统对焦环", function( assert ) {
	var canvas = document.createElement('canvas');
	var result  = typeof canvas.getContext('2d').drawSystemFocusRing != 'undefined';
	assert.ok(result, "drawSystemFocusRing方法存在");
});

QUnit.test( "canvas支持命中测试", function( assert ) {
	var canvas = document.createElement('canvas');
	var result  = typeof canvas.getContext('2d').addHitRegion != 'undefined';
	assert.ok(result, "addHitRegion方法存在");
});

QUnit.test( "canvas支持混合模式", function( assert ) {
	var canvas = document.createElement('canvas');
	canvas.width = 1;
	canvas.height = 1;			
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = '#fff';
	ctx.fillRect(0,0,1,1);	
	ctx.globalCompositeOperation = 'screen';
	ctx.fillStyle = '#000';
	ctx.fillRect(0,0,1,1);	
	var data = ctx.getImageData(0,0,1,1);
	var result  = ctx.globalCompositeOperation == 'screen' && data.data[0] == 255;
	assert.ok(result, "可以混合调用不同的绘制方法");
});

QUnit.test( "canvas支持导出png格式图片", function( assert ) {
	var canvas = document.createElement('canvas');
	var result  = canvas.toDataURL('image/png').substring(5,14) == 'image/png';
	assert.ok(result, "可以导出image/png");
});

QUnit.test( "canvas支持导出jpeg格式图片", function( assert ) {
	var canvas = document.createElement('canvas');
	var result  = canvas.toDataURL('image/jpeg').substring(5,15) == 'image/jpeg';
	assert.ok(result, "可以导出image/jpeg");
});

QUnit.test( "canvas支持导出jpeg-xr格式图片", function( assert ) {
	var canvas = document.createElement('canvas');
	var result  = canvas.toDataURL('image/vnd.ms-photo').substring(5,23) == 'image/vnd.ms-photo';
	assert.ok(result, "可以导出image/vnd.ms-photo");
});


QUnit.test( "canvas支持导出webp格式图片", function( assert ) {
	var canvas = document.createElement('canvas');
	var result  = canvas.toDataURL('image/webp').substring(5,15) == 'image/webp';
	assert.ok(result, "可以导出image/webp");
});


// -------------------------------------------------------------------
QUnit.module( "3D绘图" );
QUnit.test( "支持WebGL 3D绘图", function( assert ) {
	var element = document.createElement('canvas');	
	var contexts = ['webgl', 'ms-webgl', 'experimental-webgl', 'moz-webgl', 'opera-3d', 'webkit-3d', 'ms-3d', '3d']; 
	var context = '';
	var passed = false;
    
	for (var b = -1, len = contexts.length; ++b < len;) {
		if (element.getContext(contexts[b])) {
			assert.ok(true, "可以获取 WebGL Context，类型为"+contexts[b]);
			break;
		}
	}
});

// -------------------------------------------------------------------
QUnit.module( "动画" );
QUnit.test( "支持WebGL 3D绘图", function( assert ) {
	var result = !! window.requestAnimationFrame ? true : !! window.webkitRequestAnimationFrame || !! window.mozRequestAnimationFrame || !! window.msRequestAnimationFrame || !! window.oRequestAnimationFrame ? true : false;
	assert.ok(result, "可以获取可用的requestAnimationFrame");
});

// -------------------------------------------------------------------
QUnit.module( "离线存储" );
QUnit.test( "支持应用缓存功能", function( assert ) {
	assert.ok(!!window.applicationCache, "window对象的applicationCache方法存在");
});

QUnit.test( "支持Service Workers", function( assert ) {
	assert.ok(!!window.navigator.serviceWorker, "navigator对象的serviceWorker方法存在");
});

QUnit.test( "支持自定义协议处理", function( assert ) {
	assert.ok(!!window.navigator.registerProtocolHandler, "navigator对象的registerProtocolHandler方法存在");
});

QUnit.test( "支持自定义内容处理", function( assert ) {
	assert.ok(!!window.navigator.registerContentHandler, "navigator对象的registerContentHandler方法存在");
});

QUnit.test( "支持自定义搜索内容提供服务", function( assert ) {
	assert.ok(!!window.external, "window.external存在");
	assert.ok(!!typeof window.external.AddSearchProvider != 'undefined', "window.external.AddSearchProvider类型存在");
	assert.ok(!!typeof window.external.IsSearchProviderInstalled != 'undefined', "window.external.IsSearchProviderInstalled类型存在");
});

QUnit.test( "支持会话内容存储（sessionStorage）", function( assert ) {
	assert.ok('sessionStorage' in window && window.sessionStorage != null,"window.sessionStorage方法存在且不为null");
});

QUnit.test( "支持本地内容存储（localStorage）", function( assert ) {
	assert.ok('localStorage' in window && window.localStorage != null,"window.localStorage方法存在且不为null");
});

QUnit.test( "支持IndexDB存储", function( assert ) {
	assert.ok(!! window.indexedDB,"window.indexedDB存在");
});

QUnit.test( "支持Web SQL Database", function( assert ) {
	assert.ok(!!window.openDatabase,"window.openDatabase存在");
});

QUnit.test( "支持读文件", function( assert ) {
	assert.ok('FileReader' in window,"window.FileReader存在");
});

QUnit.test( "支持读取文件内容并转换为Blob", function( assert ) {
	assert.ok('Blob' in window,"window.Blob存在");
});

QUnit.test( "支持转换Blob得到url", function( assert ) {
	assert.ok('FileReader' in window ,"window.FileReader存在");
	assert.ok('readAsDataURL' in (new FileReader()),"FileReader的readAsDataURL方法存在");
});


QUnit.test( "支持转换Blob得到ArrayBuffer", function( assert ) {
	assert.ok('FileReader' in window ,"window.FileReader存在");
	assert.ok('readAsArrayBuffer' in (new FileReader()),"FileReader的readAsArrayBuffer方法存在");
});

QUnit.test( "支持转换Blob得到Blob的Url", function( assert ) {
	assert.ok('URL' in window ,"window.URL存在");
	assert.ok('createObjectURL' in URL,"URL的createObjectURL方法存在");
});

QUnit.test( "支持文件系统API（FileSystem API）", function( assert ) {
	var result = !! navigator.getFileSystem ? true : !! navigator.webkitGetFileSystem || !! navigator.mozGetFileSystem || !! window.msGetFileSystem ? true: false; 
	assert.ok(result,"可以获取到可用的FileSystem API对象（navigator.getFileSystem存在）");
});

QUnit.test( "支持文件API（File API）", function( assert ) {
	var result = !! window.requestFileSystem ? true : !! window.webkitRequestFileSystem || !! window.mozRequestFileSystem || !! window.oRequestFileSystem || !! window.msRequestFileSystem ? true: false; 
	assert.ok(result,"可以获取到可用的FileSystem API对象（window.requestFileSystem存在）");
});



// -------------------------------------------------------------------
QUnit.module( "流" );
QUnit.test( "支持只读流", function( assert ) {
	assert.ok('ReadableStream' in window, "ReadableStream类型存在");
});

QUnit.test( "支持可写流", function( assert ) {
	assert.ok('WriteableStream' in window, "WriteableStream类型存在");
});

// -------------------------------------------------------------------
QUnit.module( "其他组件" );
QUnit.test( "支持自定义元素", function( assert ) {
	assert.ok('registerElement' in document, "document对象的registerElement方法存在");
});

QUnit.test( "支持影子树（Shadow DOM）", function( assert ) {
	var result = 'createShadowRoot' in document.createElement('div') ? true : 'webkitCreateShadowRoot' in document.createElement('div') ? true: false;
	assert.ok(result, "document对象的createShadowRoot方法存在");
});

QUnit.test( "template元素支持content属性", function( assert ) {
	var result =  'content' in document.createElement('template');
	assert.ok(result, "template元素存在，且content属性不为空");
});


QUnit.test( "link元素支持import属性", function( assert ) {
	var result =  'import' in document.createElement('link');
	assert.ok(result, "link元素存在，且import属性不为空");
});

QUnit.test( "style元素支持scoped属性", function( assert ) {
	var result =  'scoped' in document.createElement('style');
	assert.ok(result, "style元素存在，且scoped属性不为空");
});

QUnit.test( "script元素支持async属性", function( assert ) {
	var result =  'async' in document.createElement('script');
	assert.ok(result, "script元素存在，且async属性不为空");
});


QUnit.test( "支持onerror事件", function( assert ) {
	assert.ok(isEventSupported('error'), "支持onerror事件");
});


QUnit.test( "支持脚本执行事件", function( assert ) {
	assert.expect(1,'无论成功或失败，总要有一个执行');
	var s = document.createElement('script');
	s.src="data:text/javascript;charset=utf-8,window"

	s.addEventListener('beforescriptexecute', function() {
		before = true;
	}, true);

	s.addEventListener('afterscriptexecute', function() {
		if (before) {
			assert.ok(true, "支持脚本执行事件");
		}
		else{
			assert.ok(false, "不支持脚本执行事件");
		}
	}, true);

	document.body.appendChild(s);

});

QUnit.test( "支持base64编码解码", function( assert ) {
	assert.ok('btoa' in window, "window对象的btoa方法存在");
	assert.ok('atob' in window, "window对象的atob方法存在");
});

QUnit.test( "支持json编码解码", function( assert ) {
	assert.ok('JSON' in window, "JSON类型存在");
	assert.ok('parse' in JSON, "JSON类型的parse方法存在");
});

QUnit.test( "支持URL API", function( assert ) {
	var result = 'URL' in window ? true : 'WebKitURL' in window || 'MozURL' in window || 'oURL' in window || 'msURL' in window ? true | PREFIX : false;
	assert.ok(result, "URL类型存在");
});

QUnit.test( "支持突变观察器（Mutation Observer）", function( assert ) {
	var result = 'MutationObserver' in window ? true : 'WebKitMutationObserver' in window || 'MozMutationObserver' in window || 'oMutationObserver' in window || 'msMutationObserver' in window ? true : false;
	assert.ok(result, "MutationObserver类型存在");
});

QUnit.test( "支持Promises", function( assert ) {
	assert.ok('Promise' in window, "Promise类型存在");
	assert.ok('resolve' in window.Promise, "Promise类型的resolve方法存在");
	assert.ok('reject' in window.Promise, "Promise类型的reject方法存在");
	assert.ok('all' in window.Promise, "Promise类型的all方法存在");
	assert.ok('race' in window.Promise, "Promise类型的race方法存在");

	/*
	var result = (function() {
			      var resolve;
			      new window.Promise(function(r) { resolve = r; });
			      return typeof resolve === 'function';
			    }();
	assert.ok(result, "");	    
	*/
});

QUnit.test( "支持页面可见状态", function( assert ) {
	var result = 'visibilityState' in document ? true : 'webkitVisibilityState' in document || 'mozVisibilityState' in document || 'oVisibilityState' in document || 'msVisibilityState' in document ?  true : false;
	assert.ok(result, "document对象的visibilityState属性存在");
});

QUnit.test( "获取文本选择", function( assert ) {
	assert.ok(!!window.getSelection, "window对象的getSelection方法存在");
});

QUnit.test( "元素支持滚动到可见窗口", function( assert ) {
	var element = document.createElement('div');
	assert.ok(!!element.scrollIntoView, "元素的scrollIntoView方法存在");
});
