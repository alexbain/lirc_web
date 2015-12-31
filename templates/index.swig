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
    <link rel="stylesheet" href="css/pushy.css" />
  </head>
  <body ontouchstart="">
  <!-- Pushy Menu -->
  <nav class="pushy pushy-left">
      <ul>
        <a class="" href="/">Home</a>
      </ul>
      <ul class="macros-navmenu">
          {% for macro in macros %}
            {% set area = loop.key %}
            <a class="" href="#{{ area }}">{{ area }}</a>
          {% endfor %}
      </ul>
      <br>
      <br>
      <ul class="remotes-navmenu">
          {% for remote in remotes %}
            {% set remoteName = loop.key %}
            <a class="" href="#{{ remoteName }}">{{ labelForRemote(remoteName) }}</a>
          {% endfor %}
      </ul>
  </nav>

  <!-- Site Overlay -->
  <div class="site-overlay"></div>
  <!-- Your Content -->
    <div id="container">
        <!-- Menu Button -->
    </div>
    <div id="container">
        <h2 id="menubar">
            <div class="menu-btn">&#9776;</div>
        </h2>
        <h1 id="titlebar">
            <a class="back hidden"><img src="/images/left-arrow.png" height="40" width="40" /></a>
            <span id="title" data-text="Universal Remote">Universal Remote</span>
        </h1>


    {% for macro in macros %}
        {% set area = loop.key %}
            <ul class="macros-nav">
                <h3>{{area}}</h3>
                   {% for aMacroCommand in macro %}
                       {% set macroName = loop.key %}
                           <li><button class="btn btn-wide btn-large btn-warning macro-link" href="/macros/{{area}}/{{ macroName }}">{{ macroName }}</button></li>
                {% endfor %}
            </ul>
    {% endfor %}

      <hr />

      <div class="prev"></div>

    <ul class="macros">
        {% for macro in macros %}
            {% set area = loop.key %}
                <li class="macro" id="{{ area }}">
                <ul class="macrocommands">
                    {% for command in macro %}
                        {% set macroName = loop.key %}
                        <li><button class="btn btn-wide btn-large btn-warning macro-link" href="/macros/{{area}}/{{ macroName }}">{{ macroName }}</button></li>

                    {% endfor %}
                </li>
                </ul>
        {% endfor %}
    </ul>

    <ul class="remotes">
        {% for remote in remotes %}
            {% set remoteName = loop.key %}
                <li class="remote" id="{{ remoteName }}">
                <ul class="commands">
                    {% for command in remote %}
                        <li class="command">
                        <button class="command-link {% if repeaters[remoteName][command] %}command-repeater{% else %}command-once{% endif %} btn btn-wide btn-large btn-primary" href="/remotes/{{ remoteName }}/{{ command|url_encode }}">{{ labelForCommand(remoteName, command) }}</button>
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
    </footer>

    <script src="js/compiled/app.js" type="text/javascript" charset="utf-8"></script>
    <script src="js/vendor/pushy.js" type="text/javascript" charset="utf-8"></script>
  </body>
</html>
