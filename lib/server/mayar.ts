import { PaymentPackageType } from "@/lib/types";

export interface CreatePaymentParams {
  orderId: string;
  packageType: PaymentPackageType;
  amount: number;
  userName: string;
  userEmail: string;
  redirectUrl: string;
}

export interface MayarPaymentResult {
  orderId: string;
  paymentUrl: string;
  qrCodeUrl?: string;
  gatewayTransactionId?: string;
  isSandbox: boolean;
}

const MAYAR_API_URL = process.env.MAYAR_API_URL || "https://api.mayar.id/hl/v1";
const MAYAR_API_KEY = process.env.MAYAR_API_KEY;

// Buat transaksi Mayar.id atau fallback sandbox
export async function createMayarPayment(params: CreatePaymentParams): Promise<MayarPaymentResult> {
  const packageName =
    params.packageType === "credit_1"
      ? "1 Kredit Per Proyek (Rp19.000)"
      : "Langganan Paket Pro (Rp49.000/Bulan)";

  // Jika API key belum dipasang, gunakan mode Sandbox / Demo Simulator
  if (!MAYAR_API_KEY || MAYAR_API_KEY === "demo_key" || MAYAR_API_KEY.startsWith("mock_")) {
    return {
      orderId: params.orderId,
      paymentUrl: `/dashboard?demo_pay=${params.orderId}`,
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SEPAKATIN-DEMO-QRIS",
      gatewayTransactionId: `MYR-SIM-${Date.now()}`,
      isSandbox: true,
    };
  }

  try {
    const response = await fetch(`${MAYAR_API_URL}/payment/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MAYAR_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: params.userName || "Pengguna Sepakatin",
        email: params.userEmail,
        amount: params.amount,
        description: `Pembelian ${packageName} - ${params.orderId}`,
        redirectUrl: params.redirectUrl,
      }),
    });

    if (!response.ok) {
      if (process.env.NODE_ENV !== "production") {
        const errText = await response.text();
        console.warn("Mayar API error, fallback ke sandbox:", errText);
      }
      return {
        orderId: params.orderId,
        paymentUrl: `/dashboard?demo_pay=${params.orderId}`,
        gatewayTransactionId: `MYR-FALLBACK-${Date.now()}`,
        isSandbox: true,
      };
    }

    const data = await response.json();
    return {
      orderId: params.orderId,
      paymentUrl: data.data?.link || data.data?.url || `/dashboard?demo_pay=${params.orderId}`,
      qrCodeUrl: data.data?.qrCode || data.data?.qr_image_url,
      gatewayTransactionId: data.data?.id || data.data?.transactionId,
      isSandbox: false,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Gagal menghubungi Mayar API:", error);
    }
    return {
      orderId: params.orderId,
      paymentUrl: `/dashboard?demo_pay=${params.orderId}`,
      gatewayTransactionId: `MYR-ERR-${Date.now()}`,
      isSandbox: true,
    };
  }
}
