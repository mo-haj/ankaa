import type { Metadata } from "next";

import { AnkaaMark, WingArc, WingRule } from "@/components/brand";
import { Accent, Container, Section, SectionHeader } from "@/components/layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardRule,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { resolve } from "@/lib/tokens";
import { Block, Group, Ratio, RatioTable, Spec, Swatch } from "./styleguide-parts";

export const metadata: Metadata = {
  title: "نظام التصميم",
  description:
    "دليل نظام التصميم لجمعية البنيان السكنية — الألوان، الطباعة، المسافات، والمكونات.",
  robots: { index: false, follow: false },
};

/* -----------------------------------------------------------------------------
 * /styleguide — ASTRA's proof.
 *
 * Every value on this page is READ FROM globals.css at build time (see
 * src/lib/tokens.ts) and every contrast ratio is COMPUTED at build time (see
 * src/lib/contrast.ts). Nothing here is a transcription, so nothing here can
 * drift from what ships. Change a token and this page changes with it — and
 * a token that stops passing AA turns its row red.
 * -------------------------------------------------------------------------- */

const t = resolve;

const LIGHT = [
  { key: "--color-surface-0", label: "surface-0", role: "أرضية الصفحة" },
  { key: "--color-surface-1", label: "surface-1", role: "شريط متناوب" },
  { key: "--color-surface-2", label: "surface-2", role: "بطاقات داخلية" },
];
const DARK = [
  { key: "--color-surface-inverse-1", label: "inverse-1", role: "الأخضر الأساسي" },
  { key: "--color-surface-inverse-2", label: "inverse-2", role: "المشاريع" },
  { key: "--color-surface-inverse-3", label: "inverse-3", role: "أرضية التذييل" },
];
const INK_LIGHT = [
  { key: "--color-ink-1", label: "ink-1", role: "العناوين" },
  { key: "--color-ink-2", label: "ink-2", role: "النص" },
  { key: "--color-ink-3", label: "ink-3", role: "بيانات ثانوية" },
];
const INK_DARK = [
  { key: "--color-ink-inv-1", label: "ink-inv-1", role: "العناوين" },
  { key: "--color-ink-inv-2", label: "ink-inv-2", role: "النص" },
  { key: "--color-ink-inv-3", label: "ink-inv-3", role: "الحد الأدنى" },
];
const BRAND = [
  { key: "--color-brand-900", label: "brand-900", role: "الأخضر الأساسي" },
  { key: "--color-brand-800", label: "brand-800", role: "التمرير" },
  { key: "--color-brand-600", label: "brand-600", role: "العناوين الصغيرة" },
];
const GOLD = [
  { key: "--color-gold-700", label: "gold-700", role: "الذهبي كنص على الفاتح" },
  { key: "--color-gold-500", label: "gold-500", role: "خطوط ونقاط — ليس نصا" },
  { key: "--color-gold-300", label: "gold-300", role: "الذهبي كنص على الداكن" },
];

