import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTheme } from '../hooks/useTheme';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  // Inicializamos el tema local una vez para evitar cambios inesperados al entrar en la página
  const initializedRef = useRef(false);
  const [localTheme, setLocalTheme] = useState(theme);

  useEffect(() => {
    if (!initializedRef.current) {
      setLocalTheme(theme);
      initializedRef.current = true;
    }
    // no dependencias: solo queremos la inicialización una vez al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                  onClick={() => { setTheme('light'); setLocalTheme('light'); }}
                  className={`px-4 py-2 rounded-md transition-all ${localTheme === 'light' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card/50 text-foreground hover:bg-card'}`}
                >
                  ☀️ Claro
                </button>
                <button
                  onClick={() => { setTheme('dark'); setLocalTheme('dark'); }}
                  className={`px-4 py-2 rounded-md transition-all ${localTheme === 'dark' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card/50 text-foreground hover:bg-card'}`}
                >
                  🌙 Oscuro
                </button>
                <button
                  onClick={() => { setTheme('system'); setLocalTheme('system'); }}
                  className={`px-4 py-2 rounded-md transition-all ${localTheme === 'system' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card/50 text-foreground hover:bg-card'}`}
                >
                  💻 Sistema
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
