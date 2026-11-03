export type EstadoComprobante = 'PENDIENTE' | 'PROCESANDO' | 'PROCESADO' | 'REQUIERE_ATENCION';
export type Modalidad = 'NORMAL' | 'EXPRESS';
export type TipoComprobante = 'BOLETA' | 'FACTURA';
export type Escenario = 'EXITO' | 'RECHAZO' | 'ERROR_TEMPORAL' | 'RESPUESTA_INCIERTA' | 'DEMORADO';
export interface Comprador {
  nombre: string;
  tipoDocumento: string;
  numeroDocumento: string;
  correo: string;
  direccion: string;
}
export interface Comprobante {
  id: string;
  eventoId: string;
  compraId: string;
  modalidad: Modalidad;
  tipoComprobante: TipoComprobante;
  comprador: Comprador;
  total: string;
  moneda: string;
  cantidadBoletos: number;
  estado: EstadoComprobante;
  estadoFiscal: string;
  estadoDocumentos: 'NO_HABILITADOS' | 'PENDIENTES' | 'GENERANDO' | 'DISPONIBLES' | 'ERROR';
  versionPlantilla: string | null;
  fechaEmision: string | null;
  serie: string | null;
  numero: string | null;
  intentos: number;
  ultimoError: string | null;
  estadoCorreo: string | null;
  creadoEn: string;
  actualizadoEn: string;
  simulado: boolean;
}
export interface Documento {
  id: string;
  tipo: 'PDF' | 'XML' | 'CDR';
  sha256: string;
  bytes: number;
  descarga: string;
}
export interface Entrega {
  id: string;
  tipo: 'BOLETOS' | 'CORREO';
  estado: string;
  intentos: number;
  ultimo_error: string | null;
  creado_en: string;
  actualizado_en: string;
}
export interface ComprobanteDetalle extends Comprobante {
  compra: {
    fechaPago: string;
    emisor: { ruc: string; razonSocial: string; direccion: string };
    detalle: {
      boletoIds: string[];
      descripcion: string;
      cantidad: number;
      precioUnitario: string;
      descuento: string;
      impuesto: string;
      total: string;
      afectacion: string;
    }[];
    escenarioPrueba: Escenario;
  };
  documentos: Documento[];
  entregas: Entrega[];
  historial: { accion: string; actor: string; detalle: string; creado_en: string }[];
}
export interface Consulta {
  pagina: number;
  limite: number;
  fecha: string;
  estado: string;
  modalidad: string;
  tipo: string;
  buscar: string;
}
export interface ListaComprobantes {
  datos: Comprobante[];
  resumen: {
    total: number;
    pendientes: number;
    procesando: number;
    procesados: number;
    incidencias: number;
  };
  pagina: number;
  limite: number;
}
export interface CompraPrueba {
  modalidad: Modalidad;
  tipoComprobante: TipoComprobante;
  cantidad: number;
  escenarioPrueba: Escenario;
}
