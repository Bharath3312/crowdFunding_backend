import express,{Router} from "express";
import "./config/envConfig.js";
import cors from "cors";
import router from "./router/router.js";

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const routes = Router();
routes.use('/',router);

// Mount API router
app.use('/api/v1', routes);

// Health check
app.get('/health', (_req, res) => {
    return res.status(200).json({ status: 'success', message: 'Server is healthy' });
});

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ status: 'error', message: 'Not Found' });
});

// Basic error handler
// Keep signature with 4 args so Express recognizes it as an error handler
app.use((err, _req, res, _next) => {
    // Log minimal error to console; consider using a logger in production
    // eslint-disable-next-line no-console
    console.error(err && (err.stack || err));
    res.status(err?.status || 500).json({ status: 'error', message: err?.message || 'Internal Server Error' });
});

export default app;