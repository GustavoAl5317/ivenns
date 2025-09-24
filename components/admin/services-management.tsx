"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea"; // ⛔️ substituído por TipTap
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package, DollarSign, Cloud, Headphones, Shield, Workflow, Layers, Rocket, Bold, Italic, List, ListOrdered, Link as LinkIcon, Heading } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Switch } from "@/components/ui/switch";

/* ---------- TipTap imports ---------- */
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import HeadingExt from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";

interface Service {
  id: string;
  title: string;
  description: string; // agora guardará HTML do editor
  image_url: string | null;
  sku: string | null;
  category: string;
  price: number | null;
  created_at: string;
  metadata?: {
    href?: string;
    bullets?: string[];
    visible?: boolean;
    highlight?: boolean;
    order?: number;
    icon?: string;
  } | null;
}

const ICON_OPTIONS = [
  { value: "cloud", label: "Cloud", Icon: Cloud },
  { value: "headphones", label: "Contact Center", Icon: Headphones },
  { value: "shield", label: "Segurança", Icon: Shield },
  { value: "workflow", label: "Automação", Icon: Workflow },
  { value: "layers", label: "Apps & Portais", Icon: Layers },
  { value: "rocket", label: "Consultoria", Icon: Rocket },
];

type FormState = {
  title: string;
  description: string; // HTML do editor
  image_url: string;
  sku: string;
  price: string;
  href: string;
  bullets: string; // CSV
  icon: string;
  visible: boolean;
  highlight: boolean;
  order: string;
};

/* ---------- Utils ---------- */
function stripHtml(html: string) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "");
}

