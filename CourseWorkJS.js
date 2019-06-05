// Map.cpp : Defines the entry point for the console application.
//

var pi = Math.PI;

abs = Math.abs;

floor = Math.floor;

pow = Math.pow;

wait = script.wait;

function sign(a)
{
	if (a >= 0)
		return 1;
	else
		return -1;
}

var min = Math.min;
var max = Math.max;

var mL = brick.motor("M3").setPower;
var mR = brick.motor("M4").setPower;
var eL = brick.encoder("E3");
var eR = brick.encoder("E4");
eL.reset();
eR.reset();

var sF = brick.sensor("A1").read;
var sL = brick.sensor("D1").read;
var sR = brick.sensor("D2").read;

var robot =
{
	w_D: 5.6,
	w_Base: 17.5,
	w_Circ: 0,	
	base_Circ: 0
}

robot.w_Circ = robot.w_D * pi;
robot.base_Circ = robot.w_base * pi;
var cellLength=17.5;	

var numCol = 21;
var numStr = 21;

// Ride -----------------------------------//

function motors(_mL, _mR){
	_mR = _mR == undefined ? _mL : _mR;
	mL(_mL);
	mR(_mR);
}

var  k=0.9;
function forward_(path_sm){
	var path_deg = path_sm * 360/ (5.6*3.1415);
	lLast=eL.read();
	rLast=eR.read();
	var speed=50;
	var err_sensor=0;
	var err_sensor1=0;
	var err_sensor2=0;
	var err_sensor3=0;
	var err_sensor4=0;
	var err_sensor5=0;
	while (abs(eL.read()-lLast)<path_deg)  {
		err=((eL.read()-lLast)-(eR.read()-rLast))*2;
		if (sL()<5){
			err=((eL.read()-lLast)-(eR.read()-rLast))*1.5;
			err_sensor3=err_sensor2;
			err_sensor2=err_sensor1;
			err_sensor1=-10+sL();
			err_sensor=(err_sensor1+err_sensor2+err_sensor3)/3;
			motors(speed-err-err_sensor*6,speed+err+err_sensor*6);
			}else{
				if (sR()<5){
					err_sensor3=err_sensor2;
					err_sensor2=err_sensor1;
					err_sensor1=-10+sR();
					err_sensor=(err_sensor1+err_sensor2+err_sensor3)/3;
					motors(speed-err+err_sensor*6,speed+err-err_sensor*6);
					
					}
				else{
					motors(speed-err,speed+err);
					}
		wait(3)
		//print(err_sensor);
				}
	}
	motors(-10,-10);
	wait(100);
	motors(0,0);
}

function forward(path_sm){
	path_deg = path_sm * 360 / robot.w_Circ;
	sgn = sign(path_sm);
	eL.reset()
	eR.reset();
	motors(60 * sgn);
	while (abs(eL.read()) < abs(path_deg)) {
		wait(1)
	}
	motors(0);
}

function turn (deg){
	forward(cellLength * 0.2);
	var sgn = sign(-deg);
	var degTurn = 0; 
	eL.reset();
	eR.reset();
	
	motors(20 * sgn, -20 * sgn);

	while (degTurn <= abs(deg)){
		degTurn = abs(((abs(eL.read())+abs(eR.read()))/2) * robot.w_D / robot.w_Circ);
		wait(1)
	}
	forward(cellLength * -0.2);
	motors(0);
}

function rotate (deg) 
{ 	var elLast=eL.read();
	var erLast=eR.read();
	var rightEnc=0;
	var leftEnc=0;
	var err =0;
	var sgn=sign(deg);
  while((abs(rightEnc)+abs(leftEnc))/2<(285)) 
  { 
	rightEnc=eR.read()-erLast;
	leftEnc=eL.read()-elLast;
	err=(abs(leftEnc)-abs(rightEnc));
	motors((60-err)*sgn,(-60-err)*sgn);
	//print(rightEnc,'     ',leftEnc,'   ',err);
	script.wait(1); 
  } 
  motors(-15*sgn,15*sgn);
  script.wait(100); 
  motors(0,0);  
  script.wait(100); 
}

// Algo ----------------------------------//

var mas = [];
var arr = [];
var arr2 = [];
var graph = [];
var graf = [];


var boxes = [];

var n = 6;
var bol = 1;

var color = [];

function clear()
{
	for (var i = 0; i < numStr; i++)
	{
		arr[i] = [];
		arr2[i] = [];
		for (var j = 0; j < numCol; j++)
		{
			arr[i][j] = 0;
			arr2[i][j] = 0;
		}
	}
	return 0;
}

