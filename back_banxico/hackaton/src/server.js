import app from './app.js';
import { getConnection } from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 3000;

app.listen(PORT, async() => {
    try {
        await getConnection();
        console.log(`Server is running on port ${PORT}`);
    } catch (error) {
        console.error('Failed to start server:', error);
    }       
});
