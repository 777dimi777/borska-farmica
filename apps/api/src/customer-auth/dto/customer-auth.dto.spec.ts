import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CustomerRegisterDto } from './customer-auth.dto';
const valid = {
  firstName: 'Miloš',
  lastName: 'Dimitrijević',
  email: ' MILOS@Example.COM ',
  phone: '0641234567',
  password: 'duga-lozinka-123',
};
describe('Customer auth DTO', () => {
  it('normalizes email and Serbian phone to E.164', async () => {
    const dto = plainToInstance(CustomerRegisterDto, valid);
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.email).toBe('milos@example.com');
    expect(dto.phone).toBe('+381641234567');
  });
  it.each([
    { email: 'bad' },
    { password: 'short' },
    { firstName: '<b>Miloš</b>' },
  ])('rejects invalid identity input %#', async (patch) => {
    const dto = plainToInstance(CustomerRegisterDto, { ...valid, ...patch });
    expect((await validate(dto)).length).toBeGreaterThan(0);
  });
  it('rejects invalid phone during normalization', () =>
    expect(() =>
      plainToInstance(CustomerRegisterDto, { ...valid, phone: 'not-a-phone' }),
    ).toThrow('Invalid phone number.'));
});
