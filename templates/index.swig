<!DOCTYPE HTML>
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <title>WiFi Remote</title>
    <link rel="stylesheet" href="css/compiled/app.css" />
  </head>
  <body>
    <div id="container">
      <h1>WiFi Remote</h1>

      <ul class="remotes">
      {% for remote in remotes %}
        <li class="remote">
          <h2>{{ loop.key }}</h2>
          <ul class="commands">
          {% for command in remote %}
             <li class="command">
               <a class="command-link" href="/remotes/{{ remote }}/{{ command }}">{{ command }}</a>
             </li>
          {% endfor %}
          </ul>
        </li>
      {% endfor %}
      </ul>
    </div>
    <script src="js/vendor/zepto.min.js" type="text/javascript" charset="utf-8"></script>
  </body>
</html>
