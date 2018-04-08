(function(){
	var Game = window.Game = function(){
		//得到画布
		this.mycanvas = document.getElementById("mycanvas");
		//设置上下文，也设置成为game的属性
		this.ctx = this.mycanvas.getContext("2d");
		//测试一下基准位置
		this.rowamount = 8;//行
		this.colamount = 8;//列
		this.paddingLeftRight = 20;//左右空白
		this.paddingBottom = 50;//下空白
		//参与游戏的精灵的个数
		this.spriteTypeAmount = 5;
		//有限状态机
		this.fsm = "消除检测";
		//预约器
		this.appointment = [];
		this.init();
		this.loadResource(function(){
			this.start();
		});
		this.bindevent();
	}
	//设置画布的宽和高
	Game.prototype.init = function(){
		this.mycanvas.width = document.documentElement.clientWidth;
		this.mycanvas.height = document.documentElement.clientHeight;
		if(this.mycanvas.width>500){
			this.mycanvas.width = 500;
		}
		if(this.mycanvas.height>800){
			this.mycanvas.height = 800;
		}

	}
	//读取资源
	Game.prototype.loadResource = function(callback){
		//设置R对象
		this.R = {
			"bomb":"images/bomb.png",
			"zuanshi":"images/zuanshi.png",
			"logo1":"images/logo.jpg",
			"yj":"images/yj.jpg",
			"pic1":"images/pic1.png",
			"pic2":"images/pic2.png",
			"pic3":"images/pic3.png",
			"pic4":"images/pic4.png",
			"pic5":"images/pic5.png",
			"pic6":"images/pic6.png"
		}
		//得到图片的总数
		var imagesAmount = Object.keys(this.R).length;
		var self = this;
		//计数器，加载好的图片个数
		var count = 0;
		for(var k in this.R){
			(function(k){
				var image = new Image();
				image.src = self.R[k];
				//监听图片加载完成
				image.onload = function(){
					count++;
					self.R[k] = this;
					//提示用户加载完成
					self.ctx.textAlign = "center";
					self.ctx.font="20px 微软雅黑";
					//清屏
					self.clear();
					self.ctx.fillText("正在加载图片"+count+"/"+imagesAmount, self.mycanvas.width/2, self.mycanvas.height/2*0.618)
					//加载完成
					if(count==imagesAmount){
						//全部加载完毕，执行回调函数
						callback.call(self);
						self.shanchu();
					}					
				}
			})(k)
		}
	}
	Game.prototype.clear = function(){
		this.ctx.clearRect(0, 0,self.mycanvas.width,self.mycanvas.height)
	}
	//开始游戏
	Game.prototype.start = function(){
		//设置帧编号
		this.fno = 0;
		//游戏时间
		this.time = 60;
		//分数
		this.fenshu = 0;
		this.xiaochufno = 0;
		this.xiaochudengji = 0;
		//外挂开启
		this.iswaigua  = false;
		//精灵
		//每个精灵宽度
		this.spriteW = (this.mycanvas.width - this.paddingLeftRight*2)/this.colamount;
		//精灵高度
		this.spriteH = this.spriteW;
		//第一个精灵的X
		this.spriteX = this.paddingLeftRight;
		//第一个精灵的Y
		this.spriteY = this.mycanvas.height - this.paddingBottom - this.rowamount*this.spriteH;
		this.map = new Map();
		//绑定监听事件
		this.bindevent();
		//************************
		setInterval(this.loop.bind(this),30)
	}
	//主循环的内容
	Game.prototype.loop = function(){
		//清屏
		this.clear();
		//帧编号+1
		this.fno++;
		//计算时间
		this.rate = 1-(this.fno/50/this.time);
		
		//检查是否符合了某个预约器
		for (var i = this.appointment.length-1; i >= 0; i--) {
			if(this.appointment[i].fno == this.fno){
				// console.log(this.appointment[i])
				this.appointment[i].fn.call(this);
				//删除这项
				this.appointment.splice(i,1);
			}
		};
		//状态机的工作
		//外挂未开启
		if(!this.iswaigua){
			if(this.fsm == "消除检测"){
			if(this.map.check().length > 0){
				this.fsm = "爆炸";
			}else{
				this.fsm = "静稳状态";
			}
		}else if(this.fsm == "爆炸"){
			this.map.bomb();
			//切换为动画时间
			this.fsm = "动画时间";
			//8帧以后为下落
			this.makeAppointment(this.fno + 8,function(){
				this.fsm = "下落";
			});
		}else if(this.fsm == "下落"){
			this.map.drop();
			//切换为动画时间
			this.fsm = "动画时间";
			//8帧以后为补充新的
			this.makeAppointment(this.fno +8,function(){
				this.fsm = "补充新的";
			});
		}else if(this.fsm == "补充新的"){
			this.map.supplement();
			//切换为动画时间
			this.fsm = "动画时间";
			//8帧以后为消除检测
			this.makeAppointment(this.fno +8,function(){
				this.fsm = "消除检测";
			});
		  }
		  //外挂开启模式
		}else{
			if(this.fsm == "消除检测"){
			if(this.map.check().length > 0){
				this.fsm = "爆炸";
			}else{
				this.fsm = "静稳状态";
			}
		}else if(this.fsm == "爆炸"){
			this.map.bomb();
			//切换为动画时间
			this.fsm = "动画时间";
			//8帧以后为下落
			this.makeAppointment(this.fno + 8,function(){
				this.fsm = "下落";
			});
		}else if(this.fsm == "下落"){
			this.map.drop();
			//切换为动画时间
			this.fsm = "动画时间";
			//8帧以后为补充新的
			this.makeAppointment(this.fno +8,function(){
				this.fsm = "补充新的";
			});
		}else if(this.fsm == "补充新的"){
			this.map.supplement();
			//切换为动画时间
			this.fsm = "动画时间";
			//8帧以后为消除检测
			this.makeAppointment(this.fno +8,function(){
				this.fsm = "消除检测";
			});
		 } else if(this.fsm == "静稳状态"){
		 	this.map.zidong();
		 	this.fsm = "自动模式";
		 	this.makeAppointment(this.fno +8,function(){
		 		this.map.createSpritesByMatrix();
				this.fsm = "消除检测";
			});
		 }
		}
		
		//显示背景
		this.ctx.drawImage(this.R["logo1"],0,0,this.mycanvas.width,this.mycanvas.height);
		//渲染精灵背部矩阵
		this.ctx.fillStyle = "rgba(255,255,255,0.3)";
		this.ctx.fillRect(0,0,this.mycanvas.width,this.mycanvas.height);
		//渲染地图
		this.map.render();
		//渲染时间轴
		this.ctx.save();
		this.ctx.fillStyle = "#000";
		this.ctx.fillRect(0,0,this.mycanvas.width,40);	
		this.ctx.fillStyle = "yellow";
		this.ctx.fillRect(0,0,this.mycanvas.width*this.rate,40);
		this.ctx.restore();
		//外挂模式
		if(this.iswaigua){
			// this.ctx.save();
			// this.ctx.globalAlpha=0.5;
			// this.ctx.drawImage(this.R["yj"],0,this.mycanvas.height/2-100,this.mycanvas.width,200);
			// this.ctx.restore();
			this.ctx.save();
			this.ctx.font = "50px 微软雅黑";
			this.ctx.fillStyle = "red";
			this.ctx.textAlign = "center";
			this.ctx.fillText("自动模式",this.mycanvas.width/2,30);
			this.ctx.restore();
		}
		//游戏结束
		if(this.rate<=0){
			this.fsm = "游戏结束";
			this.ctx.save();
			this.ctx.fillStyle = "rgba(255,255,255,0.5";
			this.ctx.fillRect(0,0,this.mycanvas.width,this.mycanvas.height);
			this.ctx.fillStyle = "black"
			this.ctx.font = "50px 微软雅黑";
			this.ctx.textAlign = "center";
			this.ctx.fillText("游戏结束",this.mycanvas.width/2,this.mycanvas.height/2-100);
			this.ctx.font = "30px 微软雅黑";
			this.ctx.fillStyle = "blue"
			this.ctx.fillText("你的分数为："+this.fenshu,this.mycanvas.width/2,this.mycanvas.height/2-30);
			this.ctx.font = "25px 微软雅黑";
			this.ctx.fillStyle = "#000"
			this.ctx.fillText("点击屏幕重新开始",this.mycanvas.width/2,this.mycanvas.height/2+20);
			this.ctx.restore();
			//外挂iswaigua变为false
			this.iswaigua = false;
			// console.log("111")
		}
		//显示帧编号
		this.ctx.fillStyle = "#fff";
		this.ctx.textAlign = "left";
		this.ctx.textBaseline = "top";
		this.ctx.fillText("帧编号:"+this.fno, 360, this.mycanvas.height-40);
		// this.ctx.fillText("消除帧编号:"+this.xiaochufno, 200, this.mycanvas.height-40);
		this.ctx.fillText("分数:"+this.fenshu, 10, this.mycanvas.height-40);
		// this.ctx.fillText("状态:"+this.fsm, 10, this.mycanvas.height-80);
		// 在table中实时打印map的matrix矩阵
        // for(var i = 0 ; i < this.rowamount ; i++){
        //    for(var j = 0 ; j < this.colamount ; j++){
        //         document.getElementById("matrixtable").getElementsByTagName("tr")[i].getElementsByTagName("td")[j].innerHTML = this.map.matrix[i][j];
        //     } 
        // }
        // console.log(this.fsm)

	}
	//做一个预约
	Game.prototype.makeAppointment = function(fno,fn){
		this.appointment.push({"fno":fno,"fn":fn});
	}
	//分数显示
	Game.prototype.xianshi = function(){
		$("#mytable tr:gt(0)").remove();
		$.get("/xianshi",function(data){
			for (var  i = 0; i < data.result.length; i++) {
				$([
					'<tr>',
					   '<td>'+data.result[i].fenshu+'分</td>',
					'</tr>'
				].join("")).appendTo("#mytable");            
			}
		})
	}
	//分数上传
	Game.prototype.shangchuan = function(){
		var self = this;
		$.post("/xianshi",{"fenshu":this.fenshu},function(data){
			console.log(data.result)
			if(data.result == 1){
				self.xianshi();
			}
		})
	}
	//删除数据
	Game.prototype.shanchu = function(){
		var self = this;
		$.ajax({
			"url":"/xianshi",
			"type":"DELETE",
			"success":function(data){
				if(data.result == 1){
					self.xianshi();
				}
			}
		})
	}
	//绑定事件
	Game.prototype.bindevent = function(){
		var self = this;
		this.mycanvas.onmousedown = function(event){
			if(self.fsm == "游戏结束"){	
				self.shangchuan();		
				self.fsm = "消除检测";
				self.map = new Map();
				self.fno = 0;
				self.rate = 1;
				self.fenshu = 0;
				self.xiaochufno = 0;
				self.xiaochudengji = 0;
				//***********************************
			}
			if(self.fsm != "静稳状态"){
			 	return;
			}
				
			var x = event.offsetX;
			var y = event.offsetY;
			//判断当前的鼠标点到哪个元素
			var startRow = parseInt((y - self.spriteY)/self.spriteH);
			var startCol = parseInt(x/self.spriteW);
			//验收
			if(startRow<0 || startRow>self.rowamount-1 || startCol < 0 || startCol > self.colamount-1){
				return;
			}
			// console.log("起点："+startRow,startCol);
			self.mycanvas.onmousemove = function(event){
				//终点位置
				var x = event.offsetX;
				var y = event.offsetY;
				var endRow = parseInt((y - self.spriteY)/self.spriteH);
				var endCol = parseInt(x/self.spriteW);
				// console.log("终点："+endRow,endCol);
				//验收
				if(endRow<0 || endRow>self.rowamount-1 || 	endCol < 0 || endCol > self.colamount-1){
					self.mycanvas.onmousemove = null;
					return;
				}
				//验证从哪到哪
				if(startRow == endRow && Math.abs(startCol - endCol) == 1
					||
				   startCol == endCol && Math.abs(startRow - endRow) == 1){									
					self.map.exchange(startRow,startCol,endRow,endCol)
					self.mycanvas.onmousemove = null;
				}
			}

		}
		this.mycanvas.onmouseup = function(){
			this.onmousemove = null;
		}

	}
})()