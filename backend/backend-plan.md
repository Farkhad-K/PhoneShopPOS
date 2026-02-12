# Backend Implementation Plan - Phone Shop POS

## Overview

Build a NestJS backend API for Phone Shop POS system following the business requirements in `tz.txt`. We will implement features in milestone order: Inventory → Purchase → Sale → Debt/Credit → Repair → Reports → Worker Payments.

**Architecture:** Facade pattern with specialized sub-services, TypeORM migrations, JWT role-based auth.

---

## Database Schema Design

### Core Entities

#### 1. Phone (Inventory Item)
```typescript
@Entity('phones')
export class Phone extends Extender {
  @Column({ unique: true })
  barcode: string; // Auto-generated: PH{timestamp}{random}

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column({ nullable: true })
  storage: string; // "64GB", "128GB", etc.

  @Column({ nullable: true })
  color: string;

  @Column({ unique: true, nullable: true })
  imei: string;

  @Column({ nullable: true })
  serialNumber: string;

  @Column({ type: 'enum', enum: ['Good', 'Used', 'Broken'] })
  conditionAtPurchase: string;

  @Column({ type: 'text', nullable: true })
  knownIssues: string;

  @Column({
    type: 'enum',
    enum: ['IN_STOCK', 'IN_REPAIR', 'READY_FOR_SALE', 'SOLD', 'RETURNED'],
    default: 'IN_STOCK'
  })
  status: string;

  @ManyToOne(() => Purchase, purchase => purchase.phones)
  purchase: Purchase;

  @OneToMany(() => Repair, repair => repair.phone)
  repairs: Repair[];

  @ManyToOne(() => Sale, sale => sale.phones, { nullable: true })
  sale: Sale;

  // Computed field (not stored, calculated from purchase + repairs)
  totalCost: number;
}
```

#### 2. Purchase (Stock In)
```typescript
@Entity('purchases')
export class Purchase extends Extender {
  @Column({ type: 'timestamp' })
  purchaseDate: Date;

  @ManyToOne(() => Customer, { nullable: true })
  customer: Customer; // Required if pay-later

  @OneToMany(() => Phone, phone => phone.purchase)
  phones: Phone[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPurchasePrice: number;

  @Column({ type: 'enum', enum: ['Cash', 'Card', 'Other'], default: 'Cash' })
  paymentMethod: string;

  @Column({ type: 'enum', enum: ['PAID_NOW', 'PAY_LATER'] })
  paymentType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  remainingAmount: number; // Creates customer credit

  @Column({ type: 'text', nullable: true })
  notes: string;
}
```

#### 3. Repair
```typescript
@Entity('repairs')
export class Repair extends Extender {
  @ManyToOne(() => Phone, phone => phone.repairs)
  phone: Phone;

  @Column({ type: 'timestamp' })
  repairDate: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  partsCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  laborCost: number;

  @ManyToOne(() => User)
  technician: User;

  @Column({ type: 'enum', enum: ['PENDING', 'DONE'], default: 'PENDING' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
```

#### 4. Sale (Stock Out)
```typescript
@Entity('sales')
export class Sale extends Extender {
  @Column({ type: 'timestamp' })
  saleDate: Date;

  @ManyToOne(() => Customer, { nullable: true })
  customer: Customer; // Required if pay-later

  @OneToMany(() => Phone, phone => phone.sale)
  phones: Phone[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalSalePrice: number;

  @Column({ type: 'enum', enum: ['Cash', 'Card', 'Other'], default: 'Cash' })
  paymentMethod: string;

  @Column({ type: 'enum', enum: ['PAID_NOW', 'PAY_LATER'] })
  paymentType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  remainingAmount: number; // Creates customer debt

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Computed (not stored)
  profit: number; // totalSalePrice - sum(phones.totalCost)
}
```

#### 5. Customer
```typescript
@Entity('customers')
export class Customer extends Extender {
  @Column()
  fullName: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  passportId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => Purchase, purchase => purchase.customer)
  purchases: Purchase[];

  @OneToMany(() => Sale, sale => sale.customer)
  sales: Sale[];

  @OneToMany(() => Payment, payment => payment.customer)
  payments: Payment[];

  // Computed fields
  totalDebt: number; // Sum of sales.remainingAmount
  totalCredit: number; // Sum of purchases.remainingAmount
}
```

