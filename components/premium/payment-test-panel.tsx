"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

interface TestResult {
  name: string
  status: "pending" | "success" | "error" | "running"
  message?: string
  details?: any
}

export function PaymentTestPanel() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "API Keys Configuration", status: "pending" },
    { name: "Nexi Service Initialization", status: "pending" },
    { name: "Payment Creation", status: "pending" },
    { name: "Checkout URL Generation", status: "pending" },
  ])

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests((prev) => prev.map((test, i) => (i === index ? { ...test, ...updates } : test)))
  }

  const runTests = async () => {
    console.log("[v0] Starting payment integration tests")

    // Test 1: Check API Keys
    updateTest(0, { status: "running" })
    try {
      const keysResponse = await fetch("/api/admin/api-keys")
      const keysData = await keysResponse.json()

      const nexiSecret = keysData.data?.find((key: any) => key.key_type === "nexi_secret")
      const nexiCheckout = keysData.data?.find((key: any) => key.key_type === "nexi_checkout")

      if (nexiSecret && nexiCheckout) {
        updateTest(0, {
          status: "success",
          message: "Both Nexi API keys found in database",
          details: { secretKeyLength: nexiSecret.key_value?.length, checkoutKeyLength: nexiCheckout.key_value?.length },
        })
        console.log("[v0] API keys test passed")
      } else {
        updateTest(0, {
          status: "error",
          message: `Missing keys: ${!nexiSecret ? "nexi_secret " : ""}${!nexiCheckout ? "nexi_checkout" : ""}`.trim(),
        })
        console.log("[v0] API keys test failed - missing keys")
        return
      }
    } catch (error) {
      updateTest(0, { status: "error", message: `Failed to check API keys: ${error}` })
      console.log("[v0] API keys test failed with error:", error)
      return
    }

    // Test 2: Service Initialization
    updateTest(1, { status: "running" })
    try {
      const initResponse = await fetch("/api/payments/nexi/test-init", { method: "POST" })
      const initData = await initResponse.json()

      if (initData.success) {
        updateTest(1, {
          status: "success",
          message: "Nexi service initialized successfully",
          details: initData.data,
        })
        console.log("[v0] Service initialization test passed")
      } else {
        updateTest(1, { status: "error", message: initData.error || "Service initialization failed" })
        console.log("[v0] Service initialization test failed:", initData.error)
        return
      }
    } catch (error) {
      updateTest(1, { status: "error", message: `Service initialization error: ${error}` })
      console.log("[v0] Service initialization test failed with error:", error)
      return
    }

    // Test 3: Payment Creation
    updateTest(2, { status: "running" })
    try {
      const paymentResponse = await fetch("/api/payments/nexi/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: "premium_monthly",
          amount: 999,
          currency: "EUR",
          description: "Test Payment - Premium Monthly",
        }),
      })
      const paymentData = await paymentResponse.json()

      if (paymentData.success && paymentData.data?.paymentId) {
        updateTest(2, {
          status: "success",
          message: "Payment created successfully",
          details: { paymentId: paymentData.data.paymentId },
        })
        console.log("[v0] Payment creation test passed")

        // Test 4: Checkout URL
        updateTest(3, { status: "running" })
        if (paymentData.data.checkoutUrl) {
          updateTest(3, {
            status: "success",
            message: "Checkout URL generated",
            details: { url: paymentData.data.checkoutUrl },
          })
          console.log("[v0] Checkout URL test passed")
        } else {
          updateTest(3, { status: "error", message: "No checkout URL in response" })
          console.log("[v0] Checkout URL test failed - no URL")
        }
      } else {
        updateTest(2, { status: "error", message: paymentData.error || "Payment creation failed" })
        updateTest(3, { status: "error", message: "Skipped due to payment creation failure" })
        console.log("[v0] Payment creation test failed:", paymentData.error)
      }
    } catch (error) {
      updateTest(2, { status: "error", message: `Payment creation error: ${error}` })
      updateTest(3, { status: "error", message: "Skipped due to payment creation failure" })
      console.log("[v0] Payment creation test failed with error:", error)
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    const variants = {
      success: "default",
      error: "destructive",
      running: "secondary",
      pending: "outline",
    } as const

    return <Badge variant={variants[status]}>{status}</Badge>
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Nexi Payment Integration Test</CardTitle>
        <CardDescription>Validate the complete payment flow and configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} className="w-full">
          Run Integration Tests
        </Button>

        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(test.status)}
                <div>
                  <div className="font-medium">{test.name}</div>
                  {test.message && <div className="text-sm text-muted-foreground">{test.message}</div>}
                  {test.details && (
                    <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
              {getStatusBadge(test.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
