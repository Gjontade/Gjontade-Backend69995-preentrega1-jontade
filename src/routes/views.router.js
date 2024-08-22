import {Router} from "express";
const router = Router();
// import ProductManager from "../dao/fs/productManager.js";
// const productManager = new ProductManager("./src/data/products.json");
// import CartManager from "../dao/fs/cartManager.js"
// const cartManager = new CartManager("./src/data/carts.json")
import ProductManager from "../dao/db/productManager.db.js";
import CartManager from "../dao/db/cartManager.db.js";

const productManager = new ProductManager();
const cartManager = new CartManager();

// Rutas:
router.get("/home", async (req, res) => {
	try {
		const products = await productManager.getProducts();
		console.log("Productos obtenidos:", products);
		res.render("home", {products});
	} catch (error) {
		console.error("Error al obtener productos.", error);
		res.status(500).json({error: "Error interno del servidor."});
	}
});

router.get("/realtimeproducts", async (req, res) => {
	res.render("realTimeProducts");
});

router.get("/products", async (req, res) => {
	try {
		const {page = 1, limit = 5} = req.query;
		const productos = await productManager.getProducts({
			page: parseInt(page),
			limit: parseInt(limit),
		});

		const nuevoArray = productos.docs.map((producto) => {
			const {_id, ...rest} = producto.toObject();
			return rest;
		});

		res.render("products", {
			user: req.session.user,
			productos: nuevoArray,
			hasPrevPage: productos.hasPrevPage,
			hasNextPage: productos.hasNextPage,
			prevPage: productos.prevPage,
			nextPage: productos.nextPage,
			currentPage: productos.page,
			totalPages: productos.totalPages,
		});
	} catch (error) {
		console.error("Error al obtener los productos.", error);
		res.status(500).json({
			status: "error",
			error: "Error interno del servidor.",
		});
	}
});

router.get("/carts/:cid", async (req, res) => {
	const cartId = req.params.cid;

	try {
		const carrito = await cartManager.getCarritoById(cartId);

		if (!carrito) {
			console.log("No existe el carrito.");
			return res.status(404).json({error: "Carrito no encontrado."});
		}

		const productosEnCarrito = carrito.products.map((item) => ({
			product: item.product.toObject(),
			quantity: item.quantity,
		}));

		res.render("carts", {productos: productosEnCarrito});
	} catch (error) {
		console.error("Error al obtener el carrito", error);
		res.status(500).json({error: "Error interno del servidor"});
	}
});

// Ruta para el formulario de login:
router.get("/login", (req, res) => {
	if (req.session.login) {
		return res.redirect("/products");
	}
	res.render("login");
});

// Ruta para el formulario de register:
router.get("/register", (req, res) => {
	if (req.session.login) {
		return res.redirect("/products");
	}
	res.render("register");
});

// Ruta para el formulario de perfil:
router.get("/profile", (req, res) => {
	if (!req.session.login) {
		return res.redirect("/login");
	}
	res.render("profile", {user: req.session.user});
});


export default router;
