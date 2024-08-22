// Se importan los modulos:
import passport from "passport";
import local from "passport-local";
// Se importan el model y las funciones de bcrypt:
import UserModel from "../dao/models/user.model.js";
import {createHash, isValidPassword} from "../utils/hashbcrypt.js";
import CartManager from "../dao/db/cartManager.db.js";
const cartManager = new CartManager();
// import CartModel from "../dao/fs/data/cart.model.js";
// Estrategia local
const LocalStrategy = local.Strategy;
// Estrategia de Passport - GitHub
import GitHubStrategy from "passport-github2";
// Estrategia de Passport - Facebook
import FacebookStrategy from "passport-facebook";
// Se importa Jsonwebtoken:
import jwt from "passport-jwt";
const JWTStrategy = jwt.Strategy;
const ExtractJwt = jwt.ExtractJwt;

const initializePassport = () => {
	// Extrae el token JWT desde las cookies:
	const cookieExtractor = (req) => {
		let token = null;

		if (req && req.cookies) {
			token = req.cookies["coderCookieToken"];
		}
		return token;
	};
	// Se crea la primer estrategia para "register":
	passport.use(
		"register",
		new LocalStrategy(
			{
				passReqToCallback: true,
				usernameField: "email",
			},
			async (req, username, password, done) => {
				const {first_name, last_name, email, age} = req.body;

				try {
					// Verifica si ya existe un registro con ese mail (si no existe, crea uno):
					let user = await UserModel.findOne({email: email});
					if (user) return done(null, false);

					const cart = await cartManager.crearCarrito();

					let newUser = {
						first_name,
						last_name,
						email,
						age,
						password: createHash(password),
						cart: cart._id,
					};

					let result = await UserModel.create(newUser);

					return done(null, result);
				} catch (error) {
					return done(error);
				}
			}
		)
	);

	// Agrega una nueva estrategia para el login:
	passport.use(
		"login",
		new LocalStrategy(
			{
				usernameField: "email",
			},
			async (email, password, done) => {
				try {
					// Verifica si existe un usuario con ese email:
					const user = await UserModel.findOne({email: email});
					if (!user) {
						console.log("El usuario no existe.");
						return done(null, false);
					}

					// Si existe el user, verifica la contraseña:
					if (!isValidPassword(password, user)) return done(null, false);
					return done(null, user);
				} catch (error) {
					return done(error);
				}
			}
		)
	);

	passport.serializeUser((user, done) => {
		done(null, user._id);
	});

	passport.deserializeUser(async (id, done) => {
		let user = await UserModel.findById({_id: id});
		done(null, user);
	});

	// Estrategia JWT:
	passport.use(
		"jwt",
		new JWTStrategy(
			{
				jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
				secretOrKey: "coderhouse",
			},
			async (jwt_payload, done) => {
				try {
					const user = await UserModel.findById(jwt_payload._id);
					if (!user) {
						return done(null, false); // Usuario no encontrado.
					}
					return done(null, jwt_payload);
				} catch (error) {
					return done(error);
				}
			}
		)
	);

	// Autenticacion de GitHub:
	passport.use(
		"github",
		new GitHubStrategy(
			{
				clientID: "Iv23liK7iZOTMMoPkDw7",
				clientSecret: "b4ea609fd6b1e040949a4dc7172b5ab1d7cdf11f",
				callbackURL: "http://localhost:8080/api/sessions/githubcallback",
			},
			async (accesToken, refreshToken, profile, done) => {
				//console.log("Profile: ", profile);

				try {
					let user = await UserModel.findOne({email: profile._json.email});

					if (!user) {
						// Si no esta registrado, lo crea:
						let newUser = {
							first_name: profile._json.name || "GitHubUser", // Valor por defecto si falta.
							last_name: "",
							email: profile._json.email || `${profile.username}@github.com`, // Genera un email si falta
							age: 18,
							password: "",
							provider: "Github",
						};

						// Luego se crea como documento:
						let result = await UserModel.create(newUser);
						done(null, result);
					} else {
						// Si existe el usuario, pasa a la vista de profile:
						done(null, user);
					}
				} catch (error) {
					return done(error);
				}
			}
		)
	);

	// Autenticacion de Facebook:
	passport.use(
		new FacebookStrategy(
			{
				clientID: "885459826817246",
				clientSecret: "f1743a21ccb4e7b32bc7ad27d53b424d",
				callbackURL:
					"http://localhost:8080/api/sessions/auth/facebook/callback",
				profileFields: ["id", "emails", "name"],
			},
			async (accesToken, refreshToken, profile, done) => {
				//console.log("Profile: ", profile);
				try {
					let user = await UserModel.findOne({
						accountId: profile.id,
						provider: "Facebook",
					});

					if (!user) {
						// Si no esta registrado, lo crea:
						let newUser = {
							first_name: profile.displayName,
							last_name: "",
							age: 18,
							password: "",
							provider: "Facebook",
						};

						// Luego se crea como documento:
						let result = await UserModel.create(newUser);
						done(null, result);
					} else {
						// Si existe el usuario, pasa a la vista de profile:
						done(null, user);
					}
				} catch (error) {
					return done(error);
				}
			}
		)
	);
};

export default initializePassport;
