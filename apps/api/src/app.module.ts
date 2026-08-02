import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { AdminAuditModule } from './admin-audit/admin-audit.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { AdminCategoriesModule } from './admin-categories/admin-categories.module';
import { AdminProductsModule } from './admin-products/admin-products.module';
import { CategoriesModule } from './categories/categories.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { CustomerAuthModule } from './customer-auth/customer-auth.module';
import { CheckoutModule } from './checkout/checkout.module';
import { OrdersModule } from './orders/orders.module';
import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module';
import { AdminCustomersModule } from './admin-customers/admin-customers.module';
import { AdminAuditViewerModule } from './admin-audit-viewer/admin-audit-viewer.module';
import { AdminExportsModule } from './admin-exports/admin-exports.module';
import { MaintenanceModule } from './maintenance/maintenance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
        PORT: Joi.number().port().default(4000),
        FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
        DATABASE_URL: Joi.string().required(),
        TRUST_PROXY: Joi.boolean().truthy('true').falsy('false').default(false),
        JSON_BODY_LIMIT: Joi.string()
          .pattern(/^\d+(kb|mb)$/i)
          .default('100kb'),
        JWT_ACCESS_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_SECRET: Joi.string()
          .min(32)
          .invalid(Joi.ref('JWT_ACCESS_SECRET'))
          .required(),
        JWT_ACCESS_TTL: Joi.number().integer().min(60).default(900),
        JWT_REFRESH_TTL: Joi.number().integer().min(3600).default(604800),
        ADMIN_REFRESH_COOKIE_NAME: Joi.string().default('bf_admin_refresh'),
        AUTH_COOKIE_SECURE: Joi.boolean()
          .truthy('true')
          .falsy('false')
          .default(false),
        CUSTOMER_JWT_ACCESS_SECRET: Joi.string()
          .min(32)
          .invalid(Joi.ref('JWT_ACCESS_SECRET'))
          .invalid(Joi.ref('JWT_REFRESH_SECRET'))
          .required(),
        CUSTOMER_JWT_REFRESH_SECRET: Joi.string()
          .min(32)
          .invalid(Joi.ref('JWT_ACCESS_SECRET'))
          .invalid(Joi.ref('JWT_REFRESH_SECRET'))
          .invalid(Joi.ref('CUSTOMER_JWT_ACCESS_SECRET'))
          .required(),
        CUSTOMER_JWT_ACCESS_TTL: Joi.number().integer().min(60).default(900),
        CUSTOMER_JWT_REFRESH_TTL: Joi.number()
          .integer()
          .min(3600)
          .default(2592000),
        CUSTOMER_REFRESH_COOKIE_NAME: Joi.string().default(
          'bf_customer_refresh',
        ),
        CUSTOMER_COOKIE_SECURE: Joi.boolean()
          .truthy('true')
          .falsy('false')
          .default(false),
        CUSTOMER_COOKIE_SAME_SITE: Joi.string()
          .valid('lax', 'strict', 'none')
          .default('lax'),
        CART_COOKIE_NAME: Joi.string().default('bf_cart'),
        CART_TTL_DAYS: Joi.number().integer().min(1).max(365).default(30),
        CART_COOKIE_SECURE: Joi.boolean()
          .truthy('true')
          .falsy('false')
          .default(false),
        CART_COOKIE_SAME_SITE: Joi.string()
          .valid('lax', 'strict', 'none')
          .default('lax'),
        AUTH_COOKIE_SAME_SITE: Joi.string()
          .valid('lax', 'strict', 'none')
          .default('lax'),
        IMAGE_STORAGE_PROVIDER: Joi.string()
          .valid('cloudinary')
          .default('cloudinary'),
        IMAGE_UPLOAD_ENABLED: Joi.boolean()
          .truthy('true')
          .falsy('false')
          .default(false),
        CLOUDINARY_CLOUD_NAME: Joi.string()
          .allow('')
          .when('IMAGE_UPLOAD_ENABLED', {
            is: true,
            then: Joi.string().required(),
          }),
        CLOUDINARY_API_KEY: Joi.string()
          .allow('')
          .when('IMAGE_UPLOAD_ENABLED', {
            is: true,
            then: Joi.string().required(),
          }),
        CLOUDINARY_API_SECRET: Joi.string()
          .allow('')
          .when('IMAGE_UPLOAD_ENABLED', {
            is: true,
            then: Joi.string().required(),
          }),
        CLOUDINARY_FOLDER: Joi.string()
          .pattern(/^[a-zA-Z0-9/_-]+$/)
          .default('borska-farmica'),
        IMAGE_UPLOAD_MAX_BYTES: Joi.number()
          .integer()
          .min(1024)
          .default(8388608),
        IMAGE_UPLOAD_MAX_WIDTH: Joi.number()
          .integer()
          .min(1)
          .max(20000)
          .default(6000),
        IMAGE_UPLOAD_MAX_HEIGHT: Joi.number()
          .integer()
          .min(1)
          .max(20000)
          .default(6000),
        IMAGE_OUTPUT_MAX_DIMENSION: Joi.number()
          .integer()
          .min(320)
          .max(6000)
          .default(2400),
        IMAGE_MAX_PER_PRODUCT: Joi.number()
          .integer()
          .min(1)
          .max(50)
          .default(12),
        MAINTENANCE_JOBS_ENABLED: Joi.boolean()
          .truthy('true')
          .falsy('false')
          .default(false),
        ORDER_EXPIRATION_CRON: Joi.string()
          .pattern(/^(\\S+\\s+){4}\\S+$/)
          .default('*/5 * * * *'),
        ORDER_CONFIRMATION_TTL_HOURS: Joi.number()
          .integer()
          .min(1)
          .max(168)
          .default(24),
        MAINTENANCE_BATCH_SIZE: Joi.number()
          .integer()
          .min(1)
          .max(500)
          .default(100),
        MAINTENANCE_MAX_BATCHES: Joi.number()
          .integer()
          .min(1)
          .max(100)
          .default(10),
        CART_RETENTION_DAYS: Joi.number()
          .integer()
          .min(1)
          .max(3650)
          .default(30),
        SESSION_RETENTION_DAYS: Joi.number()
          .integer()
          .min(1)
          .max(3650)
          .default(90),
        DASHBOARD_PENDING_ATTENTION_HOURS: Joi.number()
          .integer()
          .min(1)
          .max(720)
          .default(24),
        SWAGGER_ENABLED: Joi.boolean()
          .truthy('true')
          .falsy('false')
          .default(true),
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    DatabaseModule,
    AdminAuthModule,
    AdminAuditModule,
    AdminCategoriesModule,
    AdminProductsModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    CustomerAuthModule,
    CheckoutModule,
    OrdersModule,
    AdminDashboardModule,
    AdminCustomersModule,
    AdminAuditViewerModule,
    AdminExportsModule,
    HealthModule,
    MaintenanceModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
