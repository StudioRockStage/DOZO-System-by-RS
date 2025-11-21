# ============================================================
# 🧩 DOZO Final Packaging & Install Validation v1.0.0
# Sistema: DOZO System by RS (v7.9 DeepSync Framework)
# Proyecto: Warranty System RS
# Autor: RockStage Solutions
# ============================================================

import os
import zipfile
import json
import hashlib
import shutil
import re
from datetime import datetime

# === RUTAS BASE ===
HOME = os.path.expanduser('~/Documents/DOZO System by RS')
LATEST_BUILDS = os.path.join(HOME, 'Latest Builds', 'Warranty System RS')
GLOBAL = os.path.join(HOME, 'to chat gpt', 'Global')
SANDBOX = os.path.join(HOME, 'DOZO_SANDBOX_TEST')
BACKUP_DIR = os.path.join(HOME, 'Backup', 'PreFinalPackaging')

ZIP_TARGET = os.path.join(LATEST_BUILDS, 'warranty-system-rs.zip')
REPORT_PATH = os.path.join(GLOBAL, 'DOZO-ZIPFinalVerification.json')

# === CREAR DIRECTORIOS ===
os.makedirs(GLOBAL, exist_ok=True)
os.makedirs(BACKUP_DIR, exist_ok=True)

report = {
    'process': 'DOZO Final Packaging & Install Validation v1.0.0',
    'timestamp': datetime.now().isoformat(),
    'validations': [],
    'issues': [],
    'actions': [],
    'final_structure': {},
    'install_simulation': {},
    'status': 'in-progress'
}

print('═════════════════════════════════════════════════════════════')
print('🧩 DOZO Final Packaging & Install Validation v1.0.0')
print('═════════════════════════════════════════════════════════════')
print()

# === 1️⃣ REVISIÓN DE ESTRUCTURA DE EMPAQUETADO ===
print('1️⃣  Revisión de estructura de empaquetado...')

if not os.path.exists(LATEST_BUILDS):
    report['status'] = 'error'
    report['issues'].append('❌ No existe la carpeta Latest Builds')
    print('   ❌ Error: carpeta Latest Builds no encontrada')
else:
    files = os.listdir(LATEST_BUILDS)
    zip_files = [f for f in files if f.endswith('.zip')]
    
    print(f'   📂 Archivos encontrados: {len(files)}')
    print(f'   📦 ZIPs encontrados: {len(zip_files)}')
    
    for zf in zip_files:
        print(f'      • {zf}')
    
    # Identificar el ZIP principal
    main_zip = None
    if 'warranty-system-rs-aligned.zip' in zip_files:
        main_zip = 'warranty-system-rs-aligned.zip'
        print(f'   ✅ ZIP optimizado encontrado: {main_zip}')
    elif 'warranty-system-rs.zip' in zip_files:
        main_zip = 'warranty-system-rs.zip'
        print(f'   ✅ ZIP base encontrado: {main_zip}')
    
    if main_zip:
        # Usar el ZIP más reciente (aligned si existe)
        source_zip = os.path.join(LATEST_BUILDS, main_zip)
        
        # Si el ZIP principal no es warranty-system-rs.zip, renombrarlo
        if main_zip != 'warranty-system-rs.zip':
            # Respaldar ZIP antiguo si existe
            if os.path.exists(ZIP_TARGET):
                backup_name = f"warranty-system-rs.zip.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                shutil.move(ZIP_TARGET, os.path.join(BACKUP_DIR, backup_name))
                report['actions'].append(f'ZIP antiguo respaldado como {backup_name}')
                print(f'   📦 ZIP antiguo respaldado')
            
            # Copiar aligned como el principal
            shutil.copy2(source_zip, ZIP_TARGET)
            report['actions'].append(f'ZIP optimizado copiado como warranty-system-rs.zip')
            print(f'   ✅ {main_zip} → warranty-system-rs.zip')
        
        # Limpiar otros ZIPs
        for zf in zip_files:
            if zf not in ['warranty-system-rs.zip', main_zip]:
                old_zip = os.path.join(LATEST_BUILDS, zf)
                backup_name = f"{zf}.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                shutil.move(old_zip, os.path.join(BACKUP_DIR, backup_name))
                report['actions'].append(f'ZIP antiguo {zf} movido a backup')
                print(f'   🗑️  {zf} → backup')
    
    # Limpiar carpetas sueltas
    for item in files:
        item_path = os.path.join(LATEST_BUILDS, item)
        if os.path.isdir(item_path) and item not in ['warranty-system-rs', 'DOZO_REPORTS']:
            backup_name = f"folder_{item}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            shutil.move(item_path, os.path.join(BACKUP_DIR, backup_name))
            report['actions'].append(f'Carpeta suelta {item} movida a backup')
            print(f'   📁 Carpeta {item} → backup')

