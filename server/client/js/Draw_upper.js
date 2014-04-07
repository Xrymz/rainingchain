MAPSIZEFACT = 1;


//{State
Draw.state = function(){
	var s = Draw.state.constant();
	
	Draw.state.resource(s);
	s.y += 5;
	Draw.state.ability(s);
	s.y += 30;
	Draw.state.status(s,player.statusClient,player.curseClient,1);
	s.y += 30;
	Draw.chrono(s);
	s.y += 30;
	Draw.pvpScore(s);
}

Draw.state.constant = function(){
	return {
		x:0,
		y:0,
		w:200,
		h:200,	
	}
}

Draw.state.resource = function (s){ ctxrestore();
	ctx = List.ctx.stage;
		
	var array = [
		{'name':'hp','height':20,'width':s.w},
		{'name':'mana','height':10,'width':s.w},
		// {'name':'heal','height':10,'width':s.w},
		// {'name':'fury','height':10,'width':s.w},
	];
	
	for(var i in array){
		var res = array[i];
		Draw.state.resource.bar(s.x+5,s.y+5,res.width,res.height,res.name);
		
		Button.creation(0,{
			'rect':[s.x+5,s.x+5+res.width,s.y+5,s.y+5+res.height],
			'text':res.name.capitalize() + ': ' + player[res.name] + '/' + player.resource[res.name].max,
		});		
		s.y += res.height + 3;
						
	}	
}

Draw.state.resource.bar = function(numX,numY,w,h,name){	ctxrestore();
	ctx = List.ctx.stage;
	
	var ratio = Math.min(Math.max(player[name]/player.resource[name].max,0),1);
	
	ctx.fillStyle = Cst.resource.toColor[name];
	ctx.strokeStyle= "black";
	ctx.roundRect(numX,numY,w,h,false,1,4);	//empty
	ctx.roundRect(numX,numY,w*ratio,h,1,1,4);			//filled
		
	ctxrestore();
}

Draw.state.ability = function(s){ ctxrestore();
	ctx = List.ctx.stage;
	
	var size = 25;
	
	for(var i in player.ability){
		if(!player.ability[i]) continue;
		var ab =  Db.query('ability',player.ability[i]);
		if(!ab) continue;
		var numX = s.x + 10 + (+i * (size + 5));
		var numY = s.y;
		var charge = player.abilityChange.chargeClient[i];
		
		if(charge !== 1) ctx.globalAlpha = 0.5;
		var str = Input.key.ability[i][0].toString().keyCodeToName().keyFullName();
		Draw.icon(ab.icon,numX,numY,size,str + ': ' + ab.name);
		ctx.globalAlpha = 1;
		
		if(charge !== 1){	//loading circle
			ctx.globalAlpha = 0.5;
			ctx.fillStyle = 'red';

			ctx.beginPath();
			ctx.moveTo(numX+size/2,numY+size/2);
			ctx.arc(numX+size/2,numY+size/2,size/2,-Math.PI/2,-Math.PI/2 + charge*2*Math.PI);
			ctx.lineTo(numX+size/2,numY+size/2);
			ctx.closePath();
			ctx.fill();
			
			ctx.globalAlpha = 1;
		}
	}
}

Draw.state.status = function(s,status,curse,showtext){ ctxrestore();		//also use over head
	ctx = List.ctx.stage;
	var numX = s.x+10;		
	for(var i in status){
		if(+status[i]){
			var text = showtext ? Cst.status.list[i].capitalize() : "";	
			Draw.icon('status.' + Cst.status.list[i],numX,s.y,24,text);
			numX += 30;
		}
	}
	
	for(var i in curse){
		var value = curse[i];
		if(value[1] === '-') value = value.slice(1);
		
		var text = showtext ? Db.stat[i].name + ':' + value : "";	
		Draw.icon(Db.stat[i].icon,numX,s.y,24,text);
		numX += 30;
	}
}



//}

Draw.chrono = function(s){	//TOFIX
	for(var i in main.chrono){
		var end = main.chrono[i].end || Date.now();
		var str = (end - main.chrono[i].start).toChrono();
		
		ctx.fillStyle = main.chrono[i].active ? 'white' : 'red';
		ctx.setFont(30);
		ctx.fillText(str,s.x+10,s.y);
		
		var right = null;
		if(main.chrono[i]) right = {func: Chat.send.command,param:['$chrono,remove,' + i]};
		
		Button.creation(0,{
			'rect':[s.x+10,s.x+160,s.y,s.y+30],
			'text':main.chrono[i].text + (main.chrono[i].active ? '' : ' - Right-Click to remove'),
			'right':right,
		});	
		
		s.y += 35;		
	}
	ctx.fillStyle = 'black';
}

Draw.pvpScore = function(s){
	var pv = main.pvpScore;
	ctx.setFont(20);
	ctx.fillStyle = 'white';
	for(var i in pv){
		var str = 1+(+i) + ':  ' + pv[i].name + '  (' + pv[i].point + ')';
		var numX = s.x+10;	
		var numY = s.y + 22*i;
		ctx.fillText(str,numX,numY);
	}	
	//main.pvpScore = [{name:'asdasd','point':123},{name:'asdasd','point':123}]
}


//{Minimap
Draw.minimap = function (){ ctxrestore();
	ctx = List.ctx.minimap;
	Draw.minimap.map();
	
}

Draw.minimap.map = function(){
	var x = -(player.x)/16 + Cst.WIDTH2/main.pref.mapRatio;	
	var y = -(player.y)/16 + Cst.HEIGHT2/main.pref.mapRatio;	
	var im = Db.map[player.map].img.m;
	
	ctx.drawImage(Db.map[player.map].img.m, x,y);
	ctx.fillRect(1280/2/main.pref.mapRatio-2,720/2/main.pref.mapRatio-2,4,4);
}

Draw.minimap.map.updateSize = function(){
	$("#minimapCanvas").css({
		left:Cst.WIDTH-Cst.WIDTH/main.pref.mapRatio,
		width:Cst.WIDTH/main.pref.mapRatio,
		height:Cst.HEIGHT/main.pref.mapRatio,
	});
	$("#minimapCanvas")[0].width = Cst.WIDTH/main.pref.mapRatio;
	$("#minimapCanvas")[0].height = Cst.HEIGHT/main.pref.mapRatio;
	
}

Draw.minimap.icon = function(s){	//creates lag? TOFIX
	return;
	var zoom = main.pref.mapZoom/100;
	var ratio = main.pref.mapRatio;

	for(var i in List.actor){
		var m = List.actor[i];
		if(m.minimapIcon){
			var vx = m.x - player.x;
			var vy = m.y - player.y;
			
			var cx = s.x + Cst.WIDTH/ratio/2; //center
			var cy = s.y + Cst.HEIGHT/ratio/2;
			var size = 36/zoom;
			
			var numX = cx+vx/zoom/ratio-size/2;
			var numY = cy+vy/zoom/ratio-size/2;
		
			if(Collision.PtRect({x:numX+size/2,y:numY+size/2},[s.x,s.x+Cst.WIDTH/main.pref.mapRatio,s.y,s.y+Cst.HEIGHT/main.pref.mapRatio])){
				Draw.icon(m.minimapIcon,numX,numY,size);
			}
		}
	}
	//Draw.icon('system.square',s.x + Cst.WIDTH/main.pref.mapRatio/2-2,s.y + Cst.HEIGHT/main.pref.mapRatio/2-2,4);
}
//}


