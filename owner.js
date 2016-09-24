/*All the global variables*/
var c = 0;
var m=0;
var h=0;
var vote1=0;
var name=null;
var roomname=0;
var myTimer=0;

var keepcount={0:0,1:0,2:0,4:0,8:0,16:0,32:0,64:0,100:0};
var keepnames=[];

var dispactualvotes=false;
/*Function to display time*/

function myCounter() {
	c++;
	if(c == 60)
	{
		c=0;
		if(m<=60)
			m++;
		else
		{
			m=0;
			h++;
		}	
	}
    document.getElementById("demo").innerHTML = h + ":" + m + ":" + c;
}

/*load the namees and the votes from the database in a table format*/
function displayvotes(name,vote)
{
	var userVote=vote;
	var userName=name;
	var table = document.getElementsByClassName("myTableData")[0];
    var rowCount = table.rows.length;  //gets the total now of rows currently present in the table...
    var row = table.insertRow(rowCount);
	var cell=row.insertCell(0);   //Three cells for the particular table...
    cell.innerHTML="<i class='fa fa-user' style='font-size:30px'></i>";
    row.insertCell(1).innerHTML= userName;
	
	if(userVote==-1)
	{
		row.insertCell(2).innerHTML= "--";//vote2;
	}	
	else
	{
		row.insertCell(2).innerHTML= userVote;//vote2;
	}
}

function clearv1()
{	
	var options = {
    style:{
        main:{
            background: "lightsalmon",
            color: "black",
			'max-width': '10%',
			}
		}
	};
    iqwerty.toast.Toast(' Timer has been reset!!',options);


	clearInterval(myTimer,0); //Clearinterval function clears the interval specified by the SetInterval function...
	c=0;
	m=0;
	h=0;
	myTimer = setInterval(myCounter, 1000);  //setInterval is a inbuilt function to call particular function(here its myCounter) at specified time intervals.. .	
}

/*when button is clicked against the particular vote*/
function clicked(vote)
{
	if(name == 'null')
	{
		window.alert("you have to enter your name first!!!!");
	}
	
	else
	{
		vote1=vote;
		updatevote();  //function to updatee the vote in case user has changed his vote...
	}
	
}

/*actions to be taken when name has been input and enter has been pressed*/
function fun(event)
{
	
	//var x=event.which || event.keyCode;
	name=document.getElementById("in").value;		
	roomname=document.getElementById("in2").value;

	//console.log(name,roomname);	
	//if(x == 13) //x is the keycode for ENTER...

		
	document.getElementById('namein').style.display = 'none'; //hides the page element...
	mainfun();
	updatefirebase(); //create new entry for the user...
	myTimer = setInterval(myCounter, 1000); //start the timer...
	myCounter(); //starts the timer...
	listenchange(roomname); //listens to any change on that particular room...
	document.getElementsByClassName('newuser')[0].innerHTML=name;
	document.getElementsByClassName("logdetails")[0].style.visibility="visible";
}

/*to display the toast*/
function hideToast(newjoin)
{	
	var options = {
    style: {
        main: {
            background: "cornflowerblue",
            color: "black",
			'max-width': '10%',
            }
        }
    };
    iqwerty.toast.Toast( newjoin + ' has joined!!',options);
}

/*once DONE button is pressed*/
function finish()
{
	
	document.getElementById('tab1').style.display = 'none';
	document.getElementById('showdetails').style.display = 'block';	
	clearInterval(myTimer,0);//stops the timer...
	
	dispactualvotes=true;
	
	var end="finish";
	updatefirebase1(end,0); //a seperate function when DONE button is pressed...
	
	document.getElementsByClassName("complete")[0].innerHTML="Voting has been completed!!!!";			
	var inputs = document.getElementsByTagName("Button");
	
	for (var i = 0; i < inputs.length; i++) //disable all the input button...
	{
		inputs[i].disabled = true;
		inputs[i].style.cursor = "not-allowed";
	}
	
	var resetbutton=document.getElementById("nb2");
	resetbutton.disabled=false;
	resetbutton.style.cursor="pointer";
	
	updatefirebase1(end,8);//a dummy to trigger on client side... 
	dispsummary(); //to display the reesult after finish buttton is pressed...
}

