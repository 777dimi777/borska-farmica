import { BadRequestException } from '@nestjs/common';
import { AdminVariantsService } from './admin-variants.service';
describe('variant business rules', () => {
  const service = new AdminVariantsService(
    {} as never,
    {} as never,
    {} as never,
  );
  const validate = (dto: object) =>
    (service as unknown as { validate(dto: object): void }).validate(dto);
  it('requires positive price and package/minimum/increment', () => {
    expect(() => validate({ price: '0' })).toThrow(BadRequestException);
    expect(() => validate({ packageAmount: '0' })).toThrow(BadRequestException);
    expect(() => validate({ minimumPurchaseQuantity: '0' })).toThrow(
      BadRequestException,
    );
    expect(() => validate({ purchaseIncrement: '0' })).toThrow(
      BadRequestException,
    );
  });
  it('requires compare-at price above price', () =>
    expect(() => validate({ price: '10.00', compareAtPrice: '10.00' })).toThrow(
      BadRequestException,
    ));
  it('allows fractional kilogram sales', () =>
    expect(() =>
      validate({
        price: '100.00',
        packageAmount: '0.500',
        minimumPurchaseQuantity: '0.500',
        purchaseIncrement: '0.250',
      }),
    ).not.toThrow());
});
