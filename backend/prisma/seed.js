const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@scoretec.com" },
    update: {},
    create: {
      nombre: "Administrador ScoreTec",
      email: "admin@scoretec.com",
      passwordHash,
      rol: "ADMIN",
      activo: true,
    },
  });

  console.log("Usuario administrador creado:");
  console.log({
    id: admin.id,
    nombre: admin.nombre,
    email: admin.email,
    rol: admin.rol,
  });
}

main()
  .catch((error) => {
    console.error("Error ejecutando seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
