const STORAGE_KEY = "ptil_master";

export function getMasterKey(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEY) === "1";
}

export function setMasterKey(active: boolean): void {
  if (typeof window === "undefined") return;
  if (active) {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
  }
  window.dispatchEvent(new CustomEvent("ptil-master-change"));
}

/** Datos ficticios para prellenar el formulario en modo master */
export const FAKE_FORM_DATA = {
  nombreCompleto: "Juan Carlos Pérez González",
  cedula: "4.123.456",
  whatsapp: "+595 981 123 456",
  email: "juan.perez@ejemplo.com",
  facebook: "facebook.com/juanperez",
  instagram: "@juanperez",
  oficioPrincipal: "Electricista",
  oficioSecundario: "Instalador de aire acondicionado",
  anosExperiencia: "5",
  nivelEstudios: "SNPP",
  situacion: "Independiente",
  seguroSocial: true,
  selfieDataUrl: null as string | null,
  gpsActivo: true,
  promotor: "Miguel Sosa",
  gestorZona: "Miguel Sosa",
  cargoGestor: "Presidente de Seccional",
  seccionalNro: "12",
  cedulaOperador: "5.987.654",
};

export const FAKE_GPS = { lat: -25.2637, lng: -57.5759 };
