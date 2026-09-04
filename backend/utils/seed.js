const bcrypt = require("bcryptjs");
const { writeDB } = require("./db");

function seed() {
  const adminPasswordHash = bcrypt.hashSync("admin123", 10);
  const userPasswordHash = bcrypt.hashSync("user123", 10);

  const data = {
    users: [
      {
        id: 1,
        username: "admin",
        email: "admin@pichi-gamez.com",
        password: adminPasswordHash,
        role: "admin",
        provider: "local",
      },
      {
        id: 2,
        username: "user",
        email: "user@pichi-gamez.com",
        password: userPasswordHash,
        role: "user",
        provider: "local",
      },
    ],
    games: [
      // ===== JUEGOS =====
      {
        id: 1,
        categoria: "juego",
        titulo: "Bloodborne",
        consola: "PS4",
        genero: "Acción/Soulslike",
        precio: 29.99,
        stock: 12,
        portada: "/img/Bloodborne.jpg",
        resenas: [],
      },
      {
        id: 2,
        categoria: "juego",
        titulo: "Days Gone",
        consola: "PS4",
        genero: "Acción/Supervivencia",
        precio: 24.99,
        stock: 8,
        portada: "/img/DaysGone.jpg",
        resenas: [],
      },
      {
        id: 3,
        categoria: "juego",
        titulo: "God Of War",
        consola: "PS4",
        genero: "Acción/Aventura",
        precio: 9.99,
        stock: 20,
        portada: "/img/godofwar.png",
        resenas: [],
      },
      {
        id: 4,
        categoria: "juego",
        titulo: "Spiderman",
        consola: "PS4",
        genero: "Acción/Mundo Abierto",
        precio: 14.99,
        stock: 15,
        portada: "/img/Spiderman.jpg",
        resenas: [],
      },
      // ===== CONSOLAS =====
      {
        id: 5,
        categoria: "consola",
        titulo: "PlayStation 5",
        consola: "PS5",
        genero: "Edición Estándar, 825GB",
        precio: 499.99,
        stock: 6,
        portada: "/img/consolas.png",
        resenas: [],
      },
      {
        id: 6,
        categoria: "consola",
        titulo: "Xbox Series X",
        consola: "Xbox",
        genero: "1TB, 4K",
        precio: 479.99,
        stock: 5,
        portada: "/img/consola-generica.svg",
        resenas: [],
      },
      {
        id: 7,
        categoria: "consola",
        titulo: "Nintendo Switch OLED",
        consola: "Nintendo",
        genero: "Modelo OLED, 64GB",
        precio: 349.99,
        stock: 9,
        portada: "/img/consola-generica.svg",
        resenas: [],
      },
      // ===== JOYSTICKS / ACCESORIOS =====
      {
        id: 8,
        categoria: "joystick",
        titulo: "DualSense Wireless Controller",
        consola: "PS5",
        genero: "Inalámbrico",
        precio: 69.99,
        stock: 25,
        portada: "/img/joystick-generico.svg",
        resenas: [],
      },
      {
        id: 9,
        categoria: "joystick",
        titulo: "Xbox Wireless Controller",
        consola: "Xbox",
        genero: "Inalámbrico",
        precio: 59.99,
        stock: 20,
        portada: "/img/joystick-generico.svg",
        resenas: [],
      },
      {
        id: 10,
        categoria: "joystick",
        titulo: "Pro Controller",
        consola: "Nintendo",
        genero: "Inalámbrico",
        precio: 64.99,
        stock: 14,
        portada: "/img/joystick-generico.svg",
        resenas: [],
      },
    ],
    orders: [],
  };

  writeDB(data);
  console.log("Base de datos sembrada correctamente.");
  console.log("Usuario admin -> usuario: admin / contraseña: admin123");
  console.log("Usuario user  -> usuario: user  / contraseña: user123");
}

seed();
