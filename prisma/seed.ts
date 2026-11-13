import {
  OrderChannel,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
  UserRole,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed production.");
  process.exit(1);
}

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=800&q=80`;

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.shopSettings.deleteMany();
  await prisma.shopMember.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.address.deleteMany();
  await prisma.order.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.platformSetting.deleteMany();

  const password = await hash("Shop@123", 10);
  const adminPass = await hash("Admin@123", 10);
  const customerPass = await hash("Customer@123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "NexDrop Admin",
      email: "admin@nexdrop.local",
      passwordHash: adminPass,
      role: UserRole.SUPER_ADMIN,
    },
  });

  const starter = await prisma.subscriptionPlan.create({
    data: {
      name: "Starter",
      slug: "starter",
      priceMonthly: 499,
      description: "One shop, POS and storefront.",
      features: ["1 shop", "POS", "Online storefront", "Email support"],
    },
  });
  const growth = await prisma.subscriptionPlan.create({
    data: {
      name: "Growth",
      slug: "growth",
      priceMonthly: 1499,
      description: "Reports, coupons and priority support.",
      features: ["Everything in Starter", "Coupons", "Reports", "Priority support"],
    },
  });
  await prisma.subscriptionPlan.create({
    data: {
      name: "Business",
      slug: "business",
      priceMonthly: 2999,
      description: "Multi-staff and advanced inventory.",
      features: ["Everything in Growth", "Staff seats", "Low-stock alerts"],
    },
  });

  await prisma.platformSetting.create({
    data: { key: "supportEmail", value: "hello@nexdrop.local" },
  });

  const shopsSpec = [
    {
      ownerName: "Anjali Menon",
      email: "nila@nexdrop.local",
      shopName: "Nila Provisions",
      slug: "nila-provisions",
      city: "Kochi",
      pin: "682001",
      category: "Grocery",
      desc: "Daily provisions, spices and Kerala staples from MG Road.",
      planId: growth.id,
      products: [
        ["Rice", "Matta Rice 5kg", "RICE-5", 389, 20, "Food"],
        ["Rice", "Ponni Rice 10kg", "PONNI-10", 620, 18, "Food"],
        ["Spices", "Black Pepper 200g", "PEP-200", 145, 40, "Food"],
        ["Spices", "Turmeric Powder 500g", "TUR-500", 95, 35, "Food"],
        ["Spices", "Red Chilli Powder 250g", "CHL-250", 78, 28, "Food"],
        ["Oils", "Coconut Oil 1L", "COCO-1", 265, 22, "Food"],
        ["Oils", "Gingelly Oil 500ml", "GING-500", 180, 16, "Food"],
        ["Pulses", "Toor Dal 1kg", "TOOR-1", 168, 30, "Food"],
        ["Pulses", "Green Gram 1kg", "MOONG-1", 142, 24, "Food"],
        ["Snacks", "Banana Chips 200g", "CHIP-200", 90, 40, "Food"],
        ["Snacks", "Mixture 250g", "MIX-250", 75, 32, "Food"],
        ["Tea", "Kannan Devan Tea 500g", "TEA-500", 210, 25, "Food"],
      ] as const,
    },
    {
      ownerName: "Faisal Rahman",
      email: "malabar@nexdrop.local",
      shopName: "Malabar Textiles",
      slug: "malabar-textiles",
      city: "Kozhikode",
      pin: "673001",
      category: "Apparel",
      desc: "Mundu, sarees and everyday wear from SM Street.",
      planId: starter.id,
      products: [
        ["Saree", "Kasavu Saree", "SAR-KAS", 2499, 8, "Handloom"],
        ["Saree", "Cotton Saree", "SAR-COT", 1299, 12, "Handloom"],
        ["Mundu", "White Mundu with Kasavu", "MUN-KAS", 890, 20, "Handloom"],
        ["Mundu", "Daily Mundu Pack of 2", "MUN-2", 540, 18, "Handloom"],
        ["Shirts", "Linen Shirt", "SHT-LIN", 1199, 10, "Malabar"],
        ["Shirts", "Cotton Formal Shirt", "SHT-FOR", 899, 14, "Malabar"],
        ["Kurtas", "Printed Kurta", "KUR-PR", 799, 11, "Malabar"],
        ["Kids", "Kids Cotton Set", "KID-SET", 649, 16, "Malabar"],
        ["Dupatta", "Silk Dupatta", "DUP-SL", 499, 22, "Handloom"],
        ["Towel", "Bath Towel Pair", "TOW-2", 399, 25, "Malabar"],
      ] as const,
    },
    {
      ownerName: "Meera Nair",
      email: "palakkad@nexdrop.local",
      shopName: "Palakkad Home",
      slug: "palakkad-home",
      city: "Palakkad",
      pin: "678001",
      category: "Home",
      desc: "Furniture and home goods for Kerala houses.",
      planId: growth.id,
      products: [
        ["Living", "Cane Lounge Chair", "FUR-CHAIR", 6490, 6, "Palakkad Home"],
        ["Living", "Round Coffee Table", "FUR-TABLE", 8990, 4, "Palakkad Home"],
        ["Living", "3-Seater Sofa", "FUR-SOFA", 28990, 3, "Palakkad Home"],
        ["Storage", "Teak Sideboard", "FUR-SIDE", 15990, 5, "Palakkad Home"],
        ["Decor", "Brass Lamp", "DEC-LAMP", 1290, 18, "Palakkad Home"],
        ["Decor", "Wall Mirror", "DEC-MIR", 2490, 9, "Palakkad Home"],
        ["Kitchen", "Clay Pot Set", "KIT-CLAY", 890, 20, "Palakkad Home"],
        ["Kitchen", "Wooden Chopping Board", "KIT-BRD", 590, 15, "Palakkad Home"],
        ["Bedroom", "Cotton Bedsheet King", "BED-KING", 1890, 12, "Palakkad Home"],
        ["Bedroom", "Cushion Set of 4", "BED-CUSH", 990, 14, "Palakkad Home"],
      ] as const,
    },
  ];

  const photo = [
    "photo-1586201375761-83865001e31c",
    "photo-1516684669134-de6f7c473a2a",
    "photo-1596040033229-a9821ebd058d",
    "photo-1599909533680-6a123a881b3d",
    "photo-1504674900247-0877df9cc836",
    "photo-1478144592103-25e218a04942",
    "photo-1542838132-92c53300491e",
    "photo-1615485290382-441e4d049cb5",
  ];

  const createdShops = [];

  for (const spec of shopsSpec) {
    const owner = await prisma.user.create({
      data: {
        name: spec.ownerName,
        email: spec.email,
        passwordHash: password,
        role: UserRole.SHOP_OWNER,
        phone: "9876500000",
      },
    });
    const shop = await prisma.shop.create({
      data: {
        name: spec.shopName,
        slug: spec.slug,
        description: spec.desc,
        status: "ACTIVE",
        ownerId: owner.id,
        members: { create: { userId: owner.id, role: "OWNER" } },
        settings: {
          create: {
            contactNumber: "0484-221100",
            email: spec.email,
            address: `${spec.shopName}, ${spec.city}`,
            city: spec.city,
            pinCode: spec.pin,
            businessCategory: spec.category,
            openingHours: "9:00–20:00",
            deliveryEnabled: true,
            pickupEnabled: true,
            deliveryCharge: 40,
            freeDeliveryAbove: 999,
            minOrderValue: 100,
            serviceablePins: [spec.pin, "682016", "673002", "678002"],
            storeOpen: true,
          },
        },
        subscriptions: {
          create: { planId: spec.planId, status: "ACTIVE", renewsAt: new Date("2027-01-01") },
        },
      },
    });
    createdShops.push(shop);

    const cats = new Map<string, string>();
    for (const [cat] of spec.products) {
      if (cats.has(cat)) continue;
      const created = await prisma.category.create({
        data: {
          shopId: shop.id,
          name: cat,
          slug: cat.toLowerCase().replace(/\s+/g, "-"),
        },
      });
      cats.set(cat, created.id);
    }

    let i = 0;
    for (const [cat, name, sku, price, stock, brand] of spec.products) {
      const discount = i % 4 === 0 ? Math.round(price * 0.9) : null;
      const product = await prisma.product.create({
        data: {
          shopId: shop.id,
          categoryId: cats.get(cat),
          name,
          description: `${name} from ${spec.shopName}. Quality local stock, billed in INR.`,
          sku,
          brand,
          price,
          discountPrice: discount,
          images: [img(photo[i % photo.length])],
          status: "ACTIVE",
          featured: i < 3,
          variants: {
            create: { shopId: shop.id, name: "Default", sku: `${sku}-DEF` },
          },
        },
        include: { variants: true },
      });
      await prisma.inventory.create({
        data: {
          shopId: shop.id,
          productId: product.id,
          variantId: product.variants[0].id,
          quantity: stock,
          lowStockAt: 8,
        },
      });
      await prisma.stockMovement.create({
        data: {
          shopId: shop.id,
          inventoryId: (await prisma.inventory.findUnique({ where: { productId: product.id } }))!.id,
          type: "ADDED",
          quantity: stock,
          reason: "Opening stock",
          userId: owner.id,
        },
      });
      i += 1;
    }

    await prisma.coupon.create({
      data: {
        shopId: shop.id,
        code: "WELCOME10",
        type: "PERCENT",
        value: 10,
        minOrder: 500,
        active: true,
      },
    });
  }

  const customers = [];
  for (const [name, email] of [
    ["Rahul Krishnan", "customer@nexdrop.local"],
    ["Divya Suresh", "divya@nexdrop.local"],
    ["Arun Babu", "arun@nexdrop.local"],
  ] as const) {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: customerPass,
        role: UserRole.CUSTOMER,
        phone: "9800000000",
        customerProfile: { create: { phone: "9800000000" } },
        addresses: {
          create: {
            label: "Home",
            line1: "12, Temple Road",
            city: "Kochi",
            state: "Kerala",
            pinCode: "682001",
            phone: "9800000000",
            isDefault: true,
          },
        },
      },
      include: { addresses: true },
    });
    customers.push(user);
  }

  const nila = createdShops[0];
  const products = await prisma.product.findMany({
    where: { shopId: nila.id },
    include: { inventory: true, variants: true },
  });

  const onlineItems = products.slice(0, 2);
  const posItems = products.slice(2, 4);
  const customer = customers[0];

  const onlineTotal = onlineItems.reduce((s, p) => s + Number(p.price), 0);
  const online = await prisma.order.create({
    data: {
      orderNumber: "ND-2026-1001",
      shopId: nila.id,
      customerId: customer.id,
      addressId: customer.addresses[0].id,
      channel: OrderChannel.ONLINE,
      status: OrderStatus.PENDING,
      subtotal: onlineTotal,
      discount: 0,
      deliveryCharge: 40,
      total: onlineTotal + 40,
      stockDeducted: false,
      items: {
        create: onlineItems.map((p) => ({
          productId: p.id,
          variantId: p.variants[0]?.id,
          name: p.name,
          sku: p.sku,
          quantity: 1,
          unitPrice: p.price,
          lineTotal: p.price,
        })),
      },
      history: { create: { status: "PENDING", note: "Placed online" } },
      payment: {
        create: {
          shopId: nila.id,
          method: PaymentMethod.COD,
          status: PaymentStatus.PENDING,
          amount: onlineTotal + 40,
        },
      },
    },
  });

  const posTotal = posItems.reduce((s, p) => s + Number(p.price), 0);
  const owner = await prisma.user.findUnique({ where: { email: "nila@nexdrop.local" } });
  await prisma.order.create({
    data: {
      orderNumber: "ND-2026-1002",
      shopId: nila.id,
      cashierId: owner!.id,
      channel: OrderChannel.POS,
      status: OrderStatus.DELIVERED,
      subtotal: posTotal,
      total: posTotal,
      stockDeducted: true,
      items: {
        create: posItems.map((p) => ({
          productId: p.id,
          variantId: p.variants[0]?.id,
          name: p.name,
          sku: p.sku,
          quantity: 1,
          unitPrice: p.price,
          lineTotal: p.price,
        })),
      },
      history: { create: { status: "DELIVERED", note: "POS sale" } },
      payment: {
        create: {
          shopId: nila.id,
          method: PaymentMethod.UPI,
          status: PaymentStatus.RECORDED,
          amount: posTotal,
        },
      },
    },
  });

  for (const p of posItems) {
    if (!p.inventory) continue;
    await prisma.inventory.update({
      where: { id: p.inventory.id },
      data: { quantity: { decrement: 1 } },
    });
    await prisma.stockMovement.create({
      data: {
        shopId: nila.id,
        inventoryId: p.inventory.id,
        type: "DEDUCTED",
        quantity: 1,
        reason: "POS ND-2026-1002",
        userId: owner!.id,
      },
    });
  }

  await prisma.review.create({
    data: {
      shopId: nila.id,
      productId: products[0].id,
      userId: customer.id,
      rating: 5,
      comment: "Fresh stock, billed quickly.",
    },
  });

  await prisma.activityLog.createMany({
    data: [
      { shopId: nila.id, userId: owner!.id, action: "SHOP_ACTIVATED" },
      { shopId: nila.id, userId: customer.id, action: "ORDER_PLACED", meta: online.id },
    ],
  });

  const pendingOwner = await prisma.user.create({
    data: {
      name: "Sajan Varghese",
      email: "pending@nexdrop.local",
      passwordHash: password,
      role: UserRole.SHOP_OWNER,
    },
  });
  await prisma.shop.create({
    data: {
      name: "Thrissur Stationery",
      slug: "thrissur-stationery",
      description: "Pending approval sample shop.",
      status: "PENDING",
      ownerId: pendingOwner.id,
      members: { create: { userId: pendingOwner.id, role: "OWNER" } },
      settings: {
        create: {
          city: "Thrissur",
          pinCode: "680001",
          businessCategory: "Stationery",
        },
      },
    },
  });

  console.log("Seeded NexDrop demo data.");
  console.log("Admin     admin@nexdrop.local / Admin@123");
  console.log("Shop      nila@nexdrop.local / Shop@123");
  console.log("Customer  customer@nexdrop.local / Customer@123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
