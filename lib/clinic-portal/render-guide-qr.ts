import "server-only";

import QRCode from "qrcode";

import {
  GUIDE_QR_BACKGROUND,
  GUIDE_QR_ERROR_CORRECTION,
  GUIDE_QR_FOREGROUND,
  GUIDE_QR_MARGIN_MODULES,
  GUIDE_QR_PNG_SIZE_PX,
} from "@/lib/clinic-portal/guide-qr";

const qrColor = {
  dark: GUIDE_QR_FOREGROUND,
  light: GUIDE_QR_BACKGROUND,
};

export async function renderGuideQrSvg(publicUrl: string): Promise<string> {
  return QRCode.toString(publicUrl, {
    type: "svg",
    errorCorrectionLevel: GUIDE_QR_ERROR_CORRECTION,
    margin: GUIDE_QR_MARGIN_MODULES,
    color: qrColor,
  });
}

export async function renderGuideQrPng(publicUrl: string): Promise<Buffer> {
  return QRCode.toBuffer(publicUrl, {
    type: "png",
    errorCorrectionLevel: GUIDE_QR_ERROR_CORRECTION,
    margin: GUIDE_QR_MARGIN_MODULES,
    width: GUIDE_QR_PNG_SIZE_PX,
    color: qrColor,
  });
}
