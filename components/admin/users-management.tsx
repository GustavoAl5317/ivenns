"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Mail, Calendar, Shield, Building } from "lucide-react"

export function UsersManagement() {
  // Dados fixos do usuário admin da empresa
  const adminUser = {
    id: "admin-ivenns",
    email: "vendas@ivenns.com.br",
    full_name: "Administrador ivenns",
    role: "admin",
    created_at: "2024-01-01",
    company: "ivenns",
    department: "Vendas e Marketing"
  }

  const getInitials = (name: string) => {
    if (!name) return "IV"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gerenciamento de Usuários</h2>
        <p className="text-muted-foreground">
          Informações do usuário administrativo da ivenns
        </p>
      </div>

      <div className="grid gap-6">
        {/* Informações do Admin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Usuário Administrativo
            </CardTitle>
            <CardDescription>
              Conta principal de administração do sistema ivenns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
                  {getInitials(adminUser.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{adminUser.full_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {adminUser.email}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="default" className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                    <Shield className="h-3 w-3 mr-1" />
                    Administrador
                  </Badge>
                  <Badge variant="outline">
                    <Building className="h-3 w-3 mr-1" />
                    {adminUser.company}
                  </Badge>
                  <Badge variant="secondary">
                    {adminUser.department}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Criado em:</span>
                    <span>{new Date(adminUser.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Tipo:</span>
                    <span>Conta Empresarial</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configurações de Segurança
            </CardTitle>
            <CardDescription>
              Informações sobre a segurança da conta administrativa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Acesso Restrito</h4>
                <p className="text-sm text-muted-foreground">
                  Apenas o usuário administrativo autorizado pode acessar o painel de controle.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Sem Cadastro Público</h4>
                <p className="text-sm text-muted-foreground">
                  O sistema não permite cadastro de novos usuários através do site.
                </p>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Credenciais de Acesso</h4>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>E-mail:</strong> vendas@ivenns.com.br
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Senha:</strong> Configurada pelo administrador do sistema
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
