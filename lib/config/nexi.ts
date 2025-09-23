// Nexi payment gateway configuration
export const NEXI_CONFIG = {
  // API endpoints
  endpoints: {
    test: "https://test.api.dibspayment.eu",
    live: "https://api.dibspayment.eu",
  },

  // Environment detection
  isProduction: process.env.NODE_ENV === "production",

  // Get current endpoint based on environment
  getEndpoint: () => {
    return NEXI_CONFIG.isProduction ? NEXI_CONFIG.endpoints.live : NEXI_CONFIG.endpoints.test
  },

  // API paths
  paths: {
    createPayment: "/v1/payments",
    getPayment: "/v1/payments",
    chargePayment: "/v1/payments",
    refundPayment: "/v1/refunds",
  },

  // Checkout configuration
  checkout: {
    // Embedded checkout container ID
    containerId: "nexi-checkout-container",

    // Supported payment methods
    paymentMethods: ["card", "paypal", "sofort", "trustly"],

    // Checkout appearance
    appearance: {
      theme: "light",
      variables: {
        colorPrimary: "#0070f3",
        colorBackground: "#ffffff",
        colorText: "#000000",
        fontFamily: "system-ui, sans-serif",
        borderRadius: "8px",
      },
    },
  },

  // Currency settings
  currency: "EUR",

  // Webhook configuration
  webhook: {
    events: [
      "payment.checkout.completed",
      "payment.created",
      "payment.reservation.created",
      "payment.reservation.failed",
      "payment.charge.created",
      "payment.charge.failed",
      "payment.refund.initiated",
      "payment.refund.completed",
      "payment.refund.failed",
    ],
  },
} as const

// Type definitions for Nexi API
export interface NexiPaymentRequest {
  order: {
    items: Array<{
      reference: string
      name: string
      quantity: number
      unit: string
      unitPrice: number
      taxRate?: number
      taxAmount?: number
      grossTotalAmount: number
      netTotalAmount: number
    }>
    amount: number
    currency: string
    reference: string
  }
  checkout?: {
    url?: string
    termsUrl?: string
    merchantHandlesConsumerData?: boolean
    consumer?: {
      email?: string
      shippingAddress?: {
        addressLine1: string
        addressLine2?: string
        postalCode: string
        city: string
        country: string
      }
    }
  }
  notifications?: {
    webhooks?: Array<{
      eventName: string
      url: string
      authorization?: string
    }>
  }
}

export interface NexiPaymentResponse {
  paymentId: string
  hostedPaymentPageUrl?: string
  payment: {
    paymentId: string
    summary: {
      reservedAmount: number
      chargedAmount: number
      refundedAmount: number
      cancelledAmount: number
    }
    consumer?: {
      email?: string
      shippingAddress?: any
    }
    paymentDetails?: {
      paymentType: string
      paymentMethod: string
      invoiceDetails?: any
      cardDetails?: {
        maskedPan: string
        expiryDate: string
      }
    }
    orderDetails: {
      amount: number
      currency: string
      reference: string
    }
    checkout?: {
      url: string
    }
    created: string
    charges?: any[]
    refunds?: any[]
  }
}

export interface NexiWebhookEvent {
  id: string
  merchantId: number
  timestamp: string
  event: string
  data: {
    paymentId: string
    order?: {
      amount: number
      currency: string
      reference: string
    }
    payment?: any
    charge?: any
    refund?: any
  }
}
