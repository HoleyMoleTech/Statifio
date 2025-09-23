import { NEXI_CONFIG, type NexiPaymentRequest, type NexiPaymentResponse } from "@/lib/config/nexi"
import { createClient } from "@/lib/supabase/client"
import { parseNexiError, NexiPaymentError } from "@/lib/utils/nexi-errors"
import { sanitizePaymentData } from "@/lib/utils/payment-validation"

export class NexiPaymentService {
  private secretKey: string | null = null
  private checkoutKey: string | null = null
  private baseUrl: string

  constructor() {
    this.baseUrl = NEXI_CONFIG.getEndpoint()
  }

  // Initialize with API keys from database
  async initialize() {
    try {
      console.log("[v0] Initializing Nexi payment service...")
      const supabase = createClient()

      // Get Nexi API keys from database
      const { data: keys, error } = await supabase
        .from("api_keys")
        .select("key_type, key_value")
        .eq("is_active", true)
        .in("key_type", ["nexi_secret", "nexi_checkout"])
        .eq("environment", NEXI_CONFIG.isProduction ? "production" : "test")

      if (error) {
        console.error("[v0] Database error fetching Nexi keys:", error)
        throw error
      }

      console.log(
        "[v0] Found API keys:",
        keys?.map((k) => ({ type: k.key_type, hasValue: !!k.key_value })),
      )

      // Set keys
      keys?.forEach((key) => {
        if (key.key_type === "nexi_secret") {
          this.secretKey = key.key_value
        } else if (key.key_type === "nexi_checkout") {
          this.checkoutKey = key.key_value
        }
      })

      if (!this.secretKey || !this.checkoutKey) {
        console.error("[v0] Missing Nexi API keys:", {
          hasSecretKey: !!this.secretKey,
          hasCheckoutKey: !!this.checkoutKey,
          environment: NEXI_CONFIG.isProduction ? "production" : "test",
        })
        throw new Error(
          "Nexi API keys not found or not configured. Please run the database migration script to add the API keys.",
        )
      }

      console.log("[v0] Nexi service initialized successfully")
      return true
    } catch (error) {
      console.error("[v0] Failed to initialize Nexi service:", error)
      return false
    }
  }

  // Create payment with Nexi
  async createPayment(paymentRequest: NexiPaymentRequest): Promise<NexiPaymentResponse> {
    if (!this.secretKey) {
      throw new NexiPaymentError("AUTHENTICATION_FAILED", "Nexi service not initialized")
    }

    try {
      console.log("[v0] Creating Nexi payment:", sanitizePaymentData(paymentRequest))

      const response = await fetch(`${this.baseUrl}${NEXI_CONFIG.paths.createPayment}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.secretKey,
          Accept: "application/json",
        },
        body: JSON.stringify(paymentRequest),
      })

      const responseData = await response.json().catch(() => ({}))

      if (!response.ok) {
        console.error("[v0] Nexi API error response:", response.status, responseData)
        throw parseNexiError({
          response: {
            status: response.status,
            data: responseData,
          },
        })
      }

      console.log("[v0] Nexi payment created successfully:", responseData.paymentId)
      return responseData
    } catch (error) {
      console.error("[v0] Error creating Nexi payment:", error)

      if (error instanceof NexiPaymentError) {
        throw error
      }

      throw parseNexiError(error)
    }
  }

  // Get payment details
  async getPayment(paymentId: string): Promise<NexiPaymentResponse> {
    if (!this.secretKey) {
      throw new NexiPaymentError("AUTHENTICATION_FAILED", "Nexi service not initialized")
    }

    if (!paymentId || typeof paymentId !== "string") {
      throw new NexiPaymentError("MISSING_REQUIRED_FIELD", "Payment ID is required")
    }

    try {
      console.log("[v0] Fetching Nexi payment:", paymentId)

      const response = await fetch(`${this.baseUrl}${NEXI_CONFIG.paths.getPayment}/${paymentId}`, {
        method: "GET",
        headers: {
          Authorization: this.secretKey,
          Accept: "application/json",
        },
      })

      const responseData = await response.json().catch(() => ({}))

      if (!response.ok) {
        console.error("[v0] Nexi API error response:", response.status, responseData)
        throw parseNexiError({
          response: {
            status: response.status,
            data: responseData,
          },
        })
      }

      return responseData
    } catch (error) {
      console.error("[v0] Error fetching Nexi payment:", error)

      if (error instanceof NexiPaymentError) {
        throw error
      }

      throw parseNexiError(error)
    }
  }

  // Charge payment (capture)
  async chargePayment(paymentId: string, amount?: number): Promise<any> {
    if (!this.secretKey) {
      throw new Error("Nexi service not initialized")
    }

    try {
      const chargeData: any = {}
      if (amount) {
        chargeData.amount = amount
      }

      const response = await fetch(`${this.baseUrl}${NEXI_CONFIG.paths.chargePayment}/${paymentId}/charges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.secretKey,
          Accept: "application/json",
        },
        body: JSON.stringify(chargeData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Nexi API error: ${response.status} - ${errorData.message || "Unknown error"}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error charging Nexi payment:", error)
      throw error
    }
  }

  // Create refund
  async refundPayment(paymentId: string, amount: number, reason?: string): Promise<any> {
    if (!this.secretKey) {
      throw new Error("Nexi service not initialized")
    }

    try {
      const refundData = {
        amount,
        ...(reason && { reason }),
      }

      const response = await fetch(`${this.baseUrl}${NEXI_CONFIG.paths.refundPayment}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.secretKey,
          Accept: "application/json",
        },
        body: JSON.stringify({
          paymentId,
          ...refundData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Nexi API error: ${response.status} - ${errorData.message || "Unknown error"}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error refunding Nexi payment:", error)
      throw error
    }
  }

  // Get checkout key for frontend
  getCheckoutKey(): string | null {
    return this.checkoutKey
  }
}

// Export singleton instance
export const nexiService = new NexiPaymentService()

// Export alias to match import expectations
export { NexiPaymentService as NexiService }