#### 6. Payment (Settlement)
```typescript
@Entity('payments')
export class Payment extends PaymentExtender {
  @Column({ type: 'timestamp' })
  paymentDate: Date;

  @ManyToOne(() => Customer)
  customer: Customer;

  @Column({
    type: 'enum',
    enum: ['CUSTOMER_PAYS_SHOP', 'SHOP_PAYS_CUSTOMER']
  })
  direction: string;

  // amount field inherited from PaymentExtender

  @Column({ type: 'enum', enum: ['Cash', 'Card', 'Other'], default: 'Cash' })
  method: string;

  @ManyToOne(() => Sale, { nullable: true })
  relatedSale: Sale;

  @ManyToOne(() => Purchase, { nullable: true })
  relatedPurchase: Purchase;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
```

#### 7. Worker (Employee)
```typescript
@Entity('workers')
export class Worker extends Extender {
  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['OWNER', 'MANAGER', 'CASHIER', 'TECHNICIAN'] })
  role: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlySalary: number;

  @OneToMany(() => WorkerPayment, payment => payment.worker)
  payments: WorkerPayment[];

  @OneToOne(() => User, { nullable: true })
  user: User; // Link to login account
}
```

#### 8. WorkerPayment
```typescript
@Entity('worker_payments')
export class WorkerPayment extends PaymentExtender {
  @ManyToOne(() => Worker, worker => worker.payments)
  worker: Worker;

  @Column({ type: 'varchar', length: 7 })
  month: string; // Format: YYYY-MM

  // amount field inherited from PaymentExtender

  @Column({ type: 'timestamp' })
  paymentDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
```

### Entity Relationships Diagram
```
User (Auth) ←→ Worker
Customer ←→ Purchase → Phone → Repair
Customer ←→ Sale ← Phone
Customer ←→ Payment
Worker ←→ WorkerPayment
```

---

## Implementation Milestones

### Milestone 1: Core Infrastructure & Auth Enhancement
**Goal:** Prepare foundation for POS system

**Tasks:**
1. Update Role enum to include OWNER, MANAGER, CASHIER, TECHNICIAN
2. Modify JwtRoleGuard to use role hierarchy
3. Configure TypeORM migrations (disable synchronize)
4. Create base migration for User table updates
5. Test role-based access control

**Files:**
- `src/common/enums/role.enum.ts` - Add new roles
- `src/auth/guards/jwt-role.guard.ts` - Update role hierarchy logic
- `src/app.module.ts` - Set synchronize: false
- `src/migrations/XXXXXX-UpdateUserRoles.ts` - Migration for role enum

**Tests:**
- Unit test for role hierarchy in guard
- E2E test for role-based endpoint access

**Acceptance:**
- All 4 roles functional
- Migration system operational
- Role guard prevents unauthorized access

---

### Milestone 2: Customer Management
**Goal:** Manage customer records for debt/credit tracking

**Database:**
- Migration: CreateCustomerTable

**Backend:**
- Entity: `Customer`
- DTOs: `CreateCustomerDto`, `UpdateCustomerDto`, `CustomerResponseDto`
- Services:
  - `CustomerCreateService`
  - `CustomerFindService` (find by phone number, search)
  - `CustomerUpdateService`
  - `CustomerDeleteService` (soft delete)
  - `CustomerBalanceService` (calculate debt/credit)
- Facade: `CustomerService`
- Controller: `CustomerController`
- Endpoints:
  - `POST /api/customers` (MANAGER+)
  - `GET /api/customers` (CASHIER+) with pagination/search
  - `GET /api/customers/:id` (CASHIER+)
  - `GET /api/customers/:id/balance` (CASHIER+)
  - `PATCH /api/customers/:id` (MANAGER+)
  - `DELETE /api/customers/:id` (OWNER only)

**Tests:**
- Unit: Customer service methods
- E2E: Create customer, search by phone, get balance

