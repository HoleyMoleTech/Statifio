import { PaymentTestPanel } from "@/components/premium/payment-test-panel"

export default function PaymentTestPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Payment Integration Testing</h1>
          <p className="text-muted-foreground mt-2">Comprehensive testing suite for Nexi payment gateway integration</p>
        </div>

        <PaymentTestPanel />

        <div className="max-w-2xl text-sm text-muted-foreground space-y-2">
          <h3 className="font-semibold">Test Coverage:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>API Keys Configuration - Verifies both nexi_secret and nexi_checkout keys exist</li>
            <li>Service Initialization - Tests if NexiService can initialize with current keys</li>
            <li>Payment Creation - Creates a test payment to validate API integration</li>
            <li>Checkout URL Generation - Ensures proper checkout URLs are generated</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
