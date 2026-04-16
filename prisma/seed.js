async function main() {
  console.info("Prisma seed stub: no demo data is defined yet.");
  console.info(
    "Issue #2 should add the first real schema-backed seed records."
  );
}

main().catch((error) => {
  console.error("Prisma seed stub failed unexpectedly.");
  console.error(error);
  process.exitCode = 1;
});
