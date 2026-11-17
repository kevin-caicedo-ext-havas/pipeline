IF OBJECT_ID('dbo.business', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.business (
        id INT IDENTITY(1,1) PRIMARY KEY,

        client NVARCHAR(200) NOT NULL,
        industry_product NVARCHAR(150) NULL,
        business_type NVARCHAR(50) NULL,
        status NVARCHAR(30) NULL,

        billings_next_year DECIMAL(18,2) NULL,
        billings_12_months DECIMAL(18,2) NULL,
        gross_income_next_year DECIMAL(18,2) NULL,
        gross_income_12_months DECIMAL(18,2) NULL,

        win_probability TINYINT NULL,
        estimated_win_date DATE NULL,
        estimated_business_start_date DATE NULL,

        is_active BIT NOT NULL
            CONSTRAINT DF_business_is_active DEFAULT 1,

        start_date DATE NOT NULL
            CONSTRAINT DF_business_start_date
            DEFAULT CAST(GETDATE() AS DATE),

        end_date DATE NULL,

        CONSTRAINT CK_business_dates
            CHECK (
                end_date IS NULL
                OR end_date >= start_date
            )
    );
END;