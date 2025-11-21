# 🧪 Testing Guide - DOZO v3.7

## Warranty System by RockStage

**Plugin:** Warranty System by RockStage  
**Version:** 1.0.0  
**DOZO Level:** v3.7 (Complete)

---

## 🚀 QUICK START (5 Minutes)

### Step 1: Upload & Activate

```bash
1. Upload plugin folder to /wp-content/plugins/
2. WP Admin → Plugins → Activate "Warranty System by RockStage"
3. Expected: No errors, menu "Garantías" appears
```

### Step 2: Initial Sync

```bash
1. WP Admin → Garantías → Configuración → Tab "Categorías"
2. Click "Sincronizar con WooCommerce"
3. Expected: "✅ Categorías sincronizadas: X"
4. Verify table shows categories
5. Verify counters: "X activas, Y inactivas" (NOT "0 y 0")
```

### Step 3: Run Auto-Test

```bash
1. Open Console (F12)
2. Execute: rsTestDynamicCounters()
3. Expected output:
   ✅ Test 1: Elementos existen
   ✅ Test 2: Función rsReloadCategoryStats existe
   ✅ Test 3: rsWarrantyAdmin está definido
   ✅ DOZO v3.7: Todos los tests pasados.
   ✅ DOZO v3.7: Contadores actualizados → 8 activas | 2 inactivas
```

---

## ✅ TEST CHECKLIST

### Backend Tests

- [ ] Plugin activates without errors
- [ ] Menu "Garantías" appears in WP Admin
- [ ] Dashboard loads correctly
- [ ] Settings page has 4 tabs
- [ ] Categories tab shows WooCommerce categories
- [ ] Counters show real numbers (not "0 y 0")

### Frontend Tests

- [ ] Create page with `[rs_warranty_form]`
- [ ] Page loads without errors
- [ ] Shortcode renders form
- [ ] Create test order in WooCommerce
- [ ] Enter order number in verifier
- [ ] Expected: Shows products with warranty
- [ ] Expected: Progress bars visible (green/yellow/red)

### Data Persistence Tests

- [ ] Save category configuration
- [ ] Verify table updates WITHOUT page reload
- [ ] Verify counters update (e.g., "1 activa, 0 inactivas")
- [ ] Check Console: "✅ DOZO v3.7: Contadores actualizados..."
- [ ] Edit category, save again
- [ ] Verify counter increments

### Product Linking Tests

- [ ] WP Admin → Productos → Edit any product
- [ ] Scroll to Custom Fields
- [ ] Verify meta exists: `_rs_warranty_days` (e.g., 365)
- [ ] Verify meta exists: `_rs_warranty_active` (1 or 0)
- [ ] Change category warranty config
- [ ] Save
- [ ] Refresh product page
- [ ] Verify meta updated

---

## 🐛 DEBUGGING COMMANDS

### Console Commands (F12)

```javascript
// Test counters
rsTestDynamicCounters();

// Manual refresh
rsReloadCategoryStats();

// Check variables
console.log(rsWarrantyAdmin);
console.log(typeof window.rsReloadCategoryStats);

// Check elements
console.log($("#activeCount").length);
console.log($("#activeCount").text());
```

### PHP Commands (functions.php)

```php
// Get statistics
add_action('admin_init', function() {
    if (isset($_GET['test_warranty'])) {
        $core = RS_Warranty_Core::get_instance();
        $stats = $core->get_category_stats();
        echo '<pre>';
        print_r($stats);
        echo '</pre>';
        exit;
    }
});
// Visit: /wp-admin/?test_warranty=1

// Get product meta
add_action('admin_init', function() {
    if (isset($_GET['test_product'])) {
        $product_id = 123; // Change to real product ID
        $days = get_post_meta($product_id, '_rs_warranty_days', true);
        $active = get_post_meta($product_id, '_rs_warranty_active', true);
        echo "Días: $days, Activo: $active";
        exit;
    }
});
// Visit: /wp-admin/?test_product=1
```

### WP-CLI Commands

```bash
# Get categories option
wp option get rs_warranty_categories --format=json

# Count products with warranty
wp post list --post_type=product --meta_key=_rs_warranty_days --format=count

# Check specific product
wp post meta list 123 | grep _rs_warranty
```

---

## 📊 EXPECTED LOGS

### Console Logs (Browser)

```
✅ DOZO v3.5: Table reloaded. Active: 8, Inactive: 2
✅ DOZO v3.7: Contadores actualizados → 8 activas | 2 inactivas (Total: 10)
```

### Server Logs (wp-content/debug.log)

```
DOZO v3.6: Vinculados 15 productos a categoría "Smartphones" (ID: 12) con 365 días de garantía
DOZO v3.6: Vinculados 47 productos totales con 8 categorías configuradas
DOZO v3.6: Categorías configuradas: 10 total, 8 activas, 2 inactivas
DOZO v3.6: Productos: 47 con garantía, 3 sin garantía (de 50 totales)
```

---

## ⚠️ COMMON ISSUES

### Issue 1: Counters Still Show "0 y 0"

**Solutions:**

1. Clear browser cache (Ctrl + Shift + R)
2. Verify `admin-categories.js` loads (Network tab)
3. Run `rsTestDynamicCounters()` in console
4. Re-sync: Click "Sincronizar con WooCommerce"

### Issue 2: Verifier Says "No Products with Warranty"

**Solutions:**

1. WP Admin → Garantías → Configuración → Categorías
2. Click "Restaurar Predeterminadas" (forces re-link)
3. Check debug.log for "DOZO v3.6: Vinculados X productos..."
4. Verify product meta exists (Custom Fields)

### Issue 3: Auto-Test Fails

**Solutions:**

1. Verify `rsWarrantyAdmin` is defined: `console.log(rsWarrantyAdmin)`
2. Verify jQuery loaded: `console.log(jQuery.fn.jquery)`
3. Verify file loads: Network tab → admin-categories.js
4. Hard refresh: Ctrl + Shift + R

---

## ✅ SUCCESS CRITERIA

### Visual Indicators

- ✅ Counters show real numbers (e.g., "8 activas, 2 inactivas")
- ✅ Table updates without full page reload
- ✅ Notifications appear (✅/❌/📝)
- ✅ Console logs appear after operations

### Functional Indicators

- ✅ Products have `_rs_warranty_days` meta
- ✅ Verifier shows products from order
- ✅ Progress bars calculate correctly
- ✅ Claim form appears if warranty valid

### Performance Indicators

- ✅ Operations complete in < 2s
- ✅ No JavaScript errors in console
- ✅ No PHP errors in debug.log
- ✅ Smooth UX without delays

---

## 📞 SUPPORT

### Quick Commands

```javascript
// Manual counter refresh
rsReloadCategoryStats();

// Run full test
rsTestDynamicCounters();

// Check config
console.log(rsWarrantyAdmin);
```

### Enable Debug Mode

```php
// wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

### View Logs

```bash
tail -f wp-content/debug.log | grep "DOZO"
```

---

**Last Updated:** 2025-10-13  
**DOZO Level:** v3.7  
**Status:** All Systems Functional ✅

---

_Quick reference guide for testing the Warranty System by RockStage after DOZO v3.7 implementation._
