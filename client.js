var c=0;
var m=0;
var h=0;
var vote1=0;
var name=null;
var roomname=0;
var myTimer=0;
var count=0;
var keepcount={0:0,1:0,2:0,4:0,8:0,16:0,32:0,64:0,100:0};
var keepnames=[];

/*load the namees and the votes from the database in a table format*/
function displayvotes(name,vote)
{
	count++;
	var userVote=vote;
	var userName=name;

	var table = document.getElementsByClassName("myTableData")[0];

    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);

	var cell=row.insertCell(0);
    cell.innerHTML="<i class='fa fa-user' style='font-size:30px'></i>";
    row.insertCell(1).innerHTML= userName;
    if(userVote==-1)
	{
        row.insertCell(2).innerHTML= "--";//vote2;
    }
	else
	{
        row.insertCell(2).innerHTML= "&#x2714";//vote2;
    }
}

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
		updatevote();
	}

}
/*actions to be taken when name has been input and enter has been pressed*/
function fun(event)
{
	name=document.getElementById("in").value;
	if(count!=0)
	{
		document.getElementById('namein').style.display = 'none';
		document.getElementsByClassName("outerbox")[0].style.visibility="visible";
		document.getElementsByClassName("logdetails")[0].style.visibility="visible";
		updatefirebase();   //create new entry for the user
		myTimer = setInterval(myCounter, 1000); //start the timer
		myCounter();
		document.getElementById('tabledata').style.display = 'block'; //display the table contents with all active users and their votes
		listenchange(roomname);
		document.getElementsByClassName('newuser')[0].innerHTML=name;
	}
	else
	{
		var str="https://flickering-torch-439.firebaseio.com/users/" + roomname + "/";
		document.getElementById('namein').style.display = 'none';
		document.getElementById('inviblock').style.display = 'none';

		var firebase2=new Firebase(str);
		firebase2.on("child_added", function(snapshot, prevChildKey) {
		var givenvotes=snapshot.val();
		delete givenvotes;
		});
		alert("Invlaid Url or Story");
	}
}

/*to display the toast*/
function hideToast(statustext)
{
	var options = {
    style:{
        main:{
            background: "cornflowerblue",
            color: "black",
	        'max-width': '10%',
			}
		}
	};
    iqwerty.toast.Toast( name + ' has joined!!',options);
}

//*once done button is pressed*/
function completed()
{
	document.getElementById('tab1').style.display = 'none';
	document.getElementById('showdetails').style.display = 'block';
	clearInterval(myTimer,0);
	var options = {
		style: {
			main: {
				background: "white",
				color: "black",
				'max-width': '10%',
				}
			}
	};
    iqwerty.toast.Toast( 'Voting has been completed!!!',options);
	document.getElementsByClassName("complete")[0].innerHTML="Voting has been completed!!!!";
	var inputs = document.getElementsByTagName("Button");
	for (var i = 0; i < inputs.length; i++)
	{
		inputs[i].disabled = true;
		inputs[i].style.cursor = "not-allowed";

	}
	dispsummary();
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
        if(givenvotes.name !== "finish")  //a special case when DONE button is pressed...
        {
            keepnames[givenvotes.name]=givenvotes.vote;
            keepcount[givenvotes.vote]++;
        }
	});

	for(var i in keepcount)
	{
		if(keepcount[i]!= 0)
		{
			min=i;//the minimum vote given...
			break;
		}
	}

	for(var j in keepcount)
	{
		if(keepcount[j]!= 0)
		{
			max=j;//the maximum vote given...
		}
	}

	for(var k in keepcount)
	{
		if(keepcount[k]!= 0)
		{
		countrep=countrep+keepcount[k];
		total=total+(k*keepcount[k]);
		}
	}
	avg=((total)/(countrep));
	diff=avg;

	for(var k in keepcount)
	{
			if(Math.abs(avg-k)<diff)
			{
				diff=Math.abs(avg-k);
				near=k;
			}
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

//**********************firbase update functionalities.....**************
/*initially set the vote to zero*/
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
	time: curtime         //change made now...
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
	time: 0   //change made....
  });
}

/*this is a selfcalling background function,which continously listens for the change*/
(function listenchange(roomname){

	window.listenchange=listenchange;
	if(roomname!= undefined)
	{
        var myFirebaseRef = new Firebase("https://flickering-torch-439.firebaseio.com/");
        var usersRef = myFirebaseRef.child("users");
        var ref=usersRef.child(roomname);
        ref.on("child_changed", function(snapshot) {
            var givenvotes=snapshot.val();
            if(givenvotes.name == "finish")
            {
                completed();
            }
            else
            {
                var options = {
                style: {
                    main: {
                        background: "lightsalmon",
                        color: "black",
                        'max-width': '10%',
                        }
                    }
                };
                if(givenvotes.vote != -1){
                    iqwerty.toast.Toast( givenvotes.name +' has voted!!',options);
                }
                change(givenvotes.name,givenvotes.vote);
            }
        });
    }
})();


/*to show current users in the database once the page is loaded*/
function onApplicationLoad()
{
	document.getElementsByClassName("logdetails")[0].style.visibility="collapse";
	var currentUrl = window.location.toString();
	var indexOfFilter=currentUrl.indexOf("=");
	if(indexOfFilter != -1)
		var roomret = currentUrl.substring(indexOfFilter+1,currentUrl.length);  //retrive the roomname from the url given...
	roomname=roomret;

	if(roomret!=undefined) //to check for proper roomname...
	{
		document.getElementsByClassName("outerbox")[0].style.visibility="collapse";
		var myFirebaseRef = new Firebase("https://flickering-torch-439.firebaseio.com/");
		var usersRef = myFirebaseRef.child("users");
		var ref=usersRef.child(roomname);
		ref.on("child_added", function(snapshot, prevChildKey) {
            var givenvotes=snapshot.val();
            if(givenvotes.name == "finish"){
								//ref.child(snapshot.key()).remove();//if new entry is finish block,then delete it...
            }
            else{
                displayvotes(givenvotes.name,givenvotes.vote);
            }
            if(name!= 'null')
            {
                hideToast();
            }
		});
		var node=document.getElementsByClassName("invite")[0];
		node.innerHTML=window.location.href;

		var node2=document.getElementsByClassName("disroom")[0]; //displaying the room name...
		node2.innerHTML=roomname.toUpperCase();
	}
	else
	{
		alert("Invalid Url");
	}
}

/*to update the votes in the current layout when any other user changes his vote*/
/*synchronization*/
function change(name3,vote)
{
	var vote2=vote;
	var name2=name3;

	var table = document.getElementsByClassName("myTableData")[0];
    var rowCount = table.rows.length;
	for(var i=1; i<(rowCount);i++)
	{
		if(name2 == name)
		{
			if(table.rows[i].cells[1].innerHTML == name2)
			{
				if(vote2!=-1)
				{
					table.rows[i].cells[2].innerHTML= vote2;
					break;
				}
				else
				{
					table.rows[i].cells[2].innerHTML= "--";
					break;

				}
			}
		}
		else
		{
			if(table.rows[i].cells[1].innerHTML == name2)
			{
				if(vote2!= -1)
				{
					table.rows[i].cells[2].innerHTML= "&#x2714"//vote2;
					break;
				}
				else
				{
					table.rows[i].cells[2].innerHTML= "--";
					break;
				}
			}
		}
	}
}
