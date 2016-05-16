function absSqrt(n) {
  if (n < 0) {
    n = Math.abs(n);
    return -Math.sqrt(n);
  } else {
    return Math.sqrt(n);
  }
};

function radToAngles(player) {
  player.xa = Math.cos(player.a);
  player.ya = Math.sin(player.a);
}

function modulusAngle(player) {
  if (player.a > Math.PI) {
    player.a -= (Math.PI * 2);
  }
  if (player.a < -Math.PI) {
    player.a + (Math.PI * 2);
  }
}

function thrust(player) {
  player.xv += (player.xa * $thrust);
  player.yv += (player.ya * $thrust);
}

function fire(player) {
  if (($tick - player.cl) > $cooldown) {
    bullets.push({
      x:    player.x  + (players[i].xa * $radius),
      y:    player.y  + (players[i].ya * $radius),
      xv:   player.xv + (players[i].xa * $projectile),
      yv:   player.yv + (players[i].ya * $projectile),
      tick: tick,
    });
    player.cl = $tick;
  }
}

$text = true;
$pr   = window.devicePixelRatio;
$keys = {};
$tick = 0;

$real_width  = 1280;
$real_height = 720;
$fps    = 60;

$width  = $real_width  * $pr;
$height = $real_height * $pr;

$radius     = 10     * $pr;
$thrust     = 1      * $pr / $fps;
$projectile = 200    * $pr / $fps;
$gravity    = 0.01 * $pr / $fps;
$rotation   = 0.1         / $fps;
$cooldown   = 2           * $fps;
$lifespan   = 20          * $fps;

const $playerSource = [
  {
    c:  "RED",
    x:  $height / 4,
    y:  $height / 4,
    a:  0,
    lk: "a",
    rk: "s",
    tk: "d",
    fk: "f",
  },

  {
    c:  "CYAN",
    x:  $width  - ($height / 4),
    y:  $height - ($height / 4),
    a:  Math.PI,
    lk: "j",
    rk: "k",
    tk: "l",
    fk: ";",
  },
];

window.onkeydown = function (key) {
  $keys[key.key] = true;
};

window.onkeyup = function (key) {
  $keys[key.key] = false;
};

document.addEventListener("DOMContentLoaded", function(event) { 
  var canvas   = document.getElementById("game");
  const context  = canvas.getContext("2d");

  canvas.width  = $width;
  canvas.height = $height;
  canvas.style.width  = $real_width;
  canvas.style.height = $real_height;

  var bullets = [];
  var players = [];

  setInterval(function () {
    context.fillStyle = "black";
    context.fillRect(0, 0, $width, $height);
    context.fillStyle = "white";

    if ($keys["r"]) {
      $text = false;
      $tick = 0;
      players = []; 
      bullets = [];
      for (var i = 0; i < $playerSource.length; i++) {
        players[i] = {};
        players[i].c  = $playerSource[i].c;
        players[i].x  = $playerSource[i].x;
        players[i].y  = $playerSource[i].y;
        players[i].a  = $playerSource[i].a;
        players[i].rk = $playerSource[i].rk;
        players[i].lk = $playerSource[i].lk;
        players[i].tk = $playerSource[i].tk;
        players[i].fk = $playerSource[i].fk;
        players[i].xv = 0;
        players[i].yv = 0;
        players[i].s  = 0;
        players[i].cl = 0;
      }
    }

    for (var i = 0; i < players.length; i++) {
      if (players[i].x < 0 || players[i].x > $width || players[i].y < 0 || players[i].y > $height) {
        players.splice(i, 1);
        context.fillRect(0, 0, $width, $height);
      } else {
        radToAngles(players[i]);

        if ($keys[players[i].tk]) {
          thrust(players[i])
        }

        if ($keys[players[i].lk]) {
          players[i].s -= $rotation; 
        }

        if ($keys[players[i].rk]) {
          players[i].s += $rotation; 
        }

        if ($keys[players[i].fk]) {
          fire(players[i]);
        }

        players[i].x += players[i].xv;
        players[i].y += players[i].yv;
        players[i].a += players[i].s;
        modulusAngle(players[i]);
        
        context.strokeStyle = players[i].c;

        context.beginPath();
        context.lineTo(players[i].x, players[i].y);
        context.lineTo(players[i].x + (players[i].xa * ($radius * 2)), players[i].y + (players[i].ya * ($radius * 2)));

        context.stroke();

        context.beginPath();
        context.arc(players[i].x, players[i].y, $radius, 0, 2*Math.PI);
        context.stroke();

        for (var j = 0; j < players.length; j++) {
          if (j != i) {
            var xdelta = players[j].x - players[i].x;
            var ydelta = players[j].y - players[i].y;
            players[j].xv -= (absSqrt(xdelta) * $gravity);
            players[j].yv -= (absSqrt(ydelta) * $gravity);
          }
        };
      }
    }

    for (var i = 0; i < bullets.length; i++) {
      if (($tick - bullets[i].tick) > $lifespan) {
        bullets.splice(i, 1);
      } else {
        context.fillRect(bullets[i].x, bullets[i].y, 2, 2);
        bullets[i].x += bullets[i].xv;
        bullets[i].y += bullets[i].yv;

        for (var j = 0; j < players.length; j++) {
          var xdelta = bullets[i].x - players[j].x;
          var ydelta = bullets[i].y - players[j].y;
          var distance = Math.sqrt(Math.pow(xdelta, 2) + Math.pow(ydelta, 2));
          if (distance < $radius) {
            bullets.splice(i, 1);
            players.splice(j, 1);
            context.fillRect(0, 0, $width, $height);
          } else {
            bullets[i].xv -= (absSqrt(xdelta) * $gravity)
            bullets[i].yv -= (absSqrt(ydelta) * $gravity);
          }
        }
      }
    }

    context.strokeStyle = "white";

    if (players.length == 1) {
      context.font = (12 * $pr) + "px monospace";
      context.fontWeight = 200;
      context.fillText(players[0].c + " WINS (R FOR RESTART)", 100, 100);
    }

    if ($text) {
      context.font = (12 * $pr) + "px monospace";
      context.fontWeight = 200;
      context.fillText("IN A.D. 3349 ADVERSARY V N PROBE MEET IN DEEP SPACE AND MUST BATTLE FOR LIMITED COSMIC RESOURCE", 100, (100 * $pr));
      context.fillText("ONBOARD A I LIMITED TO ONE OPERATION PER FIFTY NINE HOUR - DAYS PASS IN SECONDS FOR HIM",         100, (125 * $pr));
      context.fillText("COERCE BALLISTIC WITHIN ENEMY EFFECT RADIUS BUT WATCH FOR GRAVITATION AND NOT TO EXIT ARENA",     100, (150 * $pr));
      context.fillText("A FOR RED OR J FOR BLUE ADD LEFT ROTATE",                  100, (225 * $pr));
      context.fillText("S FOR RED OR K FOR BLUE ADD RIGHT ROTATE",                 100, (250 * $pr));
      context.fillText("D FOR RED OR L FOR BLUE THRUST",                           100, (275 * $pr));
      context.fillText("F FOR RED OR ; FOR BLUE FIRE BALLISTIC",                   100, (300 * $pr));
      context.fillText("R FOR START GAME",                                         100, (325 * $pr));
    }

    $tick += 1;
  }, (1000 / $fps));
});
