# ============================================================
# 🧩 DOZO Base Autodiagnostic v1.0.0
# Sistema: DOZO System by RS (v7.9 DeepSync Framework)
# Proyecto: Warranty System RS
# Autor: RockStage Solutions
# ============================================================

import os
import zipfile
import json
import stat
import re
from datetime import datetime
from pathlib import Path

# === RUTAS BASE ===
HOME = os.path.expanduser('~/Documents/DOZO System by RS')
LATEST_BUILDS = os.path.join(HOME, 'Latest Builds', 'Warranty System RS')
LATEST_UPDATES = os.path.join(HOME, 'Latest Updates')
EMPAQUETADO = os.path.join(HOME, 'Empaquetado')
GLOBAL = os.path.join(HOME, 'to chat gpt', 'Global')
WORKFLOW_DB = os.path.join(HOME, 'Workflow DB')

ZIP_TARGET = os.path.join(LATEST_BUILDS, 'warranty-system-rs.zip')
REPORT_PATH = os.path.join(GLOBAL, 'DOZO-Autodiagnostic-BaseReport.json')

# Archivos DOZO Core
DOZO_CORE = os.path.join(WORKFLOW_DB, 'DOZO-Core.json')
VERSIONS = os.path.join(WORKFLOW_DB, 'Versions.json')
ACTIVE_PLUGIN = os.path.join(WORKFLOW_DB, 'ActivePlugin.json')

report = {
    'process': 'DOZO Base Autodiagnostic v1.0.0',
    'timestamp': datetime.now().isoformat(),
    'checks': {
        'folder_existence': {},
        'zip_validation': {},
        'structure_validation': {},
        'permissions': {},
        'dozo_core_files': {}
    },
    'issues': [],
    'corrections': [],
    'status': 'in-progress'
}

print('═════════════════════════════════════════════════════════════')
print('🧩 DOZO Base Autodiagnostic v1.0.0')
print('   Sistema: DOZO System by RS (v7.9 DeepSync Framework)')
print('═════════════════════════════════════════════════════════════')
print()

# === 1️⃣ VERIFICACIÓN DE CARPETAS BASE ===
print('1️⃣  Verificación de carpetas base...')

critical_folders = {
    'Latest Builds': LATEST_BUILDS,
    'Latest Updates': LATEST_UPDATES,
    'Empaquetado': EMPAQUETADO,
    'Global': GLOBAL,
    'Workflow DB': WORKFLOW_DB
}

for name, path in critical_folders.items():
    if os.path.exists(path):
        status = 'ok'
        report['checks']['folder_existence'][name] = {'path': path, 'status': 'exists'}
        print(f'   ✅ {name}')
    else:
        status = 'created'
        os.makedirs(path, exist_ok=True)
        report['checks']['folder_existence'][name] = {'path': path, 'status': 'created'}
        report['corrections'].append(f'Carpeta {name} creada automáticamente')
        print(f'   ⚠️  {name} (creada automáticamente)')

print()

# === 2️⃣ VALIDACIÓN DEL ZIP BASE ===
print('2️⃣  Validación del ZIP base...')

if not os.path.exists(ZIP_TARGET):
    report['issues'].append('❌ No se encontró warranty-system-rs.zip')
    report['checks']['zip_validation']['exists'] = False
    print('   ❌ warranty-system-rs.zip no encontrado')
