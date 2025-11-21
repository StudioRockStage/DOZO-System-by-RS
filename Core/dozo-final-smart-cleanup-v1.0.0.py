# ============================================================
# 🧩 DOZO Final Structure & Smart Cleanup v1.0.0 (Enhanced Consolidation Edition)
# Sistema: DOZO System by RS (v7.9 DeepSync Framework)
# Proyecto: Warranty System RS
# Autor: RockStage Solutions
# Fecha: 2025-10-19
# ============================================================
# Propósito: Limpieza inteligente + verificación global + consolidación final.
# Resultado: Entorno DOZO limpio, validado y con warranty-system-rs.zip listo.

import os
import zipfile
import json
import shutil
from datetime import datetime

# === RUTAS BASE ===
HOME = os.path.expanduser('~/Documents/DOZO System by RS')
GLOBAL = os.path.join(HOME, 'to chat gpt', 'Global')
LATEST_BUILDS = os.path.join(HOME, 'Latest Builds', 'Warranty System RS')
WORKFLOW_DB = os.path.join(HOME, 'Workflow DB')
BACKUP_DIR = os.path.join(HOME, 'Backup', 'FinalSmartCleanup')

ZIP_BASE = os.path.join(LATEST_BUILDS, 'warranty-system-rs.zip')
TEMP_DIR = os.path.join(LATEST_BUILDS, 'TEMP_REPACK')
ZIP_ALIGNED = os.path.join(LATEST_BUILDS, 'warranty-system-rs-aligned.zip')
REPORT_PATH = os.path.join(GLOBAL, 'DOZO-FinalSmartCleanup-Report.json')

# === CREAR DIRECTORIOS ===
os.makedirs(GLOBAL, exist_ok=True)
os.makedirs(BACKUP_DIR, exist_ok=True)

report = {
    'process': 'DOZO Final Structure & Smart Cleanup v1.0.0',
    'timestamp': datetime.now().isoformat(),
    'checked_dirs': [],
    'aligned_folders': [],
    'moved_to_backup': [],
    'deleted': [],
    'actions': [],
    'status': 'in-progress'
}

print('═════════════════════════════════════════════════════════════')
print('🧩 DOZO Final Structure & Smart Cleanup v1.0.0')
print('   Enhanced Consolidation Edition')
print('═════════════════════════════════════════════════════════════')
print()

# === 1️⃣ VERIFICAR CARPETAS GLOBALES ===
print('1️⃣  Verificando estructura de carpetas globales...')
CRITICAL_FOLDERS = [
    'Claude AI', 'Cursor AI', 'ChatGPT AI', 'Workflow DB', 'Latest Builds'
]
for folder in CRITICAL_FOLDERS:
    path = os.path.join(HOME, folder)
    if os.path.exists(path):
        report['checked_dirs'].append({'folder': folder, 'status': 'ok'})
        print(f'   ✅ {folder}')
    else:
        report['checked_dirs'].append({'folder': folder, 'status': 'missing'})
        os.makedirs(path, exist_ok=True)
        report['actions'].append(f'Carpeta {folder} creada automáticamente.')
        print(f'   ⚠️  {folder} (creada)')
print()

# === 2️⃣ LIMPIEZA GLOBAL SEGURA ===
print('2️⃣  Ejecutando limpieza global segura...')
CLEAN_TARGETS = [
    os.path.join(HOME, 'Empaquetado'),
    os.path.join(HOME, 'Latest Updates'),
    os.path.join(HOME, 'Shared'),
    GLOBAL
]

backup_count = 0
delete_count = 0

for target in CLEAN_TARGETS:
    if not os.path.exists(target):
        continue
    for root, dirs, files in os.walk(target):
        for file in files:
            if file.lower().endswith(('.log', '.tmp', '.bak', '.old')) or 'complete' in file.lower():
                src = os.path.join(root, file)
                backup_name = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file}"
                dst = os.path.join(BACKUP_DIR, backup_name)
                try:
                    shutil.move(src, dst)
                    report['moved_to_backup'].append(dst)
                    backup_count += 1
                except Exception as e:
                    report['actions'].append(f'Error moviendo {file}: {str(e)}')
        for dir_ in dirs[:]:  # Create a copy to safely modify during iteration
            if dir_.lower() in ['temp', '__macosx']:
                full = os.path.join(root, dir_)
                try:
                    shutil.rmtree(full)
                    report['deleted'].append(full)
                    delete_count += 1
                except Exception as e:
                    report['actions'].append(f'Error eliminando {dir_}: {str(e)}')

