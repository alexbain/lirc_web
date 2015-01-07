<!DOCTYPE HTML>
<html>
  <head>
	<script type="text/javascript">

		window.onload = function() {
 			 window.onscroll();
		};

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

	<hr />

	<div class="remotes-nav">
      {% for remote in remotes %}
        {% set remoteName = loop.key %}
        <a style="width:33%; height:25px; margin:0px 0px 5px 5px;" class="btn btn-large btn-info" href="#{{ remoteName }}">{{ labelForRemote(remoteName) }}</a>
      {% endfor %}
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


    

    <div class="next"></div>
		<div style="word-wrap: break-word; background-color:white; width:100%;" id="statusText" width="auto"> Status on and ready...</div>
	<div class="next"></div>
</div>
    <script src="js/compiled/app.js" type="text/javascript" charset="utf-8"></script>
  </body>
</html>