**Acceptance:**
- Can create/update/delete customers
- Fast search by phone number (indexed)
- Balance calculation returns debt and credit separately

---

### Milestone 3: Phone Inventory & Purchase
**Goal:** Buy phones from customers, track inventory

**Database:**
- Migrations: CreatePhoneTable, CreatePurchaseTable

**Backend:**
- Entities: `Phone`, `Purchase`
- DTOs:
  - `CreatePhoneDto`, `UpdatePhoneDto`, `PhoneResponseDto`
  - `CreatePurchaseDto`, `PurchaseResponseDto`
- Services:
  - **Phone:**
    - `PhoneCreateService` (generate barcode on create)
    - `PhoneFindService` (search by barcode, IMEI, status)
    - `PhoneUpdateService` (update status, condition)
    - `PhoneCostService` (calculate totalCost = purchase + repairs)
  - **Purchase:**
    - `PurchaseCreateService` (create purchase + phones, handle pay-later)
    - `PurchaseFindService` (list with filters, pagination)
    - `PurchasePaymentService` (handle partial/full payment on creation)
- Facades: `PhoneService`, `PurchaseService`
- Controllers: `PhoneController`, `PurchaseController`
- Endpoints:
  - **Phones:**
    - `GET /api/phones` (CASHIER+) - List inventory with filters
    - `GET /api/phones/:id` (CASHIER+)
    - `GET /api/phones/barcode/:barcode` (CASHIER+) - Fast lookup
    - `PATCH /api/phones/:id` (MANAGER+) - Update status, condition
  - **Purchases:**
    - `POST /api/purchases` (CASHIER+) - Create purchase
    - `GET /api/purchases` (MANAGER+) - List purchases
    - `GET /api/purchases/:id` (MANAGER+)

**Business Logic:**
- Generate unique barcode on phone creation: `PH{timestamp}{random6digits}`
- If `paymentType = 'PAY_LATER'`:
  - Customer is required
  - Create customer credit balance (remainingAmount)
- Validate IMEI uniqueness if provided
- Set initial phone status based on condition (Broken → IN_REPAIR, else → IN_STOCK)

**Tests:**
- Unit: Barcode generation, cost calculation, pay-later logic
- E2E: Full purchase flow with/without customer

**Acceptance:**
- Can create purchase with multiple phones
- Barcode generation works and is unique
- Pay-later creates customer credit balance
- Phones searchable by barcode and IMEI

---

### Milestone 4: Sales & Profit Tracking
**Goal:** Sell phones to customers, calculate profit

**Database:**
- Migration: CreateSaleTable

**Backend:**
- Entity: `Sale`
- DTOs: `CreateSaleDto`, `SaleResponseDto`
- Services:
  - `SaleCreateService` (create sale, update phone status to SOLD)
  - `SaleFindService` (list sales with filters)
  - `SaleProfitService` (calculate profit per sale)
  - `SaleValidationService` (prevent selling already sold phones)
- Facade: `SaleService`
- Controller: `SaleController`
- Endpoints:
  - `POST /api/sales` (CASHIER+) - Create sale
  - `GET /api/sales` (MANAGER+) - List sales
  - `GET /api/sales/:id` (MANAGER+)
  - `GET /api/sales/:id/profit` (MANAGER+)

**Business Logic:**
- Validate phones are not already sold (status !== 'SOLD')
- Calculate profit: `salePrice - phone.totalCost`
- If `paymentType = 'PAY_LATER'`:
  - Customer is required
  - Create customer debt balance (remainingAmount)
- Update phone status to 'SOLD'
- Update phone.sale relationship

**Tests:**
- Unit: Profit calculation, sold phone validation
- E2E: Full sale flow, pay-later sale

**Acceptance:**
- Can sell phones with accurate profit calculation
- Cannot sell already sold phone (throws error)
- Pay-later creates customer debt balance
- Profit includes purchase + all repair costs

---

### Milestone 5: Debt & Credit Management
**Goal:** Handle customer payments and shop payments

**Database:**
- Migration: CreatePaymentTable