function cutch()
{
	for (var i = 1; i < n - 2; i++)
	{
		var ax, ay, bx, by;
		ax = boxes[i][0];
		ay = boxes[i][1];
		bx = boxes[i][2];
		by = boxes[i][3];
		var lx = min(ax, bx) + 1;
		var rx = max(ax, bx);
		var ly = min(ay, by) + 1;
		var ry = max(ay, by);
		for (var x = lx; x <= rx; x++)
		{
			for (var y = ly; y <= ry; y++)
			{
				arr[x][y] = 1;
			}
		}
	}
}

function cutch_map()
{
	
	for (var i = 1; i < n - 2; i++)
	{
		var ax, ay, bx, by;
		ax = boxes[i][0];
		ay = boxes[i][1];
		bx = boxes[i][2];
		by = boxes[i][3];
		var lx = min(ax, bx);
		var rx = max(ax, bx);
		var ly = min(ay, by);
		var ry = max(ay, by);
		for (var x = lx; x < rx; x++)
		{
			for (var y = ly; y < ry; y++)
			{
				arr2[x][y] = 1;
			}
		}
	}
}

function num(ar)
{
	return ar[0] * numStr + ar[1];
}

function build()
{
	for (var i = 0; i < numStr * numCol; i++)
	{
		graph[i] = [];
	}
	for (var i = 0; i < numStr; i++)
	{
		for (var j = 0; j < numCol; j++)
		{
			var ar = [];
			ar[0] = i;
			ar[1] = j;
			if (i > 0 && j < numCol - 1)
			{
				if (arr[i][j] == 0 && arr[i][j + 1] == 0)
				{
					var ar2 = [];
					ar2[0] = i - 1;
					ar2[1] = j;
					graph[num(ar)].push(num(ar2));
				}
			}
			if (j > 0 && i < numStr - 1)
			{
				if (arr[i][j] == 0 && arr[i + 1][j] == 0)
				{
					var ar2 = [];
					ar2[0] = i;
					ar2[1] = j - 1;
					graph[num(ar)].push(num(ar2));
				}
			}
			if (i < numStr - 1 && j < numCol - 1)
			{
				if (arr[i + 1][j] == 0 && arr[i + 1][j + 1] == 0)
				{
					var ar2 = [];
					ar2[0] = i + 1;
					ar2[1] = j;
					graph[num(ar)].push(num(ar2));
				}
			}
			if (j < numCol - 1 && i < numStr - 1)
			{
				if (arr[i][j + 1] == 0 && arr[i + 1][j + 1] == 0)
				{
					var ar2 = [];
					ar2[0] = i;
					ar2[1] = j + 1;
					graph[num(ar)].push(num(ar2));
				}
			}
		}
	}
}

function build_map()
{
	for (var i = 0; i < numStr * numCol; i++)
	{
		graf[i] = [];
	}
	for (var i = 0; i < numStr; i++)
	{
		for (var j = 0; j < numCol; j++)
		{
			var ar = [];
			ar[0] = i;
			ar[1] = j;
			if (i > 0)
			{
				if (arr2[i][j] == 0 || arr2[i][j + 1] == 0)
				{
					var ar2 = [];
					ar2[0] = i - 1;
					ar2[1] = j;
					graf[num(ar)].push(num(ar2));
				}
			}
			if (j > 0)
			{
				if (arr2[i][j] == 0 || arr2[i + 1][j] == 0)
				{
					var ar2 = [];
					ar2[0] = i;
					ar2[1] = j - 1;
					graf[num(ar)].push(num(ar2));
				}
			}
			if (i < 20)
			{
				if (arr2[i + 1][j] == 0 || arr2[i + 1][j + 1] == 0)
				{
					var ar2 = [];
					ar2[0] = i + 1;
					ar2[1] = j;
					graf[num(ar)].push(num(ar2));
				}
			}
			if (j < 20)
			{
				if (arr2[i][j + 1] == 0 || arr2[i + 1][j + 1] == 0)
				{
					var ar2 = [];
					ar2[0] = i;
					ar2[1] = j + 1;
					graf[num(ar)].push(num(ar2));
				}
			}
		}
	}
}

//vector <vc> heap;

function prov(arr, j)
{
	for (var i = 0; i < arr.size(); i++)
	{
		if (arr[i] == j)
			return false;
	}
	return true;
}

var st = 0;
var kol = 0;

