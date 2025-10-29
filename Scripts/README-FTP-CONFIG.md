# 🔐 FTP Configuration for DOZO Remote Deploy

## Setup Instructions

Before running the remote deployment script, you need to configure your FTP credentials.

### Edit ftp-config.json

Located at: `Scripts/ftp-config.json`

Replace the placeholder values with your actual FTP credentials:

```json
{
  "host": "ftp.vapedot.mx",
  "user": "YOUR_ACTUAL_FTP_USERNAME",
  "password": "YOUR_ACTUAL_FTP_PASSWORD",
  "port": 21,
  "secure": false
}
```

### Security Note

⚠️ **IMPORTANT**: This file contains sensitive credentials. 

- Do NOT commit this file to version control
- Keep it secure and private
- Consider adding `Scripts/ftp-config.json` to your `.gitignore`

### Running the Deployment

Once configured, run:

```bash
npm run deploy
```

Or directly:

```bash
node dozo-phase11-remote-deploy.js
```

### What the Script Does

1. ✅ Validates FTP credentials
2. ✅ Finds latest ZIP in `Empaquetado/Ready/`
3. ✅ Uploads ZIP and update.json to remote server
4. ✅ Validates HTTP accessibility
5. ✅ Generates deployment report

### Deployment Target

- **Remote Directory**: `/public_html/updates/warranty-system/`
- **Public URL**: `https://updates.vapedot.mx/warranty-system/`

---

*DOZO System by RockStage Solutions*