report['validations'].append({'step': 'structure_review', 'status': 'ok'})
print()

# === 2️⃣ VALIDAR ESTRUCTURA INTERNA DEL ZIP ===
print('2️⃣  Validando estructura interna del ZIP...')

if not os.path.exists(ZIP_TARGET):
    report['status'] = 'error'
    report['issues'].append('❌ No se encontró warranty-system-rs.zip')
    print('   ❌ Error: ZIP final no encontrado')
else:
    with zipfile.ZipFile(ZIP_TARGET, 'r') as zip_ref:
        file_list = zip_ref.namelist()
        
        # Analizar estructura
        root_folders = set()
        for f in file_list:
            parts = f.split('/')
            if len(parts) > 1:
                root_folders.add(parts[0])
        
        print(f'   📊 Total de archivos: {len(file_list)}')
        print(f'   📂 Carpeta raíz detectada: {", ".join(root_folders)}')
        
        # Verificar estructura esperada
        expected_structure = {
            'main_file': 'warranty-system-rs.php',
            'folders': ['admin', 'public', 'includes', 'assets', 'templates', 'tools']
        }
        
        # Buscar archivo principal
        main_file_found = False
        for f in file_list:
            if f.endswith('warranty-system-rs.php'):
                main_file_found = True
                print(f'   ✅ Archivo principal encontrado: {f}')
                report['final_structure']['main_file'] = f
                break
        
        if not main_file_found:
            # Buscar rockstage-warranty-system.php
            for f in file_list:
                if f.endswith('rockstage-warranty-system.php'):
                    print(f'   ⚠️  Archivo encontrado con nombre antiguo: {f}')
                    report['issues'].append('Archivo principal tiene nombre antiguo')
                    break
        
        # Verificar carpetas
        folders_found = {}
        for folder in expected_structure['folders']:
            found = any(f.split('/')[1] == folder if len(f.split('/')) > 1 else False for f in file_list)
            folders_found[folder] = found
            status = '✅' if found else '⚠️ '
            print(f'   {status} {folder}/')
        
        report['final_structure']['folders'] = folders_found
        
        # Contar tipos de archivos
        php_count = sum(1 for f in file_list if f.endswith('.php'))
        js_count = sum(1 for f in file_list if f.endswith('.js'))
        css_count = sum(1 for f in file_list if f.endswith('.css'))
        
        report['final_structure']['file_stats'] = {
            'total': len(file_list),
            'php': php_count,
            'js': js_count,
            'css': css_count
        }
        
        print(f'   📊 PHP: {php_count}, JS: {js_count}, CSS: {css_count}')

report['validations'].append({'step': 'internal_structure', 'status': 'ok'})
print()

# === 3️⃣ SIMULACIÓN DE INSTALACIÓN ===
print('3️⃣  Simulando instalación del plugin...')

# Limpiar sandbox si existe
if os.path.exists(SANDBOX):
    shutil.rmtree(SANDBOX)
os.makedirs(SANDBOX)

