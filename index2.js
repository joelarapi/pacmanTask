document.addEventListener('DOMContentLoaded', function() {
  const playButton = document.getElementById('playButton');
  const audio = new Audio('path/to/pacman-sound.mp3'); // Path to your sound file

  // Function to handle the game start
  function startGame() {
    window.location.href = 'game.html'; // Redirects to game.html
  }

  if (playButton) {
    playButton.addEventListener('click', function() {
      // Play the audio and wait for it to finish before starting the game
      audio.play();

      // Use the `ended` event to start the game when the audio finishes
      audio.addEventListener('ended', startGame);
    });
  }
});

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d"); // we are using c for context , it is the same thing

const scoreEl = document.querySelector("#scoreEl");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Boundary {
  static width = 40; //i deklarojme static values qe mos te kemi nevoje ti rishkruajme kur duam te krijojme
  static height = 40; //boundaries te rinj

  constructor({ position, image }) {
    this.position = position;
    this.width = 40;
    this.height = 40;
    this.image = image;
  }
  draw() {
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}

class Pacman {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.radians = .75;
    this.openRate = 0.12;
    this.rotation = 0;
  }
  draw() {
    c.save();
    c.translate(this.position.x, this.position.y);
    c.rotate(this.rotation);
    c.translate(-this.position.x, -this.position.y);
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians);
    c.lineTo(this.position.x, this.position.y);
    c.fillStyle = "yellow";
    c.fill();
    c.closePath();
    c.restore();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.radians < 0 || this.radians > .75) this.openRate = -this.openRate;

    this.radians += this.openRate;
  }
}

class Ghost {
  static speed = 2;
  constructor({ position, velocity, color = "red" }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.color = color;
    this.prevCollisions = [];
    this.speed = 1.5;
    this.scared = false;
  }
  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.scared ? 'blue' : this.color;
    c.fill();
    c.closePath();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Pellet {
  constructor({ position }) {
    this.position = position;
    this.radius = 3;
  }
  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "white";
    c.fill();
    c.closePath();
  }
}

class PowerUp {
  constructor({ position }) {
    this.position = position;
    this.radius = 8;
  }
  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "white";
    c.fill();
    c.closePath();
  }
}

const pellets = [];
const boundaries = [];
const powerUps = [];

const ghosts = [
  new Ghost({
    position: {
      x: Boundary.width * 9 + Boundary.width / 2,
      y: Boundary.height + Boundary.height / 2,
    },
    velocity: {
      x: Ghost.speed,
      y: 0,
    },
  }),
  new Ghost({
    position: {
      x: Boundary.width * 11 + Boundary.width / 2,
      y: Boundary.height * 3 + Boundary.height / 2,
    },
    velocity: {
      x: Ghost.speed,
      y: 0,
    },
    color: 'pink'
  }),
  new Ghost({
    position: {
      x: Boundary.width * 9 + Boundary.width / 2,
      y: Boundary.height * 5 + Boundary.height / 2,
    },
    velocity: {
      x: Ghost.speed,
      y: 0,
    },
    color: 'cyan'
  }),
  new Ghost({
    position: {
      x: Boundary.width * 7 + Boundary.width / 2,
      y: Boundary.height * 9 + Boundary.height / 2,
    },
    velocity: {
      x: Ghost.speed,
      y: 0,
    },
    color: 'orange'
  }),
];

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

let score = 0; //game score

const map = [
  ["1", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-","-", "-", "-", "-", "-", "2"],
  ["|", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".",".", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "7", "]", ".", "1", "-", "2", ".", "^", ".", "b", ".", "1", "-", "]", ".", "1", "-", "2", ".", "1","-", "]", ".", "^", ".", "|"],
  ["|", ".", ".", ".", ".", "|", ".", ".", "|", "b", "|", ".", "|", ".", ".", ".", "|", "p", ".", ".", "|", "b", "|", ".", "|","p", ".", ".", "|", ".", "|"],
  ["|", ".", "[", "]", ".", "|", ".", ".", "|", ".", "|", ".", "|", ".", "b", ".", "|", "-", "]", ".", "|", "", "|", ".", "4","-", "2", ".",  "_", ".", "|"],
  ["|", ".", ".", ".", ".", "|", ".", ".", "|", "p", "|", ".", "|", ".", ".", ".", "|", ".", ".", ".", "|", ".", "|", ".", ".",".", "|", ".", ".", ".", "|"],
  ["|", ".", "b", ".", ".", "_", ".", ".","_", ".", "_", ".", "4", "-", "]", ".", "4", "-", "]", ".", "_", ".", "_", ".", "[","-", "3", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".",".", ".", ".", ".", ".", "|"],
  ["|", ".", "[", "]", ".", "^", ".", "[", "]", ".", "b", ".", "^", ".", "b", ".", "[", "-", "-", "]", ".", "[", "-", "2", ".","[", "-", "-", "]", ".", "|"],
  ["|", ".", ".", ".", ".", "|", ".", ".", ".", ".", ".", ".", "|", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "|", ".",".", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "5", "]", ".", "b", ".", "b", ".", "_", ".", "b", ".", "[", "-", "-", "]", ".", "[", "-", "3", ".","b", ".", "[", "]", ".", "|"],
  ["|", "p", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "p", ".", ".", ".", ".", ".", ".", ".", ".", ".",".", ".", ".", ".", ".", "|"],
  ["4", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-","3"],

];
function createImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case "-":
        boundaries.push(
          new Boundary({
            position: { x: Boundary.width * j, y: Boundary.height * i },
            image: createImage("./img/pipeHorizontal.png"),
          })
        );
        break;
      case "|":
        boundaries.push(
          new Boundary({
            position: { x: Boundary.width * j, y: Boundary.height * i },
            image: createImage("./img/pipeVertical.png"),
          })
        );
        break;
      case "1":
        pellets.push(
          new Pellet({
            position: { x: Boundary.width * j + Boundary.width / 2, y: Boundary.height * i + Boundary.height / 2 },
          })
        );
        break;
      case "b":
        powerUps.push(
          new PowerUp({
            position: { x: Boundary.width * j + Boundary.width / 2, y: Boundary.height * i + Boundary.height / 2 },
          })
        );
        break;
      case "p":
        pellets.push(
          new Pellet({
            position: { x: Boundary.width * j + Boundary.width / 2, y: Boundary.height * i + Boundary.height / 2 },
          })
        );
        break;
    }
  });
});

const pacman = new Pacman({
  position: { x: Boundary.width + Boundary.width / 2, y: Boundary.height + Boundary.height / 2 },
  velocity: { x: 0, y: 0 },
});

function animate() {
  c.clearRect(0, 0, canvas.width, canvas.height);
  pacman.update();

  boundaries.forEach((boundary) => {
    boundary.draw();
  });

  pellets.forEach((pellet) => {
    pellet.draw();
  });

  powerUps.forEach((powerUp) => {
    powerUp.draw();
  });

  ghosts.forEach((ghost) => {
    ghost.update();
  });

  requestAnimationFrame(animate);
}

animate();

function movePacman() {
  if (keys.w.pressed) pacman.velocity.y = -5;
  else if (keys.s.pressed) pacman.velocity.y = 5;
  else pacman.velocity.y = 0;

  if (keys.a.pressed) pacman.velocity.x = -5;
  else if (keys.d.pressed) pacman.velocity.x = 5;
  else pacman.velocity.x = 0;
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
      keys.w.pressed = true;
      break;
    case "a":
      keys.a.pressed = true;
      break;
    case "s":
      keys.s.pressed = true;
      break;
    case "d":
      keys.d.pressed = true;
      break;
  }
});

document.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
  }
});
