(function(){
	var Sprite = window.Sprite  =function(row,col,type){
		//行
		this.row = row;
		//列
		this.col = col;
		//类型
		this.type = type;
		// x坐标
		this.x = game.spriteX + game.spriteW*this.col;
		//y坐标
		this.y = game.spriteY + game.spriteH*this.row;
		//是否处于爆炸状态
		this.isBombing = false;
		//爆炸切片序号0~7
		this.bombNumber = 0;
		//自己是否隐藏
		this.hide = false;
		//状态，是否移动
		this.isMove = false;
		//增量
		this.dx = 1;
		this.dy = 1;
		//设置运动帧数
		this.animateFno = 0;
		this.zuanshinumber = 0;
		//提示
		this.tishi = false;
		this.tishinumber = 1;
	}
	Sprite.prototype.render = function(){
		//处于隐藏状态，不需要渲染任何东西
		if(this.hide) return;
		//判断是否处于爆炸状态
		if(!this.isBombing){
			//不处于
			game.ctx.drawImage(game.R["zuanshi"],50*this.zuanshinumber,38*this.type,50,38,this.x,this.y, game.spriteW,game.spriteH);
			if(this.tishi){
				game.ctx.save();
				game.ctx.globalAlpha=0.7;
				game.ctx.drawImage(game.R["pic"+this.tishinumber],this.x+2,this.y, game.spriteW,game.spriteH);
				game.ctx.restore();
				game.fno%3 == 0&&this.tishinumber++;
				if(this.tishinumber>6){
					this.tishinumber = 1;
				}
			}
			game.fno%7 == 0 && this.zuanshinumber++;
			if(this.zuanshinumber>3){
				this.zuanshinumber = 0;
			}		
		}else{
			//处于
			game.ctx.drawImage(game.R["bomb"],200*this.bombNumber,0,200,200,this.x,this.y, game.spriteW,game.spriteH);
			//每3帧+1
			game.fno%1 == 0 && this.bombNumber++;
			//图片动画结束，隐藏自己
			if(this.bombNumber>7){
				this.hide = true;
			}
		}
		//根据自己是否在移动，改变X,Y
		if(this.isMove){
			this.x+=this.dx;
			this.y+=this.dy;
			this.animateFno++;
			//运动结束
			if(this.animateFno == 8){
				this.isMove = false;
			}
		}
		// console.log(game.R[game.sprites[this.type]])
	}
	//爆炸
	Sprite.prototype.bomb = function(){
		this.isBombing = true;
	}
	//移动
	Sprite.prototype.move = function(targetrow,targetcol){
		//目标位置的X和Y
		var targetX = game.spriteX + game.spriteW*targetcol;
		var targetY = game.spriteY + game.spriteH*targetrow;
		//运动的距离
		var distanceX = targetX - this.x;
		var distanceY = targetY - this.y;
		//运动总帧数
		var animateAllFno = 8;
		//每一帧的变化量
		this.dx = distanceX / animateAllFno;
		this.dy = distanceY / animateAllFno;
		//设置运动帧数清零
		this.animateFno = 0;
		//改变状态
		this.isMove = true;
	}
})()