function bfs(j, end)
{
	print("Start bfs");
	q = [];
	col = [];
	for (var i = 0; i < numStr * numCol; i++)
	{
		col[i] = 0;
	}
	q[0] = [];
	q[0][0] = j;
	q[0][1] = -1;
	mas = [];
	var last = 0;
	var beg = 0;
	var k = 1;
	while (beg < k)
	{
		var as = q[beg];
		//print(as);
		mas.push(as);
		beg++;
		k++;
		if (col[as[0]] == 0)
		{
			var pos = mas.length - 1;
			col[as[0]] = 1;
			if (as[0] == end)
			{
				last = pos;
				break;
			}
			for (var i = 0; i < graph[as[0]].length; i++)
			{
				if (graph[as[0][i]] != 10000 && col[graph[as[0]][i]] == 0)
				{
					var gp = [];
					gp[0] = graph[as[0]][i];
					gp[1] = pos;
					q.push(gp);
				}
			}
			/*
			for (int i = 0; i < 21 * 21; i++)
			{
				if (i % 21 == 0)
				{
					cout << endl;
				}
				cout << col[i] << " ";
			}
			*/
		}
	}
	//print(mas);
	arr = [];
	var z = mas[last];
	while (z[1] >= 0)
	{
		arr.push(z[0]);
		z = mas[z[1]];
	}
	arr.push(z[0]);
	//print(arr);
	/*
	for (int i = 0; i < 21 * 21; i++)
	{
		if (i % 21 == 0)
		{
			cout << endl;
		}
		cout << col[i] << " ";
	}
	*/
	//cout << endl;
	return arr;
}

function Az_Find(a, b)
{
	if (a == b + 21)
	{
		return 0;
	}
	else
	{
		if (a == b - 1)
		{
			return 1;
		}
		else
		{
			if (a == b - 21)
			{
				return 2;
			}
			else
				return 3;
		}
	}
}

function Az_Maker(comm, az1, az2)
{
	if (az1 == 0)
	{
		if (az2 == 1)
		{
			comm.push("R");
		}
		if (az2 == 3)
		{
			comm.push("L");
		}
		if (az2 == 2)
		{
			comm.push("L");
			comm.push("L");
		}
	}
	if (az1 == 1)
	{
		if (az2 == 0)
		{
			comm.push("L");
		}
		if (az2 == 2)
		{
			comm.push("R");
		}
		if (az2 == 3)
		{
			comm.push("L");
			comm.push("L");
		}
	}
	if (az1 == 2)
	{
		if (az2 == 1)
		{
			comm.push("L");
		}
		if (az2 == 3)
		{
			comm.push("R");
		}
		if (az2 == 0)
		{
			comm.push("L");
			comm.push("L");
		}
	}
	if (az1 == 3)
	{
		if (az2 == 2)
		{
			comm.push("L");
		}
		if (az2 == 0)
		{
			comm.push("R");
		}
		if (az2 == 1)
		{
			comm.push("L");
			comm.push("L");
		}
	}
}

function wayMaker(start, finish)
{
	var way = bfs(num(start), num(finish));
	//reverse(way.begin(), way.end());
	for (var i=0; i < way.length / 2; i++)
	{
		var w = way[i];
		way[i] = way[way.length - i - 1];
		way[way.length - i - 1] = w;
	}
	print(way);

	var mp = [];
	for (var i = 0; i < numStr; i++)
	{
		mp[i] = [];
		for (var j = 0; j < numCol; j++)
		{
			mp[i][j] = 0;
		}
	}
	for (var i = 0; i < way.length; i++)
	{
		var x = Math.floor(way[i] / numStr);
		var y = way[i] % numCol;
		mp[x][y] = 1;
	}
	for (var i = 0; i < 21; i++)
	{
		print(mp[i]);
	}


	var azimuth = start[2];
	comm = [];
	for (var i = 1; i < way.length; i++)
	{
		var az1 = azimuth;
		var az2 = Az_Find(way[i - 1], way[i]);
		if (az1 != az2)
		{
			Az_Maker(comm, az1, az2);
		}
		azimuth = az2;
		comm.push("F");
	}
	if (azimuth != finish[2])
	{
		Az_Maker(comm, azimuth, finish[2]);
	}

	for (var i = 0; i < comm.length; i++)
	{
		print(comm[i]);
	}

	return comm;
}

function Can_Go_Robot()
{
	print(sF());
	if (sF() > cellLength * 2)
	{
		print("Y");
		return true;
	}
	else
	{
		print("N");
		return false;
	}
}

function Can_Go_RobotL()
{
	print(sL());
	if (sL() > cellLength * 2)
	{
		print("Y");
		return true;
	}
	else
	{
		print("N");
		return false;
	}
}

