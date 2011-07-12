/*
 * @components countdown 倒计时
 * @author liqiang  liqiang@pconline.com.cn
 * @desc 用于倒计时效果，例如：离车展开幕还有多少天、离新产品发布还有多久 ；
 *       提供灵活定制计时器的各个功能，自定义时间显示效果等；
 *       支持毫秒到天的时间单位计数；
 * @property
 * 		id：{String}：倒计时的标识
 * 		refreshRate {Number}： 计时器刷新频率，默认13。注意：此参数为页面countdown的共用参数，在第一次调用设置时生效，后面设置无效。
 * 		type {String}("onetime"||"everytime"): 倒计时计时模式。
 * 			onetime表示只读取一次当前时间，以后都在这次时间上进行递减。默认为onetime，效率高，但如果显示操作耗时太久，有可能会计时不准。
 * 			everytime表示每次都读取当前时间进行递减。能够保证时间准确，在显示特殊效果或耗时久时建议用此模式。
 * 		onFinished：计时完毕时的回调函数。当计时为0时，执行该函数。
 * 		year {Number} ：目标年份。如不设则为今年。
 * 		month {Number}：目标月份。如不设则为当前月。
 * 		day {Number} :  目标日期。如不设则为今天。
 * 		hour {Number}：  目标小时数。如不设则为当前小时。
 * 		minute {Number}：目标分钟数。如不设则为当前分钟数。
 * 		second {Number}：目标秒数。如不设则为0。
 * 
 * 		eleDays {Element} ：显示剩余天数的元素。默认为：倒计时id + "_days" 的元素
 * 		eleHours {Element}：显示剩余小时数的元素。默认为：倒计时id + "_hours" 的元素
 * 		eleMinutes {Element}：显示剩余分钟数的元素。默认为：倒计时id + "_minutes" 的元素
 * 		eleSeconds {Element}：显示剩余秒数的元素。默认为：倒计时id + "_seconds" 的元素
 * 		eleMs {Element}：显示剩余毫秒数的元素。默认为：倒计时id + "_ms" 的元素
 * @version v1.0
 */

