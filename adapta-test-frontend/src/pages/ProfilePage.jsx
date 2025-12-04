import React from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth || {});

  const initials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
          <p className="text-sm text-muted-foreground mt-1">Información de tu cuenta</p>
        </div>
        <div>
          <Link to="/settings">
            <Button variant="outline" size="sm">Ajustes</Button>
          </Link>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Ficha de Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-shrink-0">
              <Avatar className="h-28 w-28 rounded-lg border shadow">
                {user?.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user?.name || "Avatar"} />
                ) : (
                  <AvatarFallback className="text-xl">{initials(user?.name)}</AvatarFallback>
                )}
              </Avatar>
            </div>

            <div className="flex-1 w-full">
              <div className="mb-2">
                <h2 className="text-xl font-semibold text-foreground">{user?.name || "Usuario"}</h2>
                <p className="text-sm text-muted-foreground">{user?.email || "–"}</p>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-muted p-3 rounded-md">
                  <div className="text-xs text-muted-foreground">Rol</div>
                  <div className="text-sm font-medium text-foreground mt-1">{user?.role || "–"}</div>
                </div>

                <div className="bg-muted p-3 rounded-md">
                  <div className="text-xs text-muted-foreground">Institución</div>
                  <div className="text-sm font-medium text-foreground mt-1">{user?.institution?.name || "–"}</div>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm text-muted-foreground">
                  Puedes actualizar tu información en la sección de ajustes o contactar al administrador para cambios mayores.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