function Can_Go_RobotR()
{
	print(sR());
	if (sR() > cellLength * 2)
	{
		print("Y");
		return true;
	}
	else
	{
		print("N");
		return false;
	}
}

function Can_Go(a)
{
	var pos = num(a);
	var mas = [];
	mas[0] = 0;
	mas[1] = 0;
	mas[2] = 0;
	if (a[2] == 0)
	{
		for (var i = 0; i < graf[pos].length; i++)
		{
			if (graf[pos][i] == pos - 21)
				mas[1] = 1;
			if (graf[pos][i] == pos + 1)
				mas[2] = 1;
			if (graf[pos][i] == pos - 1)
				mas[0] = 1;
		}
	}
	if (a[2] == 1)
	{
		for (var i = 0; i < graf[pos].length; i++)
		{
			if (graf[pos][i] == pos + 1)
				mas[1] = 1;
			if (graf[pos][i] == pos + 21)
				mas[2] = 1;
			if (graf[pos][i] == pos - 21)
				mas[0] = 1;
		}
	}
	if (a[2] == 2)
	{
		for (var i = 0; i < graf[pos].length; i++)
		{
			if (graf[pos][i] == pos + 21)
				mas[1] = 1;
			if (graf[pos][i] == pos - 1)
				mas[2] = 1;
			if (graf[pos][i] == pos + 1)
				mas[0] = 1;
		}
	}
	if (a[2] == 3)
	{
		for (var i = 0; i < graf[pos].length; i++)
		{
			if (graf[pos][i] == pos - 1)
				mas[1] = 1;
			if (graf[pos][i] == pos - 21)
				mas[2] = 1;
			if (graf[pos][i] == pos + 21)
				mas[0] = 1;
		}
	}
	if (mas[1] == 1)
		return true;
	else
	{
		if (a[2] == 0)
		{
			var sz = graph[pos].length;
			for (var i = 0; i < sz; i++)
			{
				if (graph[pos][i] == pos - numCol)
				{
					graph[pos][i] = graph[pos][sz - 1];
					graph[pos].pop();
					return false;
				}
			}
		}
		if (a[2] == 1)
		{
			var sz = graph[pos].length;
			for (var i = 0; i < sz; i++)
			{
				if (graph[pos][i] == pos + 1)
				{
					graph[pos][i] = graph[pos][sz - 1];
					graph[pos].pop();
					return false;
				}
			}
		}
		if (a[2] == 2)
		{
			var sz = graph[pos].length;
			for (var i = 0; i < sz; i++)
			{
				if (graph[pos][i] == pos + numCol)
				{
					graph[pos][i] = graph[pos][sz - 1];
					graph[pos].pop();
					return false;
				}
			}
		}
		if (a[2] == 3)
		{
			var sz = graph[pos].length
			for (var i = 0; i < sz; i++)
			{
				if (graph[pos][i] == pos - 1)
				{
					graph[pos][i] = graph[pos][sz - 1];
					graph[pos].pop();
					return false;
				}
			}
		}
		return false;
	}
}

function go(way, start)
{
	var pos = num(start);
	var az = start[2];
	//print(way);
	var n = way.length;
	for (var i = 0; i < way.length; i++)
	{
		var q = [];
		q[0] = floor(pos / numStr);
		q[1] = pos % numCol;
		q[2] = az;
		if (way[i] == "L")
		{
			if (way[i + 1] != 'L' && !Can_Go_RobotL())
			{
				print("No L");
				var azz = az;
				var qw = pos;
				if (azz > 0)
					azz--;
				else
					azz = 3;
				if (azz == 0)
				{
					qw -= 21;
				}
				if (azz == 1)
				{
					qw++;
				}
				if (azz == 2)
				{
					qw += 21;
				}
				if (azz == 3)
				{
					qw--;
				}
				//print(qw);
				for (var j =0; j < graph[pos].length; j++)
				{
					if (graph[pos][j] == qw)
					{
						graph[pos][j] = 10000;
					}
				}
				return q;
			}
			turn(-87);
			if (az > 0)
				az--;
			else
				az = 3;
		}
		if (way[i] == "R")
		{
			if (way[i + 1] != 'R' && !Can_Go_RobotR())
			{
				print("No R");
				var azz = az;
				azz++;
				azz %= 4;
				var qw = pos;
				if (azz == 0)
				{
					qw -= 21;
				}
				if (azz == 1)
				{
					qw++;
				}
				if (azz == 2)
				{
					qw += 21;
				}
				if (azz == 3)
				{
					qw--;
				}
				//print(qw);
				for (var j =0; j < graph[pos].length; j++)
				{
					if (graph[pos][j] == qw)
					{
						graph[pos][j] = 10000;
					}
				}
				return q;
			}
			turn(87);
			az++;
			az %= 4;
		}
		if (way[i] == "F")
		{
			var q = [];
			q[0] = floor(pos / numStr);
			q[1] = pos % numCol;
			q[2] = az;
			bol = 1;
			if (Can_Go_Robot())
			{
				if (way[i] == "F")
				{
					if (az == 0)
					{
						pos -= numCol;
					}
					if (az == 1)
					{
						pos++;
					}
					if (az == 2)
					{
						pos += numCol;
					}
					if (az == 3)
					{
						pos--;
					}
				}
				forward_(cellLength);
			}
			else
			{
				print("No F");
				q[0] = floor(pos / numStr);
				q[1] = pos % numCol;
				q[2] = az;
				var qw = pos;
				if (az == 0)
				{
					qw -= 21;
				}
				if (az == 1)
				{
					qw++;
				}
				if (az == 2)
				{
					qw += 21;
				}
				if (az == 3)
				{
					qw--;
				}
				//print(qw);
				for (var j =0; j < graph[pos].length; j++)
				{
					if (graph[pos][j] == qw)
					{
						graph[pos][j] = 10000;
					}
				}
				//print(graph[pos]);
				return q;
			}
		}
	}
	var q = [];
	q[0] = floor(pos / numStr);
	q[1] = pos % numCol;
	q[2] = az;
	return q;
}