else:
    report['checks']['zip_validation']['exists'] = True
    print('   ✅ warranty-system-rs.zip encontrado')
    
    # Verificar tamaño
    size = os.path.getsize(ZIP_TARGET)
    size_mb = size / (1024 * 1024)
    report['checks']['zip_validation']['size_bytes'] = size
    report['checks']['zip_validation']['size_mb'] = round(size_mb, 2)
    print(f'   📦 Tamaño: {size_mb:.2f} MB ({size:,} bytes)')
    
    # Verificar que no esté corrupto
    try:
        with zipfile.ZipFile(ZIP_TARGET, 'r') as zip_ref:
            # Test de integridad
            bad_file = zip_ref.testzip()
            if bad_file:
                report['issues'].append(f'Archivo corrupto detectado: {bad_file}')
                report['checks']['zip_validation']['integrity'] = 'corrupted'
                print(f'   ❌ ZIP corrupto: {bad_file}')
            else:
                report['checks']['zip_validation']['integrity'] = 'ok'
                print('   ✅ Integridad del ZIP verificada')
            
            # Analizar estructura interna
            file_list = zip_ref.namelist()
            report['checks']['zip_validation']['total_files'] = len(file_list)
            
            # Detectar carpeta raíz
            root_folders = set()
            for f in file_list:
                parts = f.split('/')
                if len(parts) > 1:
                    root_folders.add(parts[0])
            
            if len(root_folders) == 1 and 'warranty-system-rs' in root_folders:
                report['checks']['zip_validation']['root_folder'] = 'ok'
                print('   ✅ Carpeta raíz única: warranty-system-rs/')
            else:
                report['issues'].append(f'Estructura de carpeta raíz inconsistente: {root_folders}')
                report['checks']['zip_validation']['root_folder'] = 'inconsistent'
                print(f'   ⚠️  Carpetas raíz detectadas: {", ".join(root_folders)}')
            
            # Verificar archivo principal
            main_file = None
            for f in file_list:
                if f.endswith('warranty-system-rs.php'):
                    main_file = f
                    break
            
            if main_file:
                report['checks']['zip_validation']['main_file'] = main_file
                print(f'   ✅ Archivo principal: {main_file}')
                
                # Leer encabezados
                content = zip_ref.read(main_file).decode('utf-8', errors='ignore')[:2000]
                
                # Extraer versión
                version_match = re.search(r'Version:\s*(.+)', content, re.IGNORECASE)
                if version_match:
                    version = version_match.group(1).strip()
                    report['checks']['zip_validation']['version'] = version
                    print(f'   ✅ Version detectada: {version}')
                
                # Extraer Text Domain
                text_domain_match = re.search(r'Text Domain:\s*(.+)', content, re.IGNORECASE)
                if text_domain_match:
                    text_domain = text_domain_match.group(1).strip()
                    report['checks']['zip_validation']['text_domain'] = text_domain
                    if text_domain == 'warranty-system-rs':
                        print(f'   ✅ Text Domain correcto: {text_domain}')
                    else:
                        report['issues'].append(f'Text Domain incorrecto: {text_domain}')
                        print(f'   ⚠️  Text Domain: {text_domain} (esperado: warranty-system-rs)')
            else:
                report['issues'].append('Archivo warranty-system-rs.php no encontrado')
                print('   ❌ warranty-system-rs.php no encontrado')
            
            # Verificar carpetas esperadas
            expected_folders = ['admin', 'public', 'includes', 'assets', 'templates', 'tools']
            folders_found = {}
            
            for folder in expected_folders:
                # Buscar en cualquier nivel
                found = any(folder in f for f in file_list)
                folders_found[folder] = found
                status_icon = '✅' if found else '⚠️ '
                print(f'   {status_icon} {folder}/')
            
            report['checks']['zip_validation']['folders'] = folders_found
            
    except zipfile.BadZipFile:
        report['issues'].append('ZIP está corrupto o no es un archivo ZIP válido')
        report['checks']['zip_validation']['integrity'] = 'bad_zip_file'
        print('   ❌ Error: archivo ZIP corrupto')
    except Exception as e:
        report['issues'].append(f'Error al validar ZIP: {str(e)}')
        print(f'   ❌ Error al validar: {str(e)}')

print()

# === 3️⃣ VERIFICACIÓN DE PERMISOS ===
print('3️⃣  Verificación de permisos...')

if os.path.exists(LATEST_BUILDS):
    try:
        # Verificar permisos de lectura/escritura
        can_read = os.access(LATEST_BUILDS, os.R_OK)
        can_write = os.access(LATEST_BUILDS, os.W_OK)
        
        report['checks']['permissions']['read'] = can_read
        report['checks']['permissions']['write'] = can_write
        
        if can_read and can_write:
            print('   ✅ Permisos de lectura/escritura: OK')
        else:
            report['issues'].append(f'Permisos insuficientes: read={can_read}, write={can_write}')
            print(f'   ⚠️  Permisos: read={can_read}, write={can_write}')
        
        # Obtener permisos octales
        if os.path.exists(ZIP_TARGET):
            st = os.stat(ZIP_TARGET)
            octal_perms = oct(st.st_mode)[-3:]
            report['checks']['permissions']['zip_permissions'] = octal_perms
            print(f'   📋 Permisos del ZIP: {octal_perms}')
        
    except Exception as e:
        report['issues'].append(f'Error al verificar permisos: {str(e)}')
        print(f'   ❌ Error: {str(e)}')