pc.add("countdown",function(pc){
	function countdown(c){
		var id=c.id;
		var now=new Date();
		//console.log(pc.isUndefined(c.year)?now.getFullYear():c.year)
		var defaultConfig={
			refreshRate:c.refreshRate||13,
			type:c.type||"onetime",//"onetime" or "everytime"
			/*
			 * Target date:
			 */
			year:pc.isUndefined(c.year)?now.getFullYear():c.year,
			month:pc.isUndefined(c.month)?now.getMonth():c.month-1,
			day:pc.isUndefined(c.day)?now.getDate():c.day,
			hour:pc.isUndefined(c.hour)?now.getHours():c.hour, 
			minute:pc.isUndefined(c.minute)?now.getMinutes():c.minute, 
			second:pc.isUndefined(c.second)?0:c.second, 
			
			onFinished:c.onFinished||function(restTime){/*document.title+=("计时完毕")*/},
			eleDays:c.eleDays||pc.getElem("#"+id+"_days"),
			eleHours:c.eleHours||pc.getElem("#"+id+"_hours"),
			eleMinutes:c.eleMinutes||pc.getElem("#"+id+"_minutes"),
			eleSeconds:c.eleSeconds||pc.getElem("#"+id+"_seconds"),
			eleMs:c.eleMs||pc.getElem("#"+id+"_ms")
		};
		
		this.targetDateMs = Date.UTC(defaultConfig['year'], defaultConfig['month'], defaultConfig['day'], defaultConfig['hour'], defaultConfig['minute'], defaultConfig['second']),
		this.config = pc.extend(defaultConfig,c, true);
    	this._init(this.config);
	}
	countdown.prototype={
		
		_init:function(config){
			var self=this,
				c=self.config,
				index=self._timerFuncs.length;
			self._addTimerFunc(function(nowMs){
				var targetMs=self.targetDateMs,
					restMs=targetMs-nowMs,
					restTime;
					
				if(restMs<=0){//time over
					restMs=0;
					restTime=self._transMsToDate(restMs);
					self._showRestTime(restTime);
					//console.log(index);
					self._removeTimerFunc(index);
					c.onFinished(restTime);
					return;
				}
				restTime=self._transMsToDate(restMs);
				self._showRestTime(restTime);
				
			});
			if(typeof countdown.timer=="undefined"){
				self._initTimer();
			}
			
		},
		/*
		 * @method _showRestTime
		 * @param restTime{Object} Contains 'days','hours','minutes','seconds','ms'.
		 * Such as:
		 * {
		 * 		days:20,
		 * 		hours:5,
		 * 		minutes:39,
		 * 		seconds:29,
		 * 		ms:763
		 * }
		 * @desc Show rest time .If you defined function 'showRestTime',it will run your function.
		 * Otherwise it will run default function,which set every data to default elements.
		 */
		_showRestTime:function(restTime){
			var self=this,
				c=self.config;
			if(typeof c.showRestTime!="undefined"){
				c.showRestTime(restTime,c);
			}else{
				if(c.eleDays!=null){c.eleDays.innerHTML=restTime.days};
				if(c.eleHours!=null){c.eleHours.innerHTML=restTime.hours};
				if(c.eleMinutes!=null){c.eleMinutes.innerHTML=restTime.minutes};
				if(c.eleSeconds!=null){c.eleSeconds.innerHTML=restTime.seconds};
				if(c.eleMs!=null){c.eleMs.innerHTML=restTime.ms};
			}
		},
		_removeTimerFunc:function(index){
			var self=this;
			self._timerFuncs.splice(index,1);
		},
		_addTimerFunc:function(func){
			var self=this;
			self._timerFuncs.push(func);
		},
		/*
		 * @property _showFuncs
		 * @desc Used to record every countdown object's date show function.
		 * The property which in the prototype chain,will exist only once.
		 */
		_timerFuncs:[],
		
		/*
		 * @method _doGroup
		 * @param info
		 * @desc Pass info to all functions in _showFuncs and excute them.
		 */
		_doGroup:function(info){
			var self=this,
				timerFuncs=self._timerFuncs;
			for(var i=0;i<timerFuncs.length;i++){
				timerFuncs[i](info);
			}
		},
		/*
		 * @method {interface}_initTimer
		 * @desc Init timer of countdown with setInterval.Several countdown objects will have only one timer.
		 * It throw rest time to _showFuncs.
		 */
		_initTimer:function(){
			var self=this,
				c=self.config,
				refreshRate=c.refreshRate;
				
			if(c.type=="onetime"){//Read time of now only once.
				var now=new Date();
				var nowMs=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate(),now.getHours(),now.getMinutes(),now.getSeconds(),now.getMilliseconds());
				countdown.timer=window.setInterval(function(){
					nowMs=nowMs+refreshRate;
					self._doGroup(nowMs);
					//countdown.timer=window.setTimeout(arguments.callee,13);
				},refreshRate);	
			}else if(c.type=="everytime"){//Read time of now everytime.
				countdown.timer=window.setInterval(function(){
					var now=new Date();
					var nowMs=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate(),now.getHours(),now.getMinutes(),now.getSeconds(),now.getMilliseconds())
					self._doGroup(nowMs);
					//countdown.timer=window.setTimeout(arguments.callee,13);
				},refreshRate);	
			}
			
		},
		/*
		 * @method _transMsToDate
		 * @param ms{Number} The milliseconds you want to trans to date format.
		 * @desc Trans milliseconds to date.This function makes date's show more easier.
		 * @return {object}Contains days,hours,minutes,seconds,ms.
		 */
		_transMsToDate:function(ms){
			var s=ms/1000;
			/*
			 * Other way to trans ms to date
			 * 
				var seconds = Math.floor(s % 60);
			    var minutes = Math.floor((s / 60) % 60);
			    var hours = Math.floor((s / 3600) % 24);
			    var days = Math.floor((s / 3600) / 24);
			*/
			var days=Math.floor(s/86400);//seconds to days
			s-=days*86400;//rest seconds
			var hours=Math.floor(s/3600);//seconds to hours
			s-=hours*3600;
			var minutes=Math.floor(s/60);//seconds to minutes
			s-=minutes*60;
			var seconds=Math.floor(s%60);
			var msRest=ms-(days*86400+hours*3600+minutes*60+seconds)*1000;
			
			return{
				days:days,
				hours:hours,
				minutes:minutes,
				seconds:seconds,
				ms:msRest
			}
		}
	};
	return countdown;
}(pc));