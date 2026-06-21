import fs from "fs";
import path from "path";

export function loadEnvFallback() {
  if (!process.env.MISTRAL_API_KEY || !process.env.FINNHUB_API_KEY) {
    try {
      const envPath = path.join(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf8");
        envContent.split(/\r?\n/).forEach((line) => {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match) {
            const key = match[1];
            let value = (match[2] || "").trim();
            
            // Remove wrapping quotes if present
            if (value.length > 1 && value.startsWith('"') && value.endsWith('"')) {
              value = value.substring(1, value.length - 1);
            } else if (value.length > 1 && value.startsWith("'") && value.endsWith("'")) {
              value = value.substring(1, value.length - 1);
            }
            
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        });
      }
    } catch (e) {
      console.error("Failed to load .env.local fallback:", e);
    }
  }
}