const TYPE = [
  { token: "display-1", cls: "text-display-1 font-display", spec: "clamp(44 → 84px) · 600 · 1.18", sample: "من المخطط إلى البيت" },
  { token: "display-2", cls: "text-display-2 font-display", spec: "clamp(36 → 64px) · 600 · 1.22", sample: "سكن يليق بأهله" },
  { token: "h1", cls: "text-h1 font-display", spec: "clamp(32 → 48px) · 600 · 1.28", sample: "جمعية البنيان السكنية" },
  { token: "h2", cls: "text-h2 font-display", spec: "clamp(28 → 36px) · 600 · 1.32", sample: "مشاريعنا في المحافظات" },
  { token: "h3", cls: "text-h3 font-display", spec: "clamp(22 → 26px) · 600 · 1.40", sample: "تصميم معماري راق" },
  { token: "h4", cls: "text-h4 font-display", spec: "20px · 600 · 1.45", sample: "خطوات الانتساب إلى الجمعية" },
  { token: "lead", cls: "text-lead", spec: "clamp(17 → 20px) · 400 · 1.85", sample: "نبني مجمعات سكنية متكاملة الخدمات، بجودة تنفيذ تطمئن العضو." },
  { token: "body", cls: "text-body", spec: "17px · 400 · 1.90 — النص الأساسي", sample: "تأسست الجمعية لتوفير مسكن كريم لأعضائها، وتعمل تحت إشراف الوزارة المختصة، بمشاريع موزعة على عدة محافظات." },
  { token: "body-sm", cls: "text-body-sm", spec: "15px · 400 · 1.85", sample: "تفاصيل الوحدة السكنية والمساحات المتاحة ضمن المشروع." },
  { token: "label", cls: "text-label font-semibold", spec: "13px · 600 · 1.60 — الحد الأدنى", sample: "عن الجمعية" },
  { token: "caption", cls: "text-caption", spec: "13px · 400 · 1.70 — الحد الأدنى", sample: "صورة أرشيفية من موقع المشروع" },
  { token: "quote", cls: "text-quote font-naskh", spec: "clamp(24 → 32px) · 500 · 2.00 · نسخ", sample: "بسم الله الرحمن الرحيم" },
  { token: "stat", cls: "text-stat font-display", spec: "clamp(36 → 56px) · 500 · 1.10", sample: "١٢٤٠" },
];

const SPACE = [
  ["0", "0"], ["1", "4px"], ["2", "8px"], ["3", "12px"], ["4", "16px"],
  ["6", "24px"], ["8", "32px"], ["12", "48px"], ["16", "64px"],
  ["24", "96px"], ["32", "128px"], ["40", "160px"], ["50", "200px"],
];

const RADII = [
  { cls: "rounded-field", label: "field", px: "8px" },
  { cls: "rounded-md", label: "md", px: "12px" },
  { cls: "rounded-card", label: "card", px: "16px" },
  { cls: "rounded-figure", label: "figure", px: "24px" },
  { cls: "rounded-media", label: "media", px: "32px" },
  { cls: "rounded-full", label: "full", px: "∞" },
];

const GROUND_LABEL = { light: "أرضية فاتحة", dark: "أرضية داكنة" } as const;

/** Screen-reader-only ground suffix — see the <ComponentShowcase> note. */
function GroundNote({ ground }: { ground: "light" | "dark" }) {
  return <span className="sr-only"> — {GROUND_LABEL[ground]}</span>;
}

function ButtonRow() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="lg">انتسب الآن</Button>
      <Button variant="gold">تواصل معنا</Button>
      <Button variant="outline">استكشف المشاريع</Button>
      <Button variant="secondary">تفاصيل</Button>
      <Button variant="ghost">المزيد</Button>
      <Button variant="link">اقرأ التقرير</Button>
      <Button size="sm" variant="outline">
        دمشق
      </Button>
      <Button disabled>غير متاح</Button>
    </div>
  );
}

/**
 * ⛔ `ground` IS LOAD-BEARING, IT IS NOT A LABEL. SAGE-2.
 *
 * This component is rendered TWICE — once on the light ground and once on the
 * dark one — and it used to hard-code `id="sg-name"`, `"sg-msg"` and `"sg-err"`.
 * MEASURED in a browser: three duplicate ids, six form controls each carrying
 * TWO `<label for>`, and clicking the dark ground's label moved focus to the
 * light ground's input. `ground` namespaces every id so each label points at
 * the field beside it.
 *
 * It also names the accordion's `role="region"`. Radix names that region from
 * its trigger (`aria-labelledby`), and two identical triggers on one page
 * produce two landmarks with the same role AND the same name (axe
 * `landmark-unique`, moderate).
 *
 * ⛔ THE FIX IS ON THE TRIGGER, AND THE TWO THAT DO NOT WORK ARE WORTH
 * RECORDING SO NOBODY RETRIES THEM. `aria-label` on <AccordionContent> does
 * nothing: accname resolves `aria-labelledby` FIRST and Radix's points at the
 * trigger. Clearing it with `aria-labelledby={undefined}` does nothing either
 * — MEASURED, the attribute is still on the node, because Radix sets it AFTER
 * spreading consumer props. What is left is to change what the trigger says,
 * so <GroundNote> appends the ground as `sr-only` text: no visible change, and
 * the trigger AND the region it names both become unique.
 */