print()

# === 4️⃣ VALIDACIÓN DE ARCHIVOS DOZO CORE ===
print('4️⃣  Validación de archivos DOZO Core...')

dozo_files = {
    'DOZO-Core.json': DOZO_CORE,
    'Versions.json': VERSIONS,
    'ActivePlugin.json': ACTIVE_PLUGIN
}

for name, path in dozo_files.items():
    if os.path.exists(path):
        try:
            with open(path, 'r') as f:
                data = json.load(f)
            report['checks']['dozo_core_files'][name] = {'exists': True, 'valid_json': True}
            print(f'   ✅ {name} (válido)')
            
            # Validaciones específicas
            if name == 'DOZO-Core.json':
                if 'project_name' in data:
                    print(f'      • project_name: {data.get("project_name")}')
                if 'active_version' in data:
                    print(f'      • active_version: {data.get("active_version")}')
            
            elif name == 'Versions.json':
                if 'version_actual' in data:
                    print(f'      • version_actual: {data.get("version_actual")}')
                if 'estado' in data:
                    print(f'      • estado: {data.get("estado")}')
            
        except json.JSONDecodeError as e:
            report['checks']['dozo_core_files'][name] = {'exists': True, 'valid_json': False, 'error': str(e)}
            report['issues'].append(f'{name} contiene JSON inválido: {str(e)}')
            print(f'   ❌ {name} (JSON inválido)')
        except Exception as e:
            report['checks']['dozo_core_files'][name] = {'exists': True, 'error': str(e)}
            print(f'   ⚠️  {name} (error al leer: {str(e)})')
    else:
        report['checks']['dozo_core_files'][name] = {'exists': False}
        print(f'   ⚠️  {name} (no encontrado)')

print()

# === 5️⃣ ESTADO FINAL ===
print('5️⃣  Evaluación final...')

critical_issues = [i for i in report['issues'] if '❌' in i]
warnings = [i for i in report['issues'] if '⚠️' in i]

if len(critical_issues) == 0 and len(warnings) == 0:
    report['status'] = 'ok'
    final_status = '✅ SISTEMA EN PERFECTO ESTADO'
elif len(critical_issues) == 0:
    report['status'] = 'ok_with_warnings'
    final_status = '⚠️  SISTEMA FUNCIONAL CON ADVERTENCIAS MENORES'
else:
    report['status'] = 'needs_attention'
    final_status = '❌ SISTEMA REQUIERE ATENCIÓN'

print(f'   {final_status}')
print(f'   Problemas críticos: {len(critical_issues)}')
print(f'   Advertencias: {len(warnings)}')
print(f'   Correcciones automáticas: {len(report["corrections"])}')

print()

# === 6️⃣ GUARDAR REPORTE ===
os.makedirs(GLOBAL, exist_ok=True)
with open(REPORT_PATH, 'w') as f:
    json.dump(report, f, indent=2)

print('═════════════════════════════════════════════════════════════')
print('📊 RESUMEN DEL AUTODIAGNÓSTICO')
print('═════════════════════════════════════════════════════════════')
print()
print(f'Estado general:           {report["status"].upper()}')
print(f'Carpetas verificadas:     {len(critical_folders)}')
print(f'ZIP base:                 {"✅ OK" if report["checks"]["zip_validation"].get("exists") else "❌ NO ENCONTRADO"}')
print(f'Permisos:                 {"✅ OK" if report["checks"]["permissions"].get("read") and report["checks"]["permissions"].get("write") else "⚠️  REVISAR"}')
print(f'Archivos DOZO Core:       {sum(1 for v in report["checks"]["dozo_core_files"].values() if v.get("exists"))} de {len(dozo_files)} encontrados')
print()
print(f'📋 Reporte completo:      {REPORT_PATH}')
print('═════════════════════════════════════════════════════════════')
print()

if report['status'] == 'ok':
    print('✅ Sistema DOZO listo para operación')
    print('   El entorno está completamente validado y sin problemas.')
elif report['status'] == 'ok_with_warnings':
    print('⚠️  Sistema DOZO funcional con advertencias')
    print('   Revisa el reporte para detalles de las advertencias.')
else:
    print('❌ Sistema DOZO requiere atención')
    print('   Se detectaron problemas que deben resolverse.')
    print()
    print('Problemas detectados:')
    for issue in report['issues']:
        print(f'   • {issue}')

print()






