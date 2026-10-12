import { MODELS, type ModelInfo, type Tier } from "./config";
import { strings } from "./strings";

export interface DeviceInfo {
  supported: boolean;
  /** Why the device is unsupported. */
  reason?: string;
  tier: Tier;
  /** saveData, 2g or 3g. */
  metered: boolean;
  /** Best model for this device (always set when supported). */
  recommended?: ModelInfo;
  quotaBytes?: number;
  usageBytes?: number;
}

interface NavigatorExtras {
  gpu?: { requestAdapter(): Promise<{ limits: Record<string, number> } | null> };
  deviceMemory?: number;
  connection?: { effectiveType?: string; saveData?: boolean };
}

const GIB = 1024 ** 3;

export function modelsForTier(tier: Tier): ModelInfo[] {
  const high = tier === "high";
  return MODELS.filter((m) => m.minTier === "standard" || high);
}

export async function detectDevice(): Promise<DeviceInfo> {
  const nav = navigator as Navigator & NavigatorExtras;
  const base = { tier: "standard" as Tier, metered: false };

  if (!nav.gpu) return { ...base, supported: false, reason: strings.unsupported.noWebGpu };
  if (!nav.storage?.getDirectory || typeof FileSystemFileHandle === "undefined" || !("createWritable" in FileSystemFileHandle.prototype)) {
    return { ...base, supported: false, reason: strings.unsupported.noOpfs };
  }

  let adapter: Awaited<ReturnType<NonNullable<NavigatorExtras["gpu"]>["requestAdapter"]>>;
  try {
    adapter = await nav.gpu.requestAdapter();
  } catch {
    adapter = null;
  }
  if (!adapter) return { ...base, supported: false, reason: strings.unsupported.noAdapter };

  const effectiveType = nav.connection?.effectiveType;
  const metered = Boolean(nav.connection?.saveData) || effectiveType === "slow-2g" || effectiveType === "2g" || effectiveType === "3g";

  const bigBuffers =
    (adapter.limits.maxBufferSize ?? 0) >= 2 * GIB && (adapter.limits.maxStorageBufferBindingSize ?? 0) >= 2 * GIB;
  const enoughMemory = (nav.deviceMemory ?? 0) >= 8;
  const enoughCores = (nav.hardwareConcurrency ?? 0) >= 4;
  const tier: Tier = bigBuffers && enoughMemory && enoughCores && !metered ? "high" : "standard";

  const { quota, usage } = (await nav.storage.estimate?.()) ?? {};
  const smallest = MODELS[0];
  if (quota !== undefined && usage !== undefined && quota - usage < smallest.sizeBytes) {
    return { tier, metered, supported: false, reason: strings.unsupported.noQuota, quotaBytes: quota, usageBytes: usage };
  }

  const options = modelsForTier(tier);
  return { tier, metered, supported: true, recommended: options[options.length - 1], quotaBytes: quota, usageBytes: usage };
}

export function formatBytes(bytes: number): string {
  if (bytes >= GIB) return `${(bytes / GIB).toFixed(1)} GB`;
  return `${Math.round(bytes / 1024 ** 2)} MB`;
}
