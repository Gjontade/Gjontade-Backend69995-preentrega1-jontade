import {json, Router} from "express";
const router = Router();
import ProductManager from "../dao/db/productManager.db.js";
const productManager = new ProductManager();

// Rutas productos:
// Devuelve el listado de productos:
router.get("/", async (req, res) => {
	try {
		const {limit = 5, page = 1, sort, query} = req.query;

		// Convertir limit y page a números enteros
		const limitNumber = parseInt(limit) || 5;
		const pageNumber = parseInt(page) || 1;

		// Configurar sort
		const sortOption =
			sort === "asc" ? "price" : sort === "desc" ? "-price" : undefined;

		// consultar productos
		const productos = await productManager.getProducts({
			limit: limitNumber,
			page: pageNumber,
			sort: sortOption,
			query,
		});

		res.json({
			status: "success",
			payload: productos.docs,
			totalPages: productos.totalPages,
			prevPage: productos.prevPage,
			nextPage: productos.nextPage,
			page: productos.page,
			hasPrevPage: productos.hasPrevPage,
			hasNextPage: productos.hasNextPage,
			prevLink: productos.hasPrevPage? `/api/products?limit=${limit}&page=${productos.prevPage}&sort=${sort || ""}&query=${query || ""}`: null,
			nextLink: productos.hasNextPage? `/api/products?limit=${limit}&page=${productos.nextPage}&sort=${sort || ""}&query=${query || ""}`: null,
		});
	} catch (error) {
		console.error("Error al obtener productos", error);
		res.status(500).json({
			status: "error",
			error: "Error interno del servidor",
		});
	}
});

// Retorna un producto especifico por ID:
router.get("/:pid", async (req, res) => {
	const id = req.params.pid;

	try {
		const producto = await productManager.getProductById(id);
		if (!producto) {
			return res.json({
				error: "Producto no encontrado.",
			});
		}

		res.json(producto);
	} catch (error) {
		console.error("Error al obtener el producto", error);
		res.status(500).json({
			error: "Error interno del servidor.",
		});
	}
});

// Crea un nuevo producto:
router.post("/", async (req, res) => {
	const nuevoProducto = req.body;

	try {
		await productManager.addProduct(nuevoProducto);
		res.status(201).json({
			message: "Producto agregado con exito.",
		});
	} catch (error) {
		console.error("Error al agregar el producto.", error);
		res.status(500).json({
			error: "Error interno del servidor.",
		});
	}
});
// 	const {
// 		title,
// 		description,
// 		code,
// 		price,
// 		status = true,
// 		stock,
// 		category,
// 		thumbnails = [],
// 	} = req.body;
// 	if (!title || !description || !code || !price || !stock || !category) {
// 		return res.json({
// 			message: "Todos los campos son requeridos, excepto thumbnails",
// 		});
// 	}

// 	const products = getProducts();
// 	const id =
// 		(products.length ? Math.max(...products.map((p) => parseInt(p.id))) : 0) +
// 		1;
// 	const newProduct = {
// 		id: id.toString(),
// 		title,
// 		description,
// 		code,
// 		price,
// 		status,
// 		stock,
// 		category,
// 		thumbnails,
// 	};
// 	products.push(newProduct);
// 	saveProducts(products);
// 	res.json({
// 		message: "El producto fue creado con exito!",
// 		newProduct,
// 	});
//});

// Actualiza un producto:
router.put("/:pid", async (req, res) => {
	const id = req.params.pid;
	const productoActualizado = req.body;

	try {
		const actualizado = await productManager.updateProduct(
			id,
			productoActualizado
		);
		if (actualizado) {
			res.json({
				message: "Producto actualizado exitosamente.",
			});
		} else {
			res.json({
				error: "Producto no nencontrado.",
			});
		}
	} catch (error) {
		console.error("Error al actualizar producto.", error);
		res.json({
			error: "Error interno del servidor",
		});
	}
});

// Elimina un producto:
router.delete("/:pid", async (req, res) => {
	const id = req.params.pid;

	try {
		await productManager.deleteProduct(id);
		res.json({
			message: "Producto eliminado exitosamente.",
		});
	} catch (error) {
		console.error("Error al eliminar producto.", error);
		res.status(500).json({
			error: "Error interno del servidor.",
		});
	}
});

export default router;
