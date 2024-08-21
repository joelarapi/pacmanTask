const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d"); // we are using c for context , it is the same thing
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Boundary {
  static width = 40; //i deklarojme static values qe mos te kemi nevoje ti rishkruajme kur duam te krijojme
  static height = 40; //boundaries te rinj

  constructor({ position }) {
    this.position = position;
    this.width = 40;
    this.height = 40;
  }
  draw() {
    // iam drawing my map with this function
    c.fillStyle = "blue"; // setting the color of the boundaries
    c.fillRect(this.position.x, this.position.y, this.width, this.height); // creating the dimensions of the boundaries
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

const boundaries = [];

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

// Game Map
const map = [
  ["-", "-", "-", "-", "-", "-", "-"],
  ["-", " ", " ", " ", " ", " ", "-"],
  ["-", " ", "-", " ", "-", " ", "-"],
  ["-", " ", " ", " ", " ", " ", "-"],
  ["-", "-", "-", "-", "-", "-", "-"],
];

let lastKey  = "" // deklarojme variablen qe do perdorim brenda if-statement per key pressing 

map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case "-":
        boundaries.push(
          new Boundary({
            position: { x: Boundary.width * j, y: Boundary.height * i },
          })
        );
        // aksesojme boundary static values
        break;
    }
  });
});

const pacman = new Pacman({
  position: {
    x: Boundary.width + Boundary.width / 2,
    y: Boundary.height + Boundary.height / 2,
  },
  velocity: {
    x: 0,
    y: 0,
  },
});

//krijimi i animation , pastrimi i trail-line qe krijon nga mbrapa ne levizje

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);


  if(keys.w.pressed && lastKey === 'w'){ 
    //shtojme condition lastKey , qe do te na duhet per te perdorur me shume se nje key njekohesisht 
    //sepse if statement i pare merr perparesi , dhe nuk lejon over-writing nga keys te tjere 
    pacman.velocity.y = -5;
  }else if (keys.a.pressed && lastKey === 'a'){
    pacman.velocity.x = -5
  }else if (keys.s.pressed && lastKey === 's'){
    pacman.velocity.y = 5
  }else if (keys.d.pressed && lastKey === 'd'){
    pacman.velocity.x = 5
  }
}

  boundaries.forEach((boundary) => {
    boundary.draw();

    //velocity i pacman , na krijon mundesine qe te ndalojme perpara se te perplasemi me boundary, pa qene nevoja ta bejme 0
    //position.x/y na jep qendren e pacmanit , pacman.radius na jep anen, majtas/djathtas , larte/poshte
    //if statement per pjesen e siperme te pacmanit , nese eshte <= se pjesa e poshtme e boundary 
    if(pacman.position.y  - pacman.radius + pacman.velocity.y  <= boundary.position.y + boundary.height 
    // condition per pjesen e djathte te pacmanit kur has pjesen e majte te boundary
      && pacman.position.x + pacman.radius + pacman.velocity.x >= boundary.position.x 
      // condition per pjesen e poshtme te pacmanit kur has pjesen e siperme te boundary
      && pacman.position.y + pacman.radius + pacman.velocity.y >=  boundary.position.y
      // condition per pjesen e majte  te pacmanit kur has pjesen e djathte te boundary
      && pacman.position.x - pacman.radius  + pacman.velocity.x <= boundary.position.x + boundary.width
    ){
      console.log('we are colliding ')
      pacman.velocity.x = 0 
      pacman.velocity.y = 0 
    }
  });

  pacman.update();
  // pacman.velocity.x = 0 
  // pacman.velocity.y = 0 // default value per velocity =0 ne menyre qe kur te mos e kemi shtypur butonin te mos levizim 
  


animate();

// krijimi i levizjeve te pacman me ane te user input kur klikojme nje key 
addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "w":
      keys.w.pressed = true;
      lastKey = "w"
      break;
    case "a":
      keys.a.pressed = true;
      lastKey = "a"
      break;
    case "s":
      keys.s.pressed = true;
      lastKey = "s"
      break;
    case "d":
      keys.d.pressed = true;
      lastKey = "d"
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
