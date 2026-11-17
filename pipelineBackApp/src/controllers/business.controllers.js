import { getConnection } from '../database/connection.js'
import sql from 'mssql/msnodesqlv8.js'

export const getBusiness = async (req, res) =>{
    const pool = await getConnection()
    const result = await pool.request().query('SELECT * FROM business WHERE is_active = 1')
    res.json(result.recordset)
}

export const getOneBusiness = async (req, res) =>{
    console.log(req.params.id)

    const pool = await getConnection()
    const result = await pool
    .request()
    .input("id", sql.Int, req.params.id)
    .query("SELECT * FROM business WHERE id = @id")

    if ( result.recordset.length === 0 ){
        return res.status(404).json({ message: "Business not found" });
    }
    
    return res.json(result.recordset[0]);
}

export const createBusiness = async (req, res) =>{    

    const pool = await getConnection()
    const result = await pool
    .request()
    .input('client', sql.NVarChar(200), req.body.client)
    .input('industry_product', sql.NVarChar(150), req.body.industry_product)
    .input('business_type', sql.NVarChar(50), req.body.business_type)
    .input('status', sql.NVarChar(30), req.body.status)
    .input('billings_next_year', sql.Decimal(18, 2), req.body.billings_next_year)
    .input('billings_12_months', sql.Decimal(18, 2), req.body.billings_12_months)
    .input('gross_income_next_year', sql.Decimal(18, 2), req.body.gross_income_next_year)
    .input('gross_income_12_months', sql.Decimal(18, 2), req.body.gross_income_12_months)
    .input('win_probability', sql.TinyInt, req.body.win_probability)
    .input('estimated_win_date', sql.Date, req.body.estimated_win_date)
    .input('estimated_business_start_date', sql.Date, req.body.estimated_business_start_date)
    .query(`
        INSERT INTO dbo.business (
            client,
            industry_product,
            business_type,
            status,
            billings_next_year,
            billings_12_months,
            gross_income_next_year,
            gross_income_12_months,
            win_probability,
            estimated_win_date,
            estimated_business_start_date
        )
        OUTPUT INSERTED.id
        VALUES (
            @client,
            @industry_product,
            @business_type,
            @status,
            @billings_next_year,
            @billings_12_months,
            @gross_income_next_year,
            @gross_income_12_months,
            @win_probability,
            @estimated_win_date,
            @estimated_business_start_date
        );
    `);

    const newId = result.recordset[0].id;

    res.status(201).json({
        message: 'Business created successfully',
        id: newId,
        rowsAffected: result.rowsAffected[0]
    });
}

export const putBusiness = async (req, res) => {
    const transaction = new sql.Transaction(await getConnection());

    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid business ID"
            });
        }

        const {
            client,
            industry_product,
            business_type,
            status,
            billings_next_year,
            billings_12_months,
            gross_income_next_year,
            gross_income_12_months,
            win_probability,
            estimated_win_date,
            estimated_business_start_date
        } = req.body;

        await transaction.begin();

        // 1. Cerrar la versión actual del negocio
        const current = await new sql.Request(transaction)
            .input("id", sql.Int, id)
            .query(`
                UPDATE dbo.business
                SET is_active = 0,
                    end_date = CAST(GETDATE() AS DATE)
                WHERE id = @id
                  AND is_active = 1;
            `);

        if (current.rowsAffected[0] === 0) {
            await transaction.rollback();

            return res.status(404).json({
                message: "Active business not found"
            });
        }

        // 2. Crear la nueva versión con los datos actualizados
        const result = await new sql.Request(transaction)
            .input("client", sql.NVarChar(200), client)
            .input("industry_product", sql.NVarChar(150), industry_product)
            .input("business_type", sql.NVarChar(50), business_type)
            .input("status", sql.NVarChar(30), status)
            .input("billings_next_year", sql.Decimal(18, 2), billings_next_year)
            .input("billings_12_months", sql.Decimal(18, 2), billings_12_months)
            .input("gross_income_next_year", sql.Decimal(18, 2), gross_income_next_year)
            .input("gross_income_12_months", sql.Decimal(18, 2), gross_income_12_months)
            .input("win_probability", sql.TinyInt, win_probability)
            .input("estimated_win_date", sql.Date, estimated_win_date)
            .input("estimated_business_start_date", sql.Date, estimated_business_start_date)
            .query(`
                INSERT INTO dbo.business (
                    client,
                    industry_product,
                    business_type,
                    status,
                    billings_next_year,
                    billings_12_months,
                    gross_income_next_year,
                    gross_income_12_months,
                    win_probability,
                    estimated_win_date,
                    estimated_business_start_date,
                    is_active,
                    start_date,
                    end_date
                )
                OUTPUT INSERTED.*
                VALUES (
                    @client,
                    @industry_product,
                    @business_type,
                    @status,
                    @billings_next_year,
                    @billings_12_months,
                    @gross_income_next_year,
                    @gross_income_12_months,
                    @win_probability,
                    @estimated_win_date,
                    @estimated_business_start_date,
                    1,
                    CAST(GETDATE() AS DATE),
                    NULL
                );
            `);

        await transaction.commit();

        return res.status(200).json({
            message: "Business updated successfully",
            business: result.recordset[0]
        });

    } catch (error) {
        if (transaction._aborted !== true) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error("Rollback error:", rollbackError.message);
            }
        }

        console.error("Error updating business:", error.message);

        return res.status(500).json({
            message: "Error updating business"
        });
    }
};

export const deleteBusiness = async (req, res) => {
    try {
        const pool = await getConnection();

        const result = await pool
            .request()
            .input("id", sql.Int, req.params.id)
            .query(`
                UPDATE dbo.business
                SET is_active = 0,
                    end_date = GETDATE()
                WHERE id = @id
                  AND is_active = 1
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                message: "Business not found or already deleted"
            });
        }

        return res.status(200).json({
            message: "Business deleted successfully",
            rowsAffected: result.rowsAffected[0]
        });

    } catch (error) {
        console.error("Error deleting business:", error.message);

        return res.status(500).json({
            message: "Error deleting business"
        });
    }
};