var Calendar = (function(){

	/**
	 * [default_options 默认配置项]
	 * @type {Object}
	 */
	var default_options = {
		calendar : 'calendar', //打开日期元素标识
		weekList: ['日', '一', '二', '三', '四', '五', '六'],
		monthList: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
		current_cls: 'cal_red', //当前样式 [鼠标滑过效果]
		disable_cls: 'cal_gray', //不可用样式
		able_cls: 'cal_able', //可用样式[据此绑定事件具有hover效果]
		prev_m_cls: 'prev_month', //上一月样式[据此绑定事件]
		prev_y_cls: 'prev_year',  //上一年样式[据此绑定事件]
		next_m_cls: 'next_month', //下一月样式[据此绑定事件]
		next_y_cls: 'next_year', //下一年样式[据此绑定事件]
		menu_item: 'menu_item', //年份、月份[据此绑定事件]
		year_list: 'year_list',
		year_list_btns: 'year_list_btns',
		month_list: 'month_list', //月份具体项父节点[据此绑定事件]
		y_l_btn: 'y_l_btn',
		y_r_btn: 'y_r_btn'
	};

	/**
	 * [Calendar 日期控件类]
	 * @param {[type]} date    [description]
	 * @param {[type]} options [description]
	 */
	function Calendar(cls, options){

		this.cls = cls || null;

		this.default_date = options.default_date || ''; //可以是'yyyy_mm_dd',也可以是['yyyy_mm_dd', ...];
		this.min_date = options.min_date || '';
		this.max_date = options.max_date || '';


		this.ele = null;

		//拆分后当前日期的年、月、日
		this.y = 0;
		this.m = 0;
		this.d = 0;

		//拆分后当前日期的年、月、日的副本
		this.copyY = 0;
		this.copyM = 0;
		this.copyD = 0;

		//拆分后最小日期的年、月、日
		this.minY = 0;
		this.minM = 0;
		this.minD = 0;

		//拆分后最大日期的年、月、日
		this.maxY = 0;
		this.maxM = 0;
		this.maxD = 0;



		this.beforeShow = options.beforeShow; //在日期控件面板显示之前，触发此事件，并返回当前触发事件的控件的实例对象。
		this.onClose = options.onClose; //当日期控件面板关闭后触发此事件（无论是否有选择日期），参数为选择的日期和当前日期插件的实例。
		this.onSelect = options.onSelect;
		//当在日期面板选中一个日期后触发此事件，参数为选择的日期和当前日期插件的实例。


		//准备工作
		this.prepare();

		this.init();


	}

	Calendar.prototype = {
		constructor: Calendar,
		/**
		 * [init 初始化]
		 * @return {null} [没有任何返回]
		 */
		init: function(){

			var oCalendar_box = document.getElementById('calendar_box');

			if(!oCalendar_box){
				this.calendar = document.createElement('div');
				this.calendar.id = this.calendar.className = 'calendar_box';
				this.calendar.style.display = 'none';
				document.body.appendChild(this.calendar);
			}else{
				this.calendar = oCalendar_box;
			}
		},
		prepare: function(){

			var eles = [], res, ele,
				This = this;

			if(this.cls !== null){

				var ele = document.getElementById(this.cls);

				if(ele){

					eles.push(ele);
				}else{

					res = this.getByClass(document, this.cls);

					//假设在不同浏览器下：没有元素时返回不同的结果
					if(res){ eles = res;}
				}
			}


			if(eles.length > 0){


				 //for(var i=0, l = eles.length; i<l; i++){

					this.ele = ele = eles[0];

					//设置input只读并设置默认值
					//this.setReadonly(ele, 0);

					//初始化默认日期
					this.setDefaultDate();

					//初始化最大，最小日期的年月日
					this.setMinYMD();
					this.setMaxYMD();


					//绑定点击事件
					this.bindEvent(ele, 'click', function(){

						//日期控件面版显示之前的callback
						This.beforeShow && This.beforeShow(This);

						var offset = This.getOffset(this), l, t,
							TT = 2;//位置调节常量


							l = offset.l;
							t = offset.t;
							This.calendar.style.left = l + 'px';
							This.calendar.style.top = t + this.offsetHeight + TT + 'px';
							This.calendar.style.display = 'block';

							//填充日期结构
							This.createHTML(This.y, This.m, This.d);
							This.bind();

							//复制y,m
							This.copyY = This.y;
							This.copyM = This.m;
					});
				//}
			}

		},
		setDefaultDate: function(dt){


			if(dt){ //传

				this.default_date = dt;
			}else{ //不传即实例化时

				//默认配置项默认值为空字符串时，取当前的日期
				if(this.default_date == ''){

					this.default_date = this.createNowDate(true);
				}

				this.setReadonly();
			}

			this.setDefaultVal();

			var arr = this.splitDate(this.default_date);

				this.y = this.copyY = arr[0];
				this.m = this.copyM = arr[1];
				this.d = this.copyD = arr[2];

		},
		setMinYMD: function(dt){

			if(dt){ //传

				this.min_date = dt;
			}else{ //不传即实例化时

				if(this.min_date !== ''){


					var min_time = new Date(this.min_date).getTime(),
						default_time = new Date(this.default_date).getTime();


						if(min_time > default_time){
							this.min_date = this.default_date;
						}
				}
			}


			if(dt || this.min_date !== ''){

				var arr = this.splitDate(this.min_date);

					this.minY = arr[0];
					this.minM = arr[1];
					this.minD = arr[2];
			}

		},
		setMaxYMD: function(dt){

			if(dt){ //传

				this.max_date = dt;
			}else{ //不传即实例化时

				if(this.max_date !== ''){

					var max_time = new Date(this.max_date).getTime(),
						default_time = new Date(this.default_date).getTime();


						if(max_time < default_time){
							this.max_date = this.default_date;
						}
				}
			}


			if(dt || this.max_date !== ''){

				var arr = this.splitDate(this.max_date);

					this.maxY = arr[0];
					this.maxM = arr[1];
					this.maxD = arr[2];
			}
		},
		setReadonly: function(){

			var ele = this.ele;

			if(ele.tagName.toLowerCase() == 'input'){

				var val = ele.getAttribute('readOnly');
					ele.setAttribute('readOnly', 'readOnly'); //兼容IE6
					ele.setAttribute('readonly', 'readOnly'); //IE不支持readonly属性设置
			}
		},
		setDefaultVal: function(ele, i, type){

			//根据提供的默认初值default_date来设置
			var ele = this.ele,
				default_date =  this.default_date;

				if(ele.tagName.toLowerCase() == 'input'){

					ele.value = default_date;
				}else{

					ele.innerHTML = default_date;
				}

		},

		/**
		 * [createHTML 填充日期结构]
		 * @param  {[number]} y [年，可选]
		 * @param  {[number]} m [月，可选]
		 * @return {undefined}   [没有任何返回]
		 */
		createHTML: function(y, m, d){

			d = d || this.d;

			//生成页面
			var cal_cnt_tpl = this.fillTPL(y, m, d);
			this.calendar.innerHTML = cal_cnt_tpl;

		},
		splitDate: function(date){

			var dateArr = date.split('-'),
				resArr = [];

				for(var i=0; i< dateArr.length; i++){
					resArr.push(parseInt(dateArr[i]));
				}

				return resArr;
		},
		getNow: function(){

			return this.y + '-' + this.fillZero(this.m) + '-' + this.fillZero(this.d);
		},
		/**
		 * [createClsReg 返回正则表达式]
		 * @param  {string} str [字符串]
		 * @return {reg}    [正则表达式]
		 */
		createClsReg: function(str){
			return new RegExp('\\b'+ str + '\\b', 'i')
		},
		getStyle:function (ele, attr){
			if(ele.currentStyle){
				return ele.currentStyle[attr];
			}else{
				return getComputedStyle(ele, null)[attr];
			}
		},
		getOffset: function(ele){

			var offset = {
					l: ele.offsetLeft,
					t: ele.offsetTop
				},
				parent = ele.offsetParent,
				uA = navigator.userAgent.toLowerCase(),
				reg = /msie (\d)/,
				ieVersion,
				isIE = false;


				if(reg.test(uA)){
					isIE = true;
					ieVersion = parseInt(RegExp.$1);
				};

				while(parent){

					if(isIE && (ieVersion < 8) && (ieVersion > 5)){

						var posVal = this.getStyle(parent, 'position').toLowerCase();

							if(posVal == 'absolute' || posVal == 'fixed' || parent.tagName.toLowerCase() == 'body'){

								offset.l += parent.offsetLeft + parent.clientLeft;

							}else if(posVal == 'relative'){

								var leftVal = parseInt(this.getStyle(parent, 'left'));

								offset.l +=	(isNaN(leftVal) ? 0 : leftVal);
							}


							//IE6-IE7下能找到的最高一级parent是HTML,IE7下html元素clientTop有两个像素值，其它浏览器为0
							if(parent.tagName.toLowerCase() != 'html'){
								offset.t += parent.offsetTop + parent.clientTop;
							}

					}else if(isIE && ieVersion == 8){ // ie8下的offsetLeft、offsetTop包含父级定位元素的border宽度，其它不包含

						offset.l += parent.offsetLeft;
						offset.t += parent.offsetTop;
					}else{
						offset.l += (parent.offsetLeft + parent.clientLeft);
						offset.t += (parent.offsetTop + parent.clientTop);
					}

					parent = parent.offsetParent;
				};

				return offset;
		},
		getEvent: function(e){
			return e || window.event;
		},
		getTarget: function(e){
			return e.target || e.srcElement;
		},
		/**
		 * [get_target_cls 返回一个对象(包括事件源，事件源className)]
		 * @param  {object} e [事件对象]
		 * @return {obj}   [{target: target, target_cls: target_cls}]
		 */
		get_target_cls: function(e){
			var e = this.getEvent(e),
				target = this.getTarget(e),
				target_cls = target.className.toLowerCase();

				return {e: e, target: target, target_cls: target_cls};
		},
		/**
		 * [addClass 添加class样式]
		 * @param {obj} obj [添加cls样式的ele]
		 * @param {string} cls [添加cls样式]
		 */
		addClass: function(obj, cls){
			var obj_cls = obj.className,
				reg = new RegExp('\\b' + cls + '\\b');

				if(!reg.test(obj_cls)){

					obj.className = obj.className.replace(/\s$/g, '') + (' ' + cls);
				}
		},
		/**
		 * [addClass 删除class样式]
		 * @param {obj} obj [删除cls样式的ele]
		 * @param {string} cls [删除cls样式]
		 */
		removeClass: function(obj, cls){
			var obj_cls = obj.className,
				reg = new RegExp('\\b' + cls + '\\b', 'g');

				if(obj_cls.indexOf(cls) != -1){
					obj.className = obj.className.replace(reg, '');
				}
		},
		getByClass: function(parent, cls){

			if(document.getElementsByClassName){
				return parent.getElementsByClassName(cls);
			}else{
				var res = [],
					eles = parent.getElementsByTagName('*'),
					reg = new RegExp('\\b'+cls+'\\b'),
					ele;

					for(var i=0; i<eles.length; i++){

						ele = eles[i];

						if(reg.test(ele.className)){
							res.push(ele);
						}
					}

					return res;
			}

			return [];
		},
		hideMenuBoxes: function(obj){
			var aMenuBoxes = this.getByClass(this.calendar, 'menu_box'), ele;

			for(var i=0, l= aMenuBoxes.length; i<l; i++){
				ele = aMenuBoxes[i];

				if(obj){

					if(obj != ele){
						ele.style.display = 'none';
					}

				}else{
					ele.style.display = 'none';
				}

			}
		},
		/**
		 * [bind 给日期控件添加事件]
		 * @return {undefined} [没有任何返回]
		 */
		bind: function(){
			var reg_prev_m_cls = this.createClsReg(default_options.prev_m_cls),
				reg_prev_y_cls = this.createClsReg(default_options.prev_y_cls),
				reg_next_m_cls = this.createClsReg(default_options.next_m_cls),
				reg_next_y_cls = this.createClsReg(default_options.next_y_cls),
				reg_able_cls = this.createClsReg(default_options.able_cls),
				reg_disable_cls = this.createClsReg(default_options.disable_cls),
				reg_menu_item = this.createClsReg(default_options.menu_item),
				reg_year_list = this.createClsReg(default_options.year_list),
				reg_year_list_btns = this.createClsReg(default_options.year_list_btns),
				reg_month_list = this.createClsReg(default_options.month_list),
				reg_y_l_btn = this.createClsReg(default_options.y_l_btn),
				reg_y_r_btn = this.createClsReg(default_options.y_r_btn),
				current_cls = default_options.current_cls,
				This = this;


			this.calendar.onclick = function(e){



				var obj = This.get_target_cls(e),
					e = obj.e,
					target = obj.target,
					target_cls = obj.target_cls;


					if(reg_prev_m_cls.test(target_cls) && !reg_disable_cls.test(target_cls)){ //上个月

						This.copyM--;

						if(This.copyM == 0){
							This.copyM = 12;
							This.copyY--;
						}

						This.createHTML(This.copyY, This.copyM, This.d);
					}else if(reg_next_m_cls.test(target_cls) && !reg_disable_cls.test(target_cls)){ //下个月

						This.copyM++;

						if(This.copyM == 13){
							This.copyM = 1;
							This.copyY++;
						}
						This.createHTML(This.copyY, This.copyM);
					}else if(reg_prev_y_cls.test(target_cls) && !reg_disable_cls.test(target_cls)){ //上一年

						This.copyY--;
						This.createHTML(This.copyY, This.copyM);
					}else if(reg_next_y_cls.test(target_cls) && !reg_disable_cls.test(target_cls)){ //下一年

						This.copyY++;
						This.createHTML(This.copyY, This.copyM);
					}else if(reg_able_cls.test(target_cls) && target.tagName.toLowerCase() == 'td'){ //当前可用日期

						//隐藏年份、月份框
						This.hideMenuBoxes();

						var tdNum = parseInt(target.innerHTML), dt, current_date;

							dt = This.copyY + '-' + This.fillZero(This.copyM) + '-' + This.fillZero(tdNum);


							if(This.ele.tagName.toLowerCase() == 'input'){
								This.ele.value = dt;
							}else{
								This.ele.innerHTML = dt;
							}


							//更新当前日期
							This.y = This.copyY;
							This.m = This.copyM;
							This.d = tdNum;




							//当在日期面板选中一个日期后触发此事件
							This.onSelect && This.onSelect(dt, This);

							This.calendar.style.display = 'none';

							//关闭日期面板时触发此事件
							This.onClose && This.onClose(dt, This);

					}else if(reg_menu_item.test(target_cls) || reg_menu_item.test(target.parentNode.className)){ //头部年份,月份


						if(reg_menu_item.test(target_cls)){

							var oMenuBox = This.getByClass(target.parentNode, 'menu_box')[0];
						}else{
							var oMenuBox = This.getByClass(target.parentNode.parentNode, 'menu_box')[0];
						}

						//隐藏除了[当前点击]以外的所有年份或月份弹框
						This.hideMenuBoxes(oMenuBox);

						if(oMenuBox.style.display != 'block'){

							oMenuBox.style.display = 'block';
						}else{
							oMenuBox.style.display = 'none';
						}

					}else if(reg_month_list.test(target.parentNode.className)){ //十二月份列表

						if(!reg_disable_cls.test(target_cls)){

							This.copyM = parseInt(target.getAttribute('_m'));
							This.createHTML(This.copyY, This.copyM);
						}

					}else if(reg_year_list.test(target.parentNode.className)){ //年份列表(默认10年,右上角是当前年)

						if(!reg_disable_cls.test(target_cls)){

							This.copyY = parseInt(target.innerHTML);
							This.createHTML(This.copyY, This.copyM);
						}

					}else if(reg_y_l_btn.test(target_cls)){ //年份往left按钮

						if(!reg_disable_cls.test(target_cls)){

							var oYearList = This.getByClass(target.parentNode.parentNode, 'year_list');
								oYearList[0].innerHTML = This.createYearList('l', This.copyM); //传一个l
						}

					}else if(reg_y_r_btn.test(target_cls)){ //年份往right按钮

						if(!reg_disable_cls.test(target_cls)){

							var oYearList = This.getByClass(target.parentNode.parentNode, 'year_list');
								oYearList[0].innerHTML = This.createYearList('r', This.copyM); //传一个r
						}
					}else{ //点击其它

						//隐藏年份、月份框
						This.hideMenuBoxes();

						//更新到当前所选年份的年份列表
						var oYearList = This.getByClass(This.calendar, 'year_list');
							oYearList[0].innerHTML = This.createYearList(This.copyY, This.copyM);

						//console.log(document);
					}


					This.stopPropagation(e);

					return false;
			};
			this.calendar.onmouseover = function(e){
				var obj = This.get_target_cls(e),
					target = obj.target,
					target_cls = obj.target_cls;

					if(reg_able_cls.test(target_cls)){
						This.addClass(target, current_cls);
					}
			};
			this.calendar.onmouseout = function(e){
				var obj = This.get_target_cls(e),
					target = obj.target,
					target_cls = obj.target_cls;

					if(!(/cal_active/.test(target_cls)) && reg_able_cls.test(target_cls)){
						This.removeClass(target, current_cls);
					}
			};
			this.calendar.onselectstart = function(){ return false;}

			this.bindEvent(document, 'click', function(e){

				var obj = This.get_target_cls(e),
					target = obj.target,
					target_cls = obj.target_cls,
					reg = new RegExp('\\b' + default_options.calendar + '\\b');

					//console.log(document);

					if(reg.test(target_cls)){
						return;
					}
					This.calendar && (This.calendar.style.display = 'none');
			});
		},
		bindEvent: function(ele, type, fn){

			if(ele.addEventListener){
				this.bindEvent = function(ele, type, fn){
					ele.addEventListener(type, fn);
				}
			}else if(ele.attachEvent){
				this.bindEvent = function(ele, type, fn){
					ele.attachEvent('on' + type, function(){
						fn.apply(ele);
					});
				}
			}else{
				this.bindEvent = function(ele, type, fn){
					ele['on' + type] = fn;
				}
			}

			return this.bindEvent(ele, type, fn);
		},
		stopPropagation: function(e){

			if(e.stopPropagation){

				e.stopPropagation();
			}else{
				e.cancelBubble = true;
			}
		},
		/**
		 * [fillZero 补0(数字小于10时自动补0)]
		 * @param  {num} num [数字]
		 * @return {string}     [字符串]
		 */
		fillZero: function(num){
			return num < 10 ? ('0' + num) : (''+ num);
		},
		/**
		 * [mh2zi 将数字月分转换成汉字]
		 * @param  {number} num [数字月份]
		 * @return {string}     [汉字月份]
		 */
		mh2zi: function(num){
			return default_options.monthList[num-1];
		},
		/**
		 * [week2Num 将汉字星期转换成数字]
		 * @param  {string} w [汉字星期]
		 * @return {number}   [数字星期]
		 */
		week2Num: function(w){
			var week2numList = {'日': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6};
			return week2numList[w];
		},
		/**
		 * [createNowDate 返回当前日期 OR 对象(日期相关y,m,d,w)]
		 * @param  {[Boolean]} isTrue [可选项: <真值>返回当前日期; <其它>返回日期对象]
		 * @return {string OR obj}  [description]
		 */
		createNowDate: function(isTrue){
			var dt = new Date(),
				y, m, d, w;

				y= dt.getFullYear();
				m = dt.getMonth() + 1;
				d = dt.getDate();

				if(isTrue) {
					return y + '-' + this.fillZero(m) + '-' + this.fillZero(d);
				}

				w = dt.getDay();

				return {
					y: y,
					m: m,
					d: d,
					w: w
				};
		},
		/**
		 * [isRunYear 判断是否为闰年]
		 * @param  {number}  y [年份]
		 * @return {number}   [是返回1, 否则返回0]
		 */
		isRunYear: function(y){
			if((y % 4 == 0 && y % 100 !=0) || (y % 400 == 0)){
				return 1;
			}
			return 0;
		},
		/**
		 * [getDays 返回月份对应的天数]
		 * @param  {number} m [月份]
		 * @param  {[number]} y [可选项; 2月份要传, 其它月份可不传]
		 * @return {number}   [description]
		 */
		getDays: function(m, y){
			var days;
				switch(m){
					case 2:
						if(this.isRunYear(y)){
							days = 29;
						}else{
							days = 28;
						}
						break;
					case 1:
					case 3:
					case 5:
					case 7:
					case 8:
					case 10:
					case 12:
						days = 31;
						break;
					case 4:
					case 6:
					case 9:
					case 11:
						days = 30;
						break;
				}
				return days;
		},
		/**
		 * [getPrevMonthDays 返回x年x月的上一个月的天数]
		 * @param  {number} m [x月]
		 * @param  {number} y [x年]
		 * @return {number}   [所占天数]
		 */
		getPrevMonthDays: function(m, y){
			var prev_m = m-1,
				prev_y = y;
				if(prev_m == 0){
					prev_m = 12;
					prev_y--;
				}
				return this.getDays(prev_m, prev_y);
		},
		/**
		 * [getPrevMonthDays 返回x年x月的下一个月的天数]
		 * @param  {number} m [x月]
		 * @param  {number} y [x年]
		 * @return {number}   [所占天数]
		 */
		getNextMonthDays: function(m, y){
			var next_m = m-1,
				next_y = y;
				if(next_m == 13){
					next_m = 1;
					next_y++;
				}
				return this.getDays(next_m, next_y);
		},
		/**
		 * [indexOfArray 返回当前值在数组中的索引]
		 * @param  {number} val [当前值]
		 * @param  {array} arr [数组]
		 * @return {number}    [返回索引, 不存在返回-1]
		 */
		indexOfArray: function(val, arr){
			for(var i=0; i<arr.length; i++){
				if(val == arr[i]){
					return i;
				}
			}
			return -1;
		},
		isArray: function(arr){
			return Object.prototype.toString.apply(arr) == '[object Array]';
		},
		/**
		 * [getNO1Weekday 返回x年x月1号对应的星期几]
		 * @param  {number} y [x年]
		 * @param  {number} m [x月]
		 * @return {number}   [星期几]
		 */
		getNO1Weekday:function(y, m){
			var	perOneDate = new Date(),weekday;

				perOneDate.setFullYear(y);
				perOneDate.setMonth(m-1);
				perOneDate.setDate(1);
				weekday = perOneDate.getDay();

				return weekday;
		},
		createPrevBtnsHTML: function(y, m, d){

			var strHTML = '',
				y_cls = 'prev_year',
				m_cls = 'prev_month ml10',
				disable_cls = default_options.disable_cls;


				if(this.min_date !== ''){ //有最小日期


					//不够一年的时候
					if((y-this.minY) == 1){

						var mCha = m - this.minM;

							if(mCha < 0){ //年份不可用

								y_cls += (' ' + disable_cls);
							}
					}

					//是最小年
					if(y == this.minY){

						y_cls += (' ' + disable_cls);

						//并且是最小月
						if(m == this.minM){
							m_cls += (' ' + disable_cls);
						}

					}
				}

				strHTML = '<span class="' + y_cls + '">PrvY</span><span class="' + m_cls + '">PrvM</span>';

				return strHTML;
		},
		createNextBtnsHTML: function(y, m, d){

			var strHTML = '',
				y_cls = 'next_year ml10',
				m_cls = 'next_month',
				disable_cls = default_options.disable_cls;


				if(this.max_date !== ''){ //有最大日期

					//不够一年的时候
					if((this.maxY-y) == 1){

						var mCha = this.maxM - m;

							if(mCha < 0){ //年份不可用

								y_cls += (' ' + disable_cls);
							}
					}

					//是最大年
					if(y == this.maxY){
						y_cls += (' ' + disable_cls);

						//并且是最大月
						if(m == this.maxM){
							m_cls += (' ' + disable_cls);
						}

					}
				}


				strHTML = '<span class="' + m_cls + '">NxtM</span><span class="'+ y_cls +'">NxtY</span>';

				return strHTML;
		},
		createMonths: function(y, m){

			//规律：序号1-12顺序队列对应如下
			//奇数行[1, 3, 5, 7, 9, 11] - [0, 1, 2, 3, 4, 5],可得[1,2,3,4,5,6];
			//偶数行[2, 4, 6, 8, 10, 12] + [5, 4, 3, 2, 1, 0],可得[7,8,9,10,11,12];

			var monthsHTML = '', j = 0, o = 5, dm,
				isMinY = 0, isMaxY = 0,
				able_cls = default_options.able_cls,
				disable_cls = default_options.disable_cls,
				m_cls;

			if(this.min_date !== ''){

				if(y == this.minY){
					isMinY = 1;
				}
			}

			if(this.max_date !== ''){

				if(y == this.maxY){
					isMaxY = 1;
				}
			}

			for(var i=1; i<13; i++){

				if(i%2){

					dm = i - j++;

					m_cls = able_cls;

					if(isMinY && (dm < this.minM)){

						m_cls = disable_cls;
					}

					if(isMaxY && (dm > this.maxM)){
						m_cls = disable_cls;
					}

					monthsHTML += '<li class="'+ m_cls +'" _m="' + dm + '">' + default_options.monthList[dm-1] + '月</li>';
				}else{

					dm = i + o--;

					m_cls = able_cls;

					if(isMinY && (dm < this.minM)){

						m_cls = disable_cls;
					}

					if(isMaxY && (dm > this.maxM)){
						m_cls = disable_cls;
					}

					monthsHTML += '<li class="'+ m_cls +'" _m="' + dm + '">' + default_options.monthList[dm-1] + (dm >10 ? '' : '月') + '</li>';
				}

			}

			return monthsHTML;
		},
		/**
		 * [createYearList 生成年份列表]
		 * @param  {[string]} direction [可选，不传时返回当前年份的列表；传时返回往上或往下10年的列表]
		 * @return {string}           [年份列表HTML]
		 */
		createYearList: function(direction, m, d){

			var yearListHTML = '',
				jY,
				oY,
				dy,
				able_cls = default_options.able_cls,
				disable_cls = default_options.disable_cls,
				y_cls,
				isMinY = 0,
				isMaxY = 0;


				if(typeof direction == 'number'){

					var y = direction;

					jY = y - 5,
					oY = y;

				}else if(typeof direction == 'string'){

					//当有方向参数时，并且this.copyYear不存在时复制一份代码
					if(!this.copyYear){
						this.copyYear = this.copyY;
					}


					if(direction == 'l'){

						this.copyYear -= 10;
					}else if(direction == 'r'){

						this.copyYear += 10;
					}

					jY = this.copyYear - 5,
					oY = this.copyYear;

					//更新到当前所选年份的年份列表
					var oYearListBtns = this.getByClass(this.calendar, 'year_list_btns');
						oYearListBtns[0].innerHTML = this.createYearListBtns(this.copyYear);

				};



				for(var i=1; i<11; i++){

					y_cls = able_cls;

					if(i%2){

						dy = jY++;


						if(this.min_date !== ''){


							if(dy < this.minY){

								y_cls = disable_cls;
							}else if(dy == this.minY){

								var mCha = m - this.minM;

									if(mCha < 0){ //年份不可用

										y_cls = disable_cls;
									}
							}
						}


						if(this.max_date !== ''){


							if(dy > this.maxY){

								y_cls = disable_cls;
							}else if(dy == this.maxY){ //等于最大年份

								var mCha = this.maxM - m;

									if(mCha < 0){ //年份不可用

										y_cls = disable_cls;
									}

							}

						}

						yearListHTML += '<li class="'+ y_cls +'">'+ dy +'</li>';
					}else{


						dy = oY++;

						if(this.min_date !== ''){


							if(dy < this.minY){

								y_cls = disable_cls;
							}else if(dy == this.minY){

								var mCha = m - this.minM;

									if(mCha < 0){ //年份不可用

										y_cls = disable_cls;
									}
							}
						}


						if(this.max_date !== ''){


							if(dy > this.maxY){

								y_cls = disable_cls;
							}else if(dy == this.maxY){ //等于最大年份

								var mCha = this.maxM - m;

									if(mCha < 0){ //年份不可用

										y_cls = disable_cls;
									}

							}

						}

						yearListHTML += '<li class="'+ y_cls +'">'+ dy +'</li>';
					}

				}

				return yearListHTML;
		},
		createYearListBtns: function(y){


			var disable_cls = default_options.disable_cls,
				y_l_btn_cls = default_options.y_l_btn,
				y_r_btn_cls = default_options.y_r_btn,
				yearListBtnsHTML = '';

				if(this.min_date !== ''){


					if(this.minY <= (y+4) && this.minY >= (y-5)){


						y_l_btn_cls += ' ' + disable_cls;
					}
				}


				if(this.max_date !== ''){


					if(this.maxY <= (y+4) && this.maxY >= (y-5)){

						y_r_btn_cls += ' ' + disable_cls;
					}
				}


				yearListBtnsHTML = '<li class="'+ y_l_btn_cls +'">←</li>'+
					'<li class="y_x_btn">×</li>'+
					'<li class="'+ y_r_btn_cls +'">→</li>';

				return yearListBtnsHTML;
		},
		/**
		 * [createWeekHTML 生成星期列表HTML]
		 * @return {string} [HTMLString]
		 */
		createWeekHTML: function(){

			var weekListHTML = '',
				weekList = default_options.weekList,
				l = weekList.length,
				weekListNUM = [];//星期列表=>数字列表

				//生成星期
				for(var i = 0; i<l; i++){
					weekListNUM[i] = this.week2Num(weekList[i]);
					weekListHTML += '<th>' + weekList[i] + '</th>';
				}
				//针对默认配置(防止被外面改动)生成一份星期的数字对照表(为后面快速匹配当前日期)
				default_options.weekListNUM = weekListNUM;

				return weekListHTML;
		},
		/**
		 * [createTbodyHTML 生成日期表格tbody主体HTML]
		 * @param  {number} y [年]
		 * @param  {number} m [月]
		 * @param  {number} d [日]
		 * @return {string}   [tbodyHTML]
		 */
		createTbodyHTML: function(y, m, d){

			var tbodyHTML = '',
				days,
				copyDays,
				prev_m_days,
				next_m_days,
				current_cls = default_options.current_cls, //当前日期的样式
				disable_cls = default_options.disable_cls, //日期不可用的样式
				able_cls = default_options.able_cls, //日期可用的样式
				weekday,
				indexWeekday,
				next_m_start_d,
				isMin_date_m = 0, //最小日期的月份，默认为否
				isMax_date_m = 0; //最大日期的月份，默认为否

				//每月1号对应的星期几
				weekday = this.getNO1Weekday(y, m);
				//weekday在星期列表中的序列号
				indexWeekday = this.indexOfArray(weekday, default_options.weekListNUM);

				//当前月的对应的天数
				days = copyDays = this.getDays(m, y);

				//求上月天数
				prev_m_days = this.getPrevMonthDays(m, y);

				//下月开始的日期
				next_m_start_d = 1;


				if(this.min_date !== ''){ //有最小日期

					if(y == this.minY && m == this.minM){

						isMin_date_m = 1;
					}
				}


				if(this.max_date !== ''){ //有最大日期

					if(y == this.maxY && m == this.maxM){

						isMax_date_m = 1;
					}
				}



				for(var i=0; i<6; i++){

					tbodyHTML += '<tr>';

					for(var j=0; j<7; j++){

						if(i==0){ //第一行时

							if(j >= indexWeekday){

								var tdNum = (copyDays - (--days)), //当前月的日期号（从1号到月末）
									current_d_cls = (tdNum == d ? ' '+ current_cls + ' cal_active' : ''), //当前日期（就是具体的几号）的样式
									d_cls = able_cls; //日期样式，默认可用

									//是最小日期的月份
									if(isMin_date_m){

										if(tdNum < this.minD){ //并小于最小日期时不可用

											d_cls = disable_cls;
											current_d_cls = '';
										}
									}

									//是最大日期的月份
									if(isMax_date_m){

										if(tdNum > this.maxD){ //并大于最大日期时不可用

											d_cls = disable_cls;
											current_d_cls = '';
										}
									}


									tbodyHTML += '<td class="'+ d_cls + current_d_cls +'">'+ tdNum +'</td>';


							}else{ //输入上个月的日期（从末尾向前）

								tbodyHTML += '<td class="'+ disable_cls +'">'+ (prev_m_days-((indexWeekday-1)-j)) +'</td>';
							}
						}else{

							if(days != 0){

								var tdNum = (copyDays - (--days)), //当前月的日期号
									current_d_cls = (tdNum == d ? ' '+ current_cls + ' cal_active' : ''), //当前日期（就是具体的几号）的样式
									d_cls = able_cls; //日期样式，默认可用


									//是最小日期的月份
									if(isMin_date_m){

										if(tdNum < this.minD){ //并小于最小日期时不可用

											d_cls = disable_cls;
											current_d_cls = '';
										}
									}

									//是最大日期的月份
									if(isMax_date_m){

										if(tdNum > this.maxD){ //并大于最大日期时不可用

											d_cls = disable_cls;
											current_d_cls = '';
										}
									}

									tbodyHTML += '<td class="'+ d_cls + current_d_cls +'">'+ tdNum +'</td>';

							}else{  //输出当前月的（下个月的日期）

								//if(j ==0){ break;} 如果最后一行没有当前月日期，则隐藏
								tbodyHTML += '<td class="'+ disable_cls +'">'+(next_m_start_d++)+'</td>';
							}

						}


					}

					tbodyHTML += '</tr>';
				}

				return tbodyHTML;
		},
		/**
		 * [fillTPL 生成日期控件主体HTML]
		 * @param  {number} y [年]
		 * @param  {number} m [月]
		 * @param  {number} d [日]
		 * @return {string} cal_cnt_tpl  [日期控件主体结构]
		 */
		fillTPL: function(y, m, d){

			var mZi = this.mh2zi(m);

			//生成上一月、上一年份按钮
			var prevBtnsHTML = this.createPrevBtnsHTML(y, m, d);

			//生成下一个月、下一年份按钮
			var nextBtnsHTML = this.createNextBtnsHTML(y, m, d);

			//生成年份列表
			var yearListHTML = this.createYearList(y, m, d);

			//生成年份按钮列表
			var yearListBtnsHTML = this.createYearListBtns(y);


			//生成月份列表
			var monthsHTML = this.createMonths(y, m);

			//生成星期列表HTML
			var weekListHTML = this.createWeekHTML();

			//生成日期tbodyHTML
			var tbodyHTML = this.createTbodyHTML(y, m, d);

			//生成日期控件内容
			var cal_cnt_tpl = this.defaultTPL();

				return cal_cnt_tpl.replace(/{{(\w+)}}/g, function(a, b){

					if(b == 'prevBtns'){

						return prevBtnsHTML;
					}else if(b == 'nextBtns'){

						return nextBtnsHTML;
					}else if(b === 'year'){

						return y;
					}else if(b === 'yearList'){

						return yearListHTML;
					}else if(b === 'yearListBtns'){

						return yearListBtnsHTML;
					}else if(b === 'month'){

						return mZi;
					}else if(b === 'months'){

						return monthsHTML;
					}else if(b == 'weekList'){

						return weekListHTML;
					}else if(b === 'content'){
						return tbodyHTML;
					}
				});
		},
		/**
		 * [defaultTPL 默认日期控件模板]
		 * @return {string} [description]
		 */
		defaultTPL: function(){
			var cal_cnt_tpl = ''+
				'<ul class="calendar_title">'+
					'<li class="prev">{{prevBtns}}</li>'+
					'<li>'+
						'<div class="menu_wrp">'+
							'<span class="menu_item current_year"><i>{{year}}</i> 年</span>'+
							'<div class="menu_box">'+
								'<ul class="menu_items year_list">{{yearList}}'+
								'</ul>'+
								'<ul class="year_list_btns">{{yearListBtns}}'+
								'</ul>'+
							'</div></div>'+
						'<div class="menu_wrp">'+
							'<span class="menu_item current_month"><i>{{month}}</i> 月</span>'+
							'<div class="menu_box">'+
								'<ul class="menu_items month_list">{{months}}'+
								'</ul>'+
							'</div>'+
						'</div>'+
					'</li>'+
					'<li class="next">{{nextBtns}}</li>'+
				'</ul>'+
				'<table class="calendar_content">'+
					'<thead>'+
						'<tr>{{weekList}}'+
						'</tr>'+
					'</thead>'+
					'<tbody>{{content}}'+
					'</tbody>'+
				'</table>'+
				'<div class="calendar_footer"></div>';

			return cal_cnt_tpl;
		}
	};



	function getCalendarInstance(cls, options){
		return new Calendar(cls, options);
	}

	/**
	 * [set getCalendarInstance静态方法：更改默配置]
	 * @param {string OR obj} name  [可以是一个属性名字符串，也可以是一个对象]
	 * @param {string} value [name属性对应值]
	 */
	getCalendarInstance.set = function(name, value){

		if(arguments.length == 2){
			default_options[name] = value;
		}else if(arguments.length == 1 && typeof name == 'object'){

			for(var attr in name){
				default_options[attr] = name[attr];
			}
		}
	};


	return getCalendarInstance;
})();
