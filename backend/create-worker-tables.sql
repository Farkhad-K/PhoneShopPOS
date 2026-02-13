-- Create workers table
CREATE TABLE IF NOT EXISTS workers (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ,
  "isActive" BOOLEAN DEFAULT TRUE,
  "fullName" VARCHAR(255) NOT NULL,
  "phoneNumber" VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  "passportId" VARCHAR(20) UNIQUE NOT NULL,
  "hireDate" DATE NOT NULL,
  "terminationDate" DATE,
  "monthlySalary" DECIMAL(10,2) NOT NULL,
  notes TEXT,
  "userId" INT,
  FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "IDX_WORKERS_PHONE" ON workers ("phoneNumber");
CREATE INDEX IF NOT EXISTS "IDX_WORKERS_ACTIVE" ON workers ("isActive");

-- Create worker_payments table
CREATE TABLE IF NOT EXISTS worker_payments (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ,
  "isActive" BOOLEAN DEFAULT TRUE,
  "workerId" INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  "paymentDate" TIMESTAMPTZ NOT NULL,
  "paymentMethod" VARCHAR(50) DEFAULT 'CASH',
  month INT NOT NULL,
  year INT NOT NULL,
  notes TEXT,
  bonus DECIMAL(10,2) DEFAULT 0,
  deduction DECIMAL(10,2) DEFAULT 0,
  "totalPaid" DECIMAL(10,2) NOT NULL,
  FOREIGN KEY ("workerId") REFERENCES workers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IDX_WORKER_PAYMENTS_WORKER" ON worker_payments ("workerId");
CREATE INDEX IF NOT EXISTS "IDX_WORKER_PAYMENTS_DATE" ON worker_payments ("paymentDate");
CREATE INDEX IF NOT EXISTS "IDX_WORKER_PAYMENTS_MONTH_YEAR" ON worker_payments (month, year);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_WORKER_PAYMENTS_UNIQUE" ON worker_payments ("workerId", month, year) WHERE "deletedAt" IS NULL;
