import prisma from "../src/prisma/client";


async function main() {
  const roles = ["CUSTOMER", "ADMIN", "VENDOR"];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: {
        name: role,
        description: `${role} role`,
      },
    });
  }
  await prisma.product.createMany({
    data: [
      {
        name: "Premium Wireless Headphones",
        description: "Noise cancelling wireless headphones",
        price: 149.99,
        category: "Electronics",
        stock: 15,
        rating: 4.5,
      },
      {
        name: "Smart Watch Series 5",
        description: "Advanced smartwatch with fitness tracking",
        price: 299.99,
        category: "Electronics",
        stock: 10,
        rating: 4.8,
      },
    ],
  });

  console.log("Roles seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
