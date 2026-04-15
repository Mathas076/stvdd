// lib/core/bluetooth/bluetoothTypes.ts

// ─── Estado de conexión ───────────────────────────────────────
export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'error';

// ─── Estado del adaptador BT del teléfono ────────────────────
export type BluetoothAdapterState = 
  | 'Unknown' 
  | 'Resetting' 
  | 'Unsupported' 
  | 'Unauthorized' 
  | 'PoweredOff' 
  | 'PoweredOn';

// ─── Dispositivo escaneado ────────────────────────────────────
export interface BluetoothDevice {
  id: string;                    // MAC address (Android) o UUID (iOS)
  name: string | null;
  rssi: number | null;           // Intensidad de señal en dBm
  isConnectable: boolean | null;
  serviceUUIDs: string[] | null; // Servicios que anuncia el dispositivo
  manufacturerData: string | null;
}

// ─── Dispositivo ya conectado (más info disponible) ──────────
export interface ConnectedDevice extends BluetoothDevice {
  status: ConnectionStatus;
  connectedAt: Date;
  mtu: number | null;            // Tamaño máximo de paquete negociado
}

// ─── Resultado de escaneo ─────────────────────────────────────
export interface ScanResult {
  device: BluetoothDevice;
  timestamp: Date;
}

// ─── Característica BLE ───────────────────────────────────────
export interface BLECharacteristic {
  uuid: string;
  serviceUUID: string;
  isReadable: boolean;
  isWritable: boolean;
  isNotifiable: boolean;
  value: string | null;          // Base64 encoded
}

// ─── Opciones de escaneo ──────────────────────────────────────
export interface ScanOptions {
  serviceUUIDs?: string[];       // Filtrar por servicio específico
  timeoutMs?: number;            // 0 = sin límite
  allowDuplicates?: boolean;     // Útil para actualizar RSSI en tiempo real
}

// ─── Estado global del contexto ──────────────────────────────
export interface BluetoothState {
  adapterState: BluetoothAdapterState;
  isScanning: boolean;
  scannedDevices: BluetoothDevice[];
  connectedDevice: ConnectedDevice | null;
  error: BluetoothError | null;
}

// ─── Errores tipados ──────────────────────────────────────────
export type BluetoothErrorCode =
  | 'ADAPTER_OFF'
  | 'PERMISSION_DENIED'
  | 'DEVICE_NOT_FOUND'
  | 'CONNECTION_FAILED'
  | 'CONNECTION_LOST'
  | 'SCAN_FAILED'
  | 'WRITE_FAILED'
  | 'READ_FAILED'
  | 'TIMEOUT'
  | 'UNKNOWN';

export interface BluetoothError {
  code: BluetoothErrorCode;
  message: string;
  deviceId?: string;
}