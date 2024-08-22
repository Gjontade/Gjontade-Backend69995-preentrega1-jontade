import {Router} from "express";
const router = Router();
import UserModel from "../dao/models/user.model.js";
import {createHash, isValidPassword} from "../utils/hashbcrypt.js";
import passport from "passport";
import jwt from "jsonwebtoken";
// import CartManager from "../dao/fs/cartManager.js";
import CartManager from "../dao/db/cartManager.db.js";
import CartModel from "../dao/fs/data/cart.model.js";

// Registro:
router.post(
	"/register",
	passport.authenticate("register", {
		failureRedirect: "/failedregister",
		failureFlash: true,
	}),
	async (req, res) => {
		try {
			req.session.user = {
				first_name: req.user.first_name,
				last_name: req.user.last_name,
				email: req.user.email,
				age: req.user.age,
				role: req.user.role,
			};

			req.session.login = true;

			// Genera el Token de JWT:
			const token = jwt.sign(
				{_id: req.user._id, usuario: req.user.first_name, rol: req.user.role},
				"coderhouse",
				{expiresIn: "1h"}
			);

			// Genera la Cookie:
			res.cookie("coderCookieToken", token, {
				maxAge: 3600000, // 1 Hora.
				httpOnly: true, // Accesible mediante peticion HTTP.
			});

			res.redirect("/api/sessions/current"); // Current
		} catch (error) {
			console.error("Error durante el registro: ", error);
			res.redirect("/failedregister");
		}
	}
);

router.get("/failedregister", (req, res) => {
	res.send("Registro fallido.");
});

// Login con Passport:
router.post(
	"/login",
	passport.authenticate("login", {
		failureRedirect: "/api/sessions/faillogin",
	}),
	async (req, res) => {
		req.session.user = {
			first_name: req.user.first_name,
			last_name: req.user.last_name,
			email: req.user.email,
			age: req.user.age,
			role: req.user.role,
		};

		req.session.login = true;

		res.redirect("/products");
	}
);

router.get("/faillogin", (req, res) => {
	res.send("Fallo el login.");
});

// Logout:
router.get("/logout", (req, res) => {
	// if (req.session.login) {
	req.session.destroy((err) => {
		if(err) {
			console.error("Error al destruir la sesion.", err);
		}
	});
	// }
	res.clearCookie("coderCookieToken")
	res.redirect("/login");
});

// Ruta Current:
router.get(
	"/current",
	passport.authenticate("jwt", {session: false}),
	(req, res) => {
		if (req.user) {
			res.render("home", {usuario: req.user.usuario});
		} else {
			res.status(401).send("No autorizado.");
		}
	}
);

// Login a partir de GitHub:
router.get(
	"/github",
	passport.authenticate("github", {scope: ["user:email"]}),
	async (req, res) => {}
);

router.get(
	"/githubcallback",
	passport.authenticate("github", {failureRedirect: "/login"}),
	async (req, res) => {
		req.session.user = req.user;
		req.session.login = true;
		res.redirect("/profile");
	}
);

// Login a partir de Facebook:
router.get(
	"/auth/facebook",
	passport.authenticate("facebook", {scope: ["email"]})
);

router.get(
	"/auth/facebook/callback",
	passport.authenticate("facebook", {failureRedirect: "/login"}),
	async (req, res) => {
		req.session.user = req.user;
		req.session.login = true;
		res.redirect("/profile");
	}
);

export default router;