**Backend:**
- Entity: `Payment`
- DTOs: `CreatePaymentDto`, `PaymentResponseDto`
- Services:
  - `PaymentCreateService` (create payment record)
  - `PaymentApplyService` (apply payment to transactions FIFO)
  - `PaymentFindService` (list payments by customer)
  - `DebtCollectionService` (customer pays shop)
  - `CreditPaymentService` (shop pays customer)
- Facade: `PaymentService`
- Controller: `PaymentController`
- Endpoints:
  - `POST /api/payments/debt` (CASHIER+) - Customer pays debt
  - `POST /api/payments/credit` (MANAGER+) - Shop pays customer
  - `GET /api/payments/customer/:customerId` (CASHIER+)
  - `GET /api/customers/:id/transactions` (CASHIER+) - Debt/credit history

**Business Logic (FIFO Payment Application):**
1. Fetch unpaid/partially paid transactions (sale/purchase) ordered by date ASC
2. For each transaction:
   - If payment >= remaining: fully pay transaction, move to next
   - If payment < remaining: partially pay transaction, stop
3. Update customer debt/credit balance
4. Mark fully paid transactions

**Tests:**
- Unit: FIFO payment allocation logic
- E2E: Multiple partial payments until full payment

**Acceptance:**
- Payments correctly reduce debt/credit
- FIFO order respected
- Cannot overpay (validate amount <= remaining balance)
- Customer profile shows accurate debt/credit totals

---

### Milestone 6: Repair Management
**Goal:** Track phone repairs and costs

**Database:**
- Migration: CreateRepairTable

**Backend:**
- Entity: `Repair`
- DTOs: `CreateRepairDto`, `UpdateRepairDto`, `RepairResponseDto`
- Services:
  - `RepairCreateService` (create repair, update phone status)
  - `RepairUpdateService` (update status, costs)
  - `RepairFindService` (list repairs by phone, technician)
  - `RepairCostService` (calculate repair totals)
- Facade: `RepairService`
- Controller: `RepairController`
- Endpoints:
  - `POST /api/repairs` (TECHNICIAN+) - Create repair
  - `PATCH /api/repairs/:id` (TECHNICIAN+) - Update repair
  - `GET /api/repairs` (MANAGER+) - List repairs
  - `GET /api/repairs/phone/:phoneId` (TECHNICIAN+)
  - `PATCH /api/repairs/:id/complete` (TECHNICIAN+) - Mark done

**Business Logic:**
- When repair created on phone:
  - Update phone status to 'IN_REPAIR'
- When repair marked DONE:
  - Update phone status to 'READY_FOR_SALE'
- Repair costs contribute to phone.totalCost
- Track technician who did repair

**Tests:**
- Unit: Status updates, cost calculation
- E2E: Create repair → mark done → verify phone status

**Acceptance:**
- Can create multiple repairs per phone
- Phone status updates correctly
- Repair costs included in profit calculation
- Technician tracking works

---

### Milestone 7: Reporting & Analytics
**Goal:** Financial reports and summaries

**Backend:**
- Services:
  - `ReportSalesService` (sales report with filters)
  - `ReportPurchasesService` (purchases report)
  - `ReportRepairsService` (repair costs breakdown)
  - `ReportProfitService` (profit calculations)
  - `ReportCustomerBalancesService` (top debtors/creditors)
- Facade: `ReportService`
- Controller: `ReportController`
- Endpoints:
  - `GET /api/reports/sales` (MANAGER+)
    - Query: dateFrom, dateTo, paid/unpaid filter
    - Response: revenue, count, profit, paidAmount, unpaidAmount
  - `GET /api/reports/purchases` (MANAGER+)
    - Query: dateFrom, dateTo
    - Response: totalCost, count, paidAmount, unpaidAmount
  - `GET /api/reports/repairs` (MANAGER+)
    - Query: dateFrom, dateTo, technicianId
    - Response: totalRepairCost, count, byTechnician
  - `GET /api/reports/profit` (OWNER+)
    - Query: dateFrom, dateTo
    - Response: totalRevenue, totalCost, totalProfit, profitMargin
  - `GET /api/reports/customer-balances` (MANAGER+)
    - Response: topDebtors[], topCreditors[]

