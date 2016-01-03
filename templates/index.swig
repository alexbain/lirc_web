<!DOCTYPE HTML>
<html>
  <head>
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
    {% include "./favicons.swig" %}
  </head>
  <body ontouchstart="">
    <div id="container">
      <h1 id="titlebar">
        <a class="back hidden"><img src="images/left-arrow.png" height="40" width="40" /></a>
        <span id="title" data-text="Universal Remote">Universal Remote</span>
      </h1>
      <ul class="remotes-nav">
      {% for remote in remotes %}
        {% set remoteName = loop.key %}
        <li><a class="btn btn-wide btn-large btn-info" href="#{{ remoteName }}">{{ labelForRemote(remoteName) }}</a></li>
      {% endfor %}
      </ul>

      <hr />

      <ul class="remotes-nav">
      {% for device in devices %}
        {% set deviceName = device.name %}
        <li><a class="btn btn-wide btn-large btn-info" href="#{{ deviceName|url_encode }}">{{ deviceName }}</a></li>
      {% endfor %}
      </ul>


      <hr />

      <ul class="macros-nav">
      {% for macro in macros %}
        {% set macroName = loop.key %}
        <li><button class="btn btn-wide btn-large btn-warning macro-link" href="/macros/{{ macroName|url_encode }}">{{ macroName }}</button></li>
      {% endfor %}
      </ul>


      <div class="prev"></div>

      <ul class="remotes">
      {% for remote in remotes %}
        {% set remoteName = loop.key %}
        <li class="remote" id="{{ remoteName }}">
          <ul class="commands">
          {% for command in remote %}
             <li class="command">
               <button class="command-link {% if repeaters[remoteName] && repeaters[remoteName][command] %}command-repeater{% else %}command-once{% endif %} btn btn-wide btn-large btn-primary" href="/remotes/{{ remoteName|url_encode }}/{{ command|url_encode }}">{{ labelForCommand(remoteName, command) }}</button>
             </li>
          {% endfor %}
          </ul>
        </li>
      {% endfor %}
      </ul>

      <hr />

      <ul class="remotes">
      {% for device in devices %}
        {% set deviceName = device.name %}
        <li class="remote" id="{{ deviceName|url_encode }}">
          <ul class="commands">
          {% for command in device.commands %}
            {% set commandName = loop.key %}
             <li class="command">
               <button class="command-link {% if repeaters[remoteName][command] %}command-repeater{% else %}command-once{% endif %} btn btn-wide btn-large btn-primary" href="/devices/{{ deviceName }}/{{ commandName|url_encode }}">{{ commandName }}</button>
             </li>
          {% endfor %}
          </ul>
        </li>
      {% endfor %}
      </ul>

    </div>

    <div class="next"></div>

    <footer>
	    <p><a href="/refresh">Refresh</a></p>
      <p><a href="http://opensourceuniversalremote.com/">Powered by Open Source Universal Remote</a></p>
      <p><a href="http://thenounproject.com/noun/remote-control/#icon-No10870">Remote Control</a> designed by <a href="http://thenounproject.com/esteves_emerick">Adriano Emerick</a> from The Noun Project</p>
    </footer>

    <script src="js/compiled/app.js" type="text/javascript" charset="utf-8"></script>
  </body>
</html>
