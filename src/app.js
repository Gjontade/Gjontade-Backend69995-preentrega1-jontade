// Levantando el servidor.
import express from "express";
const app = express();

import productosRouter from "./routes/productos.router.js";
import carritoRouter from "./routes/carrito.router.js";
import viewsRouter from "./routes/views.router.js";
import {engine} from "express-handlebars";
import {Server} from "socket.io";
import "./database.js";
import ProductManager from "./dao/fs/productManager.js";
import session from "express-session";
import sessionRouter from "./routes/sessions.router.js";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
const productManager = new ProductManager("./src/data/products.json");

// Middleware:
app.use(express.static("./src/public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(
	session({
		secret: "secretCoder",
		resave: true,
		saveUninitialized: true,
		store: MongoStore.create({
			mongoUrl:
				"mongodb+srv://gonzajontade:gonzajontade@codercluster.xovaakl.mongodb.net/?retryWrites=true&w=majority&appName=CoderCluster",
		}),
	})
);

// Cambios con passport:
app.use(passport.initialize());
app.use(passport.session());
initializePassport();

// Configuracion Express-Handlebars:
app.engine(
	"handlebars",
	engine({
		runtimeOptions: {
			allowProtoMethodsByDefault: true,
			allowProtoMethodsByDefault: true,
		},
	})
);
app.set("view engine", "handlebars");
app.set("views", "./src/views");

const PUERTO = 8080;
const httpServer = app.listen(PUERTO, () => {
	console.log(`Listening in port: http://localhost:${PUERTO}`);
});

// Rutas:
app.use("/api/products", productosRouter);
app.use("/api/carts", carritoRouter);
app.use("/", viewsRouter);
app.use("/api/sessions", sessionRouter);
// Ruta inexistente
app.get("*", (req, res) => {
	res.status(404).send("ERROR: Esta ruta no esta definida.");
});

// Instancia del lado del SERVIDOR:
const io = new Server(httpServer);

// Escucha si un cliente se conecto:
io.on("connection", async (socket) => {
	console.log("un cliente se conecto.");

	// Envia el array de productos:
	socket.emit("productos", await productManager.getProducts());

	// Recibe el evento 'eliminarProducto' desde el cliente:
	socket.on("eliminarProducto", async (id) => {
		await productManager.deleteProduct(id);

		// Devuelve al cliente la lista actualizada:
		io.sockets.emit("productos", await productManager.getProducts());
	});

	// Agrega productos por medio del formulario:
	socket.on("agregarProducto", async (product) => {
		await productManager.addProduct(product);

		// Devuelve al cliente la lista actualizada:
		io.sockets.emit("productos", await productManager.getProducts());
	});
});
