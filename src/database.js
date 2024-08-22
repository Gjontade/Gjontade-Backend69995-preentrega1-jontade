import mongoose from "mongoose";

mongoose.connect("mongodb+srv://gonzajontade:gonzajontade@codercluster.xovaakl.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=CoderCluster")
    .then(() => console.log("Conexion exitosa!"))
    .catch((error) => console.log("Error de conexion.", error))