import { z } from "zod";

export const checkoutSchema = z.object({
  items: z.array(
    z.object({
      id: z.coerce.number(),
      name: z.string(),
      price: z.coerce.number(),
      quantity: z.coerce.number().min(1),
    })
  ).min(1),

  address: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(5),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
  }),
});
