import { spawnSync } from "node:child_process";
import { access, copyFile, mkdir, open, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(projectRoot, "app/certificates.json");
const outputDir = path.join(projectRoot, "public/certificates");
const [sourceArg, titleArg, issuerArg, dateArg] = process.argv.slice(2);

if (!sourceArg) {
  console.error('Usage: npm run add:certificate -- "/path/to/certificate.pdf"');
  process.exit(1);
}

function runSips(args) {
  const result = spawnSync("sips", args, { encoding: "utf8" });
  if (result.error) throw new Error("Could not run sips. This certificate command requires macOS.", { cause: result.error });
  if (result.status !== 0) throw new Error(result.stderr.trim() || "Could not render the PDF preview.");
  return result.stdout;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const source = path.resolve(sourceArg);
  if (path.extname(source).toLowerCase() !== ".pdf") throw new Error("Choose a PDF file.");
  const file = await open(source, "r");
  try {
    const signature = Buffer.alloc(5);
    await file.read(signature, 0, 5, 0);
    if (signature.toString() !== "%PDF-") throw new Error("The selected file is not a valid PDF.");
  } finally {
    await file.close();
  }

  const defaultTitle = path.basename(source, path.extname(source)).replace(/[-_]+/g, " ");
  const terminal = process.stdin.isTTY ? createInterface({ input: process.stdin, output: process.stdout }) : null;
  let title;
  let issuer;
  let date;
  try {
    title = (titleArg ?? (terminal ? await terminal.question(`Title [${defaultTitle}]: `) : "")).trim() || defaultTitle;
    issuer = (issuerArg ?? (terminal ? await terminal.question("Issuer (optional): ") : "")).trim();
    date = (dateArg ?? (terminal ? await terminal.question("Date, e.g. October 2025 (optional): ") : "")).trim();
  } finally {
    terminal?.close();
  }

  const certificates = JSON.parse(await readFile(manifestPath, "utf8"));
  if (!Array.isArray(certificates)) throw new Error("app/certificates.json must contain a list.");
  const baseSlug = (title.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    || path.basename(source, ".pdf").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    || "certificate");
  await mkdir(outputDir, { recursive: true });

  let slug = baseSlug;
  let suffix = 2;
  while (certificates.some(item => item.pdf === `/certificates/${slug}.pdf`)
    || await exists(path.join(outputDir, `${slug}.pdf`))
    || await exists(path.join(outputDir, `${slug}.png`))) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const pdfPath = path.join(outputDir, `${slug}.pdf`);
  const imagePath = path.join(outputDir, `${slug}.png`);
  const temporaryManifest = `${manifestPath}.${process.pid}.tmp`;
  try {
    await copyFile(source, pdfPath);
    runSips(["-s", "format", "png", pdfPath, "--out", imagePath]);
    const dimensions = runSips(["-g", "pixelWidth", "-g", "pixelHeight", imagePath]);
    const width = Number(dimensions.match(/pixelWidth:\s*(\d+)/)?.[1]);
    const height = Number(dimensions.match(/pixelHeight:\s*(\d+)/)?.[1]);
    if (!width || !height) throw new Error("Could not read the preview image dimensions.");

    certificates.push({
      title, issuer, date,
      image: `/certificates/${slug}.png`,
      pdf: `/certificates/${slug}.pdf`,
      width, height,
    });
    await writeFile(temporaryManifest, `${JSON.stringify(certificates, null, 2)}\n`);
    await rename(temporaryManifest, manifestPath);
  } catch (error) {
    await Promise.allSettled([unlink(pdfPath), unlink(imagePath), unlink(temporaryManifest)]);
    throw error;
  }

  console.log(`Added "${title}" to the certificates section.`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