print(f'   📦 Archivos movidos a backup: {backup_count}')
print(f'   🗑️  Directorios temporales eliminados: {delete_count}')
report['actions'].append(f'Limpieza global ejecutada: {backup_count} respaldados, {delete_count} eliminados.')
print()

# === 3️⃣ VERIFICAR Y ALINEAR PLUGIN BASE ===
print('3️⃣  Verificando estructura del plugin base...')
if not os.path.exists(ZIP_BASE):
    report['status'] = 'error'
    report['actions'].append('❌ No se encontró warranty-system-rs.zip en Latest Builds.')
    print('   ❌ No se encontró warranty-system-rs.zip')
else:
    print(f'   ✅ ZIP base encontrado: {os.path.getsize(ZIP_BASE):,} bytes')
    
    # Extraer y analizar estructura
    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)
    os.makedirs(TEMP_DIR, exist_ok=True)
    
    with zipfile.ZipFile(ZIP_BASE, 'r') as zip_ref:
        zip_ref.extractall(TEMP_DIR)
    
    # Buscar carpetas desalineadas
    aligned_count = 0
    for root, dirs, _ in os.walk(TEMP_DIR):
        for sub in dirs:
            if sub in ['admin', 'public']:
                src = os.path.join(root, sub)
                dest = os.path.join(TEMP_DIR, sub)
                if src != dest and not os.path.exists(dest):
                    shutil.move(src, dest)
                    report['aligned_folders'].append(sub)
                    aligned_count += 1
                    print(f'   🔧 Carpeta {sub} realineada')
    
    if aligned_count == 0:
        print('   ✅ Estructura correcta, no se requiere realineación')
    
    # Reempaquetar
    print('   📦 Reempaquetando ZIP...')
    with zipfile.ZipFile(ZIP_ALIGNED, 'w', zipfile.ZIP_DEFLATED) as new_zip:
        for root, _, files in os.walk(TEMP_DIR):
            for file in files:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, TEMP_DIR)
                new_zip.write(abs_path, rel_path)
    
    # Limpiar temporal
    shutil.rmtree(TEMP_DIR)
    report['actions'].append('Estructura de plugin verificada y reempaquetada.')
    print(f'   ✅ ZIP alineado generado: {os.path.getsize(ZIP_ALIGNED):,} bytes')
print()

# === 4️⃣ VALIDACIÓN FINAL ===
print('4️⃣  Validación final...')
if os.path.exists(ZIP_ALIGNED):
    size = os.path.getsize(ZIP_ALIGNED)
    report['actions'].append(f'ZIP final generado correctamente: {size:,} bytes')
    report['status'] = 'success'
    print(f'   ✅ Validación exitosa')
    print(f'   📊 Tamaño final: {size / (1024*1024):.2f} MB')
else:
    report['status'] = 'error'
    report['actions'].append('❌ No se encontró el ZIP final tras el proceso.')
    print('   ❌ Error: ZIP final no encontrado')
print()

# === 5️⃣ GUARDAR REPORTE ===
with open(REPORT_PATH, 'w') as f:
    json.dump(report, f, indent=2)

print('═════════════════════════════════════════════════════════════')
print('📊 RESUMEN FINAL')
print('═════════════════════════════════════════════════════════════')
print(f'Estado del proceso:     {report["status"].upper()}')
print(f'Carpetas verificadas:   {len(report["checked_dirs"])}')
print(f'Archivos respaldados:   {len(report["moved_to_backup"])}')
print(f'Directorios eliminados: {len(report["deleted"])}')
print(f'Carpetas realineadas:   {len(report["aligned_folders"])}')
print()
print(f'📋 Reporte completo: {REPORT_PATH}')
print(f'📦 ZIP final: {ZIP_ALIGNED}')
print('═════════════════════════════════════════════════════════════')
print()
if report['status'] == 'success':
    print('✅ DOZO Final Smart Cleanup completado exitosamente')
else:
    print('⚠️  Proceso completado con advertencias')
print()






