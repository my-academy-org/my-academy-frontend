"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { featureInfo, type GatedFeature } from "@/lib/academy-admin/plan";
import { planComparison } from "@/lib/site";
import { useAcademy } from "./AcademyStore";

/**
 * Plan upgrades are handled by the platform team — no billing UI here.
 * The dialog explains what Pro adds and sends an upgrade request.
 */

const UpgradeContext = createContext<((feature?: GatedFeature) => void) | null>(null);

export function useUpgrade() {
  const open = useContext(UpgradeContext);
  if (!open) throw new Error("useUpgrade must be used inside <UpgradeProvider>");
  return open;
}

export function UpgradeProvider({ children }: { children: ReactNode }) {
  const { profile, notify } = useAcademy();
  const [state, setState] = useState<{ open: boolean; feature?: GatedFeature; sent: boolean }>({ open: false, sent: false });
  const close = () => setState((s) => ({ ...s, open: false }));

  return (
    <UpgradeContext.Provider value={(feature) => setState((s) => ({ ...s, open: true, feature }))}>
      {children}
      <Modal
        open={state.open}
        onClose={close}
        title="الترقية إلى خطة Pro"
        description={state.feature ? `«${featureInfo[state.feature].title}» متاح في خطة Pro.` : "تحكّم مباشر وكامل في موقع أكاديميتك."}
        footer={
          state.sent ? (
            <Button variant="secondary" onClick={close}>
              تم
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={close}>
                ليس الآن
              </Button>
              <Button
                onClick={() => {
                  setState((s) => ({ ...s, sent: true }));
                  notify("تم إرسال طلب الترقية إلى فريق المنصة");
                }}
              >
                إرسال طلب الترقية
              </Button>
            </>
          )
        }
      >
        {state.sent ? (
          <div className="flex gap-3 rounded-xl bg-brand-50 p-4 text-sm leading-6 text-brand-800 ring-1 ring-brand-100">
            <Icon name="check" className="mt-0.5 size-5 shrink-0" strokeWidth={2.5} />
            <p>
              وصل طلبك. سيتواصل معك فريق المنصة على <bdi className="font-semibold">{profile.owner.email}</bdi> لإتمام الترقية، وتبقى أكاديميتك تعمل كالمعتاد.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead className="bg-canvas text-xs text-ink-500">
                <tr>
                  <th className="px-4 py-2.5 text-start font-semibold">الميزة</th>
                  <th className="w-24 px-4 py-2.5 text-center font-semibold">
                    Basic {profile.plan === "BASIC" && <span className="block text-[0.6875rem] font-normal">(خطتك)</span>}
                  </th>
                  <th className="w-24 bg-brand-50 px-4 py-2.5 text-center font-bold text-brand-800">Pro</th>
                </tr>
              </thead>
              <tbody>
                {planComparison.map((row) => (
                  <tr key={row.label} className="border-t border-line">
                    <td className="px-4 py-3 text-ink-800">{row.label}</td>
                    <PlanCell value={row.basic} />
                    <PlanCell value={row.pro} highlight />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </UpgradeContext.Provider>
  );
}

function PlanCell({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
  return (
    <td className={cn("px-4 py-3 text-center text-xs", highlight && "bg-brand-50/60")}>
      {value === true ? (
        <>
          <Icon name="check" className="mx-auto size-4 text-brand-600" strokeWidth={2.5} />
          <span className="sr-only">متاح</span>
        </>
      ) : value === false ? (
        <>
          <Icon name="minus" className="mx-auto size-4 text-ink-300" />
          <span className="sr-only">غير متاح</span>
        </>
      ) : (
        <span className="text-ink-600">{value}</span>
      )}
    </td>
  );
}

/** Calm placeholder for a feature the current plan doesn't include. Never a broken or disabled copy of the feature. */
export function PlanGate({ feature, className, children }: { feature: GatedFeature; className?: string; children?: ReactNode }) {
  const upgrade = useUpgrade();
  const info = featureInfo[feature];
  return (
    <div className={cn("rounded-2xl border border-line bg-white px-6 py-12 text-center shadow-card", className)}>
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-gold-50 text-gold-600 ring-1 ring-gold-100">
        <Icon name="lock" className="size-5" />
      </span>
      <p className="mt-5 inline-flex items-center gap-2 text-base font-bold text-ink-950">
        {info.title}
        <ProBadge />
      </p>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-ink-500">{info.description}</p>
      {children}
      <Button className="mt-6" onClick={() => upgrade(feature)}>
        طلب الترقية إلى Pro
      </Button>
    </div>
  );
}

export function ProBadge({ className }: { className?: string }) {
  return (
    <span className={cn("rounded-md bg-gold-50 px-1.5 py-px text-[0.6875rem] font-bold text-gold-600 ring-1 ring-gold-100 ring-inset", className)}>
      PRO
    </span>
  );
}
