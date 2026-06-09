import app from "./app.js";
import {createServer} from 'http';
import mongoose from "./db/mongodb.js";
const PORT = process.env.PORT || 3500;

const server = createServer(app);

server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
