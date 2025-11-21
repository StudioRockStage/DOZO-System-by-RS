# 📦 Deployment Checklist - DOZO v3.7

## Warranty System by RockStage

---

## 🎯 ARCHIVOS A SUBIR AL SERVIDOR

### ⚠️ CRÍTICOS (Deben subirse para v3.7)

1. **`includes/class-warranty-core.php`** (Modificado)
   - Endpoint: `ajax_get_category_stats()`
   - Hook: `wp_ajax_rs_get_category_stats`
   - Fix: Key mismatch `'enabled'` → `'active'`

2. **`assets/js/admin-categories.js`** (Modificado)
   - Función: `reloadCategoryStats()`
   - Auto-test: `rsTestDynamicCounters()`
   - 6 puntos de integración

3. **`includes/class-warranty-product-linker.php`** (Nuevo - v3.6)
   - Vinculación automática productos ↔ categorías
   - Autodiagnóstico de vínculos

4. **`rockstage-warranty-system.php`** (Modificado - v3.6)
   - Carga de `class-warranty-product-linker.php`
   - Inicialización de `RS_Warranty_Product_Linker`

### ✅ RECOMENDADOS (Features completos)

5. **`templates/public/warranty-verifier.php`** (Nuevo - v3.2)
   - Verificador inteligente de pedidos

6. **`assets/js/warranty-verifier.js`** (Nuevo - v3.2)
   - JavaScript del verificador

7. **`includes/class-warranty-frontend.php`** (Modificado - v3.2)
   - Soporte para modo verifier

8. **`includes/class-warranty-admin.php`** (Modificado - v3.5)
   - Enqueue de admin-categories.js

### 📚 DOCUMENTACIÓN (Opcional)

- `DOZO-V3.7-FINAL-REPORT.md`
- `DOZO-V3.6-FINAL-REPORT.md`
- `DOZO-V3.5-FINAL-REPORT.md`
- `DOZO-COMPLETE-SUMMARY.md`
- `TESTING-GUIDE-v3.7.md`
- `DEPLOYMENT-CHECKLIST-v3.7.md` (este archivo)

---

## 🚀 DEPLOYMENT STEPS

### Pre-Deployment

```bash
1. Backup current plugin folder
   cp -r rockstage-warranty-system rockstage-warranty-system.backup

2. Backup database
   wp db export backup-$(date +%Y%m%d).sql
```

### Deployment

```bash
1. Upload archivos vía FTP/SFTP a:
   /wp-content/plugins/rockstage-warranty-system/

2. Verificar permisos:
   chmod 644 includes/*.php
   chmod 644 assets/js/*.js
   chmod 755 rockstage-warranty-system/
```

### Post-Deployment

```bash
1. Limpiar cache:
   - Browser: Ctrl + Shift + R
   - WordPress: WP Admin → Settings → Clear Cache
   - CDN: Clear cache si aplica

2. Habilitar debug (temporal):
   wp-config.php → define('WP_DEBUG', true);

3. Primera sincronización:
   WP Admin → Garantías → Configuración → Categorías
   → Click "Sincronizar con WooCommerce"

4. Verificar logs:
   tail -f wp-content/debug.log | grep "DOZO v3.6"

   Expected:
   "DOZO v3.6: Vinculados 47 productos totales..."

5. Run auto-test:
   Console (F12) → rsTestDynamicCounters()

   Expected:
   ✅ DOZO v3.7: Todos los tests pasados.

6. Testing manual:
   - Guardar una categoría
   - Verificar contadores actualizan
   - Verificar tabla actualiza sin reload
```

---

## ✅ VALIDATION CHECKLIST

### Backend Validation

- [ ] Plugin activates without errors
- [ ] Menu "Garantías" visible in WP Admin
- [ ] Dashboard loads correctly
- [ ] Settings → Categorías tab loads
- [ ] "Sincronizar con WooCommerce" funciona
- [ ] Counters show real numbers (NOT "0 y 0")
- [ ] Debug log shows "DOZO v3.6: Vinculados..."

### Frontend Validation

