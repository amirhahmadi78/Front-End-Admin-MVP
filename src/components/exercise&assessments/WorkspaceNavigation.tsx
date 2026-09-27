import type { ReactNode } from "react";
import {
  ArrowLeft,
  ClipboardCheck,
  Dumbbell,
  FileText,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type NavigationItem = {
  title: string;
  description: string;
  path: string;
  icon: ReactNode;
  color: "teal" | "sky" | "indigo";
};

type WorkspaceNavigationProps = {
  onNavigate?: (path: string) => void;
};

const navigationItems: NavigationItem[] = [
  {
    title: "بانک تمرینات",
    description:
      "مدیریت، جست‌وجو و دسترسی سریع به تمرین‌های درمانی و آموزشی",
    path: "/exercises",
    icon: <Dumbbell size={28} strokeWidth={1.8} />,
    color: "teal",
  },
  {
    title: "برگه‌های تمرینی",
    description:
      "ساخت و مدیریت برگه‌های تمرینی اختصاصی برای مراجعان و بیماران",
    path: "/exercise-sheets",
    icon: <FileText size={28} strokeWidth={1.8} />,
    color: "sky",
  },
  {
    title: "ارزیابی‌های سیستماتیک",
    description:
      "ثبت، بررسی و تحلیل ارزیابی‌های استاندارد و سیستماتیک",
    path: "/systematicassessments",
    icon: <ClipboardCheck size={28} strokeWidth={1.8} />,
    color: "indigo",
  },
];

const colorStyles = {
  teal: {
    wrapper:
      "border-teal-100 bg-gradient-to-br from-teal-50 via-white to-white hover:border-teal-300",
    icon: "bg-teal-100 text-teal-700 group-hover:bg-teal-600 group-hover:text-white",
    badge: "bg-teal-50 text-teal-700",
    glow: "bg-teal-300/20",
  },
  sky: {
    wrapper:
      "border-sky-100 bg-gradient-to-br from-sky-50 via-white to-white hover:border-sky-300",
    icon: "bg-sky-100 text-sky-700 group-hover:bg-sky-600 group-hover:text-white",
    badge: "bg-sky-50 text-sky-700",
    glow: "bg-sky-300/20",
  },
  indigo: {
    wrapper:
      "border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-white hover:border-indigo-300",
    icon: "bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white",
    badge: "bg-indigo-50 text-indigo-700",
    glow: "bg-indigo-300/20",
  },
};

export default function WorkspaceNavigation({
  onNavigate,
}: WorkspaceNavigationProps) {
    const navigate=useNavigate()
  const handleNavigate = (path: string) => {
   navigate(path)
  };

  return (
    <section
      dir="rtl"
      className="relative min-h-115 overflow-hidden rounded-4xl bg-[#f7fbfa] px-5 py-8 sm:px-8 lg:px-12"
    >
      {/* Decorative backgrounds */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-teal-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-teal-700 shadow-sm ring-1 ring-teal-100">
              <Sparkles size={15} />
              <span>فضای کاردرمانی</span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-800 sm:text-3xl lg:text-4xl">
              از کجا شروع کنیم؟
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              ابزار موردنظر خود را انتخاب کنید و فرآیند درمان را سریع‌تر و
              منظم‌تر پیش ببرید.
            </p>
          </div>

          <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm ring-1 ring-slate-100 sm:flex">
            <ClipboardCheck size={30} strokeWidth={1.6} />
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {navigationItems.map((item, index) => {
            const styles = colorStyles[item.color];

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigate(item.path)}
                className={`group relative overflow-hidden rounded-3xl border p-5 text-right shadow-sm outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-teal-300/40 sm:p-6 ${styles.wrapper}`}
              >
                {/* Glow */}
                <div
                  className={`pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150 ${styles.glow}`}
                />

                <div className="relative">
                  <div className="mb-7 flex items-start justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${styles.icon}`}
                    >
                      {item.icon}
                    </div>

                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${styles.badge}`}
                    >
                      {index + 1}
                    </span>
                  </div>

                  <h2 className="text-lg font-extrabold text-slate-800 sm:text-xl">
                    {item.title}
                  </h2>

                  <p className="mt-3 min-h-14 text-sm leading-7 text-slate-500">
                    {item.description}
                  </p>

                  <div className="mt-7 flex items-center gap-2 text-sm font-bold text-slate-700 transition-colors group-hover:text-teal-700">
                    <span>ورود به بخش</span>
                    <ArrowLeft
                      size={18}
                      className="transition-transform duration-300 group-hover:-translate-x-1"
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