**Business Logic:**
- Use QueryBuilder for complex aggregations
- Cache report results (Redis optional, future enhancement)
- Apply date filters consistently
- Compute profit = sum(sales.totalSalePrice) - sum(phones.totalCost)

**Tests:**
- E2E: Generate reports with test data, verify calculations

**Acceptance:**
- Reports show accurate financial data
- Date range filtering works
- Profit calculations match manual calculations
- Fast query performance (<2s for 10k records)

---

### Milestone 8: Worker Payment Management
**Goal:** Track employee salaries and payments

**Database:**
- Migrations: CreateWorkerTable, CreateWorkerPaymentTable

**Backend:**
- Entities: `Worker`, `WorkerPayment`
- DTOs:
  - `CreateWorkerDto`, `UpdateWorkerDto`, `WorkerResponseDto`
  - `CreateWorkerPaymentDto`, `WorkerPaymentResponseDto`
- Services:
  - **Worker:**
    - `WorkerCreateService`
    - `WorkerFindService`
    - `WorkerUpdateService`
  - **WorkerPayment:**
    - `WorkerPaymentCreateService` (record monthly payment)
    - `WorkerPaymentFindService` (payment history)
    - `WorkerPaymentReportService` (monthly totals)
- Facades: `WorkerService`, `WorkerPaymentService`
- Controllers: `WorkerController`, `WorkerPaymentController`
- Endpoints:
  - **Workers:**
    - `POST /api/workers` (OWNER only)
    - `GET /api/workers` (MANAGER+)
    - `PATCH /api/workers/:id` (OWNER only)
  - **Worker Payments:**
    - `POST /api/worker-payments` (OWNER only)
    - `GET /api/worker-payments` (OWNER only)
    - `GET /api/worker-payments/month/:month` (OWNER only) - e.g., "2025-01"

**Business Logic:**
- Link Worker to User account (optional, for login)
- Validate one payment per worker per month (unique constraint)
- Monthly salary can be different from actual payment (bonuses, deductions)

**Tests:**
- Unit: Monthly payment validation
- E2E: Create worker, record payment, view history

**Acceptance:**
- Can create workers with roles and salaries
- Can record monthly payments
- Cannot record duplicate payments for same month
- Payment history accessible

---

## Technical Implementation Details

### Migration Workflow
```bash
# 1. Generate migration
npm run migration:generate -- src/migrations/CreatePhoneTable

# 2. Review generated migration file
# 3. Run migration
npm run migration:run

# 4. Test revert
npm run migration:revert

# 5. Re-run migration
npm run migration:run
```

### Service Facade Pattern Example
```typescript
// phones.service.ts (Facade)
@Injectable()
export class PhoneService {
  constructor(
    private readonly createService: PhoneCreateService,
    private readonly findService: PhoneFindService,
    private readonly updateService: PhoneUpdateService,
    private readonly costService: PhoneCostService,
  ) {}

  async create(dto: CreatePhoneDto, userId: number) {
    return this.createService.execute(dto, userId);
  }

  async findAll(query: PaginationQueryDto) {
    return this.findService.findAll(query);
  }

  async findByBarcode(barcode: string) {
    return this.findService.findByBarcode(barcode);
  }

  async calculateTotalCost(phoneId: number) {
    return this.costService.calculate(phoneId);
  }
}
```

### DTO Validation Example
```typescript
// create-purchase.dto.ts
export class CreatePurchaseDto {
  @ApiProperty({ type: [CreatePhoneDto] })
  @ValidateNested({ each: true })
  @Type(() => CreatePhoneDto)
  phones: CreatePhoneDto[];

  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  @Min(0)
  totalPurchasePrice: number;

  @ApiProperty({ enum: ['PAID_NOW', 'PAY_LATER'] })
  @IsEnum(['PAID_NOW', 'PAY_LATER'])
  paymentType: string;

  @ApiProperty({ example: 1000.00 })
  @IsNumber()
  @Min(0)
  paidAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  customerId?: number; // Required if paymentType = 'PAY_LATER'

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @Validate(PayLaterRequiresCustomer)
  _validation: any; // Custom validator
}

// Custom validator
@ValidatorConstraint()
export class PayLaterRequiresCustomer implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const dto = args.object as CreatePurchaseDto;
    if (dto.paymentType === 'PAY_LATER' && !dto.customerId) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return 'customerId is required when paymentType is PAY_LATER';
  }
}
```

