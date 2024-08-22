document.addEventListener('DOMContentLoaded', function() {
  const playButton = document.getElementById('playButton');
  
  if (playButton) {
      playButton.addEventListener('click', function() {
          window.location.href = 'game.html'; // Redirects to game.html
      });
  }
});


const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d"); // we are using c for context , it is the same thing
const pacmanSound = document.getElementById("pacmanSoundtrack");
const scoreEl = document.querySelector("#scoreEl");

let startTime = null;
const delayDuration = 4000;
let isDelayOver = false;

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
     // jam duke vizatuar mapin me kte funksion
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
    this.radians = .75
    this.openRate = 0.12
    this.rotation =0
  }
  //krijimi i pacmanit , pozicioni dhe dimensionet e tij
  draw() {
    c.save()
    c.translate(this.position.x , this.position.y)
    c.rotate(this.rotation)
    c.translate(-this.position.x , -this.position.y)
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians);
    c.lineTo(this.position.x, this.position.y)
    c.fillStyle = "yellow";
    c.fill();
    c.closePath();
    c.restore()
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.radians < 0 || this.radians > .75 )this.openRate = -this.openRate

    this.radians += this.openRate
  }
}

class Ghost {
  static speed = 2 //bejme set nje default ghost speed , ne menyre qe mos te kemi nevoje ta vendosim ne menyre manuale me vone 
  constructor({ position, velocity, color = "red" }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.color = color;
    this.prevCollisions = [] //shtojme per te ruajtur collisions ne menyre qe te dallojme kur ghost leviz dhe i hapet nje rruge 
    this.speed = 1.5
    this.scared = false 
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

//krijimi i arrays ku do ruhen pellets/ghosts/boundaries/powerUps
const pellets = [];
const boundaries = [];
const powerUps = []

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
      y: Boundary.height * 3  + Boundary.height / 2,
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
      y: Boundary.height * 5+ Boundary.height / 2,
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
      y: Boundary.height* 9 + Boundary.height / 2,
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

// Game Map
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
        case "p":
          powerUps.push(
            new PowerUp({
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
  const padding = Boundary.width / 2 - circle.radius - 1.5  
  return (
    //circle = pacman , rectangle = boundary
    //velocity i pacman , na krijon mundesine qe te ndalojme perpara se te perplasemi me boundary, pa qene nevoja ta bejme 0
    //position.x/y na jep qendren e pacmanit , pacman.radius na jep anen, majtas/djathtas , larte/poshte
    //if statement per pjesen e siperme te pacmanit , nese eshte <= se pjesa e poshtme e boundary
    circle.position.y - circle.radius + circle.velocity.y <=
      rectangle.position.y + rectangle.height + padding &&
    // condition per pjesen e djathte te circleit kur has pjesen e majte te rectangle
    circle.position.x + circle.radius + circle.velocity.x >=
      rectangle.position.x  - padding&&
    // condition per pjesen e poshtme te circleit kur has pjesen e siperme te rectangle
    circle.position.y + circle.radius + circle.velocity.y >=
      rectangle.position.y  - padding &&
    // condition per pjesen e majte  te circleit kur has pjesen e djathte te rectangle
    circle.position.x - circle.radius + circle.velocity.x <=
      rectangle.position.x + rectangle.width + padding
  );
}

let lastKey = ""; // deklarojme variablen qe do perdorim brenda if-statement per key pressing


let animationId //krijojme kte animation id , te cilin e marrim me poshte , me ane te requestAnimationFrame , 
                // do e perdorim per te dalluar kur ka nje collision mes pacmanit dhe ghost 

//krijimi i animation , pastrimi i trail-line qe krijon nga mbrapa ne levizje

function animate() {
  animationId = requestAnimationFrame(animate);
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

  //detect collisions between ghosts and player 
  for (let i = ghosts.length - 1; 0 <= i; i--) {
    const ghost = ghosts[i]
      //ghost touches player 
      if (
        Math.hypot(
          ghost.position.x - pacman.position.x,
          ghost.position.y - pacman.position.y
        ) <
        ghost.radius + pacman.radius
      ){

        if(ghost.scared ){
          ghosts.splice(i, 1)
        }else {
          cancelAnimationFrame(animationId)
          console.log('you lose ')
        }

      }
  }


  //win condition goes here 
  if(pellets.length === 0){
     console.log('you win')
     cancelAnimationFrame(animationId)
  }


  //powerUps go 
  for (let i = powerUps.length - 1; 0 <= i; i--) {
    const powerUp  = powerUps[i]
    powerUp.draw()

    //pacman collides me powerup 
    if (
      Math.hypot(
        powerUp.position.x - pacman.position.x,
        powerUp.position.y - pacman.position.y
      ) <
      powerUp.radius + pacman.radius
    ){
      powerUps.splice(i, 1);

      //make ghosts scared 
      ghosts.forEach(ghost => {
        ghost.scared = true 
        setTimeout(()=> {
          ghost.scared = false 
        }, 4000)
      })
    }
  }

  //pellet touching
  for (let i = pellets.length - 1; 0 <= i; i--) {
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
    let newVelocity = { x: ghost.velocity.x, y: ghost.velocity.y };
  
    // Check for collisions in each direction
    const collisions = [];
  
    boundaries.forEach((boundary) => {
      ['right', 'left', 'up', 'down'].forEach((direction) => {
        if (!collisions.includes(direction)) {
          const velocityCheck = {
            right: { x: ghost.speed, y: 0 },
            left: { x: -ghost.speed, y: 0 },
            up: { x: 0, y: -ghost.speed },
            down: { x: 0, y: ghost.speed }
          }[direction];
  
          if (circleCollidesWithRectangle({
            circle: {
              ...ghost,
              velocity: velocityCheck
            },
            rectangle: boundary
          })) {
            collisions.push(direction);
          }
        }
      });
    });
  
    // If current direction is blocked, choose a new direction
    if (
      (ghost.velocity.x > 0 && collisions.includes('right')) ||
      (ghost.velocity.x < 0 && collisions.includes('left')) ||
      (ghost.velocity.y < 0 && collisions.includes('up')) ||
      (ghost.velocity.y > 0 && collisions.includes('down'))
    ) {
      const availableDirections = ['right', 'left', 'up', 'down'].filter(dir => !collisions.includes(dir));
      if (availableDirections.length > 0) {
        const newDirection = availableDirections[Math.floor(Math.random() * availableDirections.length)];
        newVelocity = {
          right: { x: ghost.speed, y: 0 },
          left: { x: -ghost.speed, y: 0 },
          up: { x: 0, y: -ghost.speed },
          down: { x: 0, y: ghost.speed }
        }[newDirection];
      } else {
 
        newVelocity = { x: 0, y: 0 };
      }
    }
  
    // Update ghost velocity and position
    ghost.velocity = newVelocity;
    ghost.position.x += ghost.velocity.x;
    ghost.position.y += ghost.velocity.y;
  
    ghost.update();
  });





  
  if(pacman.velocity.x  > 0 )pacman.rotation = 0 
  else if(pacman.velocity.x  < 0 )pacman.rotation = Math.PI 
  else if(pacman.velocity.y  > 0 )pacman.rotation = Math.PI /2 
  else if(pacman.velocity.y  < 0 )pacman.rotation = Math.PI * 1.5 


}
//this is the end of animate 
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