- [ ] Create page with `[rs_warranty_form]`
- [ ] Shortcode renders correctly
- [ ] Create test order in WooCommerce
- [ ] Enter order number in verifier
- [ ] Products with warranty appear
- [ ] Progress bars show correct percentages
- [ ] Claim form appears if warranty valid

### Console Validation

- [ ] Open Console (F12)
- [ ] Execute: `rsTestDynamicCounters()`
- [ ] All 4 tests pass
- [ ] Counter refresh log appears
- [ ] No JavaScript errors

### Product Meta Validation

- [ ] WP Admin → Productos → Edit product
- [ ] Custom Fields section
- [ ] `_rs_warranty_days` exists (e.g., 365)
- [ ] `_rs_warranty_active` exists (1 or 0)
- [ ] `_rs_warranty_text` exists (e.g., "1 año de garantía")

---

## 🐛 TROUBLESHOOTING

### Issue: Counters Still "0 y 0"

**Check:**

1. Clear browser cache (Ctrl + Shift + R)
2. Verify `admin-categories.js` loads (Network tab)
3. Run `rsTestDynamicCounters()` → should pass all tests
4. Manually execute: `rsReloadCategoryStats()`
5. Click "Sincronizar con WooCommerce"

**Fix:**

- If test fails on step 1 → Check HTML has `#activeCount`
- If test fails on step 2 → Verify JS file uploaded
- If test fails on step 3 → Check `rsWarrantyAdmin` is localized

### Issue: Verifier Says "No Products"

**Check:**

1. WP Admin → Productos → Edit product
2. Custom Fields → Look for `_rs_warranty_days`
3. If missing → Click "Restaurar Predeterminadas" in Categories tab
4. Check debug.log for "DOZO v3.6: Vinculados..."

**Fix:**

- If meta missing → Re-sync categories
- If meta exists but verifier fails → Check key 'active' in categories

### Issue: JavaScript Error

**Check:**

1. Console (F12) → Look for red errors
2. Verify jQuery loaded: `console.log(jQuery.fn.jquery)`
3. Verify `rsWarrantyAdmin` defined: `console.log(rsWarrantyAdmin)`

**Fix:**

- Clear cache and hard refresh
- Check file uploaded correctly
- Verify no syntax errors in JS file

---

## 📊 SUCCESS METRICS

### Visual

- ✅ Counters update to real numbers (e.g., "8 activas, 2 inactivas")
- ✅ Table refreshes without page reload
- ✅ Notifications appear after operations
- ✅ No loading spinners stuck

### Console

- ✅ No JavaScript errors (red text)
- ✅ Logs appear: "✅ DOZO v3.7: Contadores actualizados..."
- ✅ Auto-test passes: `rsTestDynamicCounters()` returns `true`

### Server

- ✅ Debug log shows: "DOZO v3.6: Vinculados X productos..."
- ✅ No PHP errors in debug.log
- ✅ Operations complete in < 2s

---

## 🔄 ROLLBACK PLAN

Si algo falla:

```bash
1. Restore backup:
   rm -rf rockstage-warranty-system
   cp -r rockstage-warranty-system.backup rockstage-warranty-system

2. Restore database:
   wp db import backup-YYYYMMDD.sql

3. Clear cache y reactivar plugin
```

---

## 📞 SUPPORT CONTACTS

**Developer:** RockStage Development Team  
**Plugin:** Warranty System by RockStage  
**Version:** 1.0.0  
**DOZO Level:** v3.7

**Documentation:**

- `/DOZO-V3.7-FINAL-REPORT.md`
- `/TESTING-GUIDE-v3.7.md`
- `/DOZO-COMPLETE-SUMMARY.md`

---

## ✅ FINAL CHECKLIST

- [ ] All files uploaded
- [ ] Cache cleared
- [ ] Debug enabled (temporary)
- [ ] Categories synchronized
- [ ] Auto-test executed (passes)
- [ ] Manual testing completed
- [ ] Logs verified
- [ ] Product meta verified
- [ ] Frontend verifier tested
- [ ] No errors in console or debug.log

---

**🎉 Si todos los checks pasan → Plugin está 100% funcional! 🚀**

---

_Last Updated: 2025-10-13_  
_DOZO Level: v3.7_  
_Status: Ready for Production_
