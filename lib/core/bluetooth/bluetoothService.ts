// lib/core/bluetooth/bluetoothService.ts
import { BleManager, Device, State, Characteristic } from 'react-native-ble-plx';
import {
  BluetoothDevice,
  ConnectedDevice,
  ScanOptions,
  BLECharacteristic,
  BluetoothError,
  BluetoothErrorCode,
} from './bluetoothTypes';
import {
  BT_TIMEOUTS,
  BT_RETRY,
  BT_SCAN,
  BT_MTU,
} from './bluetoothConstants';

// ─── Singleton ────────────────────────────────────────────────
class BluetoothService {
  private manager: BleManager;
  private scanTimeout: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  // ─── Adaptador ──────────────────────────────────────────────

  onAdapterStateChange(callback: (state: State) => void): () => void {
    const subscription = this.manager.onStateChange((state) => {
      callback(state);
    }, true); // true = emite el estado actual inmediatamente

    return () => subscription.remove();
  }

  async getAdapterState(): Promise<State> {
    return this.manager.state();
  }

  // ─── Escaneo ────────────────────────────────────────────────

  startScan(
    onDeviceFound: (device: BluetoothDevice) => void,
    onError: (error: BluetoothError) => void,
    options: ScanOptions = {}
  ): void {
    const {
      serviceUUIDs = [],
      timeoutMs = BT_TIMEOUTS.SCAN,
      allowDuplicates = false,
    } = options;

    const seenAt: Record<string, number> = {};

    this.manager.startDeviceScan(
      serviceUUIDs.length ? serviceUUIDs : null,
      { allowDuplicates },
      (error, device) => {
        if (error) {
          onError(this.parseError('SCAN_FAILED', error.message));
          return;
        }
        if (!device) return;

        // Filtrar por RSSI mínimo
        if (device.rssi !== null && device.rssi < BT_SCAN.RSSI_THRESHOLD) return;

        // Evitar actualizaciones demasiado frecuentes del mismo device
        const now = Date.now();
        if (
          seenAt[device.id] &&
          now - seenAt[device.id] < BT_SCAN.DUPLICATE_WINDOW_MS
        ) return;
        seenAt[device.id] = now;

        onDeviceFound(this.mapDevice(device));
      }
    );

    // Auto-stop después del timeout
    if (timeoutMs > 0) {
      this.scanTimeout = setTimeout(() => this.stopScan(), timeoutMs);
    }
  }

