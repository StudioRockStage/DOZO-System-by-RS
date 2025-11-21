# DOZO System - Cloudflare Infrastructure

This directory contains Terraform configuration for deploying the DOZO System updates infrastructure on Cloudflare.

## 🎯 What This Creates

- **R2 Bucket**: `dozo-updates` - Storage for application update files
- **Cloudflare Worker**: Serves files from R2 bucket with proper binary handling
- **DNS Record**: CNAME for `updates.rockstage.mx` pointing to the worker
- **Worker Route**: Routes traffic from subdomain to the worker

## 📋 Prerequisites

1. **Cloudflare Account** with:
   - A domain (rockstage.mx) added to Cloudflare
   - API Token with permissions:
     - `R2:Edit`
     - `Workers:Edit`
     - `Zone:Edit`

2. **Terraform** installed (>= 1.0)

   ```bash
   # macOS
   brew install terraform

   # Or download from: https://www.terraform.io/downloads
   ```

3. **Get Your Credentials**:
   - **API Token**: https://dash.cloudflare.com/profile/api-tokens
   - **Account ID**: Found in Cloudflare dashboard URL or right sidebar
   - **Zone ID**: Found in your domain's Overview page

## 🚀 Quick Start

### Step 1: Copy and Configure Variables

```bash
cd infra/cloudflare
cp terraform.tfvars.sample terraform.tfvars
```

Edit `terraform.tfvars` and fill in your credentials:

```hcl
cloudflare_api_token = "your_actual_api_token_here"
cloudflare_account_id = "your_account_id_here"
cloudflare_zone_id = "your_zone_id_here"
```

⚠️ **Important**: Never commit `terraform.tfvars` to version control! It contains sensitive credentials.

### Step 2: Initialize Terraform

```bash
terraform init
```

This downloads the Cloudflare provider plugin.

### Step 3: Review Changes

```bash
terraform plan
```

This shows what resources will be created without making changes.

### Step 4: Apply Configuration

```bash
terraform apply
```

Or to skip confirmation:

```bash
terraform apply -auto-approve
```

### Step 5: Verify Deployment

After successful deployment:

1. Visit `https://updates.rockstage.mx` - Should show "DOZO R2 Updates Endpoint ✅"
2. Upload a file to the R2 bucket via Cloudflare dashboard
3. Access it via `https://updates.rockstage.mx/your-file.dmg`

## 📦 Uploading Files to R2

### Via Cloudflare Dashboard

1. Go to R2 in Cloudflare dashboard
2. Select `dozo-updates` bucket
3. Click "Upload" and select your files
4. Files are immediately available via the worker endpoint

### Via Wrangler CLI (Recommended for CI/CD)

```bash
# Install Wrangler
npm install -g wrangler

# Authenticate
wrangler login

# Upload file
wrangler r2 object put dozo-updates/DOZO-v2.6.5.dmg --file=./dist/DOZO-v2.6.5.dmg
```

## 🔧 Configuration Options

You can override defaults in `terraform.tfvars`:

```hcl
r2_bucket_name     = "custom-bucket-name"
worker_script_name = "custom-worker-name"
subdomain          = "updates"
domain             = "rockstage.mx"
```

## 📊 Outputs

After applying, Terraform outputs:

- `r2_bucket_name`: Name of the created bucket
- `worker_name`: Name of the Cloudflare Worker
- `endpoint_url`: Full URL of the updates endpoint
- `r2_bucket_public_url`: Public URL for accessing files

## 🗑️ Destroying Resources

To remove all created resources:

```bash
terraform destroy
```

⚠️ **Warning**: This will delete the R2 bucket and all its contents!

## 🔒 Security Notes

- ✅ `.gitignore` should include `terraform.tfvars` and `.terraform/`
- ✅ API tokens should have minimal required permissions
- ✅ Use environment variables for CI/CD pipelines
- ✅ Rotate API tokens regularly

## 📝 File Structure

```
infra/cloudflare/
├── main.tf                    # Main Terraform configuration
├── variables.tf               # Variable definitions
├── worker.js                  # Cloudflare Worker script
├── terraform.tfvars.sample    # Sample variables (safe to commit)
├── terraform.tfvars           # Your credentials (DO NOT COMMIT)
└── README.md                  # This file
```

## 🐛 Troubleshooting

### Error: "API Token is invalid"

- Verify your token has correct permissions
- Check token hasn't expired
- Ensure token is for the correct account

### Error: "Zone not found"

- Verify `cloudflare_zone_id` is correct
- Ensure domain is added to Cloudflare
- Check domain status is "Active"

### Worker returns 500 errors

- Check Worker logs in Cloudflare dashboard
- Verify R2 bucket binding name matches (`DOZO_BUCKET`)
- Ensure files exist in the bucket

### DNS not resolving

- Wait 5-10 minutes for DNS propagation
- Verify CNAME record in Cloudflare dashboard
- Check DNS settings are "Proxied" (orange cloud)

## 📚 Additional Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Terraform Cloudflare Provider](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs)

## ✅ Verification Checklist

- [ ] Terraform initialized successfully
- [ ] `terraform plan` shows expected resources
- [ ] `terraform apply` completed without errors
- [ ] Root endpoint (`/`) returns "DOZO R2 Updates Endpoint ✅"
- [ ] Test file uploads and downloads work
- [ ] DNS resolves correctly (`updates.rockstage.mx`)
- [ ] Worker logs show successful requests

---

**Created for:** DOZO System by RockStage Solutions  
**Last Updated:** October 2025
