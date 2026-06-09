import express,{Router} from "express";
 import "./config/envConfig.js";
import cors from "cors";
import router from "./router/router.js";

const app = express();
app.use(cors());
app.use(express.json());

const route = Router();
route.use('/' , router);

app.use('/api/v1',route);
app.use('/health',(_,res)=>{
    res.status(200).json({
        status:"success",
        message:"Server is healthy"
    })
})
export default app;