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
    // // iam drawing my map with this function
    // c.fillStyle = "blue"; // setting the color of the boundaries
    // c.fillRect(this.position.x, this.position.y, this.width, this.height); // creating the dimensions of the boundaries
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}

class Pacman {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
  }
  //krijimi i pacmanit , pozicioni dhe dimensionet e tij
  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "yellow";
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Ghost {
  constructor({ position, velocity, color = "red" }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.color = color;
    this.prevCollisions = [] //shtojme per te ruajtur collisions ne menyre qe te dallojme kur ghost leviz dhe i hapet nje rruge 
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

//krijimi i pellets , poozicion dhe dimensione , pa velocity sps pellets jane statike
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

const pellets = [];
const boundaries = [];
const ghosts = [
  new Ghost({
    position: {
      x: Boundary.width * 6 + Boundary.width / 2,
      y: Boundary.height + Boundary.height / 2,
    },
    velocity: {
      x: 5,
      y: 0,
    },
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

// Game Map
const map = [
  ["1", "-", "-", "-", "-", "-", "-", "-", "-", "-", "2"],
  ["|", ".", ".", ".", ".", ".", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "7", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", "_", ".", ".", ".", ".", "|"],
  ["|", ".", "[", "]", ".", ".", ".", "[", "]", ".", "|"],
  ["|", ".", ".", ".", ".", "^", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "+", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", "_", ".", ".", ".", ".", "|"],
  ["|", ".", "[", "]", ".", ".", ".", "[", "]", ".", "|"],
  ["|", ".", ".", ".", ".", "^", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "5", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", ".", ".", ".", ".", ".", "|"],
  ["4", "-", "-", "-", "-", "-", "-", "-", "-", "-", "3"],
];

//replacing boundaries with images
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
        boundaries.push(
          new Boundary({
            position: { x: Boundary.width * j, y: Boundary.height * i },
            image: createImage("./img/pipeCorner1.png"),
          })
        );

        break;
      case "2":
        boundaries.push(
          new Boundary({
            position: { x: Boundary.width * j, y: Boundary.height * i },
            image: createImage("./img/pipeCorner2.png"),
          })
        );

        break;
      case "3":
        boundaries.push(
          new Boundary({
            position: { x: Boundary.width * j, y: Boundary.height * i },
            image: createImage("./img/pipeCorner3.png"),
          })
        );
        break;
      case "4":
        boundaries.push(
          new Boundary({
            position: { x: Boundary.width * j, y: Boundary.height * i },
            image: createImage("./img/pipeCorner4.png"),
          })
        );
        break;
      case "b":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/block.png"),
          })
        );
        break;
      case "[":
        boundaries.push(
          new Boundary({
            position: { x: Boundary.width * j, y: Boundary.height * i },
            image: createImage("./img/capLeft.png"),
          })
        );
        break;
      case "]":
        boundaries.push(
          new Boundary({
            position: { x: Boundary.width * j, y: Boundary.height * i },
            image: createImage("./img/capRight.png"),
          })
        );
        break;
      case "_":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/capBottom.png"),
          })
        );
        break;
      case "^":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/capTop.png"),
          })
        );
        break;
      case "+":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/pipeCross.png"),
          })
        );
        break;
      case "~":
        boundaries.push(
          new Boundary({
            position: { x: Boundary.width * j, y: Boundary.height * i },
            image: createImage("./img/capBottom.png"),
          })
        );
        break;
      case "5":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            color: "blue",
            image: createImage("./img/pipeConnectorTop.png"),
          })
        );
        break;
      case "6":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            color: "blue",
            image: createImage("./img/pipeConnectorRight.png"),
          })
        );
        break;
      case "7":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            color: "blue",
            image: createImage("./img/pipeConnectorBottom.png"),
          })
        );
        break;
      case "8":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/pipeConnectorLeft.png"),
          })
        );
        break;
      case ".":
        pellets.push(
          new Pellet({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2,
            },
          })
        );
        break;
    }
  });
});

const pacman = new Pacman({
  position: {
    x: Boundary.width + Boundary.width / 2, //pjesetojme width dhe height me 2 qe ti pozicionojme pellets ne qender
    y: Boundary.height + Boundary.height / 2,
  },
  velocity: {
    x: 0,
    y: 0,
  },
});

