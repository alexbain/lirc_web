<!DOCTYPE HTML>
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <title>WiFi LIRC Remote</title>
    <link rel="stylesheet" href="css/compiled/app.css" />
  </head>
  <body>
    <div id="container">
      <h1>WiFi LIRC Remote</h1>

      <ul class="remotes">
      {% for remote in remotes %}
        {% set remoteName = loop.key %}
        <li class="remote">
          <h2>{{ remoteName }}</h2>
          <ul class="commands">
          {% for command in remote %}
            {% set commandName = loop.key %}
             <li class="command">
               <a class="command-link" href="/remotes/{{ remoteName }}/{{ command }}">{{ command }}</a>
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
