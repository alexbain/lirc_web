<!DOCTYPE HTML>
<html>
  <head>
	<script type="text/javascript">

		window.onload = function() {
 			 window.onscroll();
			 startCountDowns();
		};

		var daysOfWeek = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"];
		var items = [];

		window.onscroll = function() 
		{
			var v = document.getElementById("statusText");

			v.style.position = "fixed";
			v.style.bottom = "0px";
		} 

		var counter;

		function outputCommand(command)
		{
			command = command.replace(/SEND_ONCE,/g, "&shy;");
			command = command.replace(/SIMULATE,/g, "&shy;");
			command = command.replace(/delay,/g, "&shy;");
			document.getElementById("statusText").innerHTML = "Sending: " + command;
			document.getElementById("statusText").style.opacity = 1;
			
			if(counter)
				clearInterval(counter);

			counter=setInterval('removeExtraText()', 5000);	
		}
		
		function removeExtraText()
		{
			clearInterval(counter);
			
			counter = setInterval('decreaseOpacity(.05)', 100);	
			//document.getElementById("statusText").innerHTML = "";
		}

		function decreaseOpacity(val)
		{
			var v = document.getElementById("statusText").style.opacity;
			if(v <= 0)
			{
				clearInterval(counter);
				document.getElementById("statusText").style.opacity = 0;
			}
			else
			{
				v = v - val;
				if(v < 0)
				{
					v = 0;
				}
				document.getElementById("statusText").style.opacity = v;
			}
		}

		function startCountDowns(command)
		{
			items = [];
			var oldTable = document.getElementById("ScheduleTable");
			if(oldTable)
				oldTable.parentNode.removeChild(oldTable);
	
			{% for item in items%}
				{% set colorName = loop.key%}
				{% set colorIndex = loop.index0%}
				var array = [];
				{% for eachItem in item%}
					array.push("{{eachItem}}");
				{% endfor %}	
				
				items.push(array);
			{% endfor %}	

			var newTable = document.createElement("table");
			newTable.style.width = "100%";
			newTable.id = "ScheduleTable";
			var newRow = document.createElement("tr");
			var newHeader1 = document.createElement("th");
				var header1Text = "Remote";
				var header1Node = document.createTextNode(header1Text);
				newHeader1.appendChild(header1Node);
				newRow.appendChild(newHeader1); 
			var newHeader2 = document.createElement("th");
				var header2Text = "Command";
				var header2Node = document.createTextNode(header2Text);
				newHeader2.appendChild(header2Node);
				newRow.appendChild(newHeader2);
			var newHeader3 = document.createElement("th");
				var header3Text = "Triggered In";
				var header3Node = document.createTextNode(header3Text);
				newHeader3.appendChild(header3Node);
				newRow.appendChild(newHeader3);
			newTable.appendChild(newRow);

			for(var i = 0; i < items.length; i++)
			{
				var currDate = moment();
				console.log("Current Time!!!: " + currDate.format());
				var daysIndex;
				for(var j = 0; j < daysOfWeek.length; j++)
				{
					if(items[i][3] == daysOfWeek[j])
						daysIndex = j;
				}

				var daysFromNow;

				if(currDate.day() == daysIndex)
				{
					//if the current hour is greater than the desired hour
					if(currDate.hour() > items[i][4])
					{
						daysFromNow = 7;
					}
					else if(currDate.hour() == items[i][4])
					{
						if(currDate.minute() >= items[i][5])
							daysFromNow = 7;
						else
							daysFromNow = 0;
					}
					else
					{
						daysFromNow = 0;
					}			
				}
				else if(currDate.day() < daysIndex)
				{
					daysFromNow = daysIndex - currDate.day();
				}
				else
				{
					daysFromNow = (6 - currDate.day()) + daysIndex+1;
				}	

				//console.log("Days From Now: " + daysFromNow);	
				var dater = currDate.year() + "-0" + (currDate.month()+1) + "-0" + currDate.date() + " 00:00";
				
				var tempDay = moment(dater);
				tempDay.add(daysFromNow, 'days');
				tempDay.hour(items[i][4]);
				tempDay.minute(items[i][5]);

				//console.log(tempDay.format());
				//console.log("From Now: " + tempDay.diff(currDate));
				//console.log(currDate.format());
				
				var timeText = secondsToString(tempDay.diff(currDate)*0.001);		

				var newRow = document.createElement("tr");
				var newColumn = document.createElement("td");
				newColumn.align = "center";
					var remoteText = items[i][1];
					var remoteTextNode = document.createTextNode(remoteText );
					newColumn.appendChild(remoteTextNode );
				newRow.appendChild(newColumn);

				var newColumn1 = document.createElement("td");
				newColumn1.align = "center";
					var commandText = items[i][2];
					var commandTextNode = document.createTextNode(commandText );
					newColumn1.appendChild(commandTextNode );
				newRow.appendChild(newColumn1);

				var newColumn2 = document.createElement("td");
				newColumn2.align = "center";
				newColumn2.id = i + items[i][1];
					var triggerText = timeText;
					var triggerTextNode = document.createTextNode(triggerText );
					newColumn2.appendChild(triggerTextNode );
				newRow.appendChild(newColumn2);

				newTable.appendChild(newRow);

				setTimeout(updateTimer, 1000, i, tempDay.diff(currDate), items[i][1], items[i][2]);
			}

			var tableSpace = document.getElementById("scheduledItems");
			tableSpace.insertBefore(newTable, tableSpace .childNodes[0]);
		}

		function updateTimer(element, time, remote, command)
		{
			var timeText = secondsToString((time - 1000)*0.001);
			//console.log(timeText);
			var newElement = document.getElementById(element + remote);
			newElement .innerHTML = timeText;
			if(time <= 0)
			{
				startCountDowns();
			}
			else
			{
				setTimeout(updateTimer, 1000, element, time-1000, remote, command);
			}
		}

		function secondsToString(seconds)
		{
			var numyears = Math.floor(seconds / 31536000);
			var numdays = Math.floor((seconds % 31536000) / 86400); 
			var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
			var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
			var numseconds = Math.round((((seconds % 31536000) % 86400) % 3600) % 60);
			
			var output = "";
			if(numyears > 0)
				output += numyears + " years ";
			if(numdays > 0)
				output += numdays + " days ";
			if(numhours > 0)
				output += numhours + " hours ";
			if(numminutes > 0)
				output += numminutes + " minutes ";
			if(numseconds)
				output += numseconds + " seconds";
			return output;		
		}
