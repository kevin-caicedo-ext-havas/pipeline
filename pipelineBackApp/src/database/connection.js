import sql from 'mssql/msnodesqlv8.js';

const dbSetting = {
    connectionString:
        'Driver={ODBC Driver 18 for SQL Server};' +
        'Server=localhost\\SQLEXPRESS;' +
        'Database=finances;' +
        'Trusted_Connection=yes;' +
        'TrustServerCertificate=yes;'
};

export const getConnection = async () => {
    try {
        const pool = await new sql.ConnectionPool(dbSetting).connect();
        return pool;
    } catch (error) {
        console.error('Error de conexión:', error.message);
        throw error;
    }
};