(function(){
	var Map = window.Map = function(){
		//矩阵
		this.matrix = (function(){
			var arr  = [];
			for (var i = 0; i < game.rowamount; i++) {
				var a = [];
				for (var j = 0; j < game.colamount; j++) {
					a.push(_.random(0,game.spriteTypeAmount-1));
				};
				arr.push(a)
			};
			arr.push([]);
			return arr;
		})();
		// console.log(this.matrix)
		//调用函数，生成精灵
		this.createSpritesByMatrix();
	
	}
	//根据矩阵来创建精灵 
	Map.prototype.createSpritesByMatrix = function(){
		this.sprites = [];
		for (var i = 0; i <game.rowamount; i++) {
			this.sprites.push([])
			for (var k = 0; k < game.colamount; k++) {
				this.sprites[i].push(new Sprite(i,k,this.matrix[i][k]))
			};
		};
		
	}
	Map.prototype.render = function(){

		for (var i = 0; i < game.rowamount; i++) {
			for (var k = 0; k < game.colamount; k++) {
				this.sprites[i][k].render();
			};
		};
	}
	//检查是否能消除
	Map.prototype.check = function(){
		var results =[];
		//判断行
		for (var r = 0; r < game.rowamount; r++) {
			var i = 0;
			var j = 1;
			while(j<=game.colamount){
				//当第i项和第j项不相等时
				if(this.matrix[r][i] != this.matrix[r][j]){
					//计算差值，差的间隔
					if(j - i >= 3){
						for (var m = i; m <j; m++) {
							results.push(this.sprites[r][m])
						};
					}
					i = j;
				}
				j++;
			}
		};
		//判断列
		for (var c = 0; c < game.colamount; c++) {
			var i = 0;
			var j = 1;
			while(j<=game.rowamount){
				//当第i项和第j项不相等时
				if(this.matrix[i][c] != this.matrix[j][c]){
					//计算差值，差的间隔
					if(j - i >= 3){
						for (var m = i; m <j; m++) {
							results.push(this.sprites[m][c])
						};
					}
					i = j;
				}
				j++;
			}
		};
		results = _.uniq(results);
		return results;
	}
	//爆炸
	Map.prototype.bomb = function(){
		var needToBomb = this.check();
		var self = this;
			needToBomb.forEach(function(item){
				item.bomb();
				//让爆炸的元素在matrix矩阵上变成一个♦
				self.matrix[item.row][item.col] = "♦";
			})
	}
	//下落
	Map.prototype.drop  = function(){
		//下落行数阵
		this.dropNumber = (function(){
			var arr = [];
			for (var i = 0; i < game.rowamount; i++) {
				arr.push([]);
			}
			return arr;
		})();
		
		//遍历每个元素，计算下落的块数
		for (var row = game.rowamount-1; row >=0; row--) {
			for (var col = 0; col < game.colamount; col++) {
				var sum = 0;
				for (var _row = row+1; _row < game.rowamount; _row++) {
					if(this.matrix[_row][col]=="♦"){
						sum++;
					}
				};
				//写入矩阵
				this.dropNumber[row][col] = sum;
				//下落动画
				this.sprites[row][col].move(row+sum,col);
				//矩阵紧凑
				if(sum!=0){
					this.matrix[row+sum][col]  = this.matrix[row][col];
					this.matrix[row][col] = "♦";
				}
			};
		};
		//连消
		if(game.fno - game.xiaochufno < 100){
			game.xiaochudengji++;
			
			if(game.xiaochudengji>8){
				game.xiaochudengji = 8;
			}
		}else{
			game.xiaochudengji = 1;
			
		}
		game.xiaochufno = game.fno;
		document.getElementById("e"+game.xiaochudengji).load();
		document.getElementById("e"+game.xiaochudengji).play();
		game.fenshu +=game.xiaochudengji*10;
	}
	//补充新的
	Map.prototype.supplement = function(){
		//全员重新new
		this.createSpritesByMatrix();
		//遍历当前的matrix，遇到一个♦就new一个新的，同时命令动画
		for (var row = 0; row < game.rowamount; row++) {
			for (var col = 0; col < game.colamount; col++) {
				var newtype = _.random(0,game.spriteTypeAmount-1);
				if(this.matrix[row][col] == "♦"){
					this.sprites[row][col] = new Sprite(row,col,newtype)
					//下落动画
					this.sprites[row][col].y = 0;
					this.sprites[row][col].move(row,col)
					//写新的matrix矩阵
					this.matrix[row][col] = newtype;
				}
			};
		};
	}
	//交换元素
	Map.prototype.exchange = function(startRow,startCol,endRow,endCol){
		//命令运动
		this.sprites[startRow][startCol].move(endRow,endCol);
		this.sprites[endRow][endCol].move(startRow,startCol);
		//改变状态
		game.fsm = "动画时间";
		var self = this;
		game.makeAppointment(game.fno + 8,function(){
			//matrix矩阵更改
			//交换数组矩阵
			var temp = self.matrix[startRow][startCol];
			self.matrix[startRow][startCol] = self.matrix[endRow][endCol];
			self.matrix[endRow][endCol] = temp;
			//此时check一下，检查能否消行
			if(self.check().length == 0){
				//滑动是失败的,是不能消除的，返回到原来的值
				var temp = self.matrix[startRow][startCol];
				self.matrix[startRow][startCol] = self.matrix[endRow][endCol];
				self.matrix[endRow][endCol] = temp;
				self.sprites[startRow][startCol].move(startRow,startCol);
				self.sprites[endRow][endCol].move(endRow,endCol);
				//改变状态
				game.makeAppointment(game.fno+8,function(){
					game.fsm = "静稳状态";	
				})
				// console.log("不能消除")
			}else{
				//重新生成sprite矩阵
				self.createSpritesByMatrix();
				// //改变状态
				game.fsm = "消除检测";
				// console.log("能消除")
			}
		})
	}
	//炸弹
	Map.prototype.zhadan = function(){
		var number = _.random(0,4);
		var arr = [];
		for (var row = 0; row < game.rowamount; row++) {
			for (var col = 0; col < game.colamount; col++) {
				if(this.sprites[row][col].type == number){
					this.sprites[row][col].bomb();
					this.matrix[row][col] = "♦";
					game.fsm = "下落";
				}
			}
		}	
	}
	//检查是否还有能交换的
	Map.prototype.havechange = function(){
		var tishiarr  =[];
		for (var row = 0; row < game.rowamount; row++) {
			for (var col = 0; col < game.colamount; col++) {
				//判断下
				if(row<game.rowamount-1){
					if(col>=1&&col<game.colamount-1){
						if(this.matrix[row][col]  == this.matrix[row+1][col-1] 
							&&
							this.matrix[row][col]  == this.matrix[row+1][col+1]
							){
							tishiarr.push({"row":row,"col":col,"changerow":row+1,"changecol":col})
							}
						}
					if(col>=2){
						if(this.matrix[row][col]  == this.matrix[row+1][col-1]
							&&
							this.matrix[row][col]  == this.matrix[row+1][col-2]){
							tishiarr.push({"row":row,"col":col,"changerow":row+1,"changecol":col})
							}					
						}
					if(col<game.colamount-2){
						if(this.matrix[row][col]  == this.matrix[row+1][col+1]
							&&
							this.matrix[row][col]  == this.matrix[row+1][col+2]){
							tishiarr.push({"row":row,"col":col,"changerow":row+1,"changecol":col})
						}
					}
				}
				// 判断上
				if(row>=1){
					if(col>=1){
						if(this.matrix[row][col]  == this.matrix[row-1][col-1] 
							&&
							this.matrix[row][col]  == this.matrix[row-1][col+1]
							){
							tishiarr.push({"row":row,"col":col,"changerow":row-1,"changecol":col})
						}
					}
					if(col>=2){
						if(this.matrix[row][col]  == this.matrix[row-1][col-1]
							&&
							this.matrix[row][col]  == this.matrix[row-1][col-2]){
							tishiarr.push({"row":row,"col":col,"changerow":row-1,"changecol":col})
						}
					}
					if(col<=game.colamount-2){
						if(this.matrix[row][col]  == this.matrix[row-1][col+1]
							&&
							this.matrix[row][col]  == this.matrix[row-1][col+2]){
							tishiarr.push({"row":row,"col":col,"changerow":row-1,"changecol":col})
						}
					}
				}
				//判断左
				if(col>=1){
					if(row>=1 && row<=game.rowamount-2){
						if(this.matrix[row][col]  == this.matrix[row-1][col-1]
							&&
							this.matrix[row][col]  == this.matrix[row+1][col-1]){
							tishiarr.push({"row":row,"col":col,"changerow":row,"changecol":col-1})
						}
					}
					if(row>=2){
						if(this.matrix[row][col]  == this.matrix[row-1][col-1]
							&&
							this.matrix[row][col]  == this.matrix[row-2][col-1]){
							tishiarr.push({"row":row,"col":col,"changerow":row,"changecol":col-1})
						}
					}
					if(row<game.colamount-2){
						if(this.matrix[row][col]  == this.matrix[row+1][col-1]
							&&
							this.matrix[row][col]  == this.matrix[row+2][col-1]){
							tishiarr.push({"row":row,"col":col,"changerow":row,"changecol":col-1})
						}
					}
				}
				//判断右
				if(col<game.colamount-1){
					if(row>=1 && row<=game.rowamount-2){
						if(this.matrix[row][col]  == this.matrix[row-1][col+1]
							&&
							this.matrix[row][col]  == this.matrix[row+1][col+1]){
							tishiarr.push({"row":row,"col":col,"changerow":row,"changecol":col+1})
						}
					}
					if(row>=2){
						if(this.matrix[row][col]  == this.matrix[row-1][col+1]
							&&
							this.matrix[row][col]  == this.matrix[row-2][col+1]){
							tishiarr.push({"row":row,"col":col,"changerow":row,"changecol":col+1})
						}
					}
					if(row<game.colamount-2){
						if(this.matrix[row][col]  == this.matrix[row+1][col+1]
							&&
							this.matrix[row][col]  == this.matrix[row+2][col+1]){
							tishiarr.push({"row":row,"col":col,"changerow":row,"changecol":col+1})
						}
					}
				}
			}
		}
		return tishiarr;
	}
	//提示
	Map.prototype.tishi = function(){
		var arr = this.havechange();
		var number = _.random(0,arr.length-1);
		var startrow = arr[number].row;
		var startcol = arr[number].col;
		var endrow = arr[number].changerow;
		var endcol = arr[number].changecol;
		this.sprites[startrow][startcol].tishi = true;
		this.sprites[endrow][endcol].tishi = true;
	}
	//自动
	Map.prototype.zidong = function(){
		var arr = this.havechange();
		var number = _.random(0,arr.length-1);
		var startrow = arr[number].row;
		var startcol = arr[number].col;
		var endrow = arr[number].changerow;
		var endcol = arr[number].changecol;
		this.sprites[startrow][startcol].move(endrow,endcol);
		this.sprites[endrow][endcol].move(startrow,startcol);
		var temp = this.matrix[startrow][startcol];
		this.matrix[startrow][startcol] = this.matrix[endrow][endcol];
		this.matrix[endrow][endcol] = temp;
		// game.fsm = "消除检测"
		// this.createSpritesByMatrix();
	}
	//重置
	Map.prototype.chongzhi = function(){
		this.matrix = (function(){
			var arr  = [];
			for (var i = 0; i < game.rowamount; i++) {
				var a = [];
				for (var j = 0; j < game.colamount; j++) {
					a.push(_.random(0,game.spriteTypeAmount-1));
				};
				arr.push(a)
			};
			arr.push([]);
			return arr;
		})();
		this.createSpritesByMatrix();
		game.fsm = "消除检测";
	}
})()