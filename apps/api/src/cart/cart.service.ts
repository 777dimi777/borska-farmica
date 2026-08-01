import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { cartInclude, emptyCart, mapCart } from './cart.mapper';
@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}
  empty() {
    return emptyCart();
  }
  async read(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: cartInclude,
    });
    return cart ? mapCart(cart) : emptyCart();
  }
}