function main()
{
	
	//var x = script.readAll("C:\Users\romas\Desktop\TRIK Studio/cord.txt");
	var rd = [];
	var lr = [];

	var start = [];
	var finish = [];

	//ifstream fin("cord.txt");

	//fin >> start.x >> start.y >> start.az;
	/*start[0] = parseInt(x[0], 10);
	start[1] = parseInt(x[1], 10);
	start[2] = parseInt(x[2], 10);
	start[0]--;
	start[1]--;*/
	//fin >> finish.x >> finish.y >> finish.az;
	/*finish[0] = parseInt(x[3], 10);
	finish[1] = parseInt(x[4], 10);
	finish[2] = parseInt(x[5], 10);
	finish[0]--;
	finish[1]--;
	var k = 6;*/
	//print(start);
	//print(finish);
	/*for (var i = 0; i < n; i++)
	{
		//boxes[i] = [];
		var ms = [];
		ms[0] = parseInt(x[k], 10);
		ms[0]--;
		ms[1] = parseInt(x[k+1], 10);
		ms[1]--;
		ms[2] = parseInt(x[k+2], 10);
		ms[2]--;
		ms[3] = parseInt(x[k+3], 10);
		ms[3]--;
		k += 4;
		//boxes.push(ms);
		
		//print(ms);
	}*/
	start = [15,17,0];
	finish = [3, 17, 0];
	boxes[0] = [1,1,3,3];
	boxes[1] = [7,9,9,11];
	boxes[2] = [10,6,12,8];
	boxes[3] = [1,1,3,3];
	boxes[4] = [15,10,17,12];
	boxes[5] = [18,19,20, 21];
	
	for (var i=0;i<5; i++)
	{
		if (boxes[i][0] > 0)
			boxes[i][0]--;
		if (boxes[i][1] > 0)
			boxes[i][1]--;
		if (boxes[i][2] < 20)
			boxes[i][2]++;
		if (boxes[i][3] < 20)
			boxes[i][3]++;
	}
	
	print(num(start));
	print(num(finish));
	
	print(start);
	print(finish);
	print(boxes);
	//fin.close();
	clear();
	cutch();
	cutch_map();
	build();
	build_map();

	for (var i = 1; i < 21; i++)
	{
		print(arr[i]);
	}

	var t = start;
	var kl = 0;
	while (t[0] != finish[0] || t[1] != finish[1] || t[2] != finish[2])
	{
		print(t);
		kl++;
		if (kl > 2)
			wait(10000);
		var way = wayMaker(t, finish);
		var q = t;
		t = go(way, t);
		print(t);
		if (q[0] == t[0] && q[0] == t[0])
		{
			var kla = graph[num(t)].length;
			for (var i=0;i<graph[num(t)].length; i++)
			{
				if (graph[num(t)][i] == 10000)
					kla--;
			}
			if (kla == 0)
			{
				print("No way(!");
			}
			else
				print("I try");
		}
		if (t[0] == finish[0] && t[0] == finish[0])
		{
			//print("Yes");
		}
		else
		{
			//print("No");
		}
	}

	return 0;
}
print("Ez");

var q = main();