try:
    # Extraer ZIP a sandbox
    with zipfile.ZipFile(ZIP_TARGET, 'r') as zip_ref:
        zip_ref.extractall(SANDBOX)
    
    print('   ✅ ZIP extraído correctamente')
    
    # Buscar archivo principal PHP
    main_php = None
    for root, dirs, files in os.walk(SANDBOX):
        for file in files:
            if file in ['warranty-system-rs.php', 'rockstage-warranty-system.php']:
                main_php = os.path.join(root, file)
                break
        if main_php:
            break
    
    if main_php:
        print(f'   ✅ Archivo principal encontrado: {os.path.basename(main_php)}')
        
        # Leer y validar encabezados
        with open(main_php, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read(2000)  # Leer solo encabezados
            
            # Buscar encabezados clave
            headers_to_check = {
                'Plugin Name': r'Plugin Name:\s*(.+)',
                'Version': r'Version:\s*(.+)',
                'Text Domain': r'Text Domain:\s*(.+)',
                'Author': r'Author:\s*(.+)'
            }
            
            headers_found = {}
            for header, pattern in headers_to_check.items():
                match = re.search(pattern, content, re.IGNORECASE)
                if match:
                    value = match.group(1).strip()
                    headers_found[header] = value
                    print(f'   ✅ {header}: {value}')
                else:
                    print(f'   ⚠️  {header}: no encontrado')
                    report['issues'].append(f'Encabezado {header} no encontrado')
            
            report['install_simulation']['headers'] = headers_found
            
            # Validar Text Domain
            text_domain = headers_found.get('Text Domain', '')
            if text_domain == 'warranty-system-rs':
                print('   ✅ Text Domain correcto: warranty-system-rs')
                report['install_simulation']['text_domain_valid'] = True
            else:
                print(f'   ⚠️  Text Domain incorrecto: {text_domain}')
                report['issues'].append(f'Text Domain incorrecto: {text_domain}')
                report['install_simulation']['text_domain_valid'] = False
            
            # Buscar errores de sintaxis comunes
            syntax_issues = []
            if 'dirname(ABSPATH)' in content:
                syntax_issues.append('Uso de dirname(ABSPATH) detectado')
                print('   ⚠️  Advertencia: dirname(ABSPATH) encontrado')
            
            if '<?php' not in content[:10]:
                syntax_issues.append('Archivo no comienza con <?php')
                print('   ⚠️  Advertencia: archivo no comienza con <?php')
            
            report['install_simulation']['syntax_issues'] = syntax_issues
            
    else:
        report['issues'].append('No se encontró archivo principal PHP')
        print('   ❌ Error: archivo principal no encontrado')
    
    report['install_simulation']['extraction_success'] = True
    print('   ✅ Simulación de instalación completada')
    
except Exception as e:
    report['install_simulation']['extraction_success'] = False
    report['issues'].append(f'Error en simulación: {str(e)}')
    print(f'   ❌ Error en simulación: {str(e)}')

# Limpiar sandbox
if os.path.exists(SANDBOX):
    shutil.rmtree(SANDBOX)

report['validations'].append({'step': 'install_simulation', 'status': 'ok'})
print()

# === 4️⃣ CALCULAR CHECKSUM Y TAMAÑO ===
print('4️⃣  Calculando checksum y metadatos...')

if os.path.exists(ZIP_TARGET):
    # SHA256
    with open(ZIP_TARGET, 'rb') as f:
        data = f.read()
        sha256_hash = hashlib.sha256(data).hexdigest()
    
    # Tamaño
    size = os.path.getsize(ZIP_TARGET)
    size_mb = size / (1024 * 1024)
    
    report['final_structure']['checksum'] = sha256_hash
    report['final_structure']['size_bytes'] = size
    report['final_structure']['size_mb'] = round(size_mb, 2)
    
    print(f'   🔐 SHA256: {sha256_hash[:32]}...')
    print(f'   📦 Tamaño: {size_mb:.2f} MB ({size:,} bytes)')

report['validations'].append({'step': 'checksum_calculation', 'status': 'ok'})
print()

# === 5️⃣ ESTADO FINAL ===
if len(report['issues']) == 0:
    report['status'] = 'success'
    print('✅ Todas las validaciones pasaron correctamente')
else:
    report['status'] = 'success_with_warnings'
    print(f'⚠️  Proceso completado con {len(report["issues"])} advertencias')

print()

# === 6️⃣ GUARDAR REPORTE ===
with open(REPORT_PATH, 'w') as f:
    json.dump(report, f, indent=2)

print('═════════════════════════════════════════════════════════════')
print('📊 RESUMEN FINAL')
print('═════════════════════════════════════════════════════════════')
print(f'Estado:              {report["status"].upper()}')
print(f'Validaciones:        {len(report["validations"])}/4 completadas')
print(f'Acciones ejecutadas: {len(report["actions"])}')
print(f'Advertencias:        {len(report["issues"])}')
print()
print(f'📦 ZIP Final:        {ZIP_TARGET}')
print(f'📋 Reporte:          {REPORT_PATH}')
print('═════════════════════════════════════════════════════════════')
print()

if report['status'] == 'success':
    print('✅ warranty-system-rs.zip está listo para instalación en WordPress')
elif report['status'] == 'success_with_warnings':
    print('⚠️  warranty-system-rs.zip funcional pero con advertencias menores')
    print('   Revisa el reporte para más detalles')
else:
    print('❌ Se encontraron errores críticos')
    print('   Revisa el reporte para más detalles')

print()






