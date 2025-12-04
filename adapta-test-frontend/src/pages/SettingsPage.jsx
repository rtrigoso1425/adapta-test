import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const THEME_KEY = "app_theme_preference"; // 'light' | 'dark' | 'system'

function applyTheme(pref) {
  if (pref === "dark") {
    document.documentElement.classList.add("dark");
  } else if (pref === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    // system
    document.documentElement.classList.remove("dark");
    const isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isDark) document.documentElement.classList.add("dark");
  }
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || "system";
  });

  useEffect(() => {
    applyTheme(theme);
    // if system, listen for changes
    let mq;
    const handleChange = () => {
      if (theme === "system") applyTheme("system");
    };
    if (window.matchMedia) {
      mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener?.("change", handleChange);
      mq.addListener?.(handleChange);
    }
    return () => {
      if (mq) {
        mq.removeEventListener?.("change", handleChange);
        mq.removeListener?.(handleChange);
      }
    };
  }, [theme]);

  const onChange = (value) => {
    setTheme(value);
    localStorage.setItem(THEME_KEY, value);
    applyTheme(value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ajustes</h1>
          <p className="text-sm text-muted-foreground mt-1">Preferencias de la aplicación</p>
        </div>
        <div>
          <Button variant="ghost" onClick={() => navigate(-1)}>Volver</Button>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Tema de la Aplicación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Selecciona el modo de color</Label>
              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => onChange("light")}
                  className={`px-4 py-2 rounded-md ${theme === "light" ? "bg-primary text-primary-foreground" : "bg-card/50 text-foreground"}`}
                >
                  Claro
                </button>
                <button
                  onClick={() => onChange("dark")}
                  className={`px-4 py-2 rounded-md ${theme === "dark" ? "bg-primary text-primary-foreground" : "bg-card/50 text-foreground"}`}
                >
                  Oscuro
                </button>
                <button
                  onClick={() => onChange("system")}
                  className={`px-4 py-2 rounded-md ${theme === "system" ? "bg-primary text-primary-foreground" : "bg-card/50 text-foreground"}`}
                >
                  Sistema
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Cambiará la apariencia de la interfaz. La opción "Sistema" seguirá la preferencia del sistema operativo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
