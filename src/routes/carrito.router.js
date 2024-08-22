import {Router} from "express";
const router = Router();
//import fs from "fs";
import path from "path";
const cartsFilePath = path.resolve("./src/data/carts.json");
const productsFilePath = path.resolve("./src/data/products.json");
import CartManager from "../dao/db/cartManager.db.js";
const cartManager = new CartManager(); 

// Convierte un array de carritos en una cadena JSON y lo guarda en el archivo especificado por cartsFilePath.
// const saveCarts = (carts) => {
// 	try {
// 		fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
// 	} catch (error) {
// 		console.error("Error al guardar en el archivo del carrito:", error);
// 	}
// };

// Lee y devuelve el contenido de products.Json, el cual contiene los datos de los productos.
// const getProducts = () => {
// 	try {
// 		const data = fs.readFileSync(productsFilePath, "utf-8");
// 		return JSON.parse(data) || [];
// 	} catch (error) {
// 		console.error("Error reading products file:", error);
// 		return [];
// 	}
// };

//Rutas Carrito:
//Devuelve el listado de los carritos:
// router.get("/", (req, res) => {
// 	const {limit} = req.query;
// 	const carts = getCarts();

// 	if (limit) {
// 		res.json(carts.slice(0, limit));
// 	} else {
// 		res.json(carts);
// 	}
// });

// Crea un nuevo carrito:
router.post("/", async (req, res) => {
	try {
		const nuevoCarrito = await cartManager.crearCarrito();
		res.json(nuevoCarrito);
	} catch (error) {
		console.error("Error al crear un nuevo carrito.", error);
		res.status(500).json({error: "Error interno del servidor."});
	}
});

// Retorna un carrito especifico por ID:
router.get("/:cid", async (req, res) => {
	const cartId = req.params.cid;
	try {
		const carrito = await cartManager.getCarritoById(cartId);
		res.render("carrito", {products: carrito.products});
	} catch (error) {
		console.error("Error al obtener el carrito.", error);
		res.status(500).json({error: "Error interno del servidor."});
	}
});

// Agrega un producto a un carrito segun los IDs indicados:
router.post("/:cid/product/:pid", async (req, res) => {
	const cartId = req.params.cid;
	const productId = req.params.pid;
	const quantity = req.body.quantity || 1;

	try {
		const actualizarCarrito = await cartManager.agregarProductoAlCarrito(
			cartId,
			productId,
			quantity
		);
		res.json(actualizarCarrito.products);
	} catch (error) {
		console.error("Error al agregar productos al carrito.", error);
		res.status(500).json({error: "Error interno del servidor."});
	}
});

// Elimina un producto de un carrito seleccionado:
router.delete("/:cid/product/:pid", async (req, res) => {
	const cartId = req.params.cid;
	const productId = req.params.pid;

	try {
		const carritoActualizado = await cartManager.eliminarProductoDelCarrito(
			cartId,
			productId
		);
		res.json({
			message: "Producto eliminado del carrito con exito.",
			products: carritoActualizado.products,
		});
	} catch (error) {
		console.error("Error al eliminar el producto del carrito", error);
		res.status(500).json({error: "Error interno del servidor."});
	}
});

// Elimina todos los productos de un carrito:
router.delete("/:cid", async (req, res) => {
	const cartId = req.params.cid;

	try {
		await cartManager.eliminarProductosDelCarrito(cartId);
		res.json({
			message:
				"Todos los productos del carrito han sido borrados exitosamente.",
		});
	} catch (error) {
		console.error("Error al borrar todos los productos del carrito.", error);
		res.status(500).json({
			status: "error",
			error: "Error interno del servidor.",
		});
	}
});

// Actualiza un carrito con un arreglo de productos:
router.put("/api/carts/:cid", async (req, res) => {
	const cartId = req.params.cid;
	const productos = req.body.products; // Se espera que el cuerpo de la solicitud tenga un arreglo de productos

	try {
		const carritoActualizado = await cartManager.actualizarCarrito(
			cartId,
			productos
		);
		res.json({
			message: "Carrito actualizado exitosamente.",
			carrito: carritoActualizado,
		});
	} catch (error) {
		console.error("Error al actualizar el carrito con productos.", error);
		res.status(500).json({
			status: "error",
			error: "Error interno del servidor.",
		});
	}
});

// Actualiza la cantidad de un producto específico en un carrito:
router.put("/api/carts/:cid/products/:pid", async (req, res) => {
	const cartId = req.params.cid;
	const productId = req.params.pid;
	const {quantity} = req.body;

	try {
		if (quantity === undefined || quantity <= 0) {
			return res.status(400).json({
				status: "error",
				error: "La cantidad debe ser un número positivo.",
			});
		}

		const carritoActualizado =
			await cartManager.actualizarCantidadProductoEnCarrito(
				cartId,
				productId,
				quantity
			);
		res.json({
			message: "Cantidad del producto actualizada exitosamente.",
			carrito: carritoActualizado,
		});
	} catch (error) {
		console.error(
			"Error al actualizar la cantidad del producto en el carrito.",
			error
		);
		res.status(500).json({
			status: "error",
			error: "Error interno del servidor.",
		});
	}
});

export default router;