/* ---------- RichTextEditor (TipTap) ---------- */
function RichTextEditor({
  value,
  onChange,
  placeholder = "Descreva seu serviço. Use listas para tópicos, títulos, etc.",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // usaremos o HeadingExt abaixo
      }),
      HeadingExt.configure({
        levels: [2, 3, 4],
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[140px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 prose prose-sm max-w-none dark:prose-invert",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    const url = window.prompt("URL do link:");
    if (url) editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const isActive = (name: string, attrs?: any) => editor.isActive(name as any, attrs);

  return (
    <div className="space-y-2">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-md border bg-muted/50 p-1">
        <Button type="button" variant={isActive("bold") ? "default" : "ghost"} size="icon" onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Negrito">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant={isActive("italic") ? "default" : "ghost"} size="icon" onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Itálico">
          <Italic className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button type="button" variant={isActive("heading", { level: 2 }) ? "default" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading className="mr-1 h-4 w-4" /> H2
        </Button>
        <Button type="button" variant={isActive("heading", { level: 3 }) ? "default" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading className="mr-1 h-4 w-4" /> H3
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button type="button" variant={isActive("bulletList") ? "default" : "ghost"} size="icon" onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="Lista com marcadores">
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant={isActive("orderedList") ? "default" : "ghost"} size="icon" onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-label="Lista numerada">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button type="button" variant="ghost" size="icon" onClick={setLink} aria-label="Inserir link">
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

/* ---------- Página ---------- */
function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<FormState>({
    title: "",
    description: "", // HTML do editor
    image_url: "",
    sku: "",
    price: "",
    href: "/contato",
    bullets: "",
    icon: "cloud",
    visible: true,
    highlight: false,
    order: "9999",
  });

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchServices() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setServices([]);
        return;
      }

      const res = await fetch(`/api/dashboard/products?userId=${user.id}&category=service`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setServices(Array.isArray(data) ? data : data?.data ?? []);
      } else {
        console.error("Fetch services failed:", await res.text());
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      sku: "",
      price: "",
      href: "/contato",
      bullets: "",
      icon: "cloud",
      visible: true,
      highlight: false,
      order: "9999",
    });
    setEditingService(null);
  }

  function onEdit(s: Service) {
    setEditingService(s);
    setFormData({
      title: s.title ?? "",
      description: s.description ?? "", // HTML vindo do banco
      image_url: s.image_url ?? "",
      sku: s.sku ?? "",
      price: s.price != null ? String(s.price) : "",
      href: s.metadata?.href ?? "/contato",
      bullets: (s.metadata?.bullets ?? []).join(", "),
      icon: s.metadata?.icon ?? "cloud",
      visible: s.metadata?.visible ?? true,
      highlight: s.metadata?.highlight ?? false,
      order: String(s.metadata?.order ?? 9999),
    });
    setIsDialogOpen(true);
  }

  async function onDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    try {
      const response = await fetch(`/api/dashboard/products/${id}`, { method: "DELETE" });
      if (response.ok) await fetchServices();
      else console.error("Error deleting service:", await response.text());
    } catch (e) {
      console.error("Error deleting service:", e);
    }
  }

  function parseNumberOrNull(value: string) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function parseOrder(value: string) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 9999;
  }

  function normalizeBullets(csv: string) {
    return csv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description, // HTML do editor
      image_url: formData.image_url || null,
      sku: formData.sku || null,
      category: "service",
      price: formData.price ? parseNumberOrNull(formData.price) : null,
      metadata: {
        href: formData.href || "/contato",
        bullets: normalizeBullets(formData.bullets),
        icon: formData.icon,
        visible: formData.visible,
        highlight: formData.highlight,
        order: parseOrder(formData.order),
      },
    };

    try {
      const url = editingService ? `/api/dashboard/products/${editingService.id}` : "/api/dashboard/products";
      const method = editingService ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchServices();
        setIsDialogOpen(false);
        resetForm();
      } else {
        const errText = await response.text();
        console.error("Error saving service:", errText);
        alert("Não foi possível salvar. Verifique o console para detalhes.");
      }
    } catch (error) {
      console.error("Error saving service:", error);
    }
  }

  function onCloseDialog() {
    setIsDialogOpen(false);
    resetForm();
  }

  const placeholderImg =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'><rect width='100%' height='100%' fill='#f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='sans-serif' font-size='16'>Sem imagem</text></svg>`
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Serviços</h2>
          <p className="text-muted-foreground">Gerencie os serviços exibidos na landing.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Serviço
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[820px]">
            <DialogHeader>
              <DialogTitle>{editingService ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
              <DialogDescription>
                Preencha os campos. Os metadados controlam a exibição na seção pública.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="title">Nome</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sku">Código (SKU)</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  {/* ⬇️ TipTap no lugar do Textarea */}
                  <RichTextEditor
                    value={formData.description}
                    onChange={(html) => setFormData({ ...formData, description: html })}
                  />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="image_url">URL da Imagem (opcional)</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://.../capa.jpg"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="price">Preço (opcional)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="href">Link do botão</Label>
                  <Input
                    id="href"
                    value={formData.href}
                    onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                    placeholder="/contato"
                  />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <Label>Bullets (separados por vírgula)</Label>
                  <Input
                    value={formData.bullets}
                    onChange={(e) => setFormData({ ...formData, bullets: e.target.value })}
                    placeholder="Ex: Landing Zones, FinOps, Alta disponibilidade"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Ícone</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(v) => setFormData({ ...formData, icon: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map(({ value, label, Icon }) => (
                        <SelectItem key={value} value={value}>
                          <span className="inline-flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="order">Ordem</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="visible"
                    checked={formData.visible}
                    onCheckedChange={(v) => setFormData({ ...formData, visible: v })}
                  />
                  <Label htmlFor="visible">Visível</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="highlight"
                    checked={formData.highlight}
                    onCheckedChange={(v) => setFormData({ ...formData, highlight: v })}
                  />
                  <Label htmlFor="highlight">Destaque</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingService ? "Salvar alterações" : "Criar serviço"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p className="mt-2 text-muted-foreground">Carregando serviços...</p>
          </div>
        </div>
      ) : services.length === 0 ? (
        <div className="py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum serviço encontrado</h3>
          <p className="text-muted-foreground">Comece adicionando o primeiro serviço.</p>
          <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Serviço
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={s.image_url || placeholderImg}
                  alt={s.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{s.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      {s.sku && <Badge variant="secondary">{s.sku}</Badge>}
                      {s.price != null && (
                        <Badge variant="outline">
                          <DollarSign className="mr-1 h-3 w-3" />
                          R$ {s.price.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {/* preview sem tags para não quebrar o layout */}
                <CardDescription className="line-clamp-2">
                  {stripHtml(s.description)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(s)}>
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(s.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export { ServicesManagement };
export default ServicesManagement;
