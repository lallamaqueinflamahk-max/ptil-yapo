"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Badge,
  Tooltip,
  Modal,
  Dropdown,
  DropdownItem,
  Tabs,
  Chip,
  KPICard,
} from "@/components/ui";

export default function SentinelUICatalogPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [tabValue, setTabValue] = useState("tab1");
  const [chipSelected, setChipSelected] = useState<string | null>("todos");
  /** Filtro global: al hacer clic en un KPI Card se activa este filtro (ej. para cruzar con mapa/tablas). */
  const [globalFilter, setGlobalFilter] = useState<string | null>(null);
  const [simulateLoading, setSimulateLoading] = useState(false);

  return (
    <div className="min-h-screen bg-surface-alt px-4 py-8 md:px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-sentinel-2xl font-bold text-sentinel-text-primary mb-2">
          SENTINEL360 — UI Kit
        </h1>
        <p className="text-sentinel-sm text-sentinel-text-secondary mb-8">
          Componentes basados en el Design System. Tailwind + design tokens.
        </p>

        {/* ─── Button ─── */}
        <section className="mb-10">
          <h2 className="text-sentinel-lg font-semibold text-sentinel-text-primary mb-4">
            Button
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primario</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Peligro</Button>
            <Button variant="primary" disabled>
              Deshabilitado
            </Button>
            <Button variant="primary" loading loadingLabel="Guardando…">
              Con loading
            </Button>
            <Button variant="primary" fullWidth>
              Ancho completo
            </Button>
          </div>
        </section>

        {/* ─── Card ─── */}
        <section className="mb-10">
          <h2 className="text-sentinel-lg font-semibold text-sentinel-text-primary mb-4">
            Card
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Título de la card</CardTitle>
              </CardHeader>
              <CardContent>
                Contenido de ejemplo. Diseño de sala de control: datos accionables y jerarquía clara.
              </CardContent>
              <CardFooter>
                <Button variant="primary" className="text-sm">
                  Acción
                </Button>
              </CardFooter>
            </Card>
            <Card interactive padding="lg">
              <CardTitle as="h2">Card interactiva</CardTitle>
              <CardContent className="mt-2">
                Hover para ver sombra y escala. Útil para KPIs o listas clickeables.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ─── Badge ─── */}
        <section className="mb-10">
          <h2 className="text-sentinel-lg font-semibold text-sentinel-text-primary mb-4">
            Badge (estado semántico)
          </h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">OK</Badge>
            <Badge variant="warning">Atención</Badge>
            <Badge variant="danger">Crítico</Badge>
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="control">Control</Badge>
            <Badge variant="danger" outline={false}>
              Sólido
            </Badge>
          </div>
        </section>

        {/* ─── Tooltip ─── */}
        <section className="mb-10">
          <h2 className="text-sentinel-lg font-semibold text-sentinel-text-primary mb-4">
            Tooltip
          </h2>
          <div className="flex flex-wrap gap-4">
            <Tooltip content="Texto de ayuda al pasar el cursor" placement="top">
              <Button variant="ghost">Hover arriba</Button>
            </Tooltip>
            <Tooltip content="O al hacer foco con teclado." placement="bottom">
              <Button variant="secondary">Hover abajo</Button>
            </Tooltip>
          </div>
        </section>

        {/* ─── Modal ─── */}
        <section className="mb-10">
          <h2 className="text-sentinel-lg font-semibold text-sentinel-text-primary mb-4">
            Modal
          </h2>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Abrir modal
          </Button>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Título del modal"
            size="md"
          >
            <p className="text-sentinel-sm text-sentinel-text-secondary">
              Contenido del modal. Cerrar con el botón, clic fuera o Escape.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                Confirmar
              </Button>
            </div>
          </Modal>
        </section>

        {/* ─── Dropdown ─── */}
        <section className="mb-10">
          <h2 className="text-sentinel-lg font-semibold text-sentinel-text-primary mb-4">
            Dropdown
          </h2>
          <div className="flex gap-4">
            <Dropdown
              trigger={
                <Button variant="secondary">
                  Menú desplegable ▾
                </Button>
              }
              align="left"
            >
              <DropdownItem onClick={() => alert("Ver")}>Ver detalle</DropdownItem>
              <DropdownItem onClick={() => alert("Editar")}>Editar</DropdownItem>
              <DropdownItem danger onClick={() => alert("Eliminar")}>
                Eliminar
              </DropdownItem>
            </Dropdown>
            <Dropdown
              trigger={
                <span className="inline-flex cursor-pointer items-center gap-1 rounded-sentinel-lg border border-sentinel-border bg-surface px-3 py-2 text-sm font-medium text-sentinel-text-primary hover:bg-surface-alt">
                  Trigger custom ▾
                </span>
              }
              align="right"
            >
              <DropdownItem>Opción A</DropdownItem>
              <DropdownItem>Opción B</DropdownItem>
            </Dropdown>
          </div>
        </section>

        {/* ─── Tabs ─── */}
        <section className="mb-10">
          <h2 className="text-sentinel-lg font-semibold text-sentinel-text-primary mb-4">
            Tabs
          </h2>
          <Tabs
            value={tabValue}
            onChange={setTabValue}
            variant="line"
            items={[
              {
                id: "tab1",
                label: "Pestaña 1",
                content: (
                  <p className="text-sentinel-sm text-sentinel-text-secondary">
                    Contenido de la pestaña 1.
                  </p>
                ),
              },
              {
                id: "tab2",
                label: "Pestaña 2",
                content: (
                  <p className="text-sentinel-sm text-sentinel-text-secondary">
                    Contenido de la pestaña 2.
                  </p>
                ),
              },
              {
                id: "tab3",
                label: "Deshabilitada",
                disabled: true,
                content: null,
              },
            ]}
          />
          <div className="mt-6">
            <p className="text-sentinel-sm text-sentinel-text-muted mb-2">Variante pill:</p>
            <Tabs
              variant="pill"
              items={[
                { id: "a", label: "Vista A", content: <p className="text-sentinel-sm">Vista A.</p> },
                { id: "b", label: "Vista B", content: <p className="text-sentinel-sm">Vista B.</p> },
              ]}
            />
          </div>
        </section>

        {/* ─── Chip (filtros) ─── */}
        <section className="mb-10">
          <h2 className="text-sentinel-lg font-semibold text-sentinel-text-primary mb-4">
            Chip (filtros)
          </h2>
          <div className="flex flex-wrap gap-2">
            {(["todos", "crítico", "atención", "ok"] as const).map((id) => (
              <Chip
                key={id}
                variant="control"
                selected={chipSelected === id}
                onSelect={() => setChipSelected(chipSelected === id ? null : id)}
              >
                {id === "todos" ? "Todos" : id.charAt(0).toUpperCase() + id.slice(1)}
              </Chip>
            ))}
          </div>
          <p className="mt-2 text-sentinel-xs text-sentinel-text-muted">
            Seleccionado: {chipSelected ?? "ninguno"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip variant="success" interactive={false}>OK</Chip>
            <Chip variant="warning" interactive={false}>Atención</Chip>
            <Chip variant="danger" interactive={false}>Crítico</Chip>
          </div>
        </section>

        {/* ─── KPI Card interactivo ─── */}
        <section className="mb-10">
          <h2 className="text-sentinel-lg font-semibold text-sentinel-text-primary mb-4">
            KPI Card interactivo
          </h2>
          {globalFilter && (
            <div className="mb-4 flex items-center justify-between rounded-sentinel-lg border border-semantic-control bg-semantic-control/10 px-4 py-2">
              <span className="text-sentinel-sm font-medium text-semantic-control">
                Filtro activo: <strong>{globalFilter}</strong>
              </span>
              <Button variant="ghost" className="text-sm" onClick={() => setGlobalFilter(null)}>
                Limpiar filtro
              </Button>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KPICard
              label="Idoneidad"
              value={78}
              unit="%"
              state="positive"
              variation={{ value: "+3% vs. mes anterior", direction: "up", positiveIsGood: true }}
              tooltip="Porcentaje de operadores con idoneidad al día. Clic para filtrar el dashboard por este KPI."
              onFilter={() => setGlobalFilter("Idoneidad")}
              isActive={globalFilter === "Idoneidad"}
              primary
            />
            <KPICard
              label="En riesgo"
              value={12}
              unit=""
              state="risk"
              variation={{ value: "-2 vs. semana pasada", direction: "down", positiveIsGood: true }}
              tooltip="Seccionales con indicadores fuera de rango. Clic para ver solo estos en mapa y tablas."
              onFilter={() => setGlobalFilter("En riesgo")}
              isActive={globalFilter === "En riesgo"}
            />
            <KPICard
              label="Atención"
              value={8}
              unit=""
              state="warning"
              variation={{ value: "+1 vs. ayer", direction: "up", positiveIsGood: false }}
              tooltip="Requieren revisión pronto. Clic para filtrar por estado Atención."
              onFilter={() => setGlobalFilter("Atención")}
              isActive={globalFilter === "Atención"}
            />
            <KPICard
              label="Eventos hoy"
              value={35}
              unit=""
              state="normal"
              variation={{ value: "sin cambio", direction: "neutral" }}
              tooltip="Total de eventos registrados en el día. Clic para filtrar por hoy."
              onFilter={() => setGlobalFilter("Eventos hoy")}
              isActive={globalFilter === "Eventos hoy"}
            />
            <KPICard
              label="Cargando…"
              value="—"
              state="normal"
              tooltip="KPI en carga. No se puede filtrar hasta que termine."
              onFilter={() => {}}
              loading={simulateLoading}
            />
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setSimulateLoading(true);
                  setTimeout(() => setSimulateLoading(false), 2000);
                }}
              >
                Simular loading 2s
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
