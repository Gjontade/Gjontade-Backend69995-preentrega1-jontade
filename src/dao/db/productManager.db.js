import ProductModel from "../models/product.model.js";

class ProductManager {
	// Si las validaciones son exitosas, crea un nuevo producto con los datos proporcionados y un ID único:
	async addProduct({
		title,
		description,
		code,
		price,
		status = true,
		stock,
		category,
		thumbnails: [],
	}) {
		try {
			if (!title || !description || !code || !price || !stock || !category) {
				console.log("Todos los campos son obligatorios.");
				return null;
			}

			// Cambia la validacion:
			const existeProducto = await ProductModel.findOne({code: code});

			if (existeProducto) {
				console.log("El codigo debe ser unico.");
				return null;
			}

			const newProduct = new ProductModel({
				title,
				description,
				code,
				price,
				status: true,
				stock,
				category,
				thumbnails: [],
			});

			await newProduct.save();
			return newProduct;
		} catch (error) {
			console.log("Error al agregar producto.", error);
			throw error;
		}
	}

	// Lee y devuelve todos los productos:
	async getProducts({limit = 5, page = 1, sort, query} = {}) {
		try {
			const skip = (page - 1) * limit;

			let queryOptions = {};

			if (query) {
				queryOptions = {category: query};
			}

			const sortOptions = {};
			if (sort) {
				if (sort === "asc" || sort === "desc") {
					sortOptions.price = sort === "asc" ? 1 : -1;
				}
			}

			const productos = await ProductModel.find(queryOptions)
				.sort(sortOptions)
				.skip(skip)
				.limit(limit);

			const totalProducts = await ProductModel.countDocuments(queryOptions);

			const totalPages = Math.ceil(totalProducts / limit);
			const hasPrevPage = page > 1;
			const hasNextPage = page < totalPages;

			return {
				docs: productos,
				totalPages,
				prevPage: hasPrevPage ? page - 1 : null,
				nextPage: hasNextPage ? page + 1 : null,
				page,
				hasPrevPage,
				hasNextPage,
				prevLink: hasPrevPage
					? `/api/products?limit=${limit}&page=${page - 1}&sort=${sort}&query=${query}`
					: null,
				nextLink: hasNextPage
					? `/api/products?limit=${limit}&page=${page + 1}&sort=${sort}&query=${query}`
					: null,
			};
		} catch (error) {
			console.log("Error al obtener los productos", error);
			throw error;
		}
	}

	// Devuelve un producto especifico por ID:
	async getProductById(id) {
		try {
			const buscado = await ProductModel.findById(id);

			if (!buscado) {
				console.log("Producto no encontrado.");
				return null;
			} else {
				console.log("Producto encontrado.");
				return buscado;
			}
		} catch (error) {
			console.log("Error al buscar el producto por ID.", error);
			throw error;
		}
	}

	// Actualiza un producto específico por su ID:
	async updateProduct(id, productoActualizado) {
		try {
			const producto = await ProductModel.findOneAndUpdate(
				{_id: id},
				productoActualizado,
				{new: true}
			);

			if (!producto) {
				console.log("No se encuentra el producto que queres actualizar.");
				return null;
			} else {
				console.log("Producto actualizado con exito.");
				return producto;
			}
		} catch (error) {
			console.log("Error al actualizar el producto.", error);
			throw error;
		}
	}

	// Elimina un producto específico por su ID:
	async deleteProduct(id) {
		try {
			const borrado = await ProductModel.findByIdAndDelete(id);
			if (!borrado) {
				console.log("Producto no encontrado.");
				return null;
			} else {
				console.log("Producto borrado con exito.");
				return borrado;
			}
		} catch (error) {
			console.log("Error al eliminar el producto.", error);
			throw error;
		}
	}
}

export default ProductManager;