</script>

    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta charset="UTF-8">
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width">
    <meta name="viewport" content="initial-scale = 1.0,maximum-scale = 1.0">
    <title>Universal Remote</title>
    <link rel="stylesheet" href="css/bootstrap.css" />
    <link rel="stylesheet" href="css/flat-ui.css" />
    <link rel="stylesheet" href="css/compiled/app.css" />
  </head>
  <body ontouchstart="">
    <div id="container">
      <h1 id="titlebar">
        <a class="back hidden"><img src="/images/left-arrow.png" height="40" width="40" /></a>
        <span id="title" data-text="Universal Remote">Universal Remote</span>
      </h1>

{% for macro in macros %}
	{% set area = loop.key %}

      <div class="macros-nav">
		<h3>{{area}}</h3>
		{% for aMacroCommand in macro %}
        		{% set macroName = loop.key %}
        		<button style="width:75px; height:75px;" onClick="outputCommand('{{aMacroCommand }}')" class="btn btn-large btn-warning macro-link" href="/macros/{{area}}/{{ macroName }}">{{ macroName }}</button>
      		{% endfor %}
      </div>
{% endfor %}

	<div class="remotes-nav">
	<hr />
      {% for remote in remotes %}
        {% set remoteName = loop.key %}
        <a class="btn btn-large btn-info" href="#{{ remoteName }}">{{ labelForRemote(remoteName) }}</a>
      {% endfor %}
	
      </div>

	<div class="scheduleBtn">
		<a class="btn btn-large btn-info" href="#scheduledItems">View Schedule</a>
	</div>

      <div class="prev"></div>

 <div class="remotes">
      {% for remote in remotes %}
        {% set remoteName = loop.key %}
        <div class="remote" id="{{ remoteName }}">
          {% for command in remote %}
               <button style="width:30%; height:50px; margin:0px 0px 5px 5px;" onClick="outputCommand('{{remoteName}} {{command}}')" class="{% if repeaters[remoteName][command] %}command-repeater{% else %}command-link{% endif %} {% if simulators[remoteName][command] %}command-simulator{% else %}command-once{% endif %} btn btn-large btn-primary" {% if simulators[remoteName][command] %} href="/remotes/{{ remoteName }}/{{ command|url_encode }}/{{ codes[remoteName][command] }}" {% else %} href="/remotes/{{ remoteName }}/{{ command|url_encode }}" {% endif%}
>{{ labelForCommand(remoteName, command) }}</button>
          {% endfor %}
        </div>
      {% endfor %}
      </div>

	<div class="scheduledItems" id="scheduledItems">
		
		<p></p>
			
      </div>

    <div class="next"></div>
		<div style="word-wrap: break-word; background-color:white; width:100%;" id="statusText" width="auto"> Status on and ready...</div>
	<div class="next"></div>
	
</div>
    <script src="js/compiled/app.js" type="text/javascript" charset="utf-8"></script>
  </body>
</html>