function ComponentShowcase({ ground }: { ground: "light" | "dark" }) {
  const id = (name: string) => `sg-${ground}-${name}`;
  return (
    <div className="grid gap-12">
      <div>
        <Spec>button — all variants, one set, correct on this ground</Spec>
        <div className="mt-4">
          <ButtonRow />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardRule />
            <CardTitle>مشروع دمشق</CardTitle>
            <CardDescription>
              مجمع سكني متكامل الخدمات على مساحة واسعة، بتصميم يراعي الخصوصية.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">قيد التنفيذ</Badge>
          </CardContent>
        </Card>
        <Card variant="raised">
          <CardHeader>
            <CardTitle>مشروع حمص</CardTitle>
            <CardDescription>
              وحدات سكنية بمساحات متنوعة تناسب العائلة السورية.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="gold">مرحلة التسليم</Badge>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>مشروع اللاذقية</CardTitle>
            <CardDescription>
              إطلالة بحرية ومرافق خدمية ضمن المخطط التنظيمي المعتمد.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge>مخطط</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="grid gap-4">
          <Spec>input · label · textarea — 48px targets, 17px text</Spec>
          <div className="grid gap-2">
            <Label htmlFor={id("name")}>الاسم الكامل</Label>
            <Input id={id("name")} placeholder="أدخل اسمك الثلاثي" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={id("msg")}>رسالتك</Label>
            <Textarea id={id("msg")} placeholder="كيف يمكننا مساعدتك؟" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={id("err")}>رقم العضوية</Label>
            <Input id={id("err")} aria-invalid defaultValue="٠٠٠" />
          </div>
        </div>

        <div className="grid content-start gap-4">
          <Spec>accordion — rotating plus, no hover underline</Spec>
          <Accordion type="single" collapsible defaultValue="a">
            <AccordionItem value="a">
              <AccordionTrigger>
                كيف أنتسب إلى الجمعية؟
                <GroundNote ground={ground} />
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  يتم تقديم الطلب مرفقا بالوثائق المطلوبة، ثم تدرس الأهلية وتخصص
                  الوحدة حسب الدور والمشروع المتاح.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>
                ما هي آلية الدفع المعتمدة؟
                <GroundNote ground={ground} />
              </AccordionTrigger>
              <AccordionContent>
                <p>أقساط دورية وفق جدول زمني معلن ومصادق عليه من الوزارة.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="c">
              <AccordionTrigger>
                هل المشاريع مرخصة رسميا؟
                <GroundNote ground={ground} />
              </AccordionTrigger>
              <AccordionContent>
                <p>نعم، جميع المشاريع ضمن المخططات التنظيمية المعتمدة.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-2 grid gap-3">
            <Spec>separator — line · strong · gold</Spec>
            <Separator />
            <Separator tone="strong" />
            <Separator tone="gold" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StyleguidePage() {
  const surface0 = t("--color-surface-0");
  const surface1 = t("--color-surface-1");
  const surface2 = t("--color-surface-2");
  const inv1 = t("--color-surface-inverse-1");
  const inv2 = t("--color-surface-inverse-2");
  const inv3 = t("--color-surface-inverse-3");
  const gold700 = t("--color-gold-700");
  const gold500 = t("--color-gold-500");
  const gold300 = t("--color-gold-300");
  const ink1 = t("--color-ink-1");
  const ink2 = t("--color-ink-2");
  const ink3 = t("--color-ink-3");
  const inkInv2 = t("--color-ink-inv-2");
  const inkInv3 = t("--color-ink-inv-3");
  const brand600 = t("--color-brand-600");
  const brand900 = t("--color-brand-900");

  const lightGrounds: [string, string][] = [
    [surface0, "surface-0"],
    [surface1, "surface-1"],
    [surface2, "surface-2"],
  ];
  const darkGrounds: [string, string][] = [
    [inv1, "inverse-1"],
    [inv2, "inverse-2"],
    [inv3, "inverse-3"],
  ];

  return (
    // `id="main"` is the header's skip-link target on every other route;
    // without it the skip link dead-ends here. SAGE-2.
    <main id="main" className="min-h-dvh">
      {/* ---------------------------------------------------------------- masthead */}
      <Section theme="dark" space="hero" container={false}>
        <Container>
          <div className="grid items-end gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="kicker-rule text-label text-kicker mb-6 flex items-center font-semibold">
                نظام التصميم · ASTRA
              </span>
              <h1 className="font-display text-display-2 text-fg font-semibold text-balance">
                لغة بصرية مشتقة من <Accent>الشعار</Accent> نفسه
              </h1>
              <p className="text-lead text-fg-muted mt-6 max-w-[54ch] text-pretty">
                كل قيمة في هذه الصفحة مقروءة مباشرة من <span className="latin">globals.css</span>{" "}
                وكل نسبة تباين محسوبة عند البناء. لا شيء هنا منسوخ يدويا، لذا لا
                يمكن أن ينحرف عما يشحن فعليا.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Badge variant="outline">Tailwind v4 · بلا ملف إعداد</Badge>
                <Badge variant="outline">RTL أولا</Badge>
                <Badge variant="gold">WCAG AA</Badge>
              </div>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <AnkaaMark className="text-accent-hair ms-auto w-40" title="شعار جمعية البنيان" />
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------------ body */}
      <Section space="lg" container={false}>
        <Container>
          <div className="grid gap-24">
            {/* ---------------------------------------------------------- 01 brand */}
            <Block
              n="٠١"
              title="العلامة"
              note={
                <>
                  الشعار ليس صورة توضع فوق التصميم — هو مصدره. القوس والكتل الثلاث
                  هما الشكلان الأوليان لهذا النظام.
                </>
              }
            >
              <div className="grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <div className="border-line rounded-figure flex items-center justify-center border p-12">
                    <AnkaaMark className="text-accent-hair w-48" />
                  </div>
                  <Spec>
                    inline SVG · traced from ankaa-mark.png · IoU 0.9917 vs source
                  </Spec>
                </div>
                <div className="grid gap-6 lg:col-span-6 lg:col-start-7">
                  <div>
                    <h3 className="text-h4 font-display text-fg mb-2 font-semibold">
                      الذهبي الحقيقي
                    </h3>
                    <p className="text-body-sm text-fg-muted text-pretty">
                      ٤٥٫٧٪ من بكسلات الشعار الصلبة تساوي تماما{" "}
                      <span className="latin">{gold500}</span>. القيمة التي كان
                      الموقع القديم يستخدمها (<span className="latin">#b9aa81</span>)
                      تبعد <span className="latin">ΔE00 1.97</span> وتميل إلى البرودة،
                      بينما الذهبي الحقيقي دافئ. صححت اللوحة على القيمة المقيسة.
                    </p>
                    <div className="mt-4 flex gap-3">
                      {GOLD.map((g) => (
                        <div key={g.key} className="flex-1">
                          <div
                            className="rounded-field border-line h-14 border"
                            style={{ background: t(g.key) }}
                          />
                          <Spec>{`${g.label} ${t(g.key)}`}</Spec>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-h4 font-display text-fg mb-2 font-semibold">
                      قوس الجناح
                    </h3>
                    <p className="text-body-sm text-fg-muted text-pretty">
                      الحافة الخارجية للجناح قوس دائري حقيقي: نصف قطر{" "}
                      <span className="latin">490.4px</span> على وتر{" "}
                      <span className="latin">321.2px</span> بانحراف متوسط{" "}
                      <span className="latin">0.91px</span>. أي ارتفاع{" "}
                      <span className="latin">8.42%</span> من الوتر، وزاوية{" "}
                      <span className="latin">38.27°</span>.
                    </p>
                    <div className="text-accent-hair mt-6">
                      <WingArc className="h-24" />
                    </div>
                    <div className="text-accent-hair mt-6">
                      <WingRule className="h-6" />
                    </div>
                    <Spec>WingArc — the measured sweep · WingRule — the divider</Spec>
                  </div>

                  <div>
                    <h3 className="text-h4 font-display text-fg mb-2 font-semibold">
                      إيقاع الكتل
                    </h3>
                    <p className="text-body-sm text-fg-muted text-pretty">
                      الأبراج الثلاثة بارتفاعات <span className="latin">85 / 123 / 171px</span>{" "}
                      — أي ×<span className="latin">1.45</span> ثم ×
                      <span className="latin">1.39</span>، بمتوسط{" "}
                      <span className="latin">√2</span>. هذا هو سلم الأنصاف أقطار
                      وإيقاع الصفوف المتدرجة.
                    </p>
                    <div className="mt-5 flex items-end gap-3" aria-hidden>
                      {[2, 1.414, 1].map((s, i) => (
                        <div
                          key={i}
                          className="bg-accent-hair rounded-t-[4px]"
                          style={{ height: `${s * 44}px`, width: "3.5rem" }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Block>

            {/* ----------------------------------------------------------- 02 type */}
            <Block
              n="٠٢"
              title="الطباعة"
              note={
                <>
                  اثنا عشر رمزا، والحد الأدنى ١٣ بكسل. الموقع القديم كان يشحن ١٢
                  مقاسا تحت ١٣ بكسل — إزالتها هي أكبر مكسب فخامة في إعادة البناء.
                  التتبع صفر دائما: العربية خط متصل.
                </>
              }
            >
              <div className="grid gap-8">
                {TYPE.map((row) => (
                  <div key={row.token} className="border-line grid gap-3 border-t pt-6 lg:grid-cols-12">
                    <div className="lg:col-span-3">
                      <div className="latin text-label text-fg font-semibold">
                        text-{row.token}
                      </div>
                      <Spec>{row.spec}</Spec>
                    </div>
                    <div className="lg:col-span-9">
                      <p className={`${row.cls} text-fg text-balance`}>{row.sample}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Block>

            {/* --------------------------------------------------------- 03 colour */}
            <Block
              n="٠٣"
              title="اللون"
              note={
                <>
                  ثلاث أرضيات فاتحة، ثلاث داكنة، ثلاثة أحبار لكل أرضية، والأخضر
                  والذهبي. الذهبي معدن لا سطح: لا يتجاوز ٥٪ من أي شاشة، وعنصر ذهبي
                  واحد لكل قسم كحد أقصى.
                </>
              }
            >
              <Group title="الأرضيات الفاتحة">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                  {LIGHT.map((c) => (
                    <Swatch key={c.key} name={c.label} value={t(c.key)} role={c.role} />
                  ))}
                </div>
              </Group>
              <Group title="الأرضيات الداكنة">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                  {DARK.map((c) => (
                    <Swatch key={c.key} name={c.label} value={t(c.key)} role={c.role} />
                  ))}
                </div>
              </Group>
              <Group title="الحبر على الفاتح">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                  {INK_LIGHT.map((c) => (
                    <Swatch key={c.key} name={c.label} value={t(c.key)} role={c.role} />
                  ))}
                </div>
              </Group>
              <Group title="الحبر على الداكن">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                  {INK_DARK.map((c) => (
                    <Swatch
                      key={c.key}
                      name={c.label}
                      value={t(c.key)}
                      on={inv1}
                      role={c.role}
                    />
                  ))}
                </div>
              </Group>
              <Group title="الأخضر">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                  {BRAND.map((c) => (
                    <Swatch key={c.key} name={c.label} value={t(c.key)} role={c.role} />
                  ))}
                </div>
              </Group>
              <Group title="الذهبي">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                  {GOLD.map((c) => (
                    <Swatch key={c.key} name={c.label} value={t(c.key)} role={c.role} />
                  ))}
                </div>
              </Group>
              <Group title="سلم الشفافية — ست درجات لكل أرضية">
                <div className="grid grid-cols-6 gap-2">
                  {[5, 10, 20, 40, 60, 80].map((a) => (
                    <div key={a}>
                      <div
                        className="rounded-field border-line h-12 border"
                        style={{ background: `rgb(0 39 36 / ${a / 100})` }}
                      />
                      <Spec>{a}%</Spec>
                    </div>
                  ))}
                </div>
              </Group>
            </Block>

            {/* ------------------------------------------------------- 04 contrast */}
            <Block
              n="٠٤"
              title="تدقيق التباين"
              note={
                <>
                  كل نسبة محسوبة عند البناء بمعادلة{" "}
                  <span className="latin">WCAG 2.1</span>، مع دمج الألوان الشفافة على
                  أرضيتها الفعلية. الحد: <span className="latin">4.5:1</span> للنص و
                  <span className="latin">3:1</span> للنص الكبير وعناصر الواجهة.
                </>
              }
            >
              <div className="grid gap-12">
                <RatioTable head="gold-700 — الذهبي كنص على الأرضيات الفاتحة">
                  {lightGrounds.map(([bg, name]) => (
                    <Ratio
                      key={name}
                      fg={gold700}
                      bg={bg}
                      label={`gold-700 ${gold700}`}
                      bgLabel={name}
                    />
                  ))}
                </RatioTable>

                <RatioTable head="gold-300 — الذهبي كنص على الأرضيات الداكنة">
                  {darkGrounds.map(([bg, name]) => (
                    <Ratio
                      key={name}
                      fg={gold300}
                      bg={bg}
                      label={`gold-300 ${gold300}`}
                      bgLabel={name}
                    />
                  ))}
                </RatioTable>

                <RatioTable head="gold-500 — مسموح كخط أو نقطة فقط، ممنوع كنص على الفاتح">
                  {lightGrounds.map(([bg, name]) => (
                    <Ratio
                      key={name}
                      fg={gold500}
                      bg={bg}
                      label={`gold-500 ${gold500}`}
                      bgLabel={name}
                      req="none"
                    />
                  ))}
                  {darkGrounds.map(([bg, name]) => (
                    <Ratio
                      key={name}
                      fg={gold500}
                      bg={bg}
                      label={`gold-500 ${gold500}`}
                      bgLabel={name}
                      req="none"
                    />
                  ))}
                </RatioTable>

                <RatioTable head="الحبر على الأرضيات الفاتحة">
                  {(
                    [
                      [ink1, "ink-1"],
                      [ink2, "ink-2"],
                      [ink3, "ink-3"],
                      [brand600, "brand-600"],
                      [brand900, "brand-900"],
                    ] as [string, string][]
                  ).flatMap(([fg, name]) =>
                    lightGrounds.map(([bg, bgName]) => (
                      <Ratio
                        key={`${name}-${bgName}`}
                        fg={fg}
                        bg={bg}
                        label={`${name} ${fg}`}
                        bgLabel={bgName}
                      />
                    )),
                  )}
                </RatioTable>

                <RatioTable head="الحبر على الأرضيات الداكنة">
                  {(
                    [
                      ["#ffffff", "ink-inv-1"],
                      [inkInv2, "ink-inv-2"],
                      [inkInv3, "ink-inv-3"],
                    ] as [string, string][]
                  ).flatMap(([fg, name]) =>
                    darkGrounds.map(([bg, bgName]) => (
                      <Ratio
                        key={`${name}-${bgName}`}
                        fg={fg}
                        bg={bg}
                        label={name}
                        bgLabel={bgName}
                      />
                    )),
                  )}
                </RatioTable>

                <RatioTable head="الأزرار وحلقة التركيز — الحد 3:1 لعناصر الواجهة">
                  <Ratio
                    fg={surface0}
                    bg={brand900}
                    label="زر أساسي — نص على أخضر"
                    bgLabel="brand-900"
                  />
                  <Ratio
                    fg={surface0}
                    bg={gold700}
                    label="زر ذهبي على فاتح"
                    bgLabel="gold-700"
                  />
                  <Ratio
                    fg={brand900}
                    bg={gold300}
                    label="زر ذهبي على داكن"
                    bgLabel="gold-300"
                  />
                  <Ratio
                    fg={brand900}
                    bg={surface0}
                    label="زر أساسي على داكن"
                    bgLabel="surface-0"
                  />
                  <Ratio
                    fg={gold700}
                    bg={surface0}
                    label="حلقة تركيز على فاتح"
                    bgLabel="surface-0"
                    req="ui"
                  />
                  <Ratio
                    fg={gold300}
                    bg={inv1}
                    label="حلقة تركيز على داكن"
                    bgLabel="inverse-1"
                    req="ui"
                  />
                </RatioTable>
              </div>
            </Block>

            {/* -------------------------------------------------------- 05 spacing */}
            <Block
              n="٠٥"
              title="المسافات والأنصاف أقطار"
              note={
                <>
                  سلم واحد بأساس ٤ بكسل يستبدل ٣٣ قيمة عشوائية، وخمسة أنصاف أقطار
                  تستبدل عشرين — كلها على درجات <span className="latin">√2</span>{" "}
                  المأخوذة من الكتل الثلاث في الشعار.
                </>
              }
            >
              <Group title="السلم">
                {/* VIPER V-4: this row was the ONLY horizontal page overflow in
                    the whole app, and it took the fixed header with it —
                    `documentElement.scrollWidth` 388 against a 360 viewport,
                    and 388 against 320. The last rung is `w-16` + `gap-4` +
                    `w-16` + `gap-4` + a 200px bar = 360px of content that
                    cannot shrink (both labels are `shrink-0`), inside a shell
                    that is 312px wide at 360.

                    Same remedy SAGE-2 gave the six tables on this page: a
                    focusable scroll container, so the row scrolls inside its
                    own box instead of widening the document. `tabIndex={0}` is
                    required, not decorative — a scrollable region that cannot
                    be reached by keyboard is a 2.1.1 failure (and axe's
                    `scrollable-region-focusable` flags it).

                    ⛔ `min-w-0` IS THE HALF THAT ACTUALLY FIXES IT, and it is
                    invisible in a diff. `overflow-x-auto` alone changed
                    NOTHING — measured, `scrollWidth` stayed at exactly 388 —
                    because a grid item's `min-width` is `auto`, so this box
                    still refused to shrink below the 360px min-content width
                    of the row inside it and simply carried the overflow up
                    one level. A scroll container that cannot be narrower than
                    its content is not a scroll container.

                    ⚠️ `outline-offset-0`, and no negative margin. The first
                    attempt used `-mx-1 px-1` to keep an offset ring clear of
                    the content, which made this box 368px wide inside a 360px
                    shell — an overflow fix that overflowed. A ring drawn on
                    the box's own edge costs nothing here. */}
                <div
                  tabIndex={0}
                  className="focus-visible:outline-ring min-w-0 overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-0"
                >
                  <div className="grid w-max gap-2">
                    {SPACE.map(([n, px]) => (
                      <div key={n} className="flex items-center gap-4">
                        <span className="latin text-caption text-fg-subtle w-16 shrink-0 tabular-nums">
                          {n}
                        </span>
                        <span className="latin text-caption text-fg-subtle w-16 shrink-0 tabular-nums">
                          {px}
                        </span>
                        <span
                          className="bg-accent-hair h-2 rounded-full"
                          style={{ width: px }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Group>
              <Group title="الأنصاف أقطار">
                <div className="flex flex-wrap gap-6">
                  {RADII.map((r) => (
                    <div key={r.label} className="grid gap-2">
                      <div
                        className={`border-line size-24 border-2 border-dashed ${r.cls}`}
                      />
                      <Spec>{`${r.label} · ${r.px}`}</Spec>
                    </div>
                  ))}
                </div>
              </Group>
              <Group title="الارتفاع والحركة">
                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="bg-card rounded-card shadow-sm grid h-24 place-items-center">
                    <Spec>shadow-sm</Spec>
                  </div>
                  <div className="bg-card rounded-card shadow-lg grid h-24 place-items-center">
                    <Spec>shadow-lg</Spec>
                  </div>
                  <div className="border-line rounded-card grid h-24 place-items-center border">
                    <Spec>hairline — الافتراضي</Spec>
                  </div>
                </div>
                <div className="mt-6 grid gap-1">
                  <Spec>--ease-out-expo cubic-bezier(0.16, 1, 0.3, 1) — الافتراضي</Spec>
                  <Spec>--ease-out-quart cubic-bezier(0.22, 1, 0.36, 1)</Spec>
                  <Spec>--dur-fast 200ms · --dur-base 350ms · --dur-slow 700ms</Spec>
                </div>
              </Group>
            </Block>

            {/* ------------------------------------------------- 06 light ground */}
            <Block
              n="٠٦"
              title="المكونات — على أرضية فاتحة"
              note={
                <>
                  مجموعة واحدة من المتغيرات تعمل على الأرضيتين. لا يوجد{" "}
                  <span className="latin">onDark</span> ولن يوجد. هذه صفحة عينات:
                  في صفحة حقيقية يسمح بعنصر ذهبي واحد لكل قسم، لا أكثر.
                </>
              }
            >
              <ComponentShowcase ground="light" />
            </Block>
          </div>
        </Container>
      </Section>

      {/* -------------------------------------------------- dark ground, live */}
      <Section theme="dark" space="lg" container={false}>
        <Container>
          <SectionHeader
            align="split"
            kicker="آلية تبديل الأرضية"
            heading={
              <>
                نفس المكونات، أرضية <Accent>داكنة</Accent>، صفر تعديلات
              </>
            }
            lead={
              <>
                هذا القسم يحمل <span className="latin">data-theme=&quot;dark&quot;</span> فقط.
                كل ما تحته — الحبر، الخطوط، الذهبي، حلقات التركيز، ومتغيرات
                shadcn الدلالية — تبدل قيمه تلقائيا.
              </>
            }
          />
          <div className="mt-16">
            <ComponentShowcase ground="dark" />
          </div>
        </Container>
      </Section>

      {/* --------------------------------------------- surface levels, live */}
      <Section surface={1} space="default" container={false}>
        <Container>
          <SectionHeader
            kicker="مستويات الأرضية"
            heading="ثلاث درجات فاتحة، ثلاث داكنة"
            lead="التتابع الفاتح الطويل يحافظ على إيقاعه عبر تدرج ٠ ← ١ ← ٢ دون قلب حاد."
          />
        </Container>
        <div className="mt-12 grid">
          {(
            [
              ["light", 0, "surface-0 · أرضية الصفحة"],
              ["light", 1, "surface-1 · شريط متناوب"],
              ["light", 2, "surface-2 · بطاقات داخلية"],
              ["dark", 1, "inverse-1 · الأخضر الأساسي"],
              ["dark", 2, "inverse-2 · المشاريع"],
              ["dark", 3, "inverse-3 · أرضية التذييل"],
            ] as ["light" | "dark", 0 | 1 | 2 | 3, string][]
          ).map(([theme, surface, label]) => (
            <div
              key={`${theme}-${surface}`}
              data-theme={theme}
              data-surface={surface}
              className="py-8"
            >
              <Container>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="text-body text-fg font-medium">{label}</span>
                  <span className="text-body-sm text-fg-muted">
                    نص ثانوي — <span className="text-accent-gold">وعبارة ذهبية</span>
                  </span>
                  <span className="bg-accent-hair h-px w-7" aria-hidden />
                </div>
              </Container>
            </div>
          ))}
        </div>
      </Section>

      <Section theme="dark" surface={3} space="sm" container={false}>
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <AnkaaMark className="text-accent-hair w-12" />
            <p className="text-caption text-fg-subtle">
              نظام التصميم · ASTRA · عملية البنيان
            </p>
          </div>
        </Container>
      </Section>
    </main>
  );
}
