"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { listAcademies, listTemplates } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/meta";
import type { AcademyStatus } from "@/lib/admin/types";
import { useApiQuery } from "../useApiQuery";
import { RowMenu } from "@/components/dashboard/RowMenu";
import { useAcademyActions } from "../useAcademyActions";
import { useListFilters } from "../useListFilters";
import { EmptyState, FilterTabs, PageHeader, SearchField, Table, Td, Th, Tr } from "@/components/dashboard/ui";
import { AcademyMark, AcademyStatusBadge, DomainLink, Loading, LoadError, Pagination, TemplateTag } from "../ui";

export type AcademyFilters = { status: AcademyStatus | ""; templateId: string; search: string };

export function AcademiesView({ filters, page }: { filters: AcademyFilters; page: number }) {
  const { menuItems, dialog } = useAcademyActions();
  const { query, onSearch, apply, reset, hrefFor } = useListFilters("/super-admin/academies", filters);
  const list = useApiQuery(`academies:${JSON.stringify(filters)}:${page}`, () => listAcademies({ ...filters, page }));
  const templates = useApiQuery("templates", listTemplates).data ?? [];

  if (list.error) return <LoadError message={list.error} />;
  if (!list.data) return <Loading />;

  const { counts, data: rows, meta } = list.data;
  const pending = list.loading;

  const filtered = filters.search !== "" || filters.status !== "" || filters.templateId !== "";

  return (
    <>
      <PageHeader
        title="الأكاديميات"
        description="كل أكاديمية مستقلة ببياناتها ونطاقها الفرعي، ومرتبطة بمالك واحد."
        actions={
          <Button href="/super-admin/academies/new">
            <Icon name="plus" className="size-4" />
            إنشاء أكاديمية
          </Button>
        }
      />

      {counts.all === 0 && !filtered ? (
        <div className="rounded-2xl border border-line bg-white shadow-card">
          <EmptyState
            icon="academy"
            title="لم تُنشأ أي أكاديمية بعد"
            description="ابدأ بإنشاء أول أكاديمية: اختر نطاقها الفرعي وقالبها، ثم أضف مالكها."
            action={
              <Button href="/super-admin/academies/new">
                <Icon name="plus" className="size-4" />
                إنشاء أول أكاديمية
              </Button>
            }
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-white shadow-card">
          <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
            <FilterTabs
              label="تصفية حسب الحالة"
              value={filters.status}
              onChange={(status) => apply({ status })}
              options={[
                { value: "", label: "الكل", count: counts.all },
                { value: "ACTIVE", label: "نشطة", count: counts.active },
                { value: "INACTIVE", label: "غير مفعّلة", count: counts.inactive },
                { value: "SUSPENDED", label: "موقوفة", count: counts.suspended },
              ]}
            />
            <div className="flex flex-col gap-3 sm:flex-row lg:ms-auto">
              <div className="sm:w-44">
                <Select aria-label="تصفية حسب القالب" value={filters.templateId} onChange={(e) => apply({ templateId: e.target.value })} className="h-10 text-sm">
                  <option value="">كل القوالب</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
              <SearchField value={query} onChange={onSearch} label="بحث في الأكاديميات" placeholder="ابحث بالاسم أو النطاق أو المالك" />
            </div>
          </div>

          <div className={cn("transition-opacity", pending && "opacity-60")} aria-busy={pending}>
            {rows.length === 0 ? (
              <EmptyState
                icon="search"
                title="لا توجد نتائج مطابقة"
                description={filtered ? "جرّب كلمات بحث أخرى أو أزل عوامل التصفية." : undefined}
                action={
                  <Button variant="secondary" size="sm" onClick={reset}>
                    إزالة التصفية
                  </Button>
                }
              />
            ) : (
              <Table className="min-w-[60rem]">
                <thead>
                  <tr>
                    <Th>الأكاديمية</Th>
                    <Th>المالك</Th>
                    <Th>النطاق الفرعي</Th>
                    <Th>القالب</Th>
                    <Th>الحالة</Th>
                    <Th>تاريخ الإنشاء</Th>
                    <Th className="w-14">
                      <span className="sr-only">إجراءات</span>
                    </Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => (
                    <Tr key={a.id}>
                      <Td>
                        <Link href={`/super-admin/academies/${a.id}`} className="group flex items-center gap-3">
                          <AcademyMark name={a.name} logoUrl={a.logoUrl} />
                          <span className="font-bold whitespace-nowrap text-ink-950 group-hover:text-brand-700">{a.name}</span>
                        </Link>
                      </Td>
                      <Td>
                        {a.owner ? (
                          <div className="leading-5">
                            <p className="font-semibold whitespace-nowrap text-ink-800">{a.owner.name}</p>
                            <p className="text-xs text-ink-500">
                              <bdi>{a.owner.email}</bdi>
                            </p>
                          </div>
                        ) : (
                          <span className="text-ink-400">بدون مالك</span>
                        )}
                      </Td>
                      <Td>
                        <DomainLink slug={a.slug} />
                      </Td>
                      <Td>{a.template ? <TemplateTag name={a.template.name} /> : <span className="text-ink-400">—</span>}</Td>
                      <Td>
                        <AcademyStatusBadge status={a.status} />
                      </Td>
                      <Td className="whitespace-nowrap text-ink-600">{formatDate(a.createdAt)}</Td>
                      <Td>
                        <RowMenu label={`إجراءات ${a.name}`} items={menuItems(a)} />
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>

          {rows.length > 0 && <Pagination meta={meta} noun="أكاديمية" hrefFor={(page) => hrefFor({}, page)} />}
        </div>
      )}

      {dialog}
    </>
  );
}
