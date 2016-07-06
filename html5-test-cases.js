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
});

QUnit.test( "支持nav新标签", function( assert ) {
	var element = document.createElement('nav');
	document.body.appendChild(element);
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& isBlock(element) 
		&& closesImplicitly('nav');
	assert.ok(result, "能够成功创建nav标签" );
});

QUnit.test( "支持article新标签", function( assert ) {
	var element = document.createElement('article');
	document.body.appendChild(element);
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& isBlock(element) 
		&& closesImplicitly('article');
	assert.ok(result, "能够成功创建article标签" );
});

QUnit.test( "支持aside新标签", function( assert ) {
	var element = document.createElement('aside');
	document.body.appendChild(element);
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& isBlock(element) 
		&& closesImplicitly('aside');
	assert.ok(result, "能够成功创建aside标签" );
});

QUnit.test( "支持header新标签", function( assert ) {
	var element = document.createElement('header');
	document.body.appendChild(element);
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& isBlock(element) 
		&& closesImplicitly('header');
	assert.ok(result, "能够成功创建header标签" );
});

QUnit.test( "支持footer新标签", function( assert ) {
	var element = document.createElement('footer');
	document.body.appendChild(element);
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& isBlock(element) 
		&& closesImplicitly('footer');
	assert.ok(result, "能够成功创建footer标签" );
});

QUnit.test( "支持main新标签", function( assert ) {
	var element = document.createElement('main');
	document.body.appendChild(element);
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& isBlock(element);
	assert.ok(result, "能够成功创建main标签" );
});

QUnit.test( "支持figure新标签", function( assert ) {
	var element = document.createElement('figure');
	document.body.appendChild(element);
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& isBlock(element) 
		&& closesImplicitly('figure');
	assert.ok(result, "能够成功创建figure标签" );
});

QUnit.test( "支持figcaption新标签", function( assert ) {
	var element = document.createElement('figcaption');
	document.body.appendChild(element);
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& isBlock(element);
	assert.ok(result, "能够成功创建figcaption标签" );
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
	var result = element instanceof HTMLElement 
		&& !(element instanceof HTMLUnknownElement) 
		&& (color = getStyle(element, 'background-color')) 
		&& (color != 'transparent');
	assert.ok(result, "能够成功创建mark标签" );
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
});

QUnit.test( "支持menu新标签，且类型不可变", function( assert ) {
	var element = document.createElement('menu');
	document.body.appendChild(element);
	element.type = 'foobar'; // !
	var result = typeof HTMLMenuElement != 'undefined' 
		&& element instanceof HTMLMenuElement 
		&& 'type' in element
		&& element.type == 'toolbar';
	assert.ok(result, "能够成功创建menu标签，且类型不可变" );
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
	removeInput(element);

	assert.ok(element.field.type == 'text', "能够成功创建input type=text的元素" );
	assert.ok('selectionDirection' in element.field, "input type=text元素支持selectionDirection属性" );
});

QUnit.test( "支持input type=search控件", function( assert ) {
	var element = createInput('search');
	removeInput(element);
	assert.ok(element.field.type == 'search', "能够成功创建input type=search的元素" );
});

QUnit.test( "支持input type=tel控件", function( assert ) {
	var element = createInput('tel');
	removeInput(element);
	assert.ok(element.field.type == 'tel', "能够成功创建input type=tel的元素" );
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
});

QUnit.test( "支持input type=color控件", function( assert ) {
	var element = createInput('color');

	assert.ok(element.field.type == 'color', "能够成功创建input type=color的元素" );

	element.field.value = "foobar";					
	assert.ok(element.field.value != 'foobar', "能够过滤输入的非法内容" );	
});

QUnit.test( "支持input type=checkbox控件", function( assert ) {
	var element = createInput('checkbox');

	assert.ok(element.field.type == 'checkbox', "能够成功创建input type=checkbox的元素" );
	assert.ok('indeterminate' in element.field, "支持indeterminate属性" );	
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
});

QUnit.test( "支持input type=file控件", function( assert ) {
	var element = createInput('file');

	assert.ok(element.field.type == 'file', "能够成功创建input type=file的元素" );
	assert.ok(element.field.files && element.field.files instanceof FileList, "支持files属性，且该属性的值是FileList的一个实例" );	
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















