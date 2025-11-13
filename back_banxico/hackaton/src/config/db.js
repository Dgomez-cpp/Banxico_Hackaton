import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();
const dbSettings = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

let connectionPool;
export async function getConnection() {
    try {
        if (!connectionPool || !connectionPool.connected) {
            if (connectionPool) {
                await connectionPool.close();
            }
            connectionPool = await sql.connect(dbSettings);
            console.log('Database connected');
        }
        return connectionPool;
    } catch (error) {
        console.error('Database connection failed:', error);
        connectionPool = null;
        throw error;
    }   
}

export { sql };