function circleCollidesWithRectangle({ circle, rectangle }) {
  return (
    //circle = pacman , rectangle = boundary
    //velocity i pacman , na krijon mundesine qe te ndalojme perpara se te perplasemi me boundary, pa qene nevoja ta bejme 0
    //position.x/y na jep qendren e pacmanit , pacman.radius na jep anen, majtas/djathtas , larte/poshte
    //if statement per pjesen e siperme te pacmanit , nese eshte <= se pjesa e poshtme e boundary
    circle.position.y - circle.radius + circle.velocity.y <=
      rectangle.position.y + rectangle.height &&
    // condition per pjesen e djathte te circleit kur has pjesen e majte te rectangle
    circle.position.x + circle.radius + circle.velocity.x >=
      rectangle.position.x &&
    // condition per pjesen e poshtme te circleit kur has pjesen e siperme te rectangle
    circle.position.y + circle.radius + circle.velocity.y >=
      rectangle.position.y &&
    // condition per pjesen e majte  te circleit kur has pjesen e djathte te rectangle
    circle.position.x - circle.radius + circle.velocity.x <=
      rectangle.position.x + rectangle.width
  );
}

let lastKey = ""; // deklarojme variablen qe do perdorim brenda if-statement per key pressing

//krijimi i animation , pastrimi i trail-line qe krijon nga mbrapa ne levizje

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);

  //condition lastKey , qe do te na duhet per te perdorur me shume se nje key njekohesisht
  //sepse if statement i pare merr perparesi , dhe nuk lejon over-writing nga keys te tjere
  if (keys.w.pressed && lastKey === "w") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]; // bejme set boundaries si index ne menyre qe te bejme nje loop te tyre
      if (
        circleCollidesWithRectangle({
          // perdorim spread operator per te marre te dhenat e pacman , dhe te modifikojme vetem velocity kur perplasemi me nje boundary
          circle: {
            ...pacman,
            velocity: {
              x: 0,
              y: -5,
            },
          },
          rectangle: boundary, //perdorim variablen e deklaruar me siper per te iteruar ato
        })
      ) {
        pacman.velocity.y = 0;
        break; // bejme break nqs jemi gati per te hasur nje boundary dhe bejme set velocity 0
      } else {
        pacman.velocity.y = -5;
      }
    }
  } else if (keys.a.pressed && lastKey === "a") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          circle: {
            ...pacman,
            velocity: {
              x: -5,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        pacman.velocity.x = 0;
        break;
      } else {
        pacman.velocity.x = -5;
      }
    }
  } else if (keys.s.pressed && lastKey === "s") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          circle: {
            ...pacman,
            velocity: {
              x: 0,
              y: 5,
            },
          },
          rectangle: boundary,
        })
      ) {
        pacman.velocity.y = 0;
        break;
      } else {
        pacman.velocity.y = 5;
      }
    }
  } else if (keys.d.pressed && lastKey === "d") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          circle: {
            ...pacman,
            velocity: {
              x: 5,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        pacman.velocity.x = 0;
        break;
      } else {
        pacman.velocity.x = 5;
      }
    }
  }

  //pellet touching
  for (let i = pellets.length - 1; 0 < i; i--) {
    const pellet = pellets[i];
    pellet.draw();

    if (
      Math.hypot(
        pellet.position.x - pacman.position.x,
        pellet.position.y - pacman.position.y
      ) <
      pellet.radius + pacman.radius
    ) {
      score += 10;
      pellets.splice(i, 1);
      scoreEl.innerHTML = score;
    }
  }

  boundaries.forEach((boundary) => {
    boundary.draw();

    if (
      circleCollidesWithRectangle({
        circle: pacman,
        rectangle: boundary,
      })
    ) {
      console.log("we are colliding ");
      pacman.velocity.x = 0;
      pacman.velocity.y = 0;
      // pacman.velocity.x = 0
      // pacman.velocity.y = 0 // default value per velocity =0 ne menyre qe kur te mos e kemi shtypur butonin te mos levizim
    }
  });

  pacman.update();

  ghosts.forEach((ghost) => {
    ghost.update();

    //collision detecion code for our ghosts
    const collisions = [];

    boundaries.forEach((boundary) => {
      if (
        !collisions.includes('right') &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: 5,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {   
        collisions.push("right");
      }

      if (
        !collisions.includes('left') &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: -5,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("left");
      }

      if (
        !collisions.includes('up') &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: 0,
              y: -5,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("up");
      }

      if (
        !collisions.includes('down') &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: 0,
              y: 5,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("down");
      }
    });
    if(collisions.length > ghost.prevCollisions.length)
    ghost.prevCollisions = collisions

    if(collisions !== ghost.prevCollisions){
      
    }
  });
}

animate();

// krijimi i levizjeve te pacman me ane te user input kur klikojme nje key
addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      break;
    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      break;
    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      break;
    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      break;
  }
  console.log(keys.d.pressed);
  console.log(keys.s.pressed);
});

//ndalimi i levizjes kur nuk jemi duke e klikuar perseri
addEventListener("keyup", ({ key }) => {
  switch (key) {
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
  console.log(keys.d.pressed);
  console.log(keys.s.pressed);
});