function dispsummary()
{
	var min=6;
	var max=0;
	var countrep=0,total=0,avg=0;
	var diff=0,near=0;	
    
	var myFirebaseRef = new Firebase("https://flickering-torch-439.firebaseio.com/");
	var usersRef = myFirebaseRef.child("users");
	var ref=usersRef.child(roomname);
	ref.on("child_added", function(snapshot, prevChildKey) {
		var givenvotes=snapshot.val();
		if(givenvotes.name == "finish")  //a special case when DONE button is pressed...
		{
		}	
		else
		{	
			keepnames[givenvotes.name]=givenvotes.vote;
			keepcount[givenvotes.vote]++;
			change(givenvotes.name,givenvotes.vote);//display the actual votes to the organizer after votting is completed...
		}
	});
		
	for(var i in keepcount)
	{
		if(keepcount[i]!= 0)
		{
			min=i;//the minimum vote given...
			break;
		}	
		else{}
	}
	
	for(var j in keepcount)
	{
		if(keepcount[j]!= 0)
		{
			max=j;//the maximum vote given...
		}	
		else
		{}
	}
	
	for(var k in keepcount)
	{
		if(keepcount[k]!= 0)
		{
			countrep=countrep+keepcount[k];
			total=total+(k*keepcount[k]);
		}	
		else{}
	}
	avg=((total)/(countrep));
	diff=avg;
	
	for(var k in keepcount)
	{
		//if(keepcount[k]!=-1)
		//{
			if(Math.abs(avg-k)<diff)
			{
				diff=Math.abs(avg-k);
				near=k;
			}	
			else
			{}
		//}
	}
	checkname(max,min,near);	
}

function checkname(max,min,near)
{	
	var max1=max;
	var min1=min;
	var near1=near;
	var maxdisp="",mindisp="";
		
	for(var i in keepnames)
	{
		if(keepnames[i] == max1)
			maxdisp= maxdisp + i + ",";
		
		if(keepnames[i] == min1)
			mindisp= mindisp + i + ",";
	}

	maxdisp=maxdisp.slice(0,-1);
	mindisp=mindisp.slice(0,-1);
	document.getElementsByClassName("maxvote")[0].innerHTML="Max. votes: " + "(" + maxdisp + ")" + " -" + max1;
	document.getElementsByClassName("minvote")[0].innerHTML="Min. votes: " + "(" + mindisp + ")" + " -" + min1;
	document.getElementsByClassName("Result")[0].innerHTML="Result: " + near1;
}



//**********************firebase update functionalities.....**************

//to call a function when finish button is pressed and to take respective action (specially defined )
function updatefirebase1(end,vo)
{
	var myFirebaseRef = new Firebase("https://flickering-torch-439.firebaseio.com/");  //The url represents the destination of data being stored...
	
	var name1=end;	
	var usersRef = myFirebaseRef.child("users");
	var ref=usersRef.child(roomname);
	var datas=ref.child(name1);
	datas.set({
	name: name1,	
	vote: vo
  });
}

/*setting the vote to zero when reset button is pressed*/
function settozero()
{	
	var stat=window.confirm("Do you want to RESET your vote??");
	if(stat == true)
	{
		var myFirebaseRef = new Firebase("https://flickering-torch-439.firebaseio.com/");
		
		var usersRef = myFirebaseRef.child("users");
		var ref=usersRef.child(roomname);
		var datas=ref.child(name);
		datas.update({
		vote: -1
		});
	}		
	else{}
}

/*to update the vote in the database*/
function updatevote()
{
	var curtime=h + ":" + m + ":" + c;
	var myFirebaseRef = new Firebase("https://flickering-torch-439.firebaseio.com/");
	var usersRef = myFirebaseRef.child("users");
	var ref=usersRef.child(roomname);
	var datas=ref.child(name);
	datas.update({
	vote: vote1,
	time: curtime //change made now...
  });
}

