/**
 * Script de migración: copia cargas desde la ruta antigua a la nueva con plantas.
 *
 * Ruta antigua: cargas / {dayId} / {provider}
 * Ruta nueva:   cargas / {dayId} / plantas / superPollo / {provider}
 *
 * Contadores antigua: cargas / {dayId} / _counters / {provider}
 * Contadores nueva:   cargas / {dayId} / plantas / superPollo / _counters / {provider}
 *
 * Uso:
 *   1. Descarga la clave de cuenta de servicio desde Firebase Console:
 *      Proyecto > Configuración > Cuentas de servicio > Generar nueva clave privada
 *   2. Guarda el JSON como scripts/serviceAccountKey.json (o define GOOGLE_APPLICATION_CREDENTIALS)
 *   3. npm install (firebase-admin debe estar instalado)
 *   4. node scripts/migrate-cargas-to-plantas.cjs
 *
 * Opcional: node scripts/migrate-cargas-to-plantas.cjs --dry-run  (solo muestra qué se migraría)
 */

const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

const PROVIDERS = ["tr", "tg", "al", "av", "an"];
const PLANTA_ID = "superPollo";
const DRY_RUN = process.argv.includes("--dry-run");

function getCredentials() {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (envPath && fs.existsSync(envPath)) {
    return envPath;
  }
  const localPath = path.join(__dirname, "serviceAccountKey.json");
  if (fs.existsSync(localPath)) {
    return localPath;
  }
  throw new Error(
    "No se encontró la clave de cuenta de servicio. " +
      "Crea scripts/serviceAccountKey.json o define GOOGLE_APPLICATION_CREDENTIALS."
  );
}

async function migrate() {
  const credPath = getCredentials();
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(require(credPath)) });
  }
  const db = admin.firestore();

  const cargasRef = db.collection("cargas");
  const daysSnap = await cargasRef.get();

  if (daysSnap.empty) {
    console.log("No hay documentos en la colección 'cargas'. Nada que migrar.");
    return;
  }

  let totalCargas = 0;
  let totalCounters = 0;

  for (const dayDoc of daysSnap.docs) {
    const dayId = dayDoc.id;
    console.log(`\n--- Día: ${dayId} ---`);

    for (const provider of PROVIDERS) {
      const oldColRef = db.collection("cargas").doc(dayId).collection(provider);
      const snap = await oldColRef.get();

      if (snap.empty) {
        continue;
      }

      const newColRef = db
        .collection("cargas")
        .doc(dayId)
        .collection("plantas")
        .doc(PLANTA_ID)
        .collection(provider);

      console.log(`  Proveedor ${provider}: ${snap.size} documento(s)`);

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (DRY_RUN) {
          console.log(`    [dry-run] Copiaría ${docSnap.id}`);
        } else {
          await newColRef.doc(docSnap.id).set(data);
        }
        totalCargas++;
      }
    }

    // Migrar contadores
    const countersRef = db.collection("cargas").doc(dayId).collection("_counters");
    const countersSnap = await countersRef.get();

    if (!countersSnap.empty) {
      const newCountersRef = db
        .collection("cargas")
        .doc(dayId)
        .collection("plantas")
        .doc(PLANTA_ID)
        .collection("_counters");

      for (const counterDoc of countersSnap.docs) {
        const data = counterDoc.data();
        if (DRY_RUN) {
          console.log(`  [dry-run] Contador ${counterDoc.id}`);
        } else {
          await newCountersRef.doc(counterDoc.id).set(data);
        }
        totalCounters++;
      }
    }
  }

  console.log("\n--- Resumen ---");
  console.log(`Documentos de cargas copiados: ${totalCargas}`);
  console.log(`Contadores copiados: ${totalCounters}`);
  if (DRY_RUN) {
    console.log("(Modo dry-run: no se escribió nada en Firestore)");
  } else {
    console.log("Migración completada. La app ya usa la ruta con plantas.");
  }
}

migrate().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
