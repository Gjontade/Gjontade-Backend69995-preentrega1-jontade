import CartModel from "../fs/data/cart.model.js";

class CartManager {
	// Crea un carrito:
	async crearCarrito() {
		try {
			const nuevoCarrito = new CartModel({products: []});
			await nuevoCarrito.save();
			return nuevoCarrito;
		} catch (error) {
			console.log("Error al crear el carrito", error);
			throw error;
		}
	}

	// Busca un carrito por su ID:
	async getCarritoById(cartId) {
		try {
			const carrito = await CartModel.findById(cartId).populate("products.product");

			if (!carrito) {
				throw new Error(`No existe un carrito con el ID ${cartId}`);
			}

			return carrito;
		} catch (error) {
			console.error("Error al obtener el carrito por ID.", error);
			throw error;
		}
	}

	// Agrega un producto al carrito. Si el producto ya existe, incrementa su cantidad:
	async agregarProductoAlCarrito(cartId, productId, quantity = 1) {
		try {
			const carrito = await this.getCarritoById(cartId);
			const existeProducto = carrito.products.find(
				(item) => item.product.toString() === productId
			);

			if (existeProducto) {
				existeProducto.quantity += quantity;
			} else {
				carrito.products.push({product: productId, quantity});
			}

			// Marca la propiedad 'products' como modificada antes de guardar.
			carrito.markModified("products");

			await carrito.save();
			return carrito;
		} catch (error) {
			console.error("Error al agregar el producto al carrito.", error);
			throw error;
		}
	}

	// Elimina un producto de un carrito seleccionado:
	async eliminarProductoDelCarrito(cartId, productId) {
		try {
			const carrito = await this.getCarritoById(cartId);
			const productoIndex = carrito.products.findIndex(
				(item) => item.product.toString() === productId
			);

			if (productoIndex !== -1) {
				carrito.products.splice(productoIndex, 1);
				carrito.markModified("products");
				await carrito.save();
				return carrito;
			} else {
				throw new Error("Producto no encontrado en el carrito.");
			}
		} catch (error) {
			console.log("Error al eliminar el producto del carrito.", error);
			throw error;
		}
	}

	// Elimina todos los productos del carrito:
	async eliminarProductosDelCarrito(cartId) {
		try {
			const carrito = await CartModel.findById(cartId);
			if (!carrito) {
				throw new Error("Carrito no encontrado.");
			}

			carrito.products = [];
			await carrito.save();
			return carrito;
		} catch (error) {
			console.log("Error al eliminar los productos del carrito.", error);
			throw error;
		}
	}

	// Actualiza el carrito:
	async actualizarCarrito(cartId, productos) {
		try {
			const carrito = await CartModel.findById(cartId);
			if (!carrito) {
				throw new Error("Carrito no encontrado.");
			}

			// Actualiza el carrito con el nuevo arreglo de productos
			carrito.products = productos;
			await carrito.save();
			return carrito;
		} catch (error) {
			console.error("Error al actualizar el carrito con productos.", error);
			throw error;
		}
	}

	// Actualiza la cantidad de productos en un carrito:
	async actualizarCantidadProductoEnCarrito(cartId, productId, quantity) {
		try {
			const carrito = await CartModel.findById(cartId);
			if (!carrito) {
				throw new Error("Carrito no encontrado.");
			}

			const producto = carrito.products.find(
				(item) => item.product.toString() === productId
			);

			if (!producto) {
				throw new Error("Producto no encontrado en el carrito.");
			}

			producto.quantity = quantity;

			// Marca la propiedad 'products' como modificada antes de guardar.
			carrito.markModified("products");
			await carrito.save();
			return carrito;
		} catch (error) {
			console.error(
				"Error al actualizar la cantidad de productos del carrito.",
				error
			);
			throw error;
		}
	}
}

export default CartManager;
