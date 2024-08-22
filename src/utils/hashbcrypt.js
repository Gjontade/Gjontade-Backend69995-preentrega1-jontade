import bcrypt from "bcrypt";

const createHash = (password) =>
	bcrypt.hashSync(password, bcrypt.genSaltSync(10));

const isValidPassword = (password, user) =>
	bcrypt.compareSync(password, user.password);
//Compara los password y retorna tru o falsete segun corresponda.

export {createHash, isValidPassword};