### Testing Example
```typescript
// phone.service.spec.ts
describe('PhoneService', () => {
  let service: PhoneService;
  let repository: Repository<Phone>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PhoneService,
        PhoneCreateService,
        PhoneFindService,
        {
          provide: getRepositoryToken(Phone),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PhoneService>(PhoneService);
    repository = module.get(getRepositoryToken(Phone));
  });

  it('should generate unique barcode on create', async () => {
    const dto: CreatePhoneDto = {
      brand: 'Apple',
      model: 'iPhone 13',
      conditionAtPurchase: 'Good',
    };

    const phone = await service.create(dto, 1);
    expect(phone.barcode).toMatch(/^PH\d{13}\d{6}$/);
  });

  it('should calculate total cost including repairs', async () => {
    const phone = {
      id: 1,
      purchase: { totalPurchasePrice: 500 },
      repairs: [{ totalCost: 100 }, { totalCost: 50 }]
    };

    jest.spyOn(repository, 'findOne').mockResolvedValue(phone as any);

    const totalCost = await service.calculateTotalCost(1);
    expect(totalCost).toBe(650); // 500 + 100 + 50
  });
});
```

---

## API Documentation (Swagger)

All endpoints will be documented with Swagger decorators:
- `@ApiTags()` for grouping
- `@ApiOperation()` for description
- `@ApiResponse()` for response types
- `@ApiBearerAuth()` for auth requirement
- `@ApiProperty()` for DTO fields

Example:
```typescript
@ApiTags('Phones')
@Controller('phones')
export class PhoneController {
  @ApiOperation({ summary: 'Get phone by barcode' })
  @ApiResponse({ status: 200, type: PhoneResponseDto })
  @ApiResponse({ status: 404, description: 'Phone not found' })
  @ApiBearerAuth()
  @Get('barcode/:barcode')
  async findByBarcode(@Param('barcode') barcode: string) {
    return this.phoneService.findByBarcode(barcode);
  }
}
```

Access Swagger: `http://localhost:5000/api/docs`

---

## Performance Considerations

1. **Indexes:**
   - `Customer.phoneNumber` (unique, for fast search)
   - `Phone.barcode` (unique)
   - `Phone.imei` (unique, partial for null values)
   - `Phone.status` (for filtering inventory)
   - `Sale.saleDate`, `Purchase.purchaseDate` (for reports)

2. **Query Optimization:**
   - Use `leftJoinAndSelect` for relations
   - Paginate all list endpoints
   - Use QueryBuilder for complex reports
   - Add indexes to foreign keys

3. **Caching (Future):**
   - Cache report results (Redis)
   - Cache customer balances (invalidate on payment)

---

## Security Checklist

- [ ] All financial endpoints require authentication
- [ ] Role-based guards on all controllers
- [ ] Input validation on all DTOs
- [ ] SQL injection prevention (TypeORM parameterized queries)
- [ ] Audit trail on all financial operations
- [ ] Soft delete for financial records (no hard delete)
- [ ] CORS restricted to frontend origin only

---

## Verification Steps

After each milestone:
1. Run unit tests: `npm run test`
2. Run E2E tests: `npm run test:e2e`
3. Test in Swagger UI manually
4. Verify migration up/down works
5. Check audit logs (createdBy, updatedBy)
6. Test role-based access control
7. Verify data integrity (no orphaned records)

---

## Dependencies to Add

```bash
# Barcode generation
npm install bwip-js @types/bwip-js

# Date utilities
npm install date-fns

# Decimal handling (if needed for precision)
npm install decimal.js
```

---

## Next Steps After Backend Complete

1. Seed database with realistic test data (10 customers, 50 phones, 20 sales, etc.)
2. Performance test with large datasets
3. Deploy to staging environment
4. Frontend integration testing
5. Security audit
6. Load testing (Artillery or k6)
