# HTML5 ability detecter
这是一个参考<a href="http://html5test.com/">html5test</a> 并基于<a href="http://qunitjs.com/">Qunit2.0</a>实现的HTML5接口测试用例库，用于方便地对浏览器、webview控件等进行HTML5接口测试。
因为是基于Qunit开发，所以可以很容易地新增自定义的测试用例。

## 使用
最简便的方式是下载源码后，用待测浏览器、webview控件等打开源码中的index.html文件即可测试。
但是涉及到网络通信的测试用例，如XMLHttpRequest、Web Socket等，则需要有一个Web Server的支持才能进行测试。

## 测试报告
测试报告如下图：
 ![image](https://github.com/woojean/HTML5-ability-detecter/blob/master/imgs/index.png)
主要包含如下内容：
### 过滤操作
 ![image](https://github.com/woojean/HTML5-ability-detecter/blob/master/imgs/guolv.png)
### 测试统计
 ![image](https://github.com/woojean/HTML5-ability-detecter/blob/master/imgs/tongji.png)
### 测试结果
 ![image](https://github.com/woojean/HTML5-ability-detecter/blob/master/imgs/yongli.png)
每个具体执行的测试都包含以下基本信息：
1.所属模块
2.用例名称
3.断言数及断言依据
4.测试耗时

并可执行以下操作：
1.点击测试用例名称，展开具体的验证过程
2.可以点击“重新测试”按钮，重新测试单个测试用例


具体可参考<a href="http://qunitjs.com/">Qunit的文档</a>。