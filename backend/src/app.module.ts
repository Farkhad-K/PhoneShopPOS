import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtRoleGuard } from './auth/guards/jwt-auth.guard';
import { UserModule } from './user/user.module';
import { CustomerModule } from './customer/customer.module';
import { SupplierModule } from './supplier/supplier.module';
import { PurchaseModule } from './purchase/purchase.module';
import { RepairModule } from './repair/repair.module';
import { SaleModule } from './sale/sale.module';
import { PhoneModule } from './phone/phone.module';

import { ClsUserInterceptor } from './common/interceptors/cls-user.interceptor';
import { AuditSubscriber } from './common/subscribers/audit.subscriber';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB'),
        autoLoadEntities: true,
        synchronize: false, // Disabled for production - use migrations
        logging: true,
        migrations: [__dirname + '/migrations/*.{ts,js}'],
        migrationsRun: false, // Run migrations manually
      }),
    }),
    UserModule,
    AuthModule,
    CustomerModule,
    SupplierModule,
    PurchaseModule,
    RepairModule,
    SaleModule,
    PhoneModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtRoleGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ClsUserInterceptor },
    AuditSubscriber,
  ],
})
export class AppModule {}
