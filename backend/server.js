import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
 console.log(`Rein Oro Express backend listening on http://localhost:${PORT}`);
});
