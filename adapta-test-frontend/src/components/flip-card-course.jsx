import React, { useState } from "react";
import { cn } from "../lib/utils";
import { ArrowRight, Code2, Copy } from "lucide-react";
import { Link } from "react-router-dom";

/*
  CourseFlipCard
  - Dimensiones y colores alineados con CardFlip (h-[360px], max-w-[300px], --primary)
  - Frente: StudentDashboard style (status, code, title, instructor, progress)
  - Reverso: detalles + features + CTA
  - Rutas: actionHref || (sectionId -> /manage/section/:id) || (courseId -> /courses/:id) || /courses
*/

export default function CourseFlipCard({
  title = "Curso sin título",
  subtitle = "",
  description = "",
  features = [],
  color = "#0ea5e9",
  actionLabel = "Ver Curso",
  actionHref = null,
  actionOnClick = null,
  courseId = null,
  sectionId = null,
  // nuevos props front
  status = "En progreso",
  code = "",
  instructorName = "-",
  progressPercent = 0,
  modulesCount = 0, // nuevo prop: cantidad de módulos
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const pct = Math.max(0, Math.min(100, Number(progressPercent || 0)));

  // Normalizar estados devueltos por el backend para mostrar "En progreso"
  const _s = String(status || "").toLowerCase();
  const displayStatus =
    _s.includes("enroll") || _s.includes("matric") || _s.includes("progress") || _s.includes("in progress")
      ? "En progreso"
      : status || "En progreso";

  // resolver ruta priorizando actionHref > sectionId > courseId > /courses
  const resolvedHref = actionHref
    ? actionHref
    : sectionId
    ? `/learn/section/${sectionId}`
    : courseId
    ? `/courses/${courseId}`
    : "/courses";

  return (
    <div
      style={{ ["--primary"]: color ?? "#2563eb" }}
      className="group relative h-[360px] w-full max-w-[300px] [perspective:2000px]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      {/* wrapper: mismo comportamiento 3D / transición que la flip-card principal */}
      <div
        className={cn(
          'relative h-full w-full',
          '[transform-style:preserve-3d]',
          'transition-all duration-700',
          isFlipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
        )}
      >
        {/* Front: Student dashboard card layout */}
        <div
          className={cn(
            'absolute inset-0 h-full w-full',
            '[transform:rotateY(0deg)] [backface-visibility:hidden]',
            'overflow-hidden rounded-2xl',
            'bg-gradient-to-br from-white via-slate-50 to-slate-100',
            'dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-800',
            'border border-gray-200 dark:border-zinc-800/50',
            'shadow-lg dark:shadow-xl',
            'transition-all duration-700',
            'group-hover:shadow-xl dark:group-hover:shadow-2xl',
            'group-hover:border-primary/20 dark:group-hover:border-primary/30',
            isFlipped ? 'opacity-0' : 'opacity-100'
          )}
        >
          {/* Image / hero area */}
          <div className="h-40 bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
            {/* Placeholder image area - can be replaced with actual course image */}
            <div className="h-full w-full bg-gradient-to-br from-white/30 to-transparent" />
          </div>

          {/* Body */}
          <div className="p-4 flex flex-col justify-between h-[calc(100%-144px)]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-block text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-200">
                  {displayStatus}
                </span>
                <span className="text-xs font-mono text-muted-foreground">{code}</span>
              </div>

              <h3 className="text-lg font-semibold text-foreground leading-tight">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{instructorName}</p>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{pct}% completado</p>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[linear-gradient(90deg,var(--primary)_0%,rgba(16,185,129,0.8)_100%)] transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Removed front CTA: only rear CTA remains per spec */}
            </div>
          </div>
        </div>

        {/* Back: detalles / features + CTA (misma configuración 3D/animación que la flip-card) */}
        <div
          className={cn(
            'absolute inset-0 h-full w-full',
            '[transform:rotateY(180deg)] [backface-visibility:hidden]',
            'rounded-2xl p-5',
            'bg-gradient-to-br from-white via-slate-50 to-slate-100',
            'dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-800',
            'border border-slate-200 dark:border-zinc-800',
            'shadow-lg dark:shadow-xl',
            'flex flex-col',
            'transition-all duration-700',
            'group-hover:shadow-xl dark:group-hover:shadow-2xl',
            'group-hover:border-primary/20 dark:group-hover:border-primary/30',
            !isFlipped ? 'opacity-0' : 'opacity-100'
          )}
        >
          <div className="relative z-10 flex flex-col h-full">
            <div className="space-y-3 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <div className="from-primary via-primary/90 to-primary/80 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br">
                  <Code2 className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              </div>

              <p className="text-sm text-muted-foreground">{description}</p>

              {/* Mostrar cantidad de módulos e instructor (requerido) */}
              <div className="mt-2 text-sm text-foreground space-y-1">
                <div>Módulos: <span className="font-medium">{modulesCount ?? 0}</span></div>
                <div>Profesor: <span className="font-medium">{instructorName || "-"}</span></div>
              </div>
              
              <div className="space-y-2.5 mt-2">
                {features && features.length ? (
                  features.map((f, i) => {
                    const icons = [Copy, Code2, Code2];
                    const IconComponent = icons[i % icons.length];
                    return (
                      <div key={i} className="flex items-center gap-3 text-sm text-foreground">
                        <div className="bg-primary/10 dark:bg-primary/20 flex h-6 w-6 items-center justify-center rounded-md">
                          <IconComponent className="text-primary h-3 w-3" />
                        </div>
                        <span className="font-medium">{f}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground italic">Sin detalles adicionales.</p>
                )}
              </div>
            </div>

            {/* CTA en la parte trasera: usa resolvedHref o actionOnClick */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
              {actionOnClick ? (
                <button
                  type="button"
                  onClick={actionOnClick}
                  className="flex w-full items-center justify-between rounded-lg p-2.5 bg-white/0 hover:bg-primary/5 transition-colors"
                >
                  <span className="text-sm font-semibold text-primary">{actionLabel}</span>
                  <ArrowRight className="text-primary h-4 w-4" />
                </button>
              ) : (
                <Link
                  to={resolvedHref}
                  className="flex w-full items-center justify-between rounded-lg p-2.5 bg-white/0 hover:bg-primary/5 transition-colors"
                  style={{ textDecoration: "none" }}
                >
                  <span className="text-sm font-semibold text-primary">{actionLabel}</span>
                  <ArrowRight className="text-primary h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
