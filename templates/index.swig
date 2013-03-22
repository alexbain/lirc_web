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
  <body>
    <div id="container">
      <h1>Universal Remote</h1>
      <ul class="remotes-nav">
      {% for remote in remotes %}
        {% set remoteName = loop.key %}
        <li><a class="btn btn-wide btn-large btn-info" href="#{{ remoteName }}">{{ remoteName }}</a></li>
      {% endfor %}
      </ul>

      <ul class="remotes">
      {% for remote in remotes %}
        {% set remoteName = loop.key %}
        <li class="remote">
          <h2 id="{{ remoteName }}">{{ remoteName }} <a class="return-to-top" href="#"><img src="/images/up-arrow.png" height="40" width="40" /></a></h2>
          <ul class="commands">
          {% for command in remote %}
            {% set commandName = loop.key %}
             <li class="command">
               <button class="command-link btn btn-wide btn-large btn-primary" href="/remotes/{{ remoteName }}/{{ command }}">{{ command }}</button>
             </li>
          {% endfor %}
          </ul>
        </li>
      {% endfor %}
      </ul>
    </div>

    <script src="js/compiled/app.js" type="text/javascript" charset="utf-8"></script>
  </body>
</html>
