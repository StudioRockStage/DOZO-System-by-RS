# ============================================================
# 🧩 DOZO Installability Test v1.0.0 (Base Validation)
# Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
# Proyecto: Warranty System RS
# Autor: RockStage Solutions
# Fecha: 2025-10-19
# ============================================================

import zipfile
import os
import json
import hashlib

# Directorios base
dozo_base = os.path.expanduser('~/Documents/DOZO System by RS')
latest_builds = os.path.join(dozo_base, 'Latest Builds', 'Warranty System RS')
report_path = os.path.join(dozo_base, 'to chat gpt', 'Global', 'DOZO-Installability-Report.json')

# Nombre del ZIP base
zip_name = 'warranty-system-rs.zip'
zip_path = os.path.join(latest_builds, zip_name)

report = {
    "test": "DOZO Installability Test v1.0.0",
    "zip_found": os.path.exists(zip_path),
    "zip_path": zip_path,
    "plugin_files": [],
    "result": "pending",
    "checksum": None,
    "issues": []
}

# 1️⃣ Verificar existencia del ZIP
if not os.path.exists(zip_path):
    report["result"] = "error"
    report["issues"].append(f"No se encontró el archivo {zip_name} en Latest Builds.")
else:
    # 2️⃣ Verificar contenido del ZIP
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        files = zip_ref.namelist()
        report["plugin_files"] = files[:25]  # muestra los primeros 25 archivos para vista rápida
        report["total_files"] = len(files)

        # Validar estructura esperada
        expected_folders = ['admin/', 'includes/', 'public/', 'templates/', 'assets/']
        missing = [f for f in expected_folders if not any(p.startswith('warranty-system-rs/' + f) for p in files)]

        if missing:
            report["issues"].append(f"Faltan carpetas esperadas: {', '.join(missing)}")
            report["result"] = "incomplete"
        else:
            report["result"] = "ok"

        # 3️⃣ Verificar archivo principal PHP
        if not any(p.endswith('warranty-system-rs.php') for p in files):
            report["issues"].append("No se encontró el archivo principal warranty-system-rs.php.")
            report["result"] = "error"
        else:
            report["main_file_found"] = True

        # Contar tipos de archivos
        php_files = [f for f in files if f.endswith('.php')]
        js_files = [f for f in files if f.endswith('.js')]
        css_files = [f for f in files if f.endswith('.css')]
        
        report["file_stats"] = {
            "total": len(files),
            "php": len(php_files),
            "js": len(js_files),
            "css": len(css_files)
        }

    # 4️⃣ Generar checksum SHA256
    with open(zip_path, 'rb') as f:
        data = f.read()
        sha256_hash = hashlib.sha256(data).hexdigest()
        report["checksum"] = sha256_hash
        report["file_size"] = len(data)

# 5️⃣ Guardar reporte global
os.makedirs(os.path.dirname(report_path), exist_ok=True)
with open(report_path, 'w') as f:
    json.dump(report, f, indent=2)

print("═════════════════════════════════════════════════════════════")
print("🧩 DOZO Installability Test v1.0.0")
print("═════════════════════════════════════════════════════════════")
print()
print("ZIP encontrado:", report["zip_found"])
if report.get("file_size"):
    size_mb = report["file_size"] / (1024 * 1024)
    print(f"Tamaño: {size_mb:.2f} MB ({report['file_size']:,} bytes)")
print("Resultado:", report["result"])
print()
if report["issues"]:
    print("⚠️  Problemas detectados:")
    for issue in report["issues"]:
        print(" -", issue)
else:
    print("✅ Estructura válida y lista para instalación.")
print()
if report.get("file_stats"):
    stats = report["file_stats"]
    print(f"📊 Estadísticas de archivos:")
    print(f"   Total: {stats['total']}")
    print(f"   PHP:   {stats['php']}")
    print(f"   JS:    {stats['js']}")
    print(f"   CSS:   {stats['css']}")
print()
if report.get("checksum"):
    print(f"🔐 SHA256: {report['checksum'][:32]}...")
print()
print("📋 Reporte generado en:", report_path)
print("═════════════════════════════════════════════════════════════")