  stopScan(): void {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = null;
    }
    this.manager.stopDeviceScan();
  }

  // ─── Conexión ───────────────────────────────────────────────

  async connect(
    deviceId: string,
    onDisconnected?: (error: BluetoothError | null) => void
  ): Promise<ConnectedDevice> {
    let attempts = 0;

    while (attempts < BT_RETRY.CONNECTION_ATTEMPTS) {
      try {
        return await this.attemptConnection(deviceId, onDisconnected);
      } catch (error) {
        attempts++;
        if (attempts >= BT_RETRY.CONNECTION_ATTEMPTS) {
          throw this.parseError('CONNECTION_FAILED', (error as Error).message, deviceId);
        }
        await this.delay(BT_RETRY.CONNECTION_DELAY_MS);
      }
    }

    // TypeScript lo requiere aunque el while siempre lanza antes
    throw this.parseError('CONNECTION_FAILED', 'Max retries reached', deviceId);
  }

  private async attemptConnection(
    deviceId: string,
    onDisconnected?: (error: BluetoothError | null) => void
  ): Promise<ConnectedDevice> {
    // Timeout de conexión
    const timeoutPromise = new Promise<never>((_, reject) => {
      this.connectionTimeout = setTimeout(
        () => reject(new Error('Connection timeout')),
        BT_TIMEOUTS.CONNECTION
      );
    });

    const connectPromise = (async () => {
      const device = await this.manager.connectToDevice(deviceId, {
        requestMTU: BT_MTU.REQUESTED,
      });

      await device.discoverAllServicesAndCharacteristics();

      // Listener de desconexión
      this.manager.onDeviceDisconnected(deviceId, (error) => {
        const btError = error
          ? this.parseError('CONNECTION_LOST', error.message, deviceId)
          : null;
        onDisconnected?.(btError);
      });

      return this.mapConnectedDevice(device);
    })();

    try {
      return await Promise.race([connectPromise, timeoutPromise]);
    } finally {
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
    }
  }

  async disconnect(deviceId: string): Promise<void> {
    try {
      await this.manager.cancelDeviceConnection(deviceId);
    } catch (error) {
      throw this.parseError('UNKNOWN', (error as Error).message, deviceId);
    }
  }

  async isConnected(deviceId: string): Promise<boolean> {
    return this.manager.isDeviceConnected(deviceId);
  }

  // ─── Lectura / Escritura ────────────────────────────────────

  async readCharacteristic(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string
  ): Promise<string | null> {
    try {
      const characteristic = await this.withTimeout(
        this.manager.readCharacteristicForDevice(deviceId, serviceUUID, characteristicUUID),
        BT_TIMEOUTS.READ,
        'READ_FAILED'
      );
      return characteristic.value; // Base64
    } catch (error) {
      throw this.parseError('READ_FAILED', (error as Error).message, deviceId);
    }
  }

  async writeCharacteristic(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    value: string, // Base64
    withResponse = true
  ): Promise<void> {
    try {
      const write = withResponse
        ? this.manager.writeCharacteristicWithResponseForDevice
        : this.manager.writeCharacteristicWithoutResponseForDevice;

      await this.withTimeout(
        write.call(this.manager, deviceId, serviceUUID, characteristicUUID, value),
        BT_TIMEOUTS.WRITE,
        'WRITE_FAILED'
      );
    } catch (error) {
      throw this.parseError('WRITE_FAILED', (error as Error).message, deviceId);
    }
  }

  // ─── Notificaciones ─────────────────────────────────────────

  subscribeToCharacteristic(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    onValueChange: (value: string | null) => void,
    onError: (error: BluetoothError) => void
  ): () => void {
    const subscription = this.manager.monitorCharacteristicForDevice(
      deviceId,
      serviceUUID,
      characteristicUUID,
      (error, characteristic) => {
        if (error) {
          onError(this.parseError('READ_FAILED', error.message, deviceId));
          return;
        }
        onValueChange(characteristic?.value ?? null);
      }
    );

    return () => subscription.remove();
  }

  // ─── Servicios y características ────────────────────────────

  async getCharacteristics(
    deviceId: string,
    serviceUUID: string
  ): Promise<BLECharacteristic[]> {
    try {
      const characteristics = await this.manager.characteristicsForDevice(
        deviceId,
        serviceUUID
      );
      return characteristics.map(this.mapCharacteristic);
    } catch (error) {
      throw this.parseError('UNKNOWN', (error as Error).message, deviceId);
    }
  }

  // ─── Cleanup ────────────────────────────────────────────────

  destroy(): void {
    this.stopScan();
    this.manager.destroy();
  }

  // ─── Helpers privados ───────────────────────────────────────

  private mapDevice(device: Device): BluetoothDevice {
    return {
      id: device.id,
      name: device.name ?? device.localName ?? null,
      rssi: device.rssi ?? null,
      isConnectable: device.isConnectable ?? null,
      serviceUUIDs: device.serviceUUIDs ?? null,
      manufacturerData: device.manufacturerData ?? null,
    };
  }

  private mapConnectedDevice(device: Device): ConnectedDevice {
    return {
      ...this.mapDevice(device),
      status: 'connected',
      connectedAt: new Date(),
      mtu: device.mtu ?? null,
    };
  }

  private mapCharacteristic(char: Characteristic): BLECharacteristic {
    return {
      uuid: char.uuid,
      serviceUUID: char.serviceUUID,
      isReadable: char.isReadable ?? false,
      isWritable: (char.isWritableWithResponse || char.isWritableWithoutResponse) ?? false,
      isNotifiable: char.isNotifiable ?? false,
      value: char.value ?? null,
    };
  }

  private parseError(
    code: BluetoothErrorCode,
    message: string,
    deviceId?: string
  ): BluetoothError {
    return { code, message, deviceId };
  }

  private withTimeout<T>(
    promise: Promise<T>,
    ms: number,
    errorCode: BluetoothErrorCode
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(this.parseError(errorCode, 'Timeout')), ms)
      ),
    ]);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ─── Exportar instancia única ────────────────────────────────
export const bluetoothService = new BluetoothService();