/*to create a new entry in the database for the particular user*/
function updatefirebase()
{
	var myFirebaseRef = new Firebase("https://flickering-torch-439.firebaseio.com/");
	
	var name1=name;	
	var usersRef = myFirebaseRef.child("users");
	var ref=usersRef.child(roomname);
	var datas=ref.child(name1);
	datas.set({
	name: name,	
	vote: -1,
	time: 0         //change made..
  });
}

/*this is a selfcalling background function,which continously listens for the change*/
(function listenchange(roomname){
	window.listenchange=listenchange;
	if(roomname!= undefined) //if roomname is entered then continue with accesss to data..
	{
		var myFirebaseRef = new Firebase("https://flickering-torch-439.firebaseio.com/");
		var usersRef = myFirebaseRef.child("users");
		var ref=usersRef.child(roomname);
		ref.on("child_changed", function(snapshot) {
		var givenvotes=snapshot.val();  //returns an jquery object array
		
		if(givenvotes.name == "finish"){
				var options = {
			style: {
				main: {
					background: "white",
					color: "black",
					'max-width': '10%',
					}
				}
			};
		iqwerty.toast.Toast( 'Voting has been completed!!!!',options);
		}
		
		else
		{		
			var options = {
				style:{
					main:{
						background: "lightsalmon",
						color: "black",
						'max-width': '10%',
						}
					}
				};
            if(givenvotes.vote != -1){
                iqwerty.toast.Toast( givenvotes.name +' has voted!!',options);
            }
            change(givenvotes.name,givenvotes.vote); //call change function to update items on the table displayed in the view...
		}
        });
    }
	else{}
})();


/*to show current users in the database once the page is loaded*/	
function loadfun()
{
	document.getElementsByClassName("outerbox")[0].style.visibility = "hidden"; //hide the outerbox div....
	document.getElementById('showdetails').style.display = 'none';
	document.getElementsByClassName("logdetails")[0].style.visibility="collapse";
}

/*to show current users in the database once the page is loaded*/	
function mainfun()
{	
	document.getElementsByClassName("outerbox")[0].style.visibility="visible";  //set the visibility of complete outerbox div as visible...	
	if(roomname!=undefined)
	{	
		var myFirebaseRef = new Firebase("https://flickering-torch-439.firebaseio.com/");
		var usersRef = myFirebaseRef.child("users");
		var ref=usersRef.child(roomname);
		ref.on("child_added", function(snapshot, prevChildKey) {
		var givenvotes=snapshot.val();
		if(givenvotes.name == "finish")  //a special case when DONE button is pressed...
		{
			ref.child(snapshot.key()).remove();
		}
		else
		{
			displayvotes(givenvotes.name,givenvotes.vote);  //call displayvote function to display the player name and his vote...
		}
		if(name!= 'null')
		{
            hideToast(givenvotes.name); //this is to check....*****************(working for now...)	
		}
		});
		var node=document.getElementsByClassName("invite")[0]; /*direct the invite text to client page with RoomName passed as parameter*/
		var url=window.location.href + "?exsistingroom=" + roomname;
		url=url.replace("front", "client");
		node.innerHTML=url; 
		var node2=document.getElementsByClassName("disroom")[0];
		node2.innerHTML=roomname.toUpperCase();
	}
	else
	{	
		alert("you have not entered the RoomName");
	}	
}

/*to update the votes in the current layout when any other user changes his vote*/
/*synchronization*/
function change(name,vote)
{
	var vote2=vote;
	var name2=name;
	var table = document.getElementsByClassName("myTableData")[0];
    var rowCount = table.rows.length;//gets the total no of rows in the current table...
 
	for(var i=1; i<(rowCount);i++)
	{
		if(table.rows[i].cells[1].innerHTML == name2)
		{	
			if(vote2!=-1)
			{	
				if(dispactualvotes)		
				{
					table.rows[i].cells[2].innerHTML= vote2; //in case voting is completed,display all the votes to the organizer...
				}	
				else
				{
					table.rows[i].cells[2].innerHTML= "&#x2714"//vote2;//&#x2714--value for TICK mark
				}
				break;
			}			
			else
			{
				table.rows[i].cells[2].innerHTML= "--"//vote2;//&#x2714--value for TICK mark
				break;
			}
			//probably add a break statement......	
		}
		else
		{}
	}
}