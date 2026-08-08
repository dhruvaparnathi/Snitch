import app from "./src/app.js";
import config from "./src/config/config.js";
import dbConnect from "./src/config/bd.js";

dbConnect();

app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
});