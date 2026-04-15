// lib/core/bluetooth/bluetoothConstants.ts

// ─── Timeouts ─────────────────────────────────────────────────
export const BT_TIMEOUTS = {
    SCAN: 10_000,          // ms — detener escaneo automáticamente
    CONNECTION: 15_000,    // ms — abortar intento de conexión
    SERVICE_DISCOVERY: 5_000,
    READ: 3_000,
    WRITE: 3_000,
  } as const;
  
  // ─── Reintentos ───────────────────────────────────────────────
  export const BT_RETRY = {
    CONNECTION_ATTEMPTS: 3,
    CONNECTION_DELAY_MS: 1_000,  // espera entre reintentos
    WRITE_ATTEMPTS: 2,
  } as const;
  
  // ─── Escaneo ──────────────────────────────────────────────────
  export const BT_SCAN = {
    RSSI_THRESHOLD: -90,         // dBm — ignorar dispositivos muy lejanos
    DUPLICATE_WINDOW_MS: 500,    // evitar actualizar el mismo device muy seguido
    MAX_DEVICES: 50,             // límite de la lista de escaneo
  } as const;
  
  // ─── Servicios BLE estándar (Bluetooth SIG) ───────────────────
  export const BLE_SERVICES = {
    GENERIC_ACCESS:        '00001800-0000-1000-8000-00805f9b34fb',
    GENERIC_ATTRIBUTE:     '00001801-0000-1000-8000-00805f9b34fb',
    DEVICE_INFORMATION:    '0000180a-0000-1000-8000-00805f9b34fb',
    BATTERY:               '0000180f-0000-1000-8000-00805f9b34fb',
    HEART_RATE:            '0000180d-0000-1000-8000-00805f9b34fb',
    UART:                  '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART
  } as const;
  
  // ─── Características BLE estándar ────────────────────────────
  export const BLE_CHARACTERISTICS = {
    // Device Information
    MANUFACTURER_NAME:     '00002a29-0000-1000-8000-00805f9b34fb',
    MODEL_NUMBER:          '00002a24-0000-1000-8000-00805f9b34fb',
    FIRMWARE_REVISION:     '00002a26-0000-1000-8000-00805f9b34fb',
    HARDWARE_REVISION:     '00002a27-0000-1000-8000-00805f9b34fb',
    SERIAL_NUMBER:         '00002a25-0000-1000-8000-00805f9b34fb',
  
    // Battery
    BATTERY_LEVEL:         '00002a19-0000-1000-8000-00805f9b34fb',
  
    // Heart Rate
    HEART_RATE_MEASUREMENT: '00002a37-0000-1000-8000-00805f9b34fb',
  
    // Nordic UART
    UART_RX:               '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
    UART_TX:               '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
  } as const;
  
  // ─── UUIDs de tu dispositivo custom (ejemplo) ─────────────────
  // Reemplaza estos con los UUIDs reales de tu hardware
  export const MY_DEVICE = {
    SERVICE_UUID:          'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    CHAR_COMMAND:          'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    CHAR_RESPONSE:         'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    CHAR_STATUS:           'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    NAME_PREFIX:           'MyDevice',   // para filtrar en el escaneo
  } as const;
  
  // ─── MTU ──────────────────────────────────────────────────────
  export const BT_MTU = {
    DEFAULT: 23,           // mínimo garantizado por BLE spec
    REQUESTED: 512,        // lo que pedimos al conectar (el SO negocia)
  } as const;
  
  // ─── Permisos requeridos por plataforma ───────────────────────
  export const BT_PERMISSIONS = {
    ANDROID: [
      'android.permission.BLUETOOTH_SCAN',
      'android.permission.BLUETOOTH_CONNECT',
      'android.permission.ACCESS_FINE_LOCATION', // requerido en Android < 12
    ],
    IOS: [
      'NSBluetoothAlwaysUsageDescription',
      'NSBluetoothPeripheralUsageDescription',
    ],
  } as const;