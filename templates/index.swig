<!DOCTYPE HTML>
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Universal Remote</title>
    <link rel="stylesheet" href="css/bootstrap.css" />
    <link rel="stylesheet" href="css/flat-ui.css" />
    <link rel="stylesheet" href="css/compiled/app.css" />
  </head>
  <body ontouchstart="">
    <div id="container">
      <h1 id="titlebar">
        <a class="back hidden" href="#"><img src="/images/left-arrow.png" height="40" width="40" /></a>
        <span id="title" data-text="Universal Remote">Universal Remote</span>
      </h1>
      <ul class="remotes-nav">
      {% for remote in remotes %}
        {% set remoteName = loop.key %}
        <li><a class="btn btn-wide btn-large btn-info" href="#{{ remoteName }}">{{ remoteName }}</a></li>
      {% endfor %}
      </ul>

      <div class="prev"></div>

      <ul class="remotes">
      {% for remote in remotes %}
        {% set remoteName = loop.key %}
        <li class="remote" id="{{ remoteName }}">
          <ul class="commands">
          {% for command in remote %}
            {% set commandName = loop.key %}
             <li class="command">
               <button class="command-link btn btn-wide btn-large btn-primary" href="/remotes/{{ remoteName }}/{{ command|url_encode }}">{{ command }}</button>
             </li>
          {% endfor %}
          </ul>
        </li>
      {% endfor %}
      </ul>
    </div>

    <div class="next"></div>

    <script src="js/compiled/app.js" type="text/javascript" charset="utf-8"></script>
  </body>
</html>
