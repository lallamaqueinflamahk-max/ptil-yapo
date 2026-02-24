/**
 * Configuración de territorio y fuente de datos.
 * Preparado para multi-tenant: cambiar ámbito sin tocar código.
 * DATA_SOURCE=mock|db para conmutar a BD real sin redeploy de lógica.
 */

export type DataSource = "mock" | "db";

export interface TerritoryConfig {
  /** Nombre de la ciudad o ámbito (ej. "Asunción") */
  nombreCiudad: string;
  /** Circunscripción o región (ej. "Capital (Asunción)") */
  circunscripcion: string;
  /** Nombre de la organización (ej. "ANR - Honor Colorado 2026") */
  organizacion: string;
  /** Cantidad de seccionales en el ámbito (por defecto desde datos estáticos) */
  totalSeccionales?: number;
}

const DEFAULT_TERRITORY: TerritoryConfig = {
  nombreCiudad: "Asunción",
  circunscripcion: "Capital (Asunción)",
  organizacion: "ANR - Honor Colorado 2026",
};

/** Configuración del territorio actual. En producción puede venir de BD por tenant. */
let cachedTerritory: TerritoryConfig | null = null;

export function getTerritoryConfig(overrides?: Partial<TerritoryConfig>): TerritoryConfig {
  if (overrides) {
    return { ...DEFAULT_TERRITORY, ...overrides };
  }
  if (cachedTerritory) return cachedTerritory;
  // En el futuro: leer de process.env o BD por organización
  // ej. ORGANIZACION_ID -> query Tenant/Circunscripcion
  cachedTerritory = { ...DEFAULT_TERRITORY };
  return cachedTerritory;
}

export function setTerritoryConfig(config: TerritoryConfig): void {
  cachedTerritory = config;
}

/** Fuente de datos: mock (por defecto) o db. Con DB real, usar process.env.DATA_SOURCE=db */
export function getDataSource(): DataSource {
  const v = process.env.DATA_SOURCE;
  if (v === "db" || v === "database") return "db";
  return "mock";
}

export function isMock(): boolean {
  return getDataSource() === "mock";
}
