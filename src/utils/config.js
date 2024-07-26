import * as dotenv from 'dotenv'
dotenv.config()

const config = {
  VERYFI_VALIDATE_URL: process.env.VERYFI_VALIDATE_URL,
  VERYFI_PROCESS: process.env.VERYFI_PROCESS,
  VERYFI_CLIENT_ID: process.env.VERYFI_CLIENT_ID,
  VERYFI_CLIENT_SECRET: process.env.VERYFI_CLIENT_SECRET,
  VERYFI_USERNAME: process.env.VERYFI_USERNAME,
  VERYFI_API_KEY: process.env.VERIFY_API_KEY,
  VERYFI_BASE_URL: process.env.VERYFI_BASE_URL,

  SUPERLIKERS_URL: process.env.SUPERLIKERS_URL,
  TENA_CAMPAIGN_ID: process.env.TENA_CAMPAIGN_ID,
  TENA_API_KEY: process.env.TENA_API_KEY
}

export